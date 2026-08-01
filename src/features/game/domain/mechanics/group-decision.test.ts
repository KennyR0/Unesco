import { describe, expect, it } from "vitest";

import { validateContentCollection } from "../../content/content-validation";
import contentPack from "../../content/game-items/grupo.v1.json";
import { calculateGameScore } from "../scoring";
import {
  evaluateGroupDecision,
  parseGroupDecisionSolution,
  type GroupDecisionOutcome,
} from "./group-decision";

const items = validateContentCollection(contentPack);

function outcomeForScore(score: number): GroupDecisionOutcome {
  if (score === 2) {
    return "protective";
  }
  if (score === 1) {
    return "partial";
  }
  return "harmful";
}

describe("evaluador group_action", () => {
  it("asigna +2 a una decisión que protege y verifica", () => {
    const item = items[0];
    const solution = parseGroupDecisionSolution(item.solutionPrivate);

    const evaluation = evaluateGroupDecision({
      answer: "verify",
      solution,
      feedback: item.feedback,
    });

    expect(evaluation).toMatchObject({
      action: "verify",
      outcome: "protective",
      points: 2,
      score: 2,
      feedback: {
        status: "correct",
        signals: item.feedback.signals,
        recommendation: item.feedback.recommendation,
        revealedAnswer: item.feedback.revealedAnswer,
      },
    });
    expect(evaluation.narrativeResult.trim().length).toBeGreaterThan(0);
    expect(evaluation.consequences.length).toBeGreaterThan(0);
    expect(evaluation).not.toHaveProperty("solutionPrivate");
    expect(evaluation).not.toHaveProperty("actionEvaluations");
  });

  it("asigna +1 cuando la acción frena parcialmente la difusión", () => {
    const item = items[0];
    const solution = parseGroupDecisionSolution(item.solutionPrivate);

    const evaluation = evaluateGroupDecision({
      answer: "pause",
      solution,
      feedback: item.feedback,
    });

    expect(evaluation).toMatchObject({
      action: "pause",
      outcome: "partial",
      points: 1,
      score: 1,
      feedback: { status: "instructive" },
    });
    expect(evaluation.consequences.every((consequence) => consequence.trim())).toBe(
      true,
    );
  });

  it("asigna 0 cuando la acción amplifica o actúa sin comprobar", () => {
    const item = items[0];
    const solution = parseGroupDecisionSolution(item.solutionPrivate);

    const evaluation = evaluateGroupDecision({
      answer: "forward",
      solution,
      feedback: item.feedback,
    });

    expect(evaluation).toMatchObject({
      action: "forward",
      outcome: "harmful",
      points: 0,
      score: 0,
      feedback: { status: "incorrect" },
    });
  });

  it("no penaliza reenviar una alerta oficial verificada", () => {
    const item = items.find((candidate) => candidate.sequence === 5);
    expect(item).toBeDefined();

    const solution = parseGroupDecisionSolution(item!.solutionPrivate);
    const evaluation = evaluateGroupDecision({
      answer: "forward",
      solution,
      feedback: item!.feedback,
    });

    expect(evaluation).toMatchObject({
      action: "forward",
      outcome: "protective",
      points: 2,
      score: 2,
      feedback: { status: "correct" },
    });
  });

  it("rechaza reglas privadas incompletas, desconocidas o fuera de rango", () => {
    const validEvaluation = {
      score: 2,
      narrativeResult: "Resultado narrativo.",
      consequences: ["Consecuencia segura."],
      feedback: "Feedback específico.",
    };
    const allActions = {
      forward: validEvaluation,
      verify: validEvaluation,
      pause: validEvaluation,
    };

    expect(() =>
      parseGroupDecisionSolution({
        actionEvaluations: {
          ...allActions,
          forward: { ...validEvaluation, score: 3 },
        },
      }),
    ).toThrow("GROUP_DECISION_INVALID_SOLUTION");
    expect(() =>
      parseGroupDecisionSolution({
        actionEvaluations: {
          forward: validEvaluation,
          verify: validEvaluation,
        },
      }),
    ).toThrow("GROUP_DECISION_INVALID_SOLUTION");
    expect(() =>
      parseGroupDecisionSolution({
        actionEvaluations: {
          ...allActions,
          pause: { ...validEvaluation, consequences: [] },
        },
      }),
    ).toThrow("GROUP_DECISION_INVALID_SOLUTION");
  });

  it("reproduce el máximo de 12 puntos al elegir una acción protectora en cada escena", () => {
    const answers = items.map((item) => {
      const solution = parseGroupDecisionSolution(item.solutionPrivate);
      const bestScore = Math.max(
        ...Object.values(solution.actionEvaluations).map((evaluation) => evaluation.score),
      );
      return { outcome: outcomeForScore(bestScore) };
    });

    const sessionScore = calculateGameScore({
      gameCode: "grupo",
      answers,
    });

    expect(answers).toHaveLength(6);
    expect(answers.every((answer) => answer.outcome === "protective")).toBe(true);
    expect(sessionScore).toMatchObject({
      points: 12,
      maxPoints: 12,
      correct: null,
      errors: 0,
    });
  });
});
