import { execFileSync } from "node:child_process";

import { describe, expect, it } from "vitest";

import { createContentRepository } from "../../../src/features/game/content/content-repository";
import { validateContentCollection } from "../../../src/features/game/content/content-validation";
import contentPack from "../../../src/features/game/content/game-items/mente-maestra.v1.json";
import {
  AUTOPSY_STEPS,
  assembleGuidedAutopsySession,
  calculateSimulatedReach,
  evaluateGuidedAutopsyStep,
  parseGuidedAutopsySolution,
  SIMULATED_REACH_MAX,
  SIMULATED_REACH_MIN,
  type GuidedAutopsySelection,
} from "../../../src/features/game/domain/mechanics/guided-autopsy";
import {
  calculateGameScore,
  maxPointsForGame,
} from "../../../src/features/game/domain/scoring";
import { sql } from "../../fixtures/supabase-local";

function arcadeDatabaseAvailable(): boolean {
  try {
    execFileSync(
      "docker",
      [
        "exec",
        process.env.SUPABASE_DB_CONTAINER ?? "supabase_db_antidoto-trivia-mvp",
        "psql",
        "-U",
        "postgres",
        "-d",
        "postgres",
        "-X",
        "-q",
        "-At",
        "-c",
        "select 1;",
      ],
      { stdio: "ignore" },
    );
    return true;
  } catch {
    return false;
  }
}

