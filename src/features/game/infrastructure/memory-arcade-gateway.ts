import "server-only";

import { randomUUID } from "node:crypto";

import type {
  AdvanceGameCommand,
  GameResult,
  GameState,
  GameCode,
  Leaderboard,
  StartGameCommand,
  SubmitGameActionCommand,
} from "@antidoto/contracts";

import { createArcadePublicError } from "../application/game-operations";
import {
  buildLeaderboard,
  type RankingCandidate,
} from "../domain/scoring";
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
  assignedItemIds: readonly string[];
};

export type MemoryArcadeGatewayOptions = Readonly<{
  /** Permite probar sesiones con más de un item sin depender de Supabase. */
  itemIdsByGameCode?: Partial<Record<GameCode, readonly string[]>>;
  /** Reloj inyectable para probar expiración y carreras de tiempo. */
  now?: () => Date;
}>;

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

let sharedMemoryArcadeGateway: MemoryArcadeGateway | null = null;

/** Singleton de proceso en memoria compartido por startGame y el transporte. */
export function getSharedMemoryArcadeGateway(): MemoryArcadeGateway {
  sharedMemoryArcadeGateway ??= createMemoryArcadeGateway();
  return sharedMemoryArcadeGateway;
}

/**
 * Gateway arcade en memoria para transporte server-only y pruebas de frontera.
 * No reemplaza la persistencia Supabase (puerta T017+).
 */
