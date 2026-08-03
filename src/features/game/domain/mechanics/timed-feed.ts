import type { PublicFeedback } from "@antidoto/contracts";

import { scoreFeedDecision } from "../scoring";

/** Límite autoritativo del reloj de Feed 60”. El cliente no puede extenderlo. */
export const FEED_TIME_LIMIT_SECONDS = 60;

/** Coste temporal de verificar: se resta del reloj autoritativo. */
export const FEED_VERIFY_COST_SECONDS = 4;

export const FEED_ACTIONS = ["verify", "share", "discard"] as const;
export type FeedAction = (typeof FEED_ACTIONS)[number];
export type FeedFinalDecision = "share" | "discard";

export const FEED_POST_KINDS = [
  "reliable",
  "false",
  "out_of_context",
  "satire",
] as const;
export type FeedPostKind = (typeof FEED_POST_KINDS)[number];

export type TimedFeedSolution = Readonly<{
  appropriateDecision: FeedFinalDecision;
  postKind: FeedPostKind;
  evaluationSignals: readonly string[];
  verificationHints: readonly string[];
}>;

export type FeedClock = Readonly<{
  startedAt: Date;
  /** Instante autoritativo de expiración; verify lo adelanta. */
  expiresAt: Date;
  verifySecondsConsumed: number;
  expired: boolean;
}>;

export type TimedFeedItemState = Readonly<{
  verified: boolean;
  decided: boolean;
}>;

export type TimedFeedRejectCode =
  | "ITEM_NOT_IN_SESSION"
  | "ANSWER_ALREADY_ACCEPTED"
  | "INVALID_ACTION"
  | "SESSION_EXPIRED";

export type TimedFeedEvaluation = Readonly<{
  decision: FeedFinalDecision;
  decisionCorrect: boolean;
  verified: boolean;
  points: number;
  bonusPoints: number;
  penaltyPoints: number;
  feedback: PublicFeedback;
}>;

export type TimedFeedResolution =
  | {
      kind: "expired";
      clock: FeedClock;
      code: "SESSION_EXPIRED";
    }
  | {
      kind: "verified";
      clock: FeedClock;
      itemState: TimedFeedItemState;
      verificationHints: readonly string[];
    }
  | {
      kind: "decided";
      clock: FeedClock;
      itemState: TimedFeedItemState;
      evaluation: TimedFeedEvaluation;
    }
  | {
      kind: "rejected";
      clock: FeedClock;
      code: TimedFeedRejectCode;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonEmptyStringArray(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((entry) => isNonEmptyString(entry))
  );
}

function isFeedFinalDecision(value: unknown): value is FeedFinalDecision {
  return value === "share" || value === "discard";
}

function isFeedPostKind(value: unknown): value is FeedPostKind {
  return FEED_POST_KINDS.includes(value as FeedPostKind);
}

function isFeedAction(value: unknown): value is FeedAction {
  return FEED_ACTIONS.includes(value as FeedAction);
}

function cloneClock(clock: FeedClock): FeedClock {
  return Object.freeze({
    startedAt: new Date(clock.startedAt.getTime()),
    expiresAt: new Date(clock.expiresAt.getTime()),
    verifySecondsConsumed: clock.verifySecondsConsumed,
    expired: clock.expired,
  });
}

/**
 * Crea el reloj autoritativo de una partida Feed 60”.
 * El límite es siempre FEED_TIME_LIMIT_SECONDS desde startedAt.
 */
export function createFeedClock(startedAt: Date = new Date()): FeedClock {
  return Object.freeze({
    startedAt: new Date(startedAt.getTime()),
    expiresAt: new Date(
      startedAt.getTime() + FEED_TIME_LIMIT_SECONDS * 1_000,
    ),
    verifySecondsConsumed: 0,
    expired: false,
  });
}

/**
 * Segundos restantes según el reloj del servidor. El cliente no puede imponer
 * ni extender este valor.
 */
export function remainingFeedSeconds(
  clock: FeedClock,
  now: Date = new Date(),
): number {
  if (clock.expired) return 0;
  const remainingMs = clock.expiresAt.getTime() - now.getTime();
  if (remainingMs <= 0) return 0;
  return Math.min(
    FEED_TIME_LIMIT_SECONDS,
    Math.ceil(remainingMs / 1_000),
  );
}

export function isFeedClockExpired(
  clock: FeedClock,
  now: Date = new Date(),
): boolean {
  return clock.expired || now.getTime() >= clock.expiresAt.getTime();
}

/**
 * Marca el reloj como expirado una sola vez. Resoluciones posteriores
 * reciben el mismo estado terminal.
 */
export function markFeedClockExpired(clock: FeedClock): FeedClock {
  if (clock.expired) return cloneClock(clock);
  return Object.freeze({
    ...cloneClock(clock),
    expired: true,
  });
}

/**
 * Aplica el coste de verify al reloj autoritativo. Nunca alarga expiresAt
 * ni supera el límite inicial de 60 s.
 */
