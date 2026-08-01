import type { PublicFeedback } from "@antidoto/contracts";

import { scoreSourceClassification } from "../scoring";

export const SOURCE_CATEGORIES = [
  "reliable",
  "doubtful",
  "fraudulent",
] as const;

export type SourceCategory = (typeof SOURCE_CATEGORIES)[number];

export type SourceAcceptanceRejectCode =
  | "ITEM_NOT_IN_SESSION"
  | "ANSWER_ALREADY_ACCEPTED";

export type SourceAcceptanceResolution =
  | { kind: "accept" }
  | { kind: "reject"; code: SourceAcceptanceRejectCode };

export type SourceClassificationSolution = Readonly<{
  classification: SourceCategory;
  evaluationSignals: readonly string[];
}>;

export type SourceClassificationEvaluationInput = Readonly<{
  answer: SourceCategory;
  solution: SourceClassificationSolution;
  feedback: PublicFeedback;
}>;

export type SourceClassificationEvaluation = Readonly<{
  classification: SourceCategory;
  correct: boolean;
  points: number;
  feedback: PublicFeedback;
}>;

export type SourceClassificationAcceptanceInput = Readonly<{
  itemId: string;
  sessionItemIds: readonly string[];
  acceptedItemIds: readonly string[];
  answer: SourceCategory;
  solution: SourceClassificationSolution;
  feedback: PublicFeedback;
}>;

export type SourceClassificationAcceptanceResult =
  | {
      kind: "accepted";
      evaluation: SourceClassificationEvaluation;
    }
  | {
      kind: "rejected";
      code: SourceAcceptanceRejectCode;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSourceCategory(value: unknown): value is SourceCategory {
  return SOURCE_CATEGORIES.includes(value as SourceCategory);
}

/**
 * Narrows the private editorial rule before it reaches the evaluator.
 * The solution stays server-side; only the resulting public feedback leaves
 * the domain boundary after an accepted answer.
 */
export function parseSourceClassificationSolution(
  input: unknown,
): SourceClassificationSolution {
  if (!isRecord(input)) {
    throw new Error("SOURCE_CLASSIFICATION_INVALID_SOLUTION");
  }

  const evaluationSignals = input.evaluationSignals;
  if (
    !isSourceCategory(input.classification) ||
    !Array.isArray(evaluationSignals) ||
    evaluationSignals.length === 0 ||
    evaluationSignals.some(
      (signal) => typeof signal !== "string" || signal.trim().length === 0,
    )
  ) {
    throw new Error("SOURCE_CLASSIFICATION_INVALID_SOLUTION");
  }

  return Object.freeze({
    classification: input.classification,
    evaluationSignals: Object.freeze([...evaluationSignals]),
  });
}

/**
 * Integrity gate for Radar de Fuentes: the source must belong to the session
 * and may be accepted at most once.
 */
export function resolveSourceAcceptance(input: {
  itemId: string;
  sessionItemIds: readonly string[];
  acceptedItemIds: readonly string[];
}): SourceAcceptanceResolution {
  if (!input.sessionItemIds.includes(input.itemId)) {
    return { kind: "reject", code: "ITEM_NOT_IN_SESSION" };
  }

  if (input.acceptedItemIds.includes(input.itemId)) {
    return { kind: "reject", code: "ANSWER_ALREADY_ACCEPTED" };
  }

  return { kind: "accept" };
}

/**
 * Scores one source classification: +1 when the category matches, 0 otherwise.
 * Does not expose the private solution or evaluation signals.
 */
export function evaluateSourceClassification(
  input: SourceClassificationEvaluationInput,
): SourceClassificationEvaluation {
  if (!isSourceCategory(input.answer)) {
    throw new Error("SOURCE_CLASSIFICATION_INVALID_CATEGORY");
  }

  const solution = parseSourceClassificationSolution(input.solution);
  const correct = input.answer === solution.classification;

  return {
    classification: input.answer,
    correct,
    points: scoreSourceClassification(correct),
    feedback: {
      ...input.feedback,
      status: correct ? "correct" : "incorrect",
      signals: [...input.feedback.signals],
    },
  };
}

/**
 * Applies membership and one-acceptance rules before evaluating a source.
 * Callers persist the acceptance only when the result kind is "accepted".
 */
export function acceptSourceClassification(
  input: SourceClassificationAcceptanceInput,
): SourceClassificationAcceptanceResult {
  const gate = resolveSourceAcceptance({
    itemId: input.itemId,
    sessionItemIds: input.sessionItemIds,
    acceptedItemIds: input.acceptedItemIds,
  });

  if (gate.kind === "reject") {
    return { kind: "rejected", code: gate.code };
  }

  return {
    kind: "accepted",
    evaluation: evaluateSourceClassification({
      answer: input.answer,
      solution: input.solution,
      feedback: input.feedback,
    }),
  };
}
