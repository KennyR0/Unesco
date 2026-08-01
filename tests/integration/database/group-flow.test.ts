import { describe, expect, it } from "vitest";

import contentPack from "../../../src/features/game/content/game-items/grupo.v1.json";
import { createContentRepository } from "../../../src/features/game/content/content-repository";
import { validateContentCollection } from "../../../src/features/game/content/content-validation";
import {
  evaluateGroupDecision,
  parseGroupDecisionSolution,
  type GroupAction,
} from "../../../src/features/game/domain/mechanics/group-decision";
import { sql } from "../../fixtures/supabase-local";

const ACTIONS: readonly GroupAction[] = ["forward", "verify", "pause"];

describe("flujo de El Grupo en la persistencia arcade", () => {
  it("mantiene catálogo, orden editorial, acciones y score máximo de 12", () => {
    expect(
      sql(
        "select count(*) from private_arcade.game_catalog where game_code = 'grupo' and mechanic = 'group_decision' and available;",
      ),
    ).toBe("1");

    const items = validateContentCollection(contentPack);
    const repository = createContentRepository(contentPack, {
      activeVersion: "2026-07-30.1",
    });
    const published = repository.listPublishedItems("grupo");

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

    const points = published.map((item) => {
      const solution = parseGroupDecisionSolution(item.solutionPrivate);
      const evaluations = ACTIONS.map((action) =>
        evaluateGroupDecision({
          answer: action,
          solution,
          feedback: item.feedback,
        }),
      );

      expect(evaluations.every((evaluation) => [0, 1, 2].includes(evaluation.points))).toBe(
        true,
      );
      return Math.max(...evaluations.map((evaluation) => evaluation.points));
    });

    expect(items).toHaveLength(6);
    expect(points).toEqual([2, 2, 2, 2, 2, 2]);
    expect(points.reduce((total, value) => total + value, 0)).toBe(12);
  });

  it("conserva la frontera privada y rechaza autoridad en respuestas de grupo", () => {
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
});
