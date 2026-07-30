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
});
