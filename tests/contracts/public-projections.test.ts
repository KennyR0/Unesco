import { describe, expect, it } from "vitest";

import { PublicQuestionSchema } from "@antidoto/contracts";

import { validQuestion } from "../fixtures/contract-samples";

describe("proyecciones públicas", () => {
  it("no admite solución, corrección, puntos, UUID ni hash", () => {
    for (const forbidden of [
      { correctOptionId: "internal" },
      { isCorrect: true },
      { pointsAwarded: 100 },
      { sessionId: "00000000-0000-0000-0000-000000000000" },
      { hash: "a".repeat(64) },
    ]) {
      expect(PublicQuestionSchema.safeParse({ ...validQuestion, ...forbidden }).success).toBe(false);
    }
  });
});
