import { describe, expect, it } from "vitest";

import { validateContentCollection } from "../../content/content-validation";
import contentPack from "../../content/game-items/clickbait-swipe.v1.json";
import { calculateGameScore } from "../scoring";
import {
  CLICKBAIT_MAX_STREAK_BONUS,
  evaluateHeadlineClassification,
  parseHeadlineClassificationSolution,
  scoreHeadlineClassificationTurn,
} from "./headline-classification";

const items = validateContentCollection(contentPack);

describe("evaluador headline_classification", () => {
  it("asigna +1 cuando la clasificación coincide y devuelve las señales educativas", () => {
    const item = items[0];
    const solution = parseHeadlineClassificationSolution(item.solutionPrivate);

    const evaluation = evaluateHeadlineClassification({
      answer: "clickbait",
      solution,
      feedback: item.feedback,
    });

    expect(evaluation).toMatchObject({
      classification: "clickbait",
      correct: true,
      points: 1,
      answerPoints: 1,
      bonusPoints: 0,
      streak: 1,
      totalBonusPoints: 0,
      feedback: {
        status: "correct",
        signals: item.feedback.signals,
        recommendation: item.feedback.recommendation,
        revealedAnswer: "Clickbait",
      },
    });
    expect(evaluation).not.toHaveProperty("solutionPrivate");
    expect(evaluation).not.toHaveProperty("evaluationSignals");
  });

  it("asigna 0 cuando falla, reinicia la racha y conserva el feedback para aprender", () => {
    const item = items[1];
    const solution = parseHeadlineClassificationSolution(item.solutionPrivate);

    const evaluation = evaluateHeadlineClassification({
      answer: "clickbait",
      solution,
      feedback: item.feedback,
      streakBefore: 2,
      bonusPointsAwarded: 1,
    });

    expect(evaluation).toMatchObject({
      classification: "clickbait",
      correct: false,
      points: 0,
      answerPoints: 0,
      bonusPoints: 0,
      streak: 0,
      totalBonusPoints: 1,
      feedback: {
        status: "incorrect",
        signals: item.feedback.signals,
        recommendation: item.feedback.recommendation,
        revealedAnswer: "Periodismo",
      },
    });
  });

  it("bonifica +1 al completar una racha de tres aciertos", () => {
    const item = items[2];
    const solution = parseHeadlineClassificationSolution(item.solutionPrivate);

    const evaluation = evaluateHeadlineClassification({
      answer: "clickbait",
      solution,
      feedback: item.feedback,
      streakBefore: 2,
      bonusPointsAwarded: 0,
    });

    expect(evaluation).toMatchObject({
      correct: true,
      answerPoints: 1,
      bonusPoints: 1,
      points: 2,
      streak: 3,
      totalBonusPoints: 1,
    });
  });

  it("limita el bono de racha a un máximo de +4", () => {
    const turn = scoreHeadlineClassificationTurn({
      correct: true,
      streakBefore: 14,
      bonusPointsAwarded: CLICKBAIT_MAX_STREAK_BONUS,
    });

    expect(turn).toMatchObject({
      answerPoints: 1,
      bonusPoints: 0,
      points: 1,
      streak: 15,
      totalBonusPoints: CLICKBAIT_MAX_STREAK_BONUS,
    });
  });

  it("rechaza una solución privada incompleta o con clasificación desconocida", () => {
    expect(() =>
      parseHeadlineClassificationSolution({ classification: "unknown" }),
    ).toThrow("HEADLINE_CLASSIFICATION_INVALID_SOLUTION");
    expect(() =>
      parseHeadlineClassificationSolution({
        classification: "journalism",
        evaluationSignals: [],
      }),
    ).toThrow("HEADLINE_CLASSIFICATION_INVALID_SOLUTION");
  });

  it("reproduce el score de sesión 0–16 al evaluar los doce titulares en secuencia", () => {
    let streakBefore = 0;
    let bonusPointsAwarded = 0;
    let points = 0;
    const answers: Array<{ correct: boolean }> = [];

    for (const item of items) {
      const solution = parseHeadlineClassificationSolution(item.solutionPrivate);
      const evaluation = evaluateHeadlineClassification({
        answer: solution.classification,
        solution,
        feedback: item.feedback,
        streakBefore,
        bonusPointsAwarded,
      });

      expect(evaluation.correct).toBe(true);
      points += evaluation.points;
      streakBefore = evaluation.streak;
      bonusPointsAwarded = evaluation.totalBonusPoints;
      answers.push({ correct: true });
    }

    const sessionScore = calculateGameScore({
      gameCode: "clickbait-swipe",
      answers,
    });

    expect(points).toBe(16);
    expect(bonusPointsAwarded).toBe(4);
    expect(sessionScore.points).toBe(16);
    expect(sessionScore.bonusPoints).toBe(4);
  });
});
