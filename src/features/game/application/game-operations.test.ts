import { describe, expect, it, vi } from "vitest";

import type {
  GameState,
  Leaderboard,
  ArcadeOperationResult,
} from "@antidoto/contracts";
import { LEADERBOARD_LIMIT } from "@antidoto/contracts";

import {
  ARCADE_GATEWAY_OPERATIONS,
  type ArcadeGameGateway,
} from "../infrastructure/game-gateway";
import { validateContentCollection } from "../content/content-validation";
import feedContentPack from "../content/game-items/feed-60.v1.json";
import {
  FEED_TIME_LIMIT_SECONDS,
  FEED_VERIFY_COST_SECONDS,
} from "../domain/mechanics/timed-feed";
import {
  MAX_ACTION_PAYLOAD_BYTES,
  assertActionPayloadWithinLimit,
  containsForbiddenAuthorityFields,
  createArcadePublicError,
  createTimedFeedSessionClock,
  getGameStateOperation,
  getLeaderboardOperation,
  measurePayloadBytes,
  projectTimedFeedRemainingSeconds,
  resolveTimedFeedSubmit,
  startGameOperation,
  submitGameActionOperation,
} from "./game-operations";

const feedItems = validateContentCollection(feedContentPack);

const baseState: GameState = {
  sessionId: "session-1",
  gameCode: "real-o-ia",
  mechanic: "image_verdict",
  status: "active",
  alias: "Ana",
  position: 1,
  total: 8,
  item: null,
  feedback: null,
  provisionalScore: null,
  nextAction: "submit",
};

function createGateway(
  overrides: Partial<ArcadeGameGateway> = {},
): ArcadeGameGateway {
  const unimplemented = async (): Promise<ArcadeOperationResult<never>> => ({
    ok: false,
    error: createArcadePublicError("INTERNAL_ERROR"),
  });

  return {
    startGame: vi.fn(
      async (): Promise<ArcadeOperationResult<GameState>> => ({
        ok: true,
        data: baseState,
      }),
    ),
    getGameState: vi.fn(unimplemented),
    submitGameAction: vi.fn(
      async (): Promise<ArcadeOperationResult<GameState>> => ({
        ok: true,
        data: baseState,
      }),
    ),
    advanceGame: vi.fn(unimplemented),
    getGameResult: vi.fn(unimplemented),
    getLeaderboard: vi.fn(
      async (): Promise<ArcadeOperationResult<Leaderboard>> => ({
        ok: true,
        data: {
          scope: "global",
          entries: [],
          limit: LEADERBOARD_LIMIT,
        },
      }),
    ),
    ...overrides,
  };
}

