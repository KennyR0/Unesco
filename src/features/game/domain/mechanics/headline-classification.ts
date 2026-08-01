import type { PublicFeedback } from "@antidoto/contracts";

import { scoreClickbaitAnswer } from "../scoring";

export const HEADLINE_CLASSIFICATIONS = ["journalism", "clickbait"] as const;

export type HeadlineClassification =
  (typeof HEADLINE_CLASSIFICATIONS)[number];

export const CLICKBAIT_STREAK_LENGTH = 3;
export const CLICKBAIT_MAX_STREAK_BONUS = 4;

export type HeadlineClassificationSolution = Readonly<{
  classification: HeadlineClassification;
  evaluationSignals: readonly string[];
}>;

export type HeadlineClassificationEvaluationInput = Readonly<{
  answer: HeadlineClassification;
  solution: HeadlineClassificationSolution;
  feedback: PublicFeedback;
  /** Continuous correct streak before evaluating this answer. */
  streakBefore?: number;
  /** Streak bonuses already awarded in the session (0–4). */
  bonusPointsAwarded?: number;
}>;

export type HeadlineClassificationEvaluation = Readonly<{
  classification: HeadlineClassification;
  correct: boolean;
  /** Points earned on this turn, including any streak bonus. */
  points: number;
  answerPoints: number;
  bonusPoints: number;
  streak: number;
  totalBonusPoints: number;
  feedback: PublicFeedback;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHeadlineClassification(
  value: unknown,
): value is HeadlineClassification {
  return HEADLINE_CLASSIFICATIONS.includes(value as HeadlineClassification);
}

function nonNegativeInteger(value: number | undefined, label: string): number {
  const normalized = value ?? 0;
  if (!Number.isInteger(normalized) || normalized < 0) {
    throw new Error(`HEADLINE_CLASSIFICATION_INVALID_${label}`);
  }
  return normalized;
}

/**
 * Narrows the private editorial rule before it reaches the evaluator.
 * The solution stays server-side; only the resulting public feedback leaves
 * the domain boundary after an accepted answer.
 */
export function parseHeadlineClassificationSolution(
  input: unknown,
): HeadlineClassificationSolution {
  if (!isRecord(input)) {
    throw new Error("HEADLINE_CLASSIFICATION_INVALID_SOLUTION");
  }

  const evaluationSignals = input.evaluationSignals;
  if (
    !isHeadlineClassification(input.classification) ||
    !Array.isArray(evaluationSignals) ||
    evaluationSignals.length === 0 ||
    evaluationSignals.some(
      (signal) => typeof signal !== "string" || signal.trim().length === 0,
    )
  ) {
    throw new Error("HEADLINE_CLASSIFICATION_INVALID_SOLUTION");
  }

  return Object.freeze({
    classification: input.classification,
    evaluationSignals: Object.freeze([...evaluationSignals]),
  });
}

/**
 * Scores one headline classification turn: +1 per hit and +1 when a streak
 * of three completes, capped at four streak bonuses for the session.
 */
export function scoreHeadlineClassificationTurn(input: {
  correct: boolean;
  streakBefore?: number;
  bonusPointsAwarded?: number;
}): Readonly<{
  answerPoints: number;
  bonusPoints: number;
  points: number;
  streak: number;
  totalBonusPoints: number;
}> {
  const streakBefore = nonNegativeInteger(input.streakBefore, "STREAK");
  const bonusPointsAwarded = nonNegativeInteger(
    input.bonusPointsAwarded,
    "BONUS",
  );
  if (bonusPointsAwarded > CLICKBAIT_MAX_STREAK_BONUS) {
    throw new Error("HEADLINE_CLASSIFICATION_INVALID_BONUS");
  }

  const answerPoints = scoreClickbaitAnswer(input.correct);
  if (!input.correct) {
    return Object.freeze({
      answerPoints,
      bonusPoints: 0,
      points: answerPoints,
      streak: 0,
      totalBonusPoints: bonusPointsAwarded,
    });
  }

  const streak = streakBefore + 1;
  const awardsStreakBonus =
    streak % CLICKBAIT_STREAK_LENGTH === 0 &&
    bonusPointsAwarded < CLICKBAIT_MAX_STREAK_BONUS;
  const bonusPoints = awardsStreakBonus ? 1 : 0;

  return Object.freeze({
    answerPoints,
    bonusPoints,
    points: answerPoints + bonusPoints,
    streak,
    totalBonusPoints: bonusPointsAwarded + bonusPoints,
  });
}

export function evaluateHeadlineClassification(
  input: HeadlineClassificationEvaluationInput,
): HeadlineClassificationEvaluation {
  const solution = parseHeadlineClassificationSolution(input.solution);
  const correct = input.answer === solution.classification;
  const turn = scoreHeadlineClassificationTurn({
    correct,
    streakBefore: input.streakBefore,
    bonusPointsAwarded: input.bonusPointsAwarded,
  });

  return {
    classification: input.answer,
    correct,
    points: turn.points,
    answerPoints: turn.answerPoints,
    bonusPoints: turn.bonusPoints,
    streak: turn.streak,
    totalBonusPoints: turn.totalBonusPoints,
    feedback: {
      ...input.feedback,
      status: correct ? "correct" : "incorrect",
      signals: [...input.feedback.signals],
    },
  };
}
