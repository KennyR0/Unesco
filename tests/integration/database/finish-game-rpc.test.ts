import { describe, expect, it } from "vitest";

import { completeRound, finish, newTokenHash, resetGameData, sessionRow, startGame } from "../../fixtures/supabase-local";

const supabaseRpcGateOpen = process.env.RUN_SUPABASE_TESTS === "true";

describe.skipIf(!supabaseRpcGateOpen)("api.finish_game (puerta Supabase)", () => {
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
