import { describe, expect, it } from "vitest";

import { validateContentCollection } from "../../content/content-validation";
import contentPack from "../../content/game-items/feed-60.v1.json";
import { calculateGameScore } from "../scoring";
import {
  FEED_TIME_LIMIT_SECONDS,
  FEED_VERIFY_COST_SECONDS,
  applyFeedVerifyCost,
  coerceFeedClockAuthority,
  createFeedClock,
  emptyTimedFeedItemState,
  evaluateTimedFeedDecision,
  isFeedClockExpired,
  parseTimedFeedSolution,
  remainingFeedSeconds,
  resolveTimedFeedAction,
} from "./timed-feed";

const items = validateContentCollection(contentPack);
const startedAt = new Date("2026-08-02T22:00:00.000Z");

describe("reloj autoritativo timed_feed (T058)", () => {
  it("fija 60 s desde el inicio y nunca supera ese límite", () => {
    const clock = createFeedClock(startedAt);

    expect(remainingFeedSeconds(clock, startedAt)).toBe(FEED_TIME_LIMIT_SECONDS);
    expect(
      remainingFeedSeconds(
        clock,
        new Date(startedAt.getTime() + 15_000),
      ),
    ).toBe(45);
    expect(clock.expiresAt.getTime() - clock.startedAt.getTime()).toBe(
      FEED_TIME_LIMIT_SECONDS * 1_000,
    );
  });

  it("consume 4 s al verificar y el cliente no puede extender el límite", () => {
    const clock = createFeedClock(startedAt);
    const afterVerify = applyFeedVerifyCost(clock);

    expect(afterVerify.verifySecondsConsumed).toBe(FEED_VERIFY_COST_SECONDS);
    expect(afterVerify.expiresAt.getTime()).toBe(
      clock.expiresAt.getTime() - FEED_VERIFY_COST_SECONDS * 1_000,
    );
    expect(
      remainingFeedSeconds(
        afterVerify,
        new Date(startedAt.getTime() + 10_000),
      ),
    ).toBe(46);

    const forged = coerceFeedClockAuthority(
      afterVerify,
      new Date(afterVerify.expiresAt.getTime() + 30_000),
    );
    expect(forged.expiresAt.getTime()).toBe(afterVerify.expiresAt.getTime());
  });

  it("expira cuando el instante autoritativo se cumple", () => {
    const clock = createFeedClock(startedAt);
    const atExpiry = new Date(clock.expiresAt.getTime());
    expect(isFeedClockExpired(clock, atExpiry)).toBe(true);
    expect(remainingFeedSeconds(clock, atExpiry)).toBe(0);
  });
});

