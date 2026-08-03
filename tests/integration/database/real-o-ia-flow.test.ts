
import { describe, expect, it } from "vitest";

import { createContentRepository } from "../../../src/features/game/content/content-repository";
import { validateContentCollection } from "../../../src/features/game/content/content-validation";
import contentPack from "../../../src/features/game/content/game-items/real-o-ia.v1.json";
import {
  evaluateImageVerdict,
  parseImageVerdictSolution,
  type ImageVerdict,
} from "../../../src/features/game/domain/mechanics/image-verdict";
import {
  calculateGameScore,
  maxPointsForGame,
} from "../../../src/features/game/domain/scoring";
import { arcadeSchemaAvailable, sql } from "../../fixtures/supabase-local";

const VERDICTS: readonly ImageVerdict[] = ["real", "ai"];

const arcadeDatabaseAvailable = arcadeSchemaAvailable;

describe("flujo de ¿Real o IA? (T044)", () => {
  it("cubre el pool de veinte items, proyección privada y score máximo 80 con fixtures", () => {
    const items = validateContentCollection(contentPack);
    const repository = createContentRepository(contentPack, {
      activeVersion: "2026-07-30.1",
    });
    const published = repository.listPublishedItems("real-o-ia");

    expect(items).toHaveLength(20);
    expect(published).toHaveLength(20);
    expect(published.map((item) => item.sequence)).toEqual(
      Array.from({ length: 20 }, (_, index) => index + 1),
    );
    expect(published.map((item) => item.itemId)).toEqual(
      Array.from(
        { length: 20 },
        (_, index) => `real-o-ia-${String(index + 1).padStart(3, "0")}`,
      ),
    );

    const answers = published.map((item) => {
      const publicItem = repository.getPublicItem("real-o-ia", item.itemId);
      expect(publicItem).not.toBeNull();
      expect(publicItem && "solutionPrivate" in publicItem).toBe(false);
      expect(publicItem && "feedback" in publicItem).toBe(false);
      expect(JSON.stringify(publicItem)).not.toMatch(
        /evaluationSignals|solutionPrivate/,
      );

      const solution = parseImageVerdictSolution(item.solutionPrivate);
      const evaluations = VERDICTS.map((answer) =>
        evaluateImageVerdict({
          answer,
          solution,
          feedback: item.feedback,
        }),
      );

      expect(
        evaluations.every((evaluation) => [0, 10].includes(evaluation.points)),
      ).toBe(true);

      const correct = evaluations.find((evaluation) => evaluation.correct);
      expect(correct?.points).toBe(10);
      expect(correct).not.toHaveProperty("solutionPrivate");
      expect(correct).not.toHaveProperty("evaluationSignals");
      expect(JSON.stringify(correct)).not.toContain("evaluationSignals");

      return { correct: true as const };
    });

    expect(maxPointsForGame("real-o-ia")).toBe(80);

    // La partida usa 8 del pool de 20.
    const perfect = calculateGameScore({
      gameCode: "real-o-ia",
      answers: answers.slice(0, 8),
    });
    expect(perfect).toMatchObject({
      points: 80,
      maxPoints: 80,
      correct: 8,
      errors: 0,
    });

    const mixed = calculateGameScore({
      gameCode: "real-o-ia",
      answers: [
        { correct: true },
        { correct: false },
        { correct: true },
        { correct: false },
        { correct: true },
        { correct: false },
        { correct: true },
        { correct: false },
      ],
    });
    expect(mixed.points).toBe(40);
    expect(mixed.maxPoints).toBe(80);
    expect(mixed.points).toBeLessThanOrEqual(mixed.maxPoints);
  });
});

describe.skipIf(!arcadeDatabaseAvailable())(
  "flujo de ¿Real o IA? en la persistencia arcade",
  () => {
    it("mantiene el catálogo físico y la frontera privada en SQL", () => {
      expect(
        sql(
          "select count(*) from private_arcade.game_catalog where game_code = 'real-o-ia' and mechanic = 'image_verdict' and available;",
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
