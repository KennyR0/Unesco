import { describe, expect, it } from "vitest";

import { newTokenHash, resetGameData, sql, startGame } from "../../fixtures/supabase-local";

const supabaseRpcGateOpen = process.env.RUN_SUPABASE_TESTS === "true";

describe.skipIf(!supabaseRpcGateOpen)("api.start_game (puerta Supabase)", () => {
  it("asigna 1, 5 y 10 posiciones y es idempotente por hash", () => {
    resetGameData();
    for (const roundSize of [1, 5, 10]) {
      const tokenHash = newTokenHash();
      const result = startGame(tokenHash, roundSize);
      expect(result.data.ok).toBe(true);
      expect(Number(sql(`select count(*) from private.session_questions sq join private.game_sessions s on s.id=sq.session_id where encode(s.session_token_hash,'hex')='${tokenHash}';`))).toBe(roundSize);
      expect(Number(sql(`select count(*) from private.session_questions sq join private.game_sessions s on s.id=sq.session_id where encode(s.session_token_hash,'hex')='${tokenHash}' and sq.position between 1 and ${roundSize};`))).toBe(roundSize);
      const replay = startGame(tokenHash, roundSize).data;
      expect(replay.idempotent).toBe(true);
    }
    expect(startGame(newTokenHash(), 0).data.ok).toBe(false);
    expect(startGame(newTokenHash(), 11).data.ok).toBe(false);
  });
});
