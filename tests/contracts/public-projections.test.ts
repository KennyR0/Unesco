import { describe, expect, it } from "vitest";

import { PublicQuestionSchema } from "@antidoto/contracts";

import { validQuestion } from "../fixtures/contract-samples";
import { PublicItemSchema } from "../../src/features/game/domain/schemas";

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

  it("valida una proyección arcade y no expone autoridad del servidor", () => {
    const item = {
      gameCode: "real-o-ia" as const,
      mechanic: "image_verdict" as const,
      itemId: "item-1",
      prompt: "Observa la imagen.",
      context: "Una escena para analizar.",
      media: {
        kind: "image" as const,
        src: "/images/questions/contexto-fuera-de-campo.webp",
        alt: "Escena urbana con elementos visibles.",
        decorative: false,
        width: 640,
        height: 480,
        fallbackText: "La imagen no está disponible.",
      },
      choices: ["real", "ai"] as const,
    };

    expect(PublicItemSchema.safeParse(item).success).toBe(true);

    for (const field of [
      "solution",
      "solutionPrivate",
      "score",
      "points",
      "maxPoints",
      "correct",
      "rankingScore",
      "nextItem",
      "completed",
      "sessionId",
      "input",
    ]) {
      expect(
        PublicItemSchema.safeParse({
          ...item,
          [field]: field === "completed" ? true : "private",
        }).success,
        field,
      ).toBe(false);
    }
  });
});
