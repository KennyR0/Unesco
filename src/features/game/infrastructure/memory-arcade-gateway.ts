import "server-only";

import { randomUUID } from "node:crypto";

import type {
  AdvanceGameCommand,
  GameResult,
  GameState,
  Leaderboard,
  StartGameCommand,
  SubmitGameActionCommand,
} from "@antidoto/contracts";
import { LEADERBOARD_LIMIT } from "@antidoto/contracts";

import { createArcadePublicError } from "../application/game-operations";
import {
  assertSessionGameCode,
  createArcadeSession,
  expireSessionIfNeeded,
  resolveAnswerIdempotency,
  touchSessionActivity,
  transitionSession,
  type AcceptedAnswerSnapshot,
  type ArcadeSessionRecord,
} from "../domain/session";
import type {
  ArcadeGameGateway,
  ArcadeGatewayResult,
  GetGameResultCommand,
  GetGameStateCommand,
} from "./game-gateway";

type MemorySession = {
  tokenHash: string;
  record: ArcadeSessionRecord;
  state: GameState;
  result: GameResult | null;
  answers: Map<string, AcceptedAnswerSnapshot>;
};

export type MemoryArcadeGateway = ArcadeGameGateway & {
  resolveSessionId(tokenHash: string): string | null;
  getSessionExpiresAt(sessionId: string): Date | null;
};

function failure(
  code: Parameters<typeof createArcadePublicError>[0],
): ArcadeGatewayResult<never> {
  return { ok: false, error: createArcadePublicError(code) };
}

function toPublicState(
  record: ArcadeSessionRecord,
  state: GameState,
): GameState {
  return {
    ...state,
    sessionId: record.sessionId,
    gameCode: record.gameCode,
    mechanic: record.mechanic,
    status: record.status,
    alias: record.alias,
    position: record.position,
    total: record.total,
  };
}

/**
 * Gateway arcade en memoria para transporte server-only y pruebas de frontera.
 * No reemplaza la persistencia Supabase (puerta T017+).
 */
