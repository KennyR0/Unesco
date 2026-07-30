import { describe, expect, it } from "vitest";

import { newTokenHash, resetGameData, startGame, stateData, submit } from "../../fixtures/supabase-local";

describe("proyección de solución", () => {
  it("no expone la solución pendiente y solo la incluye tras aceptar", () => {
    resetGameData();
    const tokenHash = newTokenHash();
    startGame(tokenHash, 5);
    const current = stateData(tokenHash);
    expect(JSON.stringify(current)).not.toMatch(/correct_option_id|is_correct|correctOptionRef/);
    const question = current.question as { ref: string; options: Array<{ ref: string }> };
    const feedback = submit(tokenHash, question.ref, question.options[1].ref);
    expect(feedback.ok).toBe(true);
    expect(JSON.stringify(feedback.data)).toContain("correctOptionRef");
  });
});
