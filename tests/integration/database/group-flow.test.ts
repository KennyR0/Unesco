
import { describe, expect, it } from "vitest";

import { createContentRepository } from "../../../src/features/game/content/content-repository";
import { validateContentCollection } from "../../../src/features/game/content/content-validation";
import contentPack from "../../../src/features/game/content/game-items/grupo.v1.json";
import {
  evaluateGroupDecision,
  parseGroupDecisionSolution,
  type GroupAction,
} from "../../../src/features/game/domain/mechanics/group-decision";
import {
  calculateGameScore,
  maxPointsForGame,
} from "../../../src/features/game/domain/scoring";
import { arcadeSchemaAvailable, sql } from "../../fixtures/supabase-local";

const ACTIONS: readonly GroupAction[] = ["forward", "verify", "pause"];

const arcadeDatabaseAvailable = arcadeSchemaAvailable;

describe("flujo de El Grupo (T048)", () => {
  it("cubre orden editorial, acciones, consecuencias y score máximo 12 con fixtures", () => {
    const items = validateContentCollection(contentPack);
    const repository = createContentRepository(contentPack, {
      activeVersion: "2026-07-30.1",
    });
    const published = repository.listPublishedItems("grupo");

    expect(items).toHaveLength(6);
    expect(published).toHaveLength(6);
    expect(published.map((item) => item.sequence)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(published.map((item) => item.itemId)).toEqual([
      "grupo-001",
      "grupo-002",
      "grupo-003",
      "grupo-004",
      "grupo-005",
      "grupo-006",
    ]);

    const bestOutcomes = published.map((item) => {
      const publicItem = repository.getPublicItem("grupo", item.itemId);
      expect(publicItem).not.toBeNull();
      expect(publicItem && "solutionPrivate" in publicItem).toBe(false);
      expect(publicItem && "feedback" in publicItem).toBe(false);

      if (publicItem?.gameCode === "grupo") {
        expect(publicItem.messages.length).toBeGreaterThan(0);
        expect(publicItem.actions).toEqual(["forward", "verify", "pause"]);
      }

      const solution = parseGroupDecisionSolution(item.solutionPrivate);
      const evaluations = ACTIONS.map((action) =>
        evaluateGroupDecision({
          answer: action,
          solution,
          feedback: item.feedback,
        }),
      );

      for (const evaluation of evaluations) {
        expect([0, 1, 2]).toContain(evaluation.points);
        expect(evaluation.consequences.length).toBeGreaterThan(0);
        expect(evaluation.narrativeResult.length).toBeGreaterThan(0);
        expect(evaluation.actionFeedback.length).toBeGreaterThan(0);
        expect(evaluation).not.toHaveProperty("solutionPrivate");
        expect(evaluation).not.toHaveProperty("actionEvaluations");
        expect(JSON.stringify(evaluation)).not.toContain("actionEvaluations");
      }

      const best = evaluations.reduce((current, candidate) =>
        candidate.points > current.points ? candidate : current,
      );
      expect(best.points).toBe(2);
      expect(best.outcome).toBe("protective");
      return best.outcome;
    });

    expect(maxPointsForGame("grupo")).toBe(12);
    expect(bestOutcomes).toEqual([
      "protective",
      "protective",
      "protective",
      "protective",
      "protective",
      "protective",
    ]);

    const perfect = calculateGameScore({
      gameCode: "grupo",
      answers: bestOutcomes.map((outcome) => ({ outcome })),
    });
    expect(perfect).toMatchObject({
      points: 12,
      maxPoints: 12,
      errors: 0,
    });
    expect(perfect.points).toBeLessThanOrEqual(perfect.maxPoints);

    const mixed = calculateGameScore({
      gameCode: "grupo",
      answers: [
        { outcome: "protective" },
        { outcome: "partial" },
        { outcome: "harmful" },
        { outcome: "protective" },
        { outcome: "partial" },
        { outcome: "harmful" },
      ],
    });
    expect(mixed.points).toBe(2 + 1 + 0 + 2 + 1 + 0);
    expect(mixed.maxPoints).toBe(12);
    expect(mixed.errors).toBe(2);
  });
});

describe.skipIf(!arcadeDatabaseAvailable())(
  "flujo de El Grupo en la persistencia arcade",
  () => {
    it("mantiene el catálogo físico y la frontera privada en SQL", () => {
      expect(
        sql(
          "select count(*) from private_arcade.game_catalog where game_code = 'grupo' and mechanic = 'group_decision' and available;",
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
      expect(
        Number(
          sql(
            "select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind in ('r', 'v', 'm', 'f') and c.relname like 'game_%';",
          ),
        ),
      ).toBe(0);
    });
  },
);
