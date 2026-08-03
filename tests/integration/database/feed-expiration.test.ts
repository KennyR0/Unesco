
import { describe, expect, it } from "vitest";

import { createContentRepository } from "../../../src/features/game/content/content-repository";
import { validateContentCollection } from "../../../src/features/game/content/content-validation";
import contentPack from "../../../src/features/game/content/game-items/feed-60.v1.json";
import {
  FEED_TIME_LIMIT_SECONDS,
  FEED_VERIFY_COST_SECONDS,
  applyFeedVerifyCost,
  coerceFeedClockAuthority,
  createFeedClock,
  emptyTimedFeedItemState,
  isFeedClockExpired,
  parseTimedFeedSolution,
  remainingFeedSeconds,
  resolveTimedFeedAction,
} from "../../../src/features/game/domain/mechanics/timed-feed";
import {
  FEED_MAX_POINTS,
  calculateFeedSessionScore,
  calculateGameScore,
  maxPointsForGame,
} from "../../../src/features/game/domain/scoring";
import { arcadeSchemaAvailable, sql } from "../../fixtures/supabase-local";

const arcadeDatabaseAvailable = arcadeSchemaAvailable;

const startedAt = new Date("2026-08-02T22:00:00.000Z");

describe("expiración autoritativa de Feed 60” (T061)", () => {
  it("fija 60 s, consume 4 s al verificar y rechaza extensión del cliente", () => {
    const clock = createFeedClock(startedAt);
    expect(remainingFeedSeconds(clock, startedAt)).toBe(FEED_TIME_LIMIT_SECONDS);

    const afterVerify = applyFeedVerifyCost(clock);
    expect(afterVerify.verifySecondsConsumed).toBe(FEED_VERIFY_COST_SECONDS);
    expect(afterVerify.expiresAt.getTime()).toBe(
      clock.expiresAt.getTime() - FEED_VERIFY_COST_SECONDS * 1_000,
    );

    const forged = coerceFeedClockAuthority(
      afterVerify,
      new Date(afterVerify.expiresAt.getTime() + 45_000),
    );
    expect(forged.expiresAt.getTime()).toBe(afterVerify.expiresAt.getTime());
    expect(
      remainingFeedSeconds(forged, new Date(startedAt.getTime() + 5_000)),
    ).toBe(51);
  });

  it("prioriza la expiración frente a verify y a la decisión final", () => {
    const items = validateContentCollection(contentPack);
    const item = items[0];
    const clock = createFeedClock(startedAt);
    const afterExpiry = new Date(clock.expiresAt.getTime());
    const sessionItemIds = items.map((entry) => entry.itemId);

    expect(isFeedClockExpired(clock, afterExpiry)).toBe(true);

    const verifyRace = resolveTimedFeedAction({
      action: "verify",
      itemId: item.itemId,
      sessionItemIds,
      clock,
      itemState: emptyTimedFeedItemState(),
      solution: item.solutionPrivate,
      feedback: item.feedback,
      now: afterExpiry,
    });
    expect(verifyRace).toMatchObject({
      kind: "expired",
      code: "SESSION_EXPIRED",
    });
    if (verifyRace.kind === "expired") {
      expect(verifyRace.clock.expired).toBe(true);
    }

    const decideRace = resolveTimedFeedAction({
      action: "discard",
      itemId: item.itemId,
      sessionItemIds,
      clock,
      itemState: emptyTimedFeedItemState(),
      solution: item.solutionPrivate,
      feedback: item.feedback,
      now: afterExpiry,
    });
    expect(decideRace.kind).toBe("expired");
  });

  it("acepta verify una vez, decide después y alcanza el score máximo 30", () => {
    const repository = createContentRepository(contentPack, {
      activeVersion: "2026-07-30.1",
    });
    const published = repository.listPublishedItems("feed-60");
    const sessionItemIds = published.map((item) => item.itemId);
    let clock = createFeedClock(startedAt);
    const answers: Array<{ decisionCorrect: boolean; verified: boolean }> = [];
    let nowMs = startedAt.getTime();

    expect(published).toHaveLength(10);
    expect(maxPointsForGame("feed-60")).toBe(FEED_MAX_POINTS);

    for (const item of published) {
      const publicItem = repository.getPublicItem("feed-60", item.itemId);
      expect(publicItem).not.toBeNull();
      expect(publicItem && "solutionPrivate" in publicItem).toBe(false);
      expect(publicItem && "feedback" in publicItem).toBe(false);

      nowMs += 1_000;
      const verified = resolveTimedFeedAction({
        action: "verify",
        itemId: item.itemId,
        sessionItemIds,
        clock,
        itemState: emptyTimedFeedItemState(),
        solution: item.solutionPrivate,
        feedback: item.feedback,
        now: new Date(nowMs),
      });
      expect(verified.kind).toBe("verified");
      if (verified.kind !== "verified") {
        throw new Error(`Falló verify en ${item.itemId}.`);
      }
      expect(verified.verificationHints.length).toBe(3);

      clock = verified.clock;
      nowMs += 500;
      const solution = parseTimedFeedSolution(item.solutionPrivate);
      const decided = resolveTimedFeedAction({
        action: solution.appropriateDecision,
        itemId: item.itemId,
        sessionItemIds,
        clock,
        itemState: verified.itemState,
        solution,
        feedback: item.feedback,
        now: new Date(nowMs),
      });
      expect(decided.kind).toBe("decided");
      if (decided.kind !== "decided") {
        throw new Error(`Falló la decisión en ${item.itemId}.`);
      }

      expect(decided.evaluation.decisionCorrect).toBe(true);
      expect(decided.evaluation.points).toBe(3);
      expect(decided.evaluation.feedback.signals.length).toBeGreaterThan(0);
      expect(decided.evaluation).not.toHaveProperty("solutionPrivate");

      clock = decided.clock;
      answers.push({
        decisionCorrect: decided.evaluation.decisionCorrect,
        verified: decided.evaluation.verified,
      });
    }

    const feedScore = calculateFeedSessionScore(answers);
    const gameScore = calculateGameScore({
      gameCode: "feed-60",
      answers,
      timeUsedSeconds: 20,
    });

    expect(feedScore.points).toBe(30);
    expect(gameScore).toMatchObject({
      points: 30,
      maxPoints: 30,
      correct: 10,
      errors: 0,
      bonusPoints: 10,
      penaltyPoints: 0,
      timeLimitSeconds: 60,
      timeUsedSeconds: 20,
    });
    expect(isFeedClockExpired(clock, new Date(nowMs))).toBe(false);
  });

  it("aplica el piso 0 cuando solo hay decisiones inadecuadas", () => {
    const score = calculateFeedSessionScore([
      { decisionCorrect: false, verified: false },
      { decisionCorrect: false, verified: true },
      { decisionCorrect: false, verified: false },
    ]);
    expect(score.rawPoints).toBe(-3);
    expect(score.points).toBe(0);
    expect(score.penaltyPoints).toBe(3);
  });
});

describe.skipIf(!arcadeDatabaseAvailable())(
  "Feed 60” en la persistencia arcade",
  () => {
    it("mantiene el catálogo físico y las soluciones fuera del esquema público", () => {
      expect(
        sql(
          "select count(*) from private_arcade.game_catalog where game_code = 'feed-60' and mechanic = 'timed_feed' and available;",
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
    });
  },
);
