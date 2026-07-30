import { describe, expect, it } from "vitest";

import { completeRound, newTokenHash, resetGameData, rpc, startGame } from "../../fixtures/supabase-local";

describe("api.get_leaderboard", () => {
  it("devuelve una instantánea pública sin duplicar filas", () => {
    resetGameData();
    const tokenHash = newTokenHash();
    startGame(tokenHash, 5, "Ranking Player");
    completeRound(tokenHash);
    const result = rpc("get_leaderboard", tokenHash);
    expect(result.ok).toBe(true);
    const data = result.data as { entries: Array<Record<string, unknown>>; currentPlayerEntry: Record<string, unknown> | null };
    expect(data.entries.length).toBeGreaterThan(0);
    expect(data.entries.some((entry) => entry.isCurrentPlayer === true)).toBe(true);
    expect(JSON.stringify(result)).not.toContain("session_token_hash");
  });
});