export function createMemoryArcadeGateway(
  options: MemoryArcadeGatewayOptions = {},
): MemoryArcadeGateway {
  const byTokenHash = new Map<string, MemorySession>();
  const bySessionId = new Map<string, MemorySession>();
  const nextDefaultItemNumber = new Map<GameCode, number>();
  const now = options.now ?? (() => new Date());

  function lookupBySessionId(sessionId: string): MemorySession | null {
    return bySessionId.get(sessionId) ?? null;
  }

  function assignItems(gameCode: GameCode): readonly string[] {
    const configured = options.itemIdsByGameCode?.[gameCode];
    if (configured) {
      if (configured.length === 0) {
        throw new Error("CONTENT_UNAVAILABLE: una sesión requiere items.");
      }
      return Object.freeze([...configured]);
    }

    const nextNumber = (nextDefaultItemNumber.get(gameCode) ?? 0) + 1;
    nextDefaultItemNumber.set(gameCode, nextNumber);
    return Object.freeze([`item-${nextNumber}`]);
  }

  function currentItemId(stored: MemorySession): string | null {
    return stored.assignedItemIds[stored.record.position] ?? null;
  }

  function isCurrentItem(stored: MemorySession, itemId: string): boolean {
    return stored.assignedItemIds.includes(itemId) && currentItemId(stored) === itemId;
  }

  function materializeResult(
    stored: MemorySession,
    status: "finished" | "expired",
  ): GameResult {
    return {
      sessionId: stored.record.sessionId,
      gameCode: stored.record.gameCode,
      alias: stored.record.alias,
      status,
      answered: stored.answers.size,
      total: stored.record.total,
      learningSummary:
        status === "expired"
          ? "La partida expiró; conserva el feedback de las respuestas aceptadas."
          : "Completaste la partida de prueba del transporte.",
      score: {
        points: 0,
        maxPoints: stored.record.total,
        correct: null,
        errors: 0,
        bonusPoints: 0,
        penaltyPoints: 0,
        timeLimitSeconds: null,
        timeUsedSeconds: null,
      },
      simulatedReach: stored.record.gameCode === "mente-maestra" ? 70 : null,
    };
  }

  function syncExpiration(stored: MemorySession): void {
    const previousStatus = stored.record.status;
    stored.record = expireSessionIfNeeded(stored.record, now());
    if (stored.record.status !== "expired") return;

    stored.state = {
      ...toPublicState(stored.record, stored.state),
      item: null,
      feedback: null,
      nextAction: "result",
    };
    if (previousStatus !== "expired" || !stored.result) {
      stored.result = materializeResult(stored, "expired");
    }
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
      const existing = byTokenHash.get(command.sessionTokenHash);
      if (existing) {
        syncExpiration(existing);
        return { ok: true, data: existing.state };
      }

      const assignedItemIds = assignItems(command.gameCode);
      const record = createArcadeSession({
        alias: command.alias,
        gameCode: command.gameCode,
        total: assignedItemIds.length,
        sessionId: randomUUID(),
        now: now(),
      });
      const active = transitionSession(record, "active", now());
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
        assignedItemIds,
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

      syncExpiration(stored);
      return { ok: true, data: stored.state };
    },

    async submitGameAction(
      command: SubmitGameActionCommand,
    ): Promise<ArcadeGatewayResult<GameState>> {
      const stored = lookupBySessionId(command.sessionId);
      if (!stored) return failure("SESSION_NOT_FOUND");

      const mismatch = assertSessionGameCode(stored.record, command.gameCode);
      if (mismatch !== "ok") return failure("GAME_MISMATCH");

      syncExpiration(stored);
      if (stored.record.status === "expired") {
        return failure("SESSION_EXPIRED");
      }
      if (!isCurrentItem(stored, command.itemId)) {
        return failure("ITEM_NOT_IN_SESSION");
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

      if (idempotency.kind === "replay") {
        return { ok: true, data: stored.state };
      }

      if (stored.record.status !== "active") {
        return failure("INVALID_ACTION");
      }

      if (idempotency.kind === "accept") {
        stored.answers.set(command.itemId, {
          itemId: command.itemId,
          idempotencyKey: idempotency.idempotencyKey,
          inputFingerprint: idempotency.inputFingerprint,
        });
        stored.record = transitionSession(stored.record, "processing", now());
        stored.record = transitionSession(stored.record, "feedback", now());
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

      stored.record = touchSessionActivity(stored.record, now());
      return { ok: true, data: stored.state };
    },

    async advanceGame(
      command: AdvanceGameCommand,
    ): Promise<ArcadeGatewayResult<GameState>> {
      const stored = lookupBySessionId(command.sessionId);
      if (!stored) return failure("SESSION_NOT_FOUND");
      syncExpiration(stored);
      if (stored.record.status === "expired") return failure("SESSION_EXPIRED");
      if (!isCurrentItem(stored, command.itemId)) {
        return failure("ITEM_NOT_IN_SESSION");
      }
      if (stored.record.status !== "feedback") return failure("INVALID_ACTION");
      if (!stored.answers.has(command.itemId)) return failure("INVALID_ACTION");

      stored.record = {
        ...stored.record,
        position: Math.min(stored.record.position + 1, stored.record.total),
      };
      if (stored.record.position < stored.record.total) {
        stored.record = transitionSession(stored.record, "active", now());
        stored.state = {
          ...toPublicState(stored.record, stored.state),
          item: null,
          feedback: null,
          nextAction: "submit",
        };
        return { ok: true, data: stored.state };
      }

      stored.record = transitionSession(stored.record, "finished", now());
      stored.result = materializeResult(stored, "finished");
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
      syncExpiration(stored);
      if (stored.record.status === "expired") {
        return { ok: true, data: stored.result ?? materializeResult(stored, "expired") };
      }
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
      const candidates: RankingCandidate[] = [];

      for (const stored of bySessionId.values()) {
        const result = stored.result;
        if (!result) continue;

        candidates.push({
          resultId: stored.record.sessionId,
          gameCode: result.gameCode,
          alias: result.alias,
          status: result.status,
          answered: result.answered,
          total: result.total,
          points: result.score.points,
          maxPoints: result.score.maxPoints,
          completedAt: (
            stored.record.finishedAt ?? stored.record.lastActivityAt
          ).toISOString(),
          aliasAllowed: true,
          abuseMarked: false,
          invalidMarked: false,
        });
      }

      return {
        ok: true,
        data: buildLeaderboard(candidates),
      };
    },
  };

  return gateway;
}
