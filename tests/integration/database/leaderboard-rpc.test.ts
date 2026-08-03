import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import { LEADERBOARD_LIMIT } from "@antidoto/contracts";

import {
  getLeaderboardFromCandidates,
  ingestRankingCandidates,
  LEADERBOARD_COPY,
  projectEligibleLeaderboard,
  projectLeaderboardFromUnknown,
} from "../../../src/features/game/application/leaderboard";
import {
  calculateRankingScore,
  isRankingEligible,
  type RankingCandidate,
} from "../../../src/features/game/domain/scoring";
import {
  ARCADE_SCHEMA,
  jsonSql,
  resetArcadeData,
  sql,
} from "../../fixtures/supabase-local";

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

function candidate(
  overrides: Partial<RankingCandidate> & Pick<RankingCandidate, "resultId">,
): RankingCandidate {
  return {
    gameCode: "real-o-ia",
    alias: "Ana",
    status: "finished",
    answered: 8,
    total: 8,
    points: 40,
    maxPoints: 80,
    completedAt: "2026-08-01T10:00:00.000Z",
    aliasAllowed: true,
    abuseMarked: false,
    invalidMarked: false,
    ...overrides,
  };
}

describe("ranking global arcade (T039, proyección de aplicación)", () => {
  it("limita a diez, recalcula rankingScore y desempata por completedAt/resultId", () => {
    const rows = [
      candidate({
        resultId: "z-result",
        alias: "Fecha posterior",
        completedAt: "2026-08-01T11:00:00.000Z",
      }),
      candidate({
        resultId: "b-result",
        alias: "ID posterior",
        completedAt: "2026-08-01T10:00:00.000Z",
      }),
      candidate({
        resultId: "a-result",
        alias: "ID anterior",
        completedAt: "2026-08-01T10:00:00.000Z",
      }),
      ...Array.from({ length: 9 }, (_, index) =>
        candidate({
          resultId: `extra-${index}`,
          alias: `Extra ${index}`,
          points: 39,
          completedAt: `2026-08-01T12:${String(index).padStart(2, "0")}:00.000Z`,
        }),
      ),
    ];

    const board = projectLeaderboardFromUnknown(rows);
    expect(board.scope).toBe("global");
    expect(board.limit).toBe(LEADERBOARD_LIMIT);
    expect(board.entries).toHaveLength(10);
    expect(board.entries.slice(0, 3).map((entry) => entry.alias)).toEqual([
      "ID anterior",
      "ID posterior",
      "Fecha posterior",
    ]);
    expect(board.entries[0]).toMatchObject({
      rank: 1,
      rankingScore: 50,
      points: 40,
      maxPoints: 80,
    });
  });

  it("excluye expirados, incompletos, maxPoints inválido y clampa el porcentaje", () => {
    expect(calculateRankingScore(-5, 80)).toBe(0);
    expect(calculateRankingScore(120, 80)).toBe(100);
    expect(calculateRankingScore(10, 0)).toBeNull();

    const base = candidate({ resultId: "ok", points: 70 });
    expect(isRankingEligible(base)).toBe(true);
    expect(isRankingEligible({ ...base, status: "expired" })).toBe(false);
    expect(isRankingEligible({ ...base, answered: 7 })).toBe(false);
    expect(isRankingEligible({ ...base, maxPoints: 0 })).toBe(false);
    expect(isRankingEligible({ ...base, aliasAllowed: false })).toBe(false);

    const board = projectEligibleLeaderboard(
      ingestRankingCandidates([
        candidate({ resultId: "ok", points: 40, alias: "Elegible" }),
        candidate({ resultId: "expired", status: "expired", alias: "Expirado" }),
        candidate({
          resultId: "incomplete",
          answered: 7,
          alias: "Incompleto",
        }),
        candidate({ resultId: "bad-max", maxPoints: 0, alias: "Sin escala" }),
        candidate({
          resultId: "blocked-alias",
          aliasAllowed: false,
          alias: "Bloqueado",
        }),
      ]),
    );

    expect(board.entries.map((entry) => entry.alias)).toEqual(["Elegible"]);
    expect(board.entries[0]?.rankingScore).toBe(50);
  });

  it("trata el fallo vacío como independiente y no reintentable", () => {
    const empty = getLeaderboardFromCandidates([
      candidate({ resultId: "expired-only", status: "expired" }),
    ]);
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.error.code).toBe("LEADERBOARD_EMPTY");
      expect(empty.error.message).toBe(LEADERBOARD_COPY.empty);
      expect(empty.error.retryable).toBe(false);
    }
  });
});