export function applyFeedVerifyCost(clock: FeedClock): FeedClock {
  if (clock.expired) return cloneClock(clock);

  const nextExpiresAt = new Date(
    clock.expiresAt.getTime() - FEED_VERIFY_COST_SECONDS * 1_000,
  );
  const earliestAllowed = clock.startedAt.getTime();
  const clampedExpiresAt = new Date(
    Math.max(earliestAllowed, nextExpiresAt.getTime()),
  );

  return Object.freeze({
    startedAt: new Date(clock.startedAt.getTime()),
    expiresAt: clampedExpiresAt,
    verifySecondsConsumed: clock.verifySecondsConsumed + FEED_VERIFY_COST_SECONDS,
    expired: false,
  });
}

/**
 * Narrows the private editorial rule before it reaches the evaluator.
 * Hints and signals stay server-side until verify or a final decision.
 */
export function parseTimedFeedSolution(input: unknown): TimedFeedSolution {
  if (!isRecord(input)) {
    throw new Error("TIMED_FEED_INVALID_SOLUTION");
  }

  const evaluationSignals = input.evaluationSignals;
  const verificationHints = input.verificationHints;

  if (
    !isFeedFinalDecision(input.appropriateDecision) ||
    !isFeedPostKind(input.postKind) ||
    !isNonEmptyStringArray(evaluationSignals) ||
    !isNonEmptyStringArray(verificationHints)
  ) {
    throw new Error("TIMED_FEED_INVALID_SOLUTION");
  }

  return Object.freeze({
    appropriateDecision: input.appropriateDecision,
    postKind: input.postKind,
    evaluationSignals: Object.freeze([...evaluationSignals]),
    verificationHints: Object.freeze([...verificationHints]),
  });
}

export function evaluateTimedFeedDecision(input: {
  decision: FeedFinalDecision;
  verified: boolean;
  solution: TimedFeedSolution;
  feedback: PublicFeedback;
}): TimedFeedEvaluation {
  if (!isFeedFinalDecision(input.decision)) {
    throw new Error("TIMED_FEED_INVALID_ACTION");
  }

  const solution = parseTimedFeedSolution(input.solution);
  const decisionCorrect = input.decision === solution.appropriateDecision;
  const scored = scoreFeedDecision(decisionCorrect, input.verified);

  return {
    decision: input.decision,
    decisionCorrect,
    verified: input.verified,
    points: scored.points,
    bonusPoints: scored.bonusPoints,
    penaltyPoints: scored.penaltyPoints,
    feedback: {
      ...input.feedback,
      status: decisionCorrect ? "correct" : "incorrect",
      signals: [...input.feedback.signals],
    },
  };
}

/**
 * Resuelve una carrera entre expiración, verify y decisión final.
 * Solo una resolución gana; la expiración tiene prioridad si el instante
 * autoritativo ya se cumplió.
 */
export function resolveTimedFeedAction(input: {
  action: FeedAction;
  itemId: string;
  sessionItemIds: readonly string[];
  clock: FeedClock;
  itemState: TimedFeedItemState;
  solution: TimedFeedSolution | unknown;
  feedback: PublicFeedback;
  now?: Date;
}): TimedFeedResolution {
  const now = input.now ?? new Date();
  let clock = cloneClock(input.clock);

  if (!input.sessionItemIds.includes(input.itemId)) {
    return { kind: "rejected", clock, code: "ITEM_NOT_IN_SESSION" };
  }

  if (!isFeedAction(input.action)) {
    return { kind: "rejected", clock, code: "INVALID_ACTION" };
  }

  if (isFeedClockExpired(clock, now)) {
    clock = markFeedClockExpired(clock);
    return { kind: "expired", clock, code: "SESSION_EXPIRED" };
  }

  if (input.itemState.decided) {
    return { kind: "rejected", clock, code: "ANSWER_ALREADY_ACCEPTED" };
  }

  const solution = parseTimedFeedSolution(input.solution);

  if (input.action === "verify") {
    if (input.itemState.verified) {
      return { kind: "rejected", clock, code: "INVALID_ACTION" };
    }

    clock = applyFeedVerifyCost(clock);
    const itemState: TimedFeedItemState = Object.freeze({
      verified: true,
      decided: false,
    });

    if (isFeedClockExpired(clock, now)) {
      clock = markFeedClockExpired(clock);
      return {
        kind: "verified",
        clock,
        itemState,
        verificationHints: solution.verificationHints,
      };
    }

    return {
      kind: "verified",
      clock,
      itemState,
      verificationHints: solution.verificationHints,
    };
  }

  const evaluation = evaluateTimedFeedDecision({
    decision: input.action,
    verified: input.itemState.verified,
    solution,
    feedback: input.feedback,
  });

  return {
    kind: "decided",
    clock,
    itemState: Object.freeze({
      verified: input.itemState.verified,
      decided: true,
    }),
    evaluation,
  };
}

/**
 * Impide que el cliente alargue el reloj: cualquier expiresAt propuesto que
 * supere el autoritativo se descarta a favor del reloj del servidor.
 */
export function coerceFeedClockAuthority(
  clock: FeedClock,
  clientProposedExpiresAt: Date | null | undefined,
): FeedClock {
  if (!clientProposedExpiresAt) return cloneClock(clock);
  if (clientProposedExpiresAt.getTime() > clock.expiresAt.getTime()) {
    return cloneClock(clock);
  }
  // El cliente tampoco puede acortar el reloj para fabricar expiraciones.
  return cloneClock(clock);
}

export function emptyTimedFeedItemState(): TimedFeedItemState {
  return Object.freeze({ verified: false, decided: false });
}
