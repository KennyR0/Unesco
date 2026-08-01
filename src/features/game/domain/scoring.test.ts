import { describe, expect, it } from "vitest";

import type { GameCode } from "@antidoto/contracts";

import {
  buildLeaderboard,
  calculateGameScore,
  calculateRankingScore,
  GAME_SCORE_RULES,
  isRankingEligible,
  maxPointsForGame,
  rankLeaderboard,
  type RankingCandidate,
} from "./scoring";

describe("puntuación educativa del arcade", () => {
  it("declara la escala aprobada de los seis juegos", () => {
    const expected: Record<GameCode, number> = {
      "real-o-ia": 80,
      grupo: 12,
      "clickbait-swipe": 16,
      "radar-de-fuentes": 9,
      "feed-60": 30,
      "mente-maestra": 4,
    };

    expect(Object.keys(GAME_SCORE_RULES)).toHaveLength(6);
    for (const [gameCode, maxPoints] of Object.entries(expected)) {
      expect(maxPointsForGame(gameCode as GameCode)).toBe(maxPoints);
    }
  });

  it("calcula las fórmulas específicas sin recibir puntos del cliente", () => {
    expect(
      calculateGameScore({
        gameCode: "real-o-ia",
        answers: [{ correct: true }, { correct: false }, { correct: true }],
      }),
    ).toMatchObject({
      points: 20,
      maxPoints: 80,
      correct: 2,
      errors: 1,
      bonusPoints: 0,
      penaltyPoints: 0,
    });

    expect(
      calculateGameScore({
        gameCode: "grupo",
        answers: [
          { outcome: "protective" },
          { outcome: "partial" },
          { outcome: "harmful" },
        ],
      }),
    ).toMatchObject({
      points: 3,
      maxPoints: 12,
      correct: null,
      errors: 1,
    });

    expect(
      calculateGameScore({
        gameCode: "clickbait-swipe",
        answers: [
          { correct: true },
          { correct: true },
          { correct: true },
          { correct: true },
          { correct: false },
          { correct: true },
          { correct: true },
          { correct: true },
        ],
      }),
    ).toMatchObject({
      points: 9,
      maxPoints: 16,
      correct: 7,
      errors: 1,
      bonusPoints: 2,
    });

    expect(
      calculateGameScore({
        gameCode: "radar-de-fuentes",
        answers: [{ correct: true }, { correct: false }, { correct: true }],
      }),
    ).toMatchObject({
      points: 2,
      maxPoints: 9,
      correct: 2,
      errors: 1,
    });

    expect(
      calculateGameScore({
        gameCode: "feed-60",
        answers: [
          { decisionCorrect: true, verified: false },
          { decisionCorrect: true, verified: true },
          { decisionCorrect: false, verified: false },
        ],
        timeUsedSeconds: 8,
      }),
    ).toMatchObject({
      points: 4,
      maxPoints: 30,
      correct: 2,
      errors: 1,
      bonusPoints: 1,
      penaltyPoints: 1,
      timeLimitSeconds: 60,
      timeUsedSeconds: 8,
    });

    expect(
      calculateGameScore({
        gameCode: "mente-maestra",
        answers: [{ completed: true }, { completed: false }, { completed: true }],
      }),
    ).toMatchObject({
      points: 2,
      maxPoints: 4,
      correct: 2,
      errors: 1,
    });
  });

  it("mantiene el piso de Feed 60 y el máximo de bonos de racha", () => {
    const feedScore = calculateGameScore({
      gameCode: "feed-60",
      answers: [{ decisionCorrect: false, verified: false }],
    });
    expect(feedScore.points).toBe(0);
    expect(feedScore.penaltyPoints).toBe(1);

    const clickbaitScore = calculateGameScore({
      gameCode: "clickbait-swipe",
      answers: Array.from({ length: 15 }, () => ({ correct: true })),
    });
    expect(clickbaitScore.points).toBe(16);
    expect(clickbaitScore.bonusPoints).toBe(4);
  });
});

describe("rankingScore y elegibilidad", () => {
  it("normaliza y limita el porcentaje, y rechaza denominadores inválidos", () => {
    expect(calculateRankingScore(0, 80)).toBe(0);
    expect(calculateRankingScore(40, 80)).toBe(50);
    expect(calculateRankingScore(80, 80)).toBe(100);
    expect(calculateRankingScore(-10, 80)).toBe(0);
    expect(calculateRankingScore(100, 80)).toBe(100);
    expect(calculateRankingScore(10, 0)).toBeNull();
    expect(calculateRankingScore(10, -1)).toBeNull();
    expect(calculateRankingScore(Number.NaN, 80)).toBeNull();
  });

  it("excluye resultados expirados, incompletos, inválidos o fuera de escala", () => {
    const base: RankingCandidate = {
      resultId: "result-1",
      gameCode: "real-o-ia",
      alias: "Ana",
      status: "finished",
      answered: 8,
      total: 8,
      points: 70,
      maxPoints: 80,
      completedAt: "2026-08-01T10:00:00.000Z",
      aliasAllowed: true,
      abuseMarked: false,
      invalidMarked: false,
    };

    expect(isRankingEligible(base)).toBe(true);
    expect(isRankingEligible({ ...base, status: "expired" })).toBe(false);
    expect(isRankingEligible({ ...base, answered: 7 })).toBe(false);
    expect(isRankingEligible({ ...base, total: 0 })).toBe(false);
    expect(isRankingEligible({ ...base, aliasAllowed: false })).toBe(false);
    expect(isRankingEligible({ ...base, abuseMarked: true })).toBe(false);
    expect(isRankingEligible({ ...base, invalidMarked: true })).toBe(false);
    expect(isRankingEligible({ ...base, maxPoints: 0 })).toBe(false);
    expect(isRankingEligible({ ...base, points: 81 })).toBe(false);
    expect(isRankingEligible({ ...base, points: Number.POSITIVE_INFINITY })).toBe(
      false,
    );
  });

  it("ordena empates por fecha e identificador, limita a diez y recalcula el score", () => {
    const makeCandidate = (
      resultId: string,
      alias: string,
      completedAt: string,
    ): RankingCandidate => ({
      resultId,
      gameCode: "real-o-ia",
      alias,
      status: "finished",
      answered: 8,
      total: 8,
      points: 40,
      maxPoints: 80,
      completedAt,
      aliasAllowed: true,
      abuseMarked: false,
      invalidMarked: false,
    });

    const candidates = [
      makeCandidate("z-result", "Fecha posterior", "2026-08-01T11:00:00.000Z"),
      makeCandidate("b-result", "ID posterior", "2026-08-01T10:00:00.000Z"),
      makeCandidate("a-result", "ID anterior", "2026-08-01T10:00:00.000Z"),
      ...Array.from({ length: 9 }, (_, index) =>
        makeCandidate(
          `extra-${index}`,
          `Extra ${index}`,
          `2026-08-01T12:${String(index).padStart(2, "0")}:00.000Z`,
        ),
      ),
    ];

    const entries = rankLeaderboard(candidates);

    expect(entries).toHaveLength(10);
    expect(entries.slice(0, 3).map((entry) => entry.alias)).toEqual([
      "ID anterior",
      "ID posterior",
      "Fecha posterior",
    ]);
    expect(entries[0]).toMatchObject({
      rank: 1,
      points: 40,
      maxPoints: 80,
      rankingScore: 50,
    });
    expect(buildLeaderboard(candidates)).toMatchObject({
      scope: "global",
      limit: 10,
    });
  });
});
