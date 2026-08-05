import { describe, expect, it } from "vitest";

import {
  AnswerResultSchema,
  FinalResultSchema,
  GameStateSchema,
  PublicQuestionSchema,
  RoundSizeSchema,
  createAliasSubmissionSchema,
} from "@antidoto/contracts";

import { validQuestion } from "../fixtures/contract-samples";
import {
  GameActionSchema,
  GameResultSchema as ArcadeGameResultSchema,
  GameStateSchema as ArcadeGameStateSchema,
  SubmitGameActionCommandSchema,
} from "../../src/features/game/domain/schemas";

describe("schemas de dominio", () => {
  it("normaliza alias y bloquea el alias completo sin revelar la lista", () => {
    const schema = createAliasSubmissionSchema(new Set(["admin"]));
    expect(schema.parse({ alias: "  Ana  " }).alias).toBe("Ana");
    expect(schema.safeParse({ alias: "ADMIN" }).success).toBe(false);
    expect(schema.safeParse({ alias: "adm" }).success).toBe(true);
    expect(schema.safeParse({ alias: "a" }).success).toBe(false);
  });

  it("aplica exactamente el intervalo contractual de RoundSize", () => {
    for (const value of [1, 5, 10]) {
      expect(RoundSizeSchema.safeParse(value).success).toBe(true);
    }
    for (const value of [0, 11, 1.5]) {
      expect(RoundSizeSchema.safeParse(value).success).toBe(false);
    }
  });

  it("rechaza proyecciones de pregunta con solución o campos internos", () => {
    expect(PublicQuestionSchema.safeParse(validQuestion).success).toBe(true);
    expect(
      PublicQuestionSchema.safeParse({
        ...validQuestion,
        correctOptionRef: validQuestion.options[0].ref,
      }).success,
    ).toBe(false);
  });

  it("rechaza estados y resultados con derivaciones incoherentes", () => {
    expect(
      AnswerResultSchema.safeParse({
        questionRef: validQuestion.ref,
        selectedOptionRef: validQuestion.options[0].ref,
        feedback: {
          explanation: "La fuente permite contrastar la afirmación.",
          signals: ["Procedencia verificable"],
          recommendation: "Consulta la fuente original.",
        },
        progress: {
          currentQuestion: 1,
          totalQuestions: 5,
          answeredQuestions: 1,
        },
        outcome: "correct",
        pointsAwarded: 100,
      }).success,
    ).toBe(true);
    expect(GameStateSchema.safeParse({ view: "question" }).success).toBe(false);
    expect(
      FinalResultSchema.safeParse({
        alias: "Ana",
        score: 100,
        correctAnswers: 1,
        totalQuestions: 5,
        maxScore: 500,
        scoringRule: {
          version: "single-choice-100-v1",
          pointsPerCorrectAnswer: 100,
          pointsPerIncorrectAnswer: 0,
          speedBonus: false,
        },
        educationalClosingMessage:
          "Antes de compartir, verifica la fuente, la evidencia y el contexto.",
      }).success,
    ).toBe(true);
  });

  it("valida acciones arcade y rechaza campos de autoridad", () => {
    const action = {
      gameCode: "real-o-ia" as const,
      itemId: "item-1",
      input: { kind: "verdict" as const, value: "real" as const },
    };

    expect(GameActionSchema.safeParse(action).success).toBe(true);
    expect(
      SubmitGameActionCommandSchema.safeParse({
        ...action,
        sessionId: "session-1",
      }).success,
    ).toBe(true);

    for (const field of [
      "score",
      "points",
      "solution",
      "completed",
      "rankingScore",
      "nextItem",
    ]) {
      expect(
        GameActionSchema.safeParse({
          ...action,
          [field]: field === "completed" ? true : 10,
        }).success,
        field,
      ).toBe(false);
    }
  });

  it("rechaza estado arcade con mecánica o posición incoherente", () => {
    const state = {
      sessionId: "session-1",
      gameCode: "real-o-ia" as const,
      mechanic: "image_verdict" as const,
      status: "active" as const,
      alias: "Ana",
      position: 0,
      total: 8,
      item: null,
      feedback: null,
      provisionalScore: null,
      nextAction: "submit" as const,
    };

    expect(ArcadeGameStateSchema.safeParse(state).success).toBe(true);
    expect(
      ArcadeGameStateSchema.safeParse({
        ...state,
        mechanic: "timed_feed",
      }).success,
    ).toBe(false);
    expect(
      ArcadeGameStateSchema.safeParse({
        ...state,
        position: 9,
      }).success,
    ).toBe(false);
  });

  it("rechaza un resultado arcade incompleto o con elegibilidad impuesta", () => {
    const result = {
      sessionId: "session-1",
      gameCode: "real-o-ia" as const,
      alias: "Ana",
      status: "finished" as const,
      answered: 8,
      total: 8,
      learningSummary: "Observaste señales antes de decidir.",
      score: {
        points: 80,
        maxPoints: 80,
        correct: 8,
        errors: 0,
        bonusPoints: 0,
        penaltyPoints: 0,
        timeLimitSeconds: null,
        timeUsedSeconds: null,
      },
      simulatedReach: null,
      itemDigests: null,
    };

    expect(ArcadeGameResultSchema.safeParse(result).success).toBe(true);
    expect(
      ArcadeGameResultSchema.safeParse({
        ...result,
        answered: 7,
      }).success,
    ).toBe(false);
    expect(
      ArcadeGameResultSchema.safeParse({
        ...result,
        leaderboardEligible: true,
      }).success,
    ).toBe(false);
  });
});
