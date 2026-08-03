import { describe, expect, it } from "vitest";

import { validateContentCollection } from "../../content/content-validation";
import contentPack from "../../content/game-items/mente-maestra.v1.json";
import { calculateGameScore } from "../scoring";
import {
  assembleGuidedAutopsySession,
  AUTOPSY_STEPS,
  calculateSimulatedReach,
  evaluateGuidedAutopsyStep,
  parseGuidedAutopsySolution,
  SIMULATED_REACH_MAX,
  SIMULATED_REACH_MIN,
  type GuidedAutopsySelection,
} from "./guided-autopsy";

const items = validateContentCollection(contentPack);

describe("evaluador guided_autopsy (T063)", () => {
  it("asigna +1 por paso completado y conserva feedback instructivo sin exponer la solución", () => {
    const item = items[0];
    const solution = parseGuidedAutopsySolution(item.solutionPrivate);
    const optionId = Object.keys(solution.optionEvaluations)[0];

    const evaluation = evaluateGuidedAutopsyStep({
      step: "objective",
      optionId,
      solution,
      feedback: item.feedback,
    });

    expect(evaluation).toMatchObject({
      step: "objective",
      optionId,
      completed: true,
      points: 1,
      feedback: {
        status: "instructive",
        signals: item.feedback.signals,
        recommendation: item.feedback.recommendation,
        revealedAnswer: item.feedback.revealedAnswer,
      },
    });
    expect(evaluation.reachWeight).toBeGreaterThan(0);
    expect(evaluation).not.toHaveProperty("solutionPrivate");
    expect(evaluation).not.toHaveProperty("optionEvaluations");
  });

  it("rechaza optionId desconocido, paso inválido o desalineado con la solución", () => {
    const item = items[1];
    const solution = parseGuidedAutopsySolution(item.solutionPrivate);

    expect(() =>
      evaluateGuidedAutopsyStep({
        step: "emotion",
        optionId: "option-inexistente",
        solution,
        feedback: item.feedback,
      }),
    ).toThrow("GUIDED_AUTOPSY_INVALID_OPTION");

    expect(() =>
      evaluateGuidedAutopsyStep({
        step: "headline",
        optionId: Object.keys(solution.optionEvaluations)[0],
        solution,
        feedback: item.feedback,
      }),
    ).toThrow("GUIDED_AUTOPSY_STEP_MISMATCH");

    expect(() => parseGuidedAutopsySolution({ step: "emotion" })).toThrow(
      "GUIDED_AUTOPSY_INVALID_SOLUTION",
    );
  });

  it("mantiene la viralidad simulada separada del score y acotada a 65–95", () => {
    const selections: GuidedAutopsySelection[] = [];
    let educationalPoints = 0;

    for (const item of items) {
      if (item.publicItem.gameCode !== "mente-maestra") {
        throw new Error("El pack solo debe contener items de mente-maestra.");
      }

      const solution = parseGuidedAutopsySolution(item.solutionPrivate);
      const optionId = Object.keys(solution.optionEvaluations)[0];
      const evaluation = evaluateGuidedAutopsyStep({
        step: item.publicItem.step,
        optionId,
        solution,
        feedback: item.feedback,
      });

      educationalPoints += evaluation.points;
      selections.push({
        step: evaluation.step,
        optionId: evaluation.optionId,
        reachWeight: evaluation.reachWeight,
        autopsyEntry: evaluation.autopsyEntry,
      });
    }

    const evidenceSolution = parseGuidedAutopsySolution(
      items[3].solutionPrivate,
    );
    const session = assembleGuidedAutopsySession({
      selections,
      simulationAssets: evidenceSolution.simulationAssets,
    });

    expect(educationalPoints).toBe(4);
    expect(session.points).toBe(4);
    expect(session.maxPoints).toBe(4);
    expect(session.completedSteps).toBe(4);
    expect(session.simulatedReach).toBeGreaterThanOrEqual(SIMULATED_REACH_MIN);
    expect(session.simulatedReach).toBeLessThanOrEqual(SIMULATED_REACH_MAX);
    expect(session.points).not.toBe(session.simulatedReach);
    expect(session.publishesExternally).toBe(false);
    expect(session.educationalDisclaimer).toMatch(/simulación educativa/i);
    expect(session.fictionalComments.length).toBeGreaterThanOrEqual(3);
    expect(session.autopsyEntries.length).toBe(4);

    const gameScore = calculateGameScore({
      gameCode: "mente-maestra",
      answers: selections.map(() => ({ completed: true })),
    });
    expect(gameScore.points).toBe(4);
    expect(gameScore).not.toHaveProperty("simulatedReach");
  });

  it("cubre el rango editorial 65–95 con las combinaciones mínima y máxima del pack", () => {
    const weightsByStep = items.map((item) => {
      const solution = parseGuidedAutopsySolution(item.solutionPrivate);
      return Object.values(solution.optionEvaluations).map(
        (evaluation) => evaluation.reachWeight,
      );
    });

    const minimumWeights = weightsByStep.map((weights) => Math.min(...weights));
    const maximumWeights = weightsByStep.map((weights) => Math.max(...weights));

    expect(calculateSimulatedReach(minimumWeights)).toBe(65);
    expect(calculateSimulatedReach(maximumWeights)).toBe(95);
    expect(calculateSimulatedReach([1, 1, 1, 1])).toBe(SIMULATED_REACH_MIN);
    expect(calculateSimulatedReach([40, 40, 40, 40])).toBe(SIMULATED_REACH_MAX);
  });

  it("no premia la opción de mayor alcance con más puntos educativos", () => {
    const headline = items[2];
    if (headline.publicItem.gameCode !== "mente-maestra") {
      throw new Error("Se esperaba el paso headline.");
    }

    const solution = parseGuidedAutopsySolution(headline.solutionPrivate);
    const entries = Object.entries(solution.optionEvaluations);
    const lowest = entries.reduce((current, candidate) =>
      candidate[1].reachWeight < current[1].reachWeight ? candidate : current,
    );
    const highest = entries.reduce((current, candidate) =>
      candidate[1].reachWeight > current[1].reachWeight ? candidate : current,
    );

    expect(highest[1].reachWeight).toBeGreaterThan(lowest[1].reachWeight);

    const lowEval = evaluateGuidedAutopsyStep({
      step: "headline",
      optionId: lowest[0],
      solution,
      feedback: headline.feedback,
    });
    const highEval = evaluateGuidedAutopsyStep({
      step: "headline",
      optionId: highest[0],
      solution,
      feedback: headline.feedback,
    });

    expect(lowEval.points).toBe(1);
    expect(highEval.points).toBe(1);
    expect(lowEval.points).toBe(highEval.points);
    expect(highEval.reachWeight).toBeGreaterThan(lowEval.reachWeight);
  });

  it("declara los cuatro pasos canónicos en orden contractual", () => {
    expect(AUTOPSY_STEPS).toEqual([
      "objective",
      "emotion",
      "headline",
      "evidence",
    ]);
    expect(
      items.map((item) =>
        item.publicItem.gameCode === "mente-maestra"
          ? item.publicItem.step
          : null,
      ),
    ).toEqual([...AUTOPSY_STEPS]);
  });
});
