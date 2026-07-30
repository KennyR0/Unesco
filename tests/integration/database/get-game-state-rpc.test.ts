import { describe, expect, it } from "vitest";

import { newTokenHash, resetGameData, sessionRow, sql, startGame, state } from "../../fixtures/supabase-local";

describe("api.get_game_state", () => {
  it("lee una pregunta sin solución y proyecta vencimiento sin escritura", () => {
    resetGameData();
    const tokenHash = newTokenHash();
    startGame(tokenHash, 5);
    const before = sessionRow(tokenHash);
    const current = state(tokenHash);
    expect(current.ok).toBe(true);
    expect(JSON.stringify(current)).not.toContain("correct_option_id");
    expect(JSON.stringify(current)).not.toContain("correctOptionRef");
    expect(sessionRow(tokenHash)).toEqual(before);
    sql(`update private.game_sessions set expires_at=now()-interval '1 second' where session_token_hash=decode('${tokenHash}','hex');`);
    const beforeExpiredRead = sessionRow(tokenHash);
    const expired = state(tokenHash);
    expect(expired.ok).toBe(false);
    expect(expired.code).toBe("SESSION_INVALID");
    expect(sessionRow(tokenHash)).toEqual(beforeExpiredRead);
  });
});
