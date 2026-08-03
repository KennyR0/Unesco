import { describe, expect, it, vi } from "vitest";

import { LEADERBOARD_LIMIT, type Leaderboard } from "@antidoto/contracts";

import type { ArcadeGameGateway } from "../infrastructure/game-gateway";
import { createArcadePublicError } from "./game-operations";
import {
  getLeaderboard,
  getLeaderboardFromCandidates,
  ingestRankingCandidates,
  LEADERBOARD_COPY,
  projectEligibleLeaderboard,
  projectLeaderboardFromUnknown,
} from "./leaderboard";

function candidate(overrides: Record<string, unknown> = {}) {
  return {
    resultId: "result-1",
    gameCode: "real-o-ia",
    alias: "Ana",
    status: "finished",
    answered: 8,
    total: 8,
    points: 70,
    maxPoints: 80,
    completedAt: "2026-08-01T10:00:00.000Z",
    aliasAllowed: true,
    abuseMarked: false,
    invalidMarked: false,
    ...overrides,
  };
}

describe("leaderboard application (T035)", () => {
  it("proyecta máximo diez entradas con rankingScore normalizado", () => {
    const rows = Array.from({ length: 12 }, (_, index) =>
      candidate({
        resultId: `result-${index}`,
        alias: `Jugador ${index}`,
        points: 80 - index,
        completedAt: `2026-08-01T10:${String(index).padStart(2, "0")}:00.000Z`,
      }),
    );

    const leaderboard = projectLeaderboardFromUnknown(rows);
    expect(leaderboard.scope).toBe("global");
    expect(leaderboard.limit).toBe(LEADERBOARD_LIMIT);
    expect(leaderboard.entries).toHaveLength(10);
    expect(leaderboard.entries[0]).toMatchObject({
      rank: 1,
      alias: "Jugador 0",
      rankingScore: 100,
    });
    expect(leaderboard.entries[1]?.rankingScore).toBe(
      Math.round((79 / 80) * 100),
    );
  });

  it("excluye expirados, incompletos y maxPoints inválido", () => {
    const leaderboard = projectEligibleLeaderboard(
      ingestRankingCandidates([
        candidate({ resultId: "ok", points: 40 }),
        candidate({ resultId: "expired", status: "expired" }),
        candidate({ resultId: "incomplete", answered: 7 }),
        candidate({ resultId: "bad-max", maxPoints: 0 }),
        candidate({
          resultId: "forged-score",
          points: 40,
          rankingScore: 99,
          rank: 1,
          leaderboardEligible: true,
        }),
      ]),
    );

    expect(leaderboard.entries.map((entry) => entry.alias)).toEqual([
      "Ana",
      "Ana",
    ]);
    expect(leaderboard.entries.every((entry) => entry.rankingScore === 50)).toBe(
      true,
    );
  });

  it("ignora autoridad del cliente al ingerir candidatas", () => {
    const ingested = ingestRankingCandidates([
      candidate({
        points: 40,
        maxPoints: 80,
        rankingScore: 1,
        rank: 99,
        leaderboardEligible: false,
        score: 999,
        completed: true,
      }),
    ]);

    expect(ingested).toHaveLength(1);
    expect(ingested[0]).not.toHaveProperty("rankingScore");
    expect(ingested[0]).not.toHaveProperty("rank");
    expect(ingested[0]).not.toHaveProperty("leaderboardEligible");

    const projected = projectEligibleLeaderboard(ingested);
    expect(projected.entries[0]?.rankingScore).toBe(50);
  });

  it("devuelve LEADERBOARD_EMPTY con copia neutral", () => {
    const empty = getLeaderboardFromCandidates([
      candidate({ status: "expired" }),
    ]);
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.error.code).toBe("LEADERBOARD_EMPTY");
      expect(empty.error.message).toBe(LEADERBOARD_COPY.empty);
    }
  });

  it("lee el gateway y mapea fallos a copia neutral", async () => {
    const gateway = {
      getLeaderboard: vi.fn(async () => {
        throw new Error("relation does not exist");
      }),
    } as unknown as ArcadeGameGateway;

    const unavailable = await getLeaderboard({ gateway });
    expect(unavailable.ok).toBe(false);
    if (!unavailable.ok) {
      expect(unavailable.error.code).toBe("LEADERBOARD_UNAVAILABLE");
      expect(unavailable.error.message).toBe(LEADERBOARD_COPY.unavailable);
      expect(unavailable.error.message).not.toMatch(/relation/i);
    }

    const emptyGateway = {
      getLeaderboard: vi.fn(async (): Promise<{ ok: true; data: Leaderboard }> => ({
        ok: true,
        data: { scope: "global", entries: [], limit: LEADERBOARD_LIMIT },
      })),
    } as unknown as ArcadeGameGateway;

    const empty = await getLeaderboard({ gateway: emptyGateway });
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.error.code).toBe("LEADERBOARD_EMPTY");
    }

    const okGateway = {
      getLeaderboard: vi.fn(async () => ({
        ok: true as const,
        data: projectEligibleLeaderboard([
          candidate({ points: 80 }) as never,
        ]),
      })),
      startGame: vi.fn(),
      getGameState: vi.fn(),
      submitGameAction: vi.fn(),
      advanceGame: vi.fn(),
      getGameResult: vi.fn(),
    } as unknown as ArcadeGameGateway;

    const ok = await getLeaderboard({ gateway: okGateway });
    expect(ok).toEqual({
      ok: true,
      data: expect.objectContaining({
        entries: [expect.objectContaining({ rankingScore: 100 })],
      }),
    });
    expect(createArcadePublicError("LEADERBOARD_EMPTY").retryable).toBe(false);
  });
});
