import { describe, expect, it } from "vitest";

import {
  FEED_CORRECT_POINTS,
  FEED_INCORRECT_PENALTY,
  FEED_ITEM_COUNT,
  FEED_MAX_POINTS,
  FEED_MIN_POINTS,
  FEED_VERIFY_BONUS,
  calculateFeedSessionScore,
  scoreFeedDecision,
} from "./feed-scoring";

describe("feed-scoring (T060)", () => {
  it("aplica +2 sin verify, +3 con verify y -1 si falla", () => {
    expect(scoreFeedDecision(true, false)).toEqual({
      points: FEED_CORRECT_POINTS,
      bonusPoints: 0,
      penaltyPoints: 0,
    });
    expect(scoreFeedDecision(true, true)).toEqual({
      points: FEED_CORRECT_POINTS + FEED_VERIFY_BONUS,
      bonusPoints: FEED_VERIFY_BONUS,
      penaltyPoints: 0,
    });
    expect(scoreFeedDecision(false, true)).toEqual({
      points: -FEED_INCORRECT_PENALTY,
      bonusPoints: 0,
      penaltyPoints: FEED_INCORRECT_PENALTY,
    });
  });

  it("agrega la sesión con piso 0 y techo 30", () => {
    const mixed = calculateFeedSessionScore([
      { decisionCorrect: true, verified: false },
      { decisionCorrect: true, verified: true },
      { decisionCorrect: false, verified: false },
    ]);
    // 2 + 3 - 1 = 4
    expect(mixed).toMatchObject({
      points: 4,
      maxPoints: FEED_MAX_POINTS,
      correct: 2,
      errors: 1,
      bonusPoints: 1,
      penaltyPoints: 1,
      rawPoints: 4,
    });

    const floor = calculateFeedSessionScore([
      { decisionCorrect: false, verified: false },
      { decisionCorrect: false, verified: true },
    ]);
    expect(floor.rawPoints).toBe(-2);
    expect(floor.points).toBe(FEED_MIN_POINTS);
    expect(floor.penaltyPoints).toBe(2);

    const perfect = calculateFeedSessionScore(
      Array.from({ length: FEED_ITEM_COUNT }, () => ({
        decisionCorrect: true,
        verified: true,
      })),
    );
    expect(perfect.rawPoints).toBe(FEED_ITEM_COUNT * 3);
    expect(perfect.points).toBe(FEED_MAX_POINTS);
    expect(perfect.bonusPoints).toBe(FEED_ITEM_COUNT);
    expect(perfect.correct).toBe(FEED_ITEM_COUNT);
  });

  it("no deja superar 30 aunque el bruto crezca", () => {
    const overflow = calculateFeedSessionScore(
      Array.from({ length: 12 }, () => ({
        decisionCorrect: true,
        verified: true,
      })),
    );
    expect(overflow.rawPoints).toBe(36);
    expect(overflow.points).toBe(FEED_MAX_POINTS);
  });
});