describe("evaluador y carreras timed_feed (T058)", () => {
  it("parsea la solución editorial con hints SIFT privados", () => {
    const item = items[0];
    const solution = parseTimedFeedSolution(item.solutionPrivate);

    expect(solution.appropriateDecision).toBe("share");
    expect(solution.postKind).toBe("reliable");
    expect(solution.verificationHints).toHaveLength(3);
    expect(solution.evaluationSignals.length).toBeGreaterThan(0);
  });

  it("puntúa +2 sin verify, +3 con verify y -1 si la decisión falla", () => {
    const item = items[0];
    const solution = parseTimedFeedSolution(item.solutionPrivate);

    const withoutVerify = evaluateTimedFeedDecision({
      decision: "share",
      verified: false,
      solution,
      feedback: item.feedback,
    });
    expect(withoutVerify).toMatchObject({
      decisionCorrect: true,
      points: 2,
      bonusPoints: 0,
      penaltyPoints: 0,
      feedback: { status: "correct" },
    });

    const withVerify = evaluateTimedFeedDecision({
      decision: "share",
      verified: true,
      solution,
      feedback: item.feedback,
    });
    expect(withVerify).toMatchObject({
      decisionCorrect: true,
      points: 3,
      bonusPoints: 1,
      penaltyPoints: 0,
    });

    const wrong = evaluateTimedFeedDecision({
      decision: "discard",
      verified: true,
      solution,
      feedback: item.feedback,
    });
    expect(wrong).toMatchObject({
      decisionCorrect: false,
      points: -1,
      bonusPoints: 0,
      penaltyPoints: 1,
      feedback: { status: "incorrect" },
    });
    expect(wrong).not.toHaveProperty("verificationHints");
    expect(wrong).not.toHaveProperty("evaluationSignals");
  });

  it("prioriza la expiración frente a verify o decisión en una carrera", () => {
    const item = items[1];
    const clock = createFeedClock(startedAt);
    const afterExpiry = new Date(clock.expiresAt.getTime() + 1);

    const verifyRace = resolveTimedFeedAction({
      action: "verify",
      itemId: item.itemId,
      sessionItemIds: items.map((entry) => entry.itemId),
      clock,
      itemState: emptyTimedFeedItemState(),
      solution: item.solutionPrivate,
      feedback: item.feedback,
      now: afterExpiry,
    });
    expect(verifyRace.kind).toBe("expired");
    if (verifyRace.kind === "expired") {
      expect(verifyRace.code).toBe("SESSION_EXPIRED");
      expect(verifyRace.clock.expired).toBe(true);
    }

    const decideRace = resolveTimedFeedAction({
      action: "share",
      itemId: item.itemId,
      sessionItemIds: items.map((entry) => entry.itemId),
      clock,
      itemState: emptyTimedFeedItemState(),
      solution: item.solutionPrivate,
      feedback: item.feedback,
      now: afterExpiry,
    });
    expect(decideRace.kind).toBe("expired");
  });

  it("acepta verify una vez, revela hints y luego permite la decisión final", () => {
    const item = items[2];
    const sessionItemIds = items.map((entry) => entry.itemId);
    const clock = createFeedClock(startedAt);
    const now = new Date(startedAt.getTime() + 5_000);

    const verified = resolveTimedFeedAction({
      action: "verify",
      itemId: item.itemId,
      sessionItemIds,
      clock,
      itemState: emptyTimedFeedItemState(),
      solution: item.solutionPrivate,
      feedback: item.feedback,
      now,
    });

    expect(verified.kind).toBe("verified");
    if (verified.kind !== "verified") {
      throw new Error("Se esperaba verify aceptado.");
    }
    expect(verified.verificationHints).toHaveLength(3);
    expect(verified.itemState.verified).toBe(true);
    expect(verified.clock.verifySecondsConsumed).toBe(FEED_VERIFY_COST_SECONDS);

    const duplicateVerify = resolveTimedFeedAction({
      action: "verify",
      itemId: item.itemId,
      sessionItemIds,
      clock: verified.clock,
      itemState: verified.itemState,
      solution: item.solutionPrivate,
      feedback: item.feedback,
      now,
    });
    expect(duplicateVerify).toMatchObject({
      kind: "rejected",
      code: "INVALID_ACTION",
    });

    const decided = resolveTimedFeedAction({
      action: "discard",
      itemId: item.itemId,
      sessionItemIds,
      clock: verified.clock,
      itemState: verified.itemState,
      solution: item.solutionPrivate,
      feedback: item.feedback,
      now: new Date(startedAt.getTime() + 8_000),
    });

    expect(decided.kind).toBe("decided");
    if (decided.kind !== "decided") {
      throw new Error("Se esperaba decisión final.");
    }
    expect(decided.evaluation.decisionCorrect).toBe(true);
    expect(decided.evaluation.points).toBe(3);
    expect(decided.itemState.decided).toBe(true);

    const afterDecision = resolveTimedFeedAction({
      action: "share",
      itemId: item.itemId,
      sessionItemIds,
      clock: decided.clock,
      itemState: decided.itemState,
      solution: item.solutionPrivate,
      feedback: item.feedback,
      now: new Date(startedAt.getTime() + 9_000),
    });
    expect(afterDecision).toMatchObject({
      kind: "rejected",
      code: "ANSWER_ALREADY_ACCEPTED",
    });
  });

  it("rechaza un item ajeno a la sesión", () => {
    const item = items[0];
    const result = resolveTimedFeedAction({
      action: "share",
      itemId: item.itemId,
      sessionItemIds: ["feed-60-999"],
      clock: createFeedClock(startedAt),
      itemState: emptyTimedFeedItemState(),
      solution: item.solutionPrivate,
      feedback: item.feedback,
      now: startedAt,
    });

    expect(result).toMatchObject({
      kind: "rejected",
      code: "ITEM_NOT_IN_SESSION",
    });
  });

  it("reproduce el techo 0–30 al decidir bien las diez publicaciones con verify", () => {
    const sessionItemIds = items.map((item) => item.itemId);
    let clock = createFeedClock(startedAt);
    const answers: Array<{ decisionCorrect: boolean; verified: boolean }> = [];
    let nowMs = startedAt.getTime();

    for (const item of items) {
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

      clock = decided.clock;
      answers.push({
        decisionCorrect: decided.evaluation.decisionCorrect,
        verified: decided.evaluation.verified,
      });
    }

    const sessionScore = calculateGameScore({
      gameCode: "feed-60",
      answers,
      timeUsedSeconds: FEED_TIME_LIMIT_SECONDS - remainingFeedSeconds(clock, new Date(nowMs)),
    });

    expect(answers).toHaveLength(10);
    expect(answers.every((answer) => answer.decisionCorrect && answer.verified)).toBe(
      true,
    );
    expect(sessionScore.points).toBe(30);
    expect(sessionScore.maxPoints).toBe(30);
    expect(sessionScore.bonusPoints).toBe(10);
  });
});
