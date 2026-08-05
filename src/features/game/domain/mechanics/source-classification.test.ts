import { describe, expect, it } from "vitest";

import { validateContentCollection } from "../../content/content-validation";
import contentPack from "../../content/game-items/radar-de-fuentes.v1.json";
import { calculateGameScore } from "../scoring";
import {
  acceptSourceClassification,
  evaluateSourceClassification,
  parseSourceClassificationSolution,
  resolveSourceAcceptance,
} from "./source-classification";

const items = validateContentCollection(contentPack);

describe("evaluador source_classification", () => {
  it("asigna +1 cuando la categoría coincide y devuelve las señales educativas", () => {
    const item = items[0];
    const solution = parseSourceClassificationSolution(item.solutionPrivate);

    const evaluation = evaluateSourceClassification({
      answer: "reliable",
      solution,
      feedback: item.feedback,
    });

    expect(evaluation).toMatchObject({
      classification: "reliable",
      correct: true,
      points: 1,
      feedback: {
        status: "correct",
        signals: item.feedback.signals,
        recommendation: item.feedback.recommendation,
        revealedAnswer: "Confiable",
      },
    });
    expect(evaluation).not.toHaveProperty("solutionPrivate");
    expect(evaluation).not.toHaveProperty("evaluationSignals");
  });

  it("asigna 0 cuando falla y conserva el feedback para aprender", () => {
    const item = items[0];
    const solution = parseSourceClassificationSolution(item.solutionPrivate);

    const evaluation = evaluateSourceClassification({
      answer: "fraudulent",
      solution,
      feedback: item.feedback,
    });

    expect(evaluation).toMatchObject({
      classification: "fraudulent",
      correct: false,
      points: 0,
      feedback: {
        status: "incorrect",
        signals: item.feedback.signals,
        recommendation: item.feedback.recommendation,
        revealedAnswer: "Confiable",
      },
    });
  });

  it("rechaza una solución privada incompleta o con categoría desconocida", () => {
    expect(() =>
      parseSourceClassificationSolution({ classification: "unknown" }),
    ).toThrow("SOURCE_CLASSIFICATION_INVALID_SOLUTION");
    expect(() =>
      parseSourceClassificationSolution({
        classification: "reliable",
        evaluationSignals: [],
      }),
    ).toThrow("SOURCE_CLASSIFICATION_INVALID_SOLUTION");
  });

  it("rechaza una fuente ajena a la sesión", () => {
    const sessionItemIds = items.slice(0, 3).map((item) => item.itemId);

    expect(
      resolveSourceAcceptance({
        itemId: "radar-de-fuentes-009",
        sessionItemIds,
        acceptedItemIds: [],
      }),
    ).toEqual({ kind: "reject", code: "ITEM_NOT_IN_SESSION" });

    const item = items[8];
    const result = acceptSourceClassification({
      itemId: item.itemId,
      sessionItemIds,
      acceptedItemIds: [],
      answer: "fraudulent",
      solution: parseSourceClassificationSolution(item.solutionPrivate),
      feedback: item.feedback,
    });

    expect(result).toEqual({
      kind: "rejected",
      code: "ITEM_NOT_IN_SESSION",
    });
  });

  it("rechaza un segundo intento sobre una fuente ya aceptada", () => {
    const item = items[1];
    const sessionItemIds = items.map((entry) => entry.itemId);
    const solution = parseSourceClassificationSolution(item.solutionPrivate);

    const first = acceptSourceClassification({
      itemId: item.itemId,
      sessionItemIds,
      acceptedItemIds: [],
      answer: solution.classification,
      solution,
      feedback: item.feedback,
    });

    expect(first.kind).toBe("accepted");
    if (first.kind !== "accepted") {
      throw new Error("Se esperaba la primera aceptación.");
    }
    expect(first.evaluation.correct).toBe(true);
    expect(first.evaluation.points).toBe(1);

    const duplicate = acceptSourceClassification({
      itemId: item.itemId,
      sessionItemIds,
      acceptedItemIds: [item.itemId],
      answer: "doubtful",
      solution,
      feedback: item.feedback,
    });

    expect(duplicate).toEqual({
      kind: "rejected",
      code: "ANSWER_ALREADY_ACCEPTED",
    });
  });

  it("reproduce el score de sesión 0–9 al clasificar las nueve fuentes", () => {
    const sessionItemIds = items.map((item) => item.itemId);
    const acceptedItemIds: string[] = [];
    const answers: Array<{ correct: boolean }> = [];
    let points = 0;

    for (const item of items) {
      const solution = parseSourceClassificationSolution(item.solutionPrivate);
      const result = acceptSourceClassification({
        itemId: item.itemId,
        sessionItemIds,
        acceptedItemIds,
        answer: solution.classification,
        solution,
        feedback: item.feedback,
      });

      expect(result.kind).toBe("accepted");
      if (result.kind !== "accepted") {
        throw new Error(`Falló la aceptación de ${item.itemId}.`);
      }

      expect(result.evaluation.correct).toBe(true);
      expect(result.evaluation.points).toBe(1);
      points += result.evaluation.points;
      acceptedItemIds.push(item.itemId);
      answers.push({ correct: true });
    }

    const sessionScore = calculateGameScore({
      gameCode: "radar-de-fuentes",
      answers,
    });

    expect(points).toBe(9);
    expect(acceptedItemIds).toHaveLength(9);
    expect(sessionScore.points).toBe(9);
    expect(sessionScore.maxPoints).toBe(9);
    expect(sessionScore.correct).toBe(9);
  });
});