describe("operaciones arcade server-only", () => {
  it("expone las seis operaciones del gateway contractual", () => {
    expect(ARCADE_GATEWAY_OPERATIONS).toEqual([
      "startGame",
      "getGameState",
      "submitGameAction",
      "advanceGame",
      "getGameResult",
      "getLeaderboard",
    ]);
  });

  it("rechaza payloads sobre 16 KB y campos de autoridad", () => {
    const oversized = { alias: "Ana", gameCode: "real-o-ia", padding: "x".repeat(MAX_ACTION_PAYLOAD_BYTES) };
    expect(measurePayloadBytes(oversized)).toBeGreaterThan(MAX_ACTION_PAYLOAD_BYTES);
    expect(assertActionPayloadWithinLimit(oversized)?.code).toBe("INVALID_ACTION");
    expect(containsForbiddenAuthorityFields({ score: 10 })).toBe(true);
    expect(containsForbiddenAuthorityFields({ input: { value: "real" } })).toBe(false);
  });

  it("valida startGame y proyecta envelopes públicos seguros", async () => {
    const gateway = createGateway();
    const ok = await startGameOperation(
      { alias: "Ana", gameCode: "real-o-ia" },
      { gateway, sessionTokenHash: "a".repeat(64) },
    );
    expect(ok).toEqual({ ok: true, data: baseState });
    expect(gateway.startGame).toHaveBeenCalledWith({
      alias: "Ana",
      gameCode: "real-o-ia",
      sessionTokenHash: "a".repeat(64),
    });

    const invalidGame = await startGameOperation(
      { alias: "Ana", gameCode: "single_choice" },
      { gateway, sessionTokenHash: "a".repeat(64) },
    );
    expect(invalidGame.ok).toBe(false);
    if (!invalidGame.ok) {
      expect(invalidGame.error.code).toBe("INVALID_GAME");
      expect(invalidGame.error.retryable).toBe(false);
    }

    const withScore = await startGameOperation(
      { alias: "Ana", gameCode: "real-o-ia", score: 99 },
      { gateway, sessionTokenHash: "a".repeat(64) },
    );
    expect(withScore.ok).toBe(false);
    if (!withScore.ok) {
      expect(withScore.error.code).toBe("INVALID_ACTION");
    }
  });

  it("rechaza submit con autoridad y acepta la entrada discriminada", async () => {
    const gateway = createGateway();
    const rejected = await submitGameActionOperation(
      {
        sessionId: "session-1",
        gameCode: "real-o-ia",
        itemId: "item-1",
        input: { kind: "verdict", value: "real" },
        rankingScore: 100,
      },
      { gateway },
    );
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) {
      expect(rejected.error.code).toBe("INVALID_ACTION");
    }

    const accepted = await submitGameActionOperation(
      {
        sessionId: "session-1",
        gameCode: "real-o-ia",
        itemId: "item-1",
        input: { kind: "verdict", value: "real" },
      },
      { gateway },
    );
    expect(accepted.ok).toBe(true);
  });

  it("aisla fallos del ranking sin códigos internos de infraestructura", async () => {
    const gateway = createGateway({
      getLeaderboard: vi.fn(async () => {
        throw new Error("relation leaderboard does not exist");
      }),
    });
    const result = await getLeaderboardOperation({ gateway });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("LEADERBOARD_UNAVAILABLE");
      expect(result.error.retryable).toBe(true);
      expect(result.error.message).not.toMatch(/relation|sql|leaderboard does not exist/i);
    }
  });

  it("sanitiza diagnÃ³sticos internos devueltos por el gateway", async () => {
    const gateway = createGateway({
      getGameState: vi.fn(async () => ({
        ok: false as const,
        error: {
          code: "INTERNAL_ERROR" as const,
          message: "relation game_sessions does not exist",
          retryable: true,
        },
      })),
    });

    const result = await getGameStateOperation(
      { sessionId: "session-1", gameCode: "real-o-ia" },
      { gateway },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("Reintenta");
      expect(result.error.message).not.toContain("game_sessions");
    }
  });

  it("rechaza remainingSeconds del cliente en Feed 60” y resuelve verify/expiración", async () => {
    const gateway = createGateway({
      submitGameAction: vi.fn(async () => ({
        ok: true as const,
        data: {
          ...baseState,
          gameCode: "feed-60" as const,
          mechanic: "timed_feed" as const,
          total: 10,
        },
      })),
    });

    const forged = await submitGameActionOperation(
      {
        sessionId: "session-feed",
        gameCode: "feed-60",
        itemId: "feed-60-001",
        input: { kind: "feed_action", value: "verify" },
        remainingSeconds: 99,
      },
      { gateway },
    );
    expect(forged.ok).toBe(false);
    if (!forged.ok) {
      expect(forged.error.code).toBe("INVALID_ACTION");
    }
    expect(gateway.submitGameAction).not.toHaveBeenCalled();

    const accepted = await submitGameActionOperation(
      {
        sessionId: "session-feed",
        gameCode: "feed-60",
        itemId: "feed-60-001",
        input: { kind: "feed_action", value: "verify" },
      },
      { gateway },
    );
    expect(accepted.ok).toBe(true);

    const startedAt = new Date("2026-08-02T22:00:00.000Z");
    const clock = createTimedFeedSessionClock(startedAt);
    expect(projectTimedFeedRemainingSeconds(clock, startedAt)).toBe(
      FEED_TIME_LIMIT_SECONDS,
    );

    const item = feedItems[0];
    const verified = resolveTimedFeedSubmit({
      action: "verify",
      itemId: item.itemId,
      sessionItemIds: feedItems.map((entry) => entry.itemId),
      clock,
      solution: item.solutionPrivate,
      feedback: item.feedback,
      now: new Date(startedAt.getTime() + 2_000),
      clientProposedExpiresAt: new Date(startedAt.getTime() + 120_000),
    });
    expect(verified.kind).toBe("verified");
    if (verified.kind === "verified") {
      expect(verified.clock.verifySecondsConsumed).toBe(FEED_VERIFY_COST_SECONDS);
      expect(verified.clock.expiresAt.getTime()).toBeLessThan(
        clock.expiresAt.getTime(),
      );
    }

    const expired = resolveTimedFeedSubmit({
      action: "share",
      itemId: item.itemId,
      sessionItemIds: feedItems.map((entry) => entry.itemId),
      clock,
      solution: item.solutionPrivate,
      feedback: item.feedback,
      now: new Date(clock.expiresAt.getTime() + 1),
    });
    expect(expired.kind).toBe("expired");
  });
});
