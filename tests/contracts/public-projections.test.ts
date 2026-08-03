import { describe, expect, it } from "vitest";

import { PublicQuestionSchema } from "@antidoto/contracts";

import { arcadeContractSamples, validQuestion } from "../fixtures/contract-samples";
import {
  GameResultSchema,
  GameStateSchema,
  PublicFeedbackSchema,
  PublicItemSchema,
} from "../../src/features/game/domain/schemas";

const FORBIDDEN_PUBLIC_FIELDS = [
  "solution",
  "solutionPrivate",
  "score",
  "points",
  "maxPoints",
  "correct",
  "rankingScore",
  "nextItem",
  "completed",
  "leaderboardEligible",
] as const;

describe("proyecciones públicas", () => {
  it("no admite solución, corrección, puntos, UUID ni hash en la proyección legada", () => {
    for (const forbidden of [
      { correctOptionId: "internal" },
      { isCorrect: true },
      { pointsAwarded: 100 },
      { sessionId: "00000000-0000-0000-0000-000000000000" },
      { hash: "a".repeat(64) },
    ]) {
      expect(
        PublicQuestionSchema.safeParse({ ...validQuestion, ...forbidden })
          .success,
      ).toBe(false);
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
      ...FORBIDDEN_PUBLIC_FIELDS,
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

  it("acepta feedback público inline sin campos de solución privada", () => {
    const feedback = PublicFeedbackSchema.parse({
      status: "incorrect",
      explanation: "Falta contexto verificable.",
      signals: ["La fecha no está confirmada."],
      recommendation: "Busca la fuente original.",
      revealedAnswer: "Real",
    });

    expect(feedback).not.toHaveProperty("solutionPrivate");
    expect(feedback).not.toHaveProperty("solution");
    expect(
      PublicFeedbackSchema.safeParse({
        ...feedback,
        solutionPrivate: { verdict: "ai" },
      }).success,
    ).toBe(false);
  });

  it("el GameState con feedback no admite solución ni finalización del cliente", () => {
    const feedbackState = GameStateSchema.parse({
      ...arcadeContractSamples.state,
      status: "feedback",
      item: arcadeContractSamples.state.item,
      feedback: {
        status: "correct",
        explanation: "La respuesta coincide con las señales.",
        signals: ["La fuente conserva contexto."],
        recommendation: "Comprueba antes de compartir.",
        revealedAnswer: null,
      },
      provisionalScore: {
        points: 10,
        maxPoints: 80,
        correct: 1,
        errors: 0,
        bonusPoints: 0,
        penaltyPoints: 0,
        timeLimitSeconds: null,
        timeUsedSeconds: null,
      },
      nextAction: "advance",
    });

    expect(feedbackState.feedback).not.toBeNull();
    expect(JSON.stringify(feedbackState)).not.toContain("solutionPrivate");

    for (const field of FORBIDDEN_PUBLIC_FIELDS) {
      expect(
        GameStateSchema.safeParse({
          ...feedbackState,
          [field]: field === "completed" ? true : { private: true },
        }).success,
        field,
      ).toBe(false);
    }
  });

  it("el GameResult proyecta aprendizaje y score sin solución", () => {
    const result = GameResultSchema.parse(arcadeContractSamples.result);
    expect(result.learningSummary.length).toBeGreaterThan(0);
    expect(result.score.maxPoints).toBeGreaterThan(0);
    expect(result).not.toHaveProperty("solution");
    expect(result).not.toHaveProperty("solutionPrivate");
    expect(result).not.toHaveProperty("feedback");

    expect(
      GameResultSchema.safeParse({
        ...result,
        solutionPrivate: { verdict: "ai" },
      }).success,
    ).toBe(false);
    expect(
      GameResultSchema.safeParse({
        ...result,
        rankingScore: 100,
      }).success,
    ).toBe(false);
  });

  it("revalida de forma idempotente las mismas proyecciones públicas", () => {
    const first = PublicItemSchema.parse(arcadeContractSamples.publicItems[0]);
    const second = PublicItemSchema.parse(arcadeContractSamples.publicItems[0]);
    expect(second).toEqual(first);

    const feedback = {
      status: "instructive" as const,
      explanation: "Revisa el tono.",
      signals: ["Urgencia artificial"],
      recommendation: "Pausa antes de reenviar.",
      revealedAnswer: null,
    };
    expect(PublicFeedbackSchema.parse(feedback)).toEqual(
      PublicFeedbackSchema.parse(feedback),
    );
  });
});
