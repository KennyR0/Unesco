import { describe, expect, it } from "vitest";

import { completeRound, finish, newTokenHash, resetGameData, sessionRow, startGame } from "../../fixtures/supabase-local";

/** LEGACY_SINGLE_CHOICE: retired with private_arcade (no api.* schema). */
describe.skip("api.finish_game (legacy single_choice retired)", () => {
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
