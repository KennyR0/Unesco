import { describe, expect, it } from "vitest";

import { completeRound, finish, newTokenHash, resetGameData, sessionRow, startGame } from "../../fixtures/supabase-local";

describe("api.finish_game", () => {
  it("congela el resultado y devuelve el mismo resultado en replay", () => {
    resetGameData();
    const tokenHash = newTokenHash();
    startGame(tokenHash, 5);
    const first = completeRound(tokenHash);
    expect(first.ok).toBe(true);
    const second = finish(tokenHash);
    expect(second).toEqual(first);
    expect((first.data as { score: number }).score).toBe(500);
    expect(sessionRow(tokenHash).status).toBe("finished");
  });
});
