import { describe, expect, it } from "vitest";

import { validateContentCollection } from "../../content/content-validation";
import contentPack from "../../content/game-items/real-o-ia.v1.json";
import {
  evaluateImageVerdict,
  parseImageVerdictSolution,
} from "./image-verdict";

const items = validateContentCollection(contentPack);

describe("evaluador image_verdict", () => {
  it("asigna +10 cuando el veredicto coincide y devuelve las pistas educativas", () => {
    const item = items[0];
    const solution = parseImageVerdictSolution(item.solutionPrivate);

    const evaluation = evaluateImageVerdict({
      answer: "ai",
      solution,
      feedback: item.feedback,
    });

    expect(evaluation).toMatchObject({
      verdict: "ai",
      correct: true,
      points: 10,
      feedback: {
        status: "correct",
        signals: item.feedback.signals,
        recommendation: item.feedback.recommendation,
        revealedAnswer: "Generada por IA",
      },
    });
    expect(evaluation).not.toHaveProperty("solutionPrivate");
    expect(evaluation).not.toHaveProperty("evaluationSignals");
  });

  it("asigna 0 cuando el veredicto falla y conserva el feedback para aprender", () => {
    const item = items[1];
    const solution = parseImageVerdictSolution(item.solutionPrivate);

    const evaluation = evaluateImageVerdict({
      answer: "ai",
      solution,
      feedback: item.feedback,
    });

    expect(evaluation).toMatchObject({
      verdict: "ai",
      correct: false,
      points: 0,
      feedback: {
        status: "incorrect",
        signals: item.feedback.signals,
        recommendation: item.feedback.recommendation,
        revealedAnswer: "Real",
      },
    });
  });

  it("rechaza una solución privada incompleta o con un veredicto desconocido", () => {
    expect(() => parseImageVerdictSolution({ verdict: "unknown" })).toThrow(
      "IMAGE_VERDICT_INVALID_SOLUTION",
    );
    expect(() =>
      parseImageVerdictSolution({ verdict: "real", evaluationSignals: [] }),
    ).toThrow("IMAGE_VERDICT_INVALID_SOLUTION");
  });
});