describe.skipIf(!arcadeDatabaseAvailable())(
  "persistencia arcade del ranking (T039)",
  () => {
    it("rechaza proyecciones con max_points <= 0 y elegibilidad inconsistente", () => {
      resetArcadeData();

      const finishedId = randomUUID();
      sql(`
        insert into ${ARCADE_SCHEMA}.game_results (
          result_id, session_id, game_code, alias, alias_normalized, status,
          answered, total, points, max_points, errors, learning_summary,
          ranking_score, leaderboard_eligible, alias_allowed, abuse_flagged,
          invalidated, completed_at
        ) values (
          '${finishedId}'::uuid, null, 'real-o-ia', 'Ana', 'ana', 'finished',
          8, 8, 40, 80, 0, 'Resumen de aprendizaje',
          50, true, true, false, false, '2026-08-01T10:00:00Z'
        );
      `);

      expect(() =>
        sql(`
          insert into ${ARCADE_SCHEMA}.leaderboard_projection (
            result_id, game_code, alias, points, max_points, ranking_score, completed_at
          ) values (
            '${finishedId}'::uuid, 'real-o-ia', 'Ana', 40, 0, 50, '2026-08-01T10:00:00Z'
          );
        `),
      ).toThrow(/leaderboard_projection_score_check|check constraint/i);

      expect(() =>
        sql(`
          insert into ${ARCADE_SCHEMA}.game_results (
            result_id, session_id, game_code, alias, alias_normalized, status,
            answered, total, points, max_points, errors, learning_summary,
            ranking_score, leaderboard_eligible, alias_allowed, abuse_flagged,
            invalidated, completed_at
          ) values (
            '${randomUUID()}'::uuid, null, 'real-o-ia', 'Exp', 'exp', 'expired',
            8, 8, 40, 80, 0, 'Resumen',
            50, true, true, false, false, '2026-08-01T10:00:00Z'
          );
        `),
      ).toThrow(/game_results_ranking_check|check constraint/i);

      expect(() =>
        sql(`
          insert into ${ARCADE_SCHEMA}.game_results (
            result_id, session_id, game_code, alias, alias_normalized, status,
            answered, total, points, max_points, errors, learning_summary,
            ranking_score, leaderboard_eligible, alias_allowed, abuse_flagged,
            invalidated, completed_at
          ) values (
            '${randomUUID()}'::uuid, null, 'real-o-ia', 'Inc', 'inc', 'finished',
            7, 8, 40, 80, 0, 'Resumen',
            50, true, true, false, false, '2026-08-01T10:00:00Z'
          );
        `),
      ).toThrow(/game_results_ranking_check|check constraint/i);
    });

    it("ordena la proyección por ranking_score, completed_at y result_id con tope 10", () => {
      resetArcadeData();

      const rows = [
        {
          id: "11111111-1111-4111-8111-111111111111",
          alias: "ID anterior",
          score: 50,
          at: "2026-08-01T10:00:00Z",
        },
        {
          id: "22222222-2222-4222-8222-222222222222",
          alias: "ID posterior",
          score: 50,
          at: "2026-08-01T10:00:00Z",
        },
        {
          id: "33333333-3333-4333-8333-333333333333",
          alias: "Fecha posterior",
          score: 50,
          at: "2026-08-01T11:00:00Z",
        },
        ...Array.from({ length: 9 }, (_, index) => ({
          id: `44444444-4444-4444-8444-4444444444${String(index).padStart(2, "0")}`,
          alias: `Extra ${index}`,
          score: 40,
          at: `2026-08-01T12:${String(index).padStart(2, "0")}:00Z`,
        })),
      ];

      for (const row of rows) {
        sql(`
          insert into ${ARCADE_SCHEMA}.game_results (
            result_id, session_id, game_code, alias, alias_normalized, status,
            answered, total, points, max_points, errors, learning_summary,
            ranking_score, leaderboard_eligible, alias_allowed, abuse_flagged,
            invalidated, completed_at
          ) values (
            '${row.id}'::uuid, null, 'real-o-ia', ${sqlLiteral(row.alias)},
            ${sqlLiteral(row.alias.toLowerCase())}, 'finished',
            8, 8, ${Math.round((row.score / 100) * 80)}, 80, 0, 'Resumen',
            ${row.score}, true, true, false, false, '${row.at}'
          );

          insert into ${ARCADE_SCHEMA}.leaderboard_projection (
            result_id, game_code, alias, points, max_points, ranking_score, completed_at
          ) values (
            '${row.id}'::uuid, 'real-o-ia', ${sqlLiteral(row.alias)},
            ${Math.round((row.score / 100) * 80)}, 80, ${row.score}, '${row.at}'
          );
        `);
      }

      const top = jsonSql<Array<{ alias: string; ranking_score: number }>>(
        `
        select coalesce(json_agg(row_to_json(t)), '[]'::json)::text
        from (
          select alias, ranking_score
          from ${ARCADE_SCHEMA}.leaderboard_projection
          order by ranking_score desc, completed_at asc, result_id asc
          limit 10
        ) t;
        `,
      );

      expect(top).toHaveLength(10);
      expect(top.slice(0, 3).map((row) => row.alias)).toEqual([
        "ID anterior",
        "ID posterior",
        "Fecha posterior",
      ]);
      expect(Number(sql(`select count(*) from ${ARCADE_SCHEMA}.leaderboard_projection;`))).toBe(
        12,
      );
    });
  },
);

function sqlLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}
