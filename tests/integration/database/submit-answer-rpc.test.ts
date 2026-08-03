import { describe, expect, it } from "vitest";

import { newTokenHash, resetGameData, sql, startGame, stateData, submit } from "../../fixtures/supabase-local";

const supabaseRpcGateOpen = process.env.RUN_SUPABASE_TESTS === "true";

describe.skipIf(!supabaseRpcGateOpen)("api.submit_answer (puerta Supabase)", () => {
  it("acepta una sola respuesta, reconcilia replay y rechaza opción ajena", () => {
    resetGameData();
    const tokenHash = newTokenHash();
    startGame(tokenHash, 5);
    const question = stateData(tokenHash).question as { ref: string; options: Array<{ ref: string }> };
    const first = submit(tokenHash, question.ref, question.options[0].ref);
    expect(first.ok).toBe(true);
    expect((first.data as { accepted_new: boolean }).accepted_new).toBe(true);
    const replay = submit(tokenHash, question.ref, question.options[0].ref);
    expect(replay.ok).toBe(true);
    expect((replay.data as { accepted_new: boolean }).accepted_new).toBe(false);
    expect(Number(sql(`select count(*) from private.player_answers pa join private.game_sessions s on s.id=pa.session_id where s.session_token_hash=decode('${tokenHash}','hex');`))).toBe(1);
    const invalidToken = newTokenHash();
    startGame(invalidToken, 5);
    const invalidQuestion = stateData(invalidToken).question as { ref: string };
    const foreign = submit(invalidToken, invalidQuestion.ref, "O999999999999999999999");
    expect(foreign.ok).toBe(false);
    expect(foreign.code).toBe("OPTION_NOT_ALLOWED");
  });
});