describe("flujo de Mente Maestra (T065)", () => {
  it("exige el orden objective → emotion → headline → evidence", () => {
    const items = validateContentCollection(contentPack);
    expect(items).toHaveLength(4);
    expect(items.map((item) => item.sequence)).toEqual([1, 2, 3, 4]);

    const steps = items.map((item) => {
      if (item.publicItem.gameCode !== "mente-maestra") {
        throw new Error("El pack solo debe contener mente-maestra.");
      }
      return item.publicItem.step;
    });
    expect(steps).toEqual([...AUTOPSY_STEPS]);

    const emotion = items[1];
    const emotionSolution = parseGuidedAutopsySolution(emotion.solutionPrivate);
    const optionId = Object.keys(emotionSolution.optionEvaluations)[0];

    expect(() =>
      evaluateGuidedAutopsyStep({
        step: "objective",
        optionId,
        solution: emotionSolution,
        feedback: emotion.feedback,
      }),
    ).toThrow("GUIDED_AUTOPSY_STEP_MISMATCH");

    expect(() =>
      evaluateGuidedAutopsyStep({
        step: "emotion",
        optionId: "option-ajena",
        solution: emotionSolution,
        feedback: emotion.feedback,
      }),
    ).toThrow("GUIDED_AUTOPSY_INVALID_OPTION");
  });

  it("completa los cuatro pasos con autopsia, viralidad separada y score máximo 4", () => {
    const repository = createContentRepository(contentPack, {
      activeVersion: "2026-07-30.1",
    });
    const published = repository.listPublishedItems("mente-maestra");
    const selections: GuidedAutopsySelection[] = [];
    let educationalPoints = 0;

    expect(published).toHaveLength(4);
    expect(maxPointsForGame("mente-maestra")).toBe(4);

    for (const item of published) {
      const publicItem = repository.getPublicItem("mente-maestra", item.itemId);
      expect(publicItem).not.toBeNull();
      expect(publicItem && "solutionPrivate" in publicItem).toBe(false);
      expect(publicItem && "feedback" in publicItem).toBe(false);

      if (publicItem?.gameCode !== "mente-maestra") {
        throw new Error(`Payload público inválido para ${item.itemId}.`);
      }

      const optionId = publicItem.options[0].optionId;
      const evaluation = evaluateGuidedAutopsyStep({
        step: publicItem.step,
        optionId,
        solution: item.solutionPrivate,
        feedback: item.feedback,
      });

      expect(evaluation).toMatchObject({
        step: publicItem.step,
        optionId,
        completed: true,
        points: 1,
        feedback: {
          status: "instructive",
          explanation: item.feedback.explanation,
          signals: item.feedback.signals,
          recommendation: item.feedback.recommendation,
          revealedAnswer: item.feedback.revealedAnswer,
        },
      });
      expect(evaluation.autopsyEntry).not.toBeNull();
      expect(evaluation).not.toHaveProperty("solutionPrivate");
      expect(evaluation).not.toHaveProperty("optionEvaluations");

      educationalPoints += evaluation.points;
      selections.push({
        step: evaluation.step,
        optionId: evaluation.optionId,
        reachWeight: evaluation.reachWeight,
        autopsyEntry: evaluation.autopsyEntry,
      });
    }

    const evidenceSolution = parseGuidedAutopsySolution(
      published[3].solutionPrivate,
    );
    const session = assembleGuidedAutopsySession({
      selections,
      simulationAssets: evidenceSolution.simulationAssets,
    });
    const score = calculateGameScore({
      gameCode: "mente-maestra",
      answers: selections.map(() => ({ completed: true })),
    });

    expect(educationalPoints).toBe(4);
    expect(score).toMatchObject({
      points: 4,
      maxPoints: 4,
      correct: 4,
      errors: 0,
      bonusPoints: 0,
      penaltyPoints: 0,
    });
    expect(score.points).toBeLessThanOrEqual(score.maxPoints);
    expect(score).not.toHaveProperty("simulatedReach");

    expect(session.points).toBe(4);
    expect(session.maxPoints).toBe(4);
    expect(session.completedSteps).toBe(4);
    expect(session.simulatedReach).toBeGreaterThanOrEqual(SIMULATED_REACH_MIN);
    expect(session.simulatedReach).toBeLessThanOrEqual(SIMULATED_REACH_MAX);
    expect(session.simulatedReach).not.toBe(session.points);
    expect(session.autopsyEntries).toHaveLength(4);
    expect(session.fictionalComments.length).toBeGreaterThanOrEqual(3);
    expect(session.educationalDisclaimer).toMatch(/simulación educativa/i);
    expect(session.publishesExternally).toBe(false);

    const serialized = JSON.stringify(session);
    expect(serialized).not.toContain("reachWeight");
    expect(serialized).not.toContain("optionEvaluations");
    expect(serialized).not.toContain("solutionPrivate");
  });

  it("no premia mayor alcance con más puntos y acota la viralidad a 65–95", () => {
    const items = validateContentCollection(contentPack);
    const lowSelections: GuidedAutopsySelection[] = [];
    const highSelections: GuidedAutopsySelection[] = [];

    for (const item of items) {
      if (item.publicItem.gameCode !== "mente-maestra") {
        throw new Error("El pack solo debe contener mente-maestra.");
      }

      const solution = parseGuidedAutopsySolution(item.solutionPrivate);
      const entries = Object.entries(solution.optionEvaluations);
      const lowest = entries.reduce((current, candidate) =>
        candidate[1].reachWeight < current[1].reachWeight ? candidate : current,
      );
      const highest = entries.reduce((current, candidate) =>
        candidate[1].reachWeight > current[1].reachWeight ? candidate : current,
      );

      const lowEval = evaluateGuidedAutopsyStep({
        step: item.publicItem.step,
        optionId: lowest[0],
        solution,
        feedback: item.feedback,
      });
      const highEval = evaluateGuidedAutopsyStep({
        step: item.publicItem.step,
        optionId: highest[0],
        solution,
        feedback: item.feedback,
      });

      expect(lowEval.points).toBe(1);
      expect(highEval.points).toBe(1);

      lowSelections.push({
        step: lowEval.step,
        optionId: lowEval.optionId,
        reachWeight: lowEval.reachWeight,
        autopsyEntry: lowEval.autopsyEntry,
      });
      highSelections.push({
        step: highEval.step,
        optionId: highEval.optionId,
        reachWeight: highEval.reachWeight,
        autopsyEntry: highEval.autopsyEntry,
      });
    }

    expect(
      calculateSimulatedReach(lowSelections.map((entry) => entry.reachWeight)),
    ).toBe(65);
    expect(
      calculateSimulatedReach(highSelections.map((entry) => entry.reachWeight)),
    ).toBe(95);

    const lowSession = assembleGuidedAutopsySession({
      selections: lowSelections,
    });
    const highSession = assembleGuidedAutopsySession({
      selections: highSelections,
    });

    expect(lowSession.points).toBe(4);
    expect(highSession.points).toBe(4);
    expect(lowSession.simulatedReach).toBe(SIMULATED_REACH_MIN);
    expect(highSession.simulatedReach).toBe(SIMULATED_REACH_MAX);
    expect(lowSession.publishesExternally).toBe(false);
    expect(highSession.publishesExternally).toBe(false);
  });
});

describe.skipIf(!arcadeDatabaseAvailable())(
  "flujo de Mente Maestra en la persistencia arcade",
  () => {
    it("mantiene el catálogo físico y las soluciones fuera del esquema público", () => {
      expect(
        sql(
          "select count(*) from private_arcade.game_catalog where game_code = 'mente-maestra' and mechanic = 'guided_autopsy' and available;",
        ),
      ).toBe("1");
      expect(
        Number(
          sql(
            "select count(*) from information_schema.columns where table_schema = 'private_arcade' and table_name = 'item_solution_private' and column_name in ('solution_payload', 'evaluation_rule');",
          ),
        ),
      ).toBe(2);
      expect(
        Number(
          sql(
            "select count(*) from information_schema.columns where table_schema = 'private_arcade' and table_name = 'game_items' and column_name in ('public_payload', 'solution_private', 'solution', 'score', 'points');",
          ),
        ),
      ).toBe(1);
      expect(
        Number(
          sql(
            "select count(*) from pg_constraint where conname in ('game_items_public_payload_safe_check', 'player_answers_input_authority_check');",
          ),
        ),
      ).toBe(2);
    });
  },
);
