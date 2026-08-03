import { describe, expect, it } from "vitest";

import { LEADERBOARD_LIMIT } from "@antidoto/contracts";

import { LEADERBOARD_COPY } from "../application/leaderboard";
import { SupabaseGameGateway } from "./supabase-game-gateway";

describe("SupabaseGameGateway arcade leaderboard", () => {
  it("proyecta candidatas con elegibilidad y rankingScore server-only", async () => {
    const gateway = new SupabaseGameGateway({ rpc: async () => ({ data: null, error: null }) } as never);

    const result = await gateway.getArcadeLeaderboard([
      {
        resultId: "r1",
        gameCode: "grupo",
        alias: "Lina",
        status: "finished",
        answered: 6,
        total: 6,
        points: 9,
        maxPoints: 12,
        completedAt: "2026-08-01T12:00:00.000Z",
        aliasAllowed: true,
        abuseMarked: false,
        invalidMarked: false,
        rankingScore: 3,
        rank: 99,
        leaderboardEligible: true,
      },
      {
        resultId: "r2",
        gameCode: "feed-60",
        alias: "Expirado",
        status: "expired",
        answered: 10,
        total: 10,
        points: 30,
        maxPoints: 30,
        completedAt: "2026-08-01T11:00:00.000Z",
        aliasAllowed: true,
        abuseMarked: false,
        invalidMarked: false,
      },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.limit).toBe(LEADERBOARD_LIMIT);
    expect(result.data.entries).toHaveLength(1);
    expect(result.data.entries[0]).toMatchObject({
      rank: 1,
      alias: "Lina",
      gameCode: "grupo",
      points: 9,
      maxPoints: 12,
      rankingScore: 75,
    });
  });

  it("devuelve vacío neutral cuando no hay elegibles", async () => {
    const gateway = new SupabaseGameGateway({ rpc: async () => ({ data: null, error: null }) } as never);
    const result = await gateway.readArcadeLeaderboardProjection();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("LEADERBOARD_EMPTY");
      expect(result.error.message).toBe(LEADERBOARD_COPY.empty);
    }
  });
});
