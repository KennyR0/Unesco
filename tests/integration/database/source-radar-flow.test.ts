
import { describe, expect, it } from "vitest";

import { createContentRepository } from "../../../src/features/game/content/content-repository";
import { validateContentCollection } from "../../../src/features/game/content/content-validation";
import contentPack from "../../../src/features/game/content/game-items/radar-de-fuentes.v1.json";
import {
  acceptSourceClassification,
  parseSourceClassificationSolution,
} from "../../../src/features/game/domain/mechanics/source-classification";
import {
  calculateGameScore,
  maxPointsForGame,
} from "../../../src/features/game/domain/scoring";
import { arcadeSchemaAvailable, sql } from "../../fixtures/supabase-local";

const arcadeDatabaseAvailable = arcadeSchemaAvailable;

describe("flujo de Radar de Fuentes (T056)", () => {
  it("rechaza una fuente ajena sin evaluarla ni revelar feedback", () => {
    const items = validateContentCollection(contentPack);
    const assignedItems = items.slice(0, 8);
    const foreignItem = items[8];

    const result = acceptSourceClassification({
      itemId: foreignItem.itemId,
      sessionItemIds: assignedItems.map((item) => item.itemId),
      acceptedItemIds: [],
      answer: "fraudulent",
      solution: parseSourceClassificationSolution(foreignItem.solutionPrivate),
      feedback: foreignItem.feedback,
    });

    expect(result).toEqual({
      kind: "rejected",
      code: "ITEM_NOT_IN_SESSION",
    });
    expect(result).not.toHaveProperty("evaluation");
    expect(JSON.stringify(result)).not.toContain(
      foreignItem.feedback.explanation,
    );
  });

  it("acepta una fuente una sola vez y conserva el primer resultado", () => {
    const [item] = validateContentCollection(contentPack);
    const solution = parseSourceClassificationSolution(item.solutionPrivate);
    const sessionItemIds = [item.itemId];

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
      throw new Error("Se esperaba la primera aceptación de la fuente.");
    }
    expect(first.evaluation).toMatchObject({
      classification: "reliable",
      correct: true,
      points: 1,
    });

    const duplicate = acceptSourceClassification({
      itemId: item.itemId,
      sessionItemIds,
      acceptedItemIds: [item.itemId],
      answer: "fraudulent",
      solution,
      feedback: item.feedback,
    });

    expect(duplicate).toEqual({
      kind: "rejected",
      code: "ANSWER_ALREADY_ACCEPTED",
    });
    expect(duplicate).not.toHaveProperty("evaluation");
    expect(first.evaluation.points).toBe(1);
  });

  it("devuelve feedback educativo completo y alcanza el score máximo 9", () => {
    const items = validateContentCollection(contentPack);
    const repository = createContentRepository(contentPack, {
      activeVersion: "2026-07-30.1",
    });
    const published = repository.listPublishedItems("radar-de-fuentes");
    const sessionItemIds = published.map((item) => item.itemId);
    const acceptedItemIds: string[] = [];
    const answers: Array<{ correct: boolean }> = [];

    expect(items).toHaveLength(9);
    expect(published).toHaveLength(9);
    expect(published.map((item) => item.sequence)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
    expect(maxPointsForGame("radar-de-fuentes")).toBe(9);

    for (const item of published) {
      const publicItem = repository.getPublicItem(
        "radar-de-fuentes",
        item.itemId,
      );
      expect(publicItem).not.toBeNull();
      expect(publicItem && "solutionPrivate" in publicItem).toBe(false);
      expect(publicItem && "feedback" in publicItem).toBe(false);

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
      expect(result.evaluation.feedback).toMatchObject({
        status: "correct",
        explanation: item.feedback.explanation,
        signals: item.feedback.signals,
        recommendation: item.feedback.recommendation,
        revealedAnswer: item.feedback.revealedAnswer,
      });
      expect(result.evaluation.feedback.signals.length).toBeGreaterThan(0);
      expect(result.evaluation).not.toHaveProperty("solutionPrivate");
      expect(result.evaluation).not.toHaveProperty("evaluationSignals");

      acceptedItemIds.push(item.itemId);
      answers.push({ correct: result.evaluation.correct });
    }

    const score = calculateGameScore({
      gameCode: "radar-de-fuentes",
      answers,
    });

    expect(acceptedItemIds).toHaveLength(9);
    expect(score).toMatchObject({
      points: 9,
      maxPoints: 9,
      correct: 9,
      errors: 0,
      bonusPoints: 0,
      penaltyPoints: 0,
    });
    expect(score.points).toBeLessThanOrEqual(score.maxPoints);
  });
});

describe.skipIf(!arcadeDatabaseAvailable())(
  "flujo de Radar de Fuentes en la persistencia arcade",
  () => {
    it("mantiene el catálogo físico y las soluciones fuera del esquema público", () => {
      expect(
        sql(
          "select count(*) from private_arcade.game_catalog where game_code = 'radar-de-fuentes' and mechanic = 'source_classification' and available;",
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