export function createMemoryArcadeGateway(): MemoryArcadeGateway {
  const byTokenHash = new Map<string, MemorySession>();
  const bySessionId = new Map<string, MemorySession>();

  function lookupBySessionId(sessionId: string): MemorySession | null {
    return bySessionId.get(sessionId) ?? null;
  }

  const gateway: MemoryArcadeGateway = {
    resolveSessionId(tokenHash: string): string | null {
      return byTokenHash.get(tokenHash)?.record.sessionId ?? null;
    },

    getSessionExpiresAt(sessionId: string): Date | null {
      return bySessionId.get(sessionId)?.record.expiresAt ?? null;
    },

    async startGame(
      command: StartGameCommand & { sessionTokenHash: string },
    ): Promise<ArcadeGatewayResult<GameState>> {
      const record = createArcadeSession({
        alias: command.alias,
        gameCode: command.gameCode,
        total: 1,
        sessionId: randomUUID(),
      });
      const active = transitionSession(record, "active");
      const state: GameState = {
        sessionId: active.sessionId,
        gameCode: active.gameCode,
        mechanic: active.mechanic,
        status: active.status,
        alias: active.alias,
        position: 0,
        total: active.total,
        item: null,
        feedback: null,
        provisionalScore: null,
        nextAction: "submit",
      };
      const stored: MemorySession = {
        tokenHash: command.sessionTokenHash,
        record: active,
        state,
        result: null,
        answers: new Map(),
      };
      byTokenHash.set(command.sessionTokenHash, stored);
      bySessionId.set(active.sessionId, stored);
      return { ok: true, data: toPublicState(active, state) };
    },

    async getGameState(
      command: GetGameStateCommand,
    ): Promise<ArcadeGatewayResult<GameState>> {
      const stored = lookupBySessionId(command.sessionId);
      if (!stored) return failure("SESSION_NOT_FOUND");

      if (command.gameCode) {
        const mismatch = assertSessionGameCode(stored.record, command.gameCode);
        if (mismatch !== "ok") return failure("GAME_MISMATCH");
      }

      const expired = expireSessionIfNeeded(stored.record);
      stored.record = expired;
      stored.state = toPublicState(expired, {
        ...stored.state,
        status: expired.status,
        nextAction:
          expired.status === "finished" || expired.status === "expired"
            ? "result"
            : stored.state.nextAction,
      });
      return { ok: true, data: stored.state };
    },

    async submitGameAction(
      command: SubmitGameActionCommand,
    ): Promise<ArcadeGatewayResult<GameState>> {
      const stored = lookupBySessionId(command.sessionId);
      if (!stored) return failure("SESSION_NOT_FOUND");

      const mismatch = assertSessionGameCode(stored.record, command.gameCode);
      if (mismatch !== "ok") return failure("GAME_MISMATCH");

      stored.record = expireSessionIfNeeded(stored.record);
      if (stored.record.status === "expired") {
        return failure("SESSION_EXPIRED");
      }
      if (
        stored.record.status !== "active" &&
        stored.record.status !== "processing"
      ) {
        return failure("INVALID_ACTION");
      }

      const previous = stored.answers.get(command.itemId) ?? null;
      const idempotency = resolveAnswerIdempotency({
        sessionId: command.sessionId,
        action: command,
        previous,
      });
      if (idempotency.kind === "conflict") {
        return failure("ANSWER_ALREADY_ACCEPTED");
      }

      if (idempotency.kind === "accept") {
        stored.answers.set(command.itemId, {
          itemId: command.itemId,
          idempotencyKey: idempotency.idempotencyKey,
          inputFingerprint: idempotency.inputFingerprint,
        });
        stored.record = transitionSession(stored.record, "processing");
        stored.record = transitionSession(stored.record, "feedback");
        stored.state = {
          ...toPublicState(stored.record, stored.state),
          feedback: {
            status: "instructive",
            explanation: "Respuesta aceptada por el servidor.",
            signals: ["La evaluación es autoritativa."],
            recommendation: "Revisa el feedback antes de avanzar.",
            revealedAnswer: null,
          },
          nextAction: "advance",
        };
      }

      stored.record = touchSessionActivity(stored.record);
      return { ok: true, data: stored.state };
    },

    async advanceGame(
      command: AdvanceGameCommand,
    ): Promise<ArcadeGatewayResult<GameState>> {
      const stored = lookupBySessionId(command.sessionId);
      if (!stored) return failure("SESSION_NOT_FOUND");
      if (stored.record.status !== "feedback") return failure("INVALID_ACTION");
      if (!stored.answers.has(command.itemId)) {
        return failure("ITEM_NOT_IN_SESSION");
      }

      stored.record = {
        ...stored.record,
        position: Math.min(stored.record.position + 1, stored.record.total),
      };
      stored.record = transitionSession(stored.record, "finished");
      stored.result = {
        sessionId: stored.record.sessionId,
        gameCode: stored.record.gameCode,
        alias: stored.record.alias,
        status: "finished",
        answered: stored.answers.size,
        total: stored.record.total,
        learningSummary: "Completaste la partida de prueba del transporte.",
        score: {
          points: 0,
          maxPoints: 1,
          correct: null,
          errors: 0,
          bonusPoints: 0,
          penaltyPoints: 0,
          timeLimitSeconds: null,
          timeUsedSeconds: null,
        },
        simulatedReach:
          stored.record.gameCode === "mente-maestra" ? 70 : null,
      };
      stored.state = {
        ...toPublicState(stored.record, stored.state),
        item: null,
        feedback: null,
        nextAction: "result",
      };
      return { ok: true, data: stored.state };
    },

    async getGameResult(
      command: GetGameResultCommand,
    ): Promise<ArcadeGatewayResult<GameResult>> {
      const stored = lookupBySessionId(command.sessionId);
      if (!stored) return failure("SESSION_NOT_FOUND");
      if (!stored.result) return failure("RESULT_NOT_AVAILABLE");
      if (
        stored.record.resultAccessUntil &&
        Date.now() >= stored.record.resultAccessUntil.getTime()
      ) {
        return failure("RESULT_ACCESS_EXPIRED");
      }
      return { ok: true, data: stored.result };
    },

    async getLeaderboard(): Promise<ArcadeGatewayResult<Leaderboard>> {
      return {
        ok: true,
        data: {
          scope: "global",
          entries: [],
          limit: LEADERBOARD_LIMIT,
        },
      };
    },
  };

  return gateway;
}
