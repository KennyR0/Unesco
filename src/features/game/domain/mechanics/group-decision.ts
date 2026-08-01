import type { PublicFeedback } from "@antidoto/contracts";

import {
  scoreGroupDecision,
  type GroupDecisionOutcome,
} from "../scoring";

export type { GroupDecisionOutcome } from "../scoring";

export const GROUP_ACTIONS = ["forward", "verify", "pause"] as const;

export type GroupAction = (typeof GROUP_ACTIONS)[number];
export type GroupDecisionScore = 0 | 1 | 2;

export type GroupActionEvaluationRule = Readonly<{
  score: GroupDecisionScore;
  narrativeResult: string;
  consequences: readonly string[];
  feedback: string;
}>;

export type GroupDecisionSolution = Readonly<{
  actionEvaluations: Readonly<
    Record<GroupAction, GroupActionEvaluationRule>
  >;
}>;

export type GroupDecisionEvaluationInput = Readonly<{
  answer: GroupAction;
  solution: GroupDecisionSolution;
  feedback: PublicFeedback;
}>;

export type GroupDecisionEvaluation = Readonly<{
  action: GroupAction;
  outcome: GroupDecisionOutcome;
  points: GroupDecisionScore;
  /** Alias explícito de points para conservar la escala editorial 0–2. */
  score: GroupDecisionScore;
  narrativeResult: string;
  consequences: readonly string[];
  /** Feedback específico de la decisión, separado del feedback editorial común. */
  actionFeedback: string;
  feedback: PublicFeedback;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isGroupAction(value: unknown): value is GroupAction {
  return GROUP_ACTIONS.includes(value as GroupAction);
}

function isGroupDecisionScore(value: unknown): value is GroupDecisionScore {
  return value === 0 || value === 1 || value === 2;
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

function invalidSolution(): never {
  throw new Error("GROUP_DECISION_INVALID_SOLUTION");
}

function outcomeForScore(score: GroupDecisionScore): GroupDecisionOutcome {
  switch (score) {
    case 2:
      return "protective";
    case 1:
      return "partial";
    case 0:
      return "harmful";
  }
}

function feedbackStatusForOutcome(
  outcome: GroupDecisionOutcome,
): PublicFeedback["status"] {
  switch (outcome) {
    case "protective":
      return "correct";
    case "partial":
      return "instructive";
    case "harmful":
      return "incorrect";
  }
}

/**
 * Narrows the private editorial rule before it reaches the evaluator.
 * The solution remains server-side; only the selected consequence and public
 * feedback are returned after an accepted group_action.
 */
export function parseGroupDecisionSolution(
  input: unknown,
): GroupDecisionSolution {
  if (!isRecord(input) || !isRecord(input.actionEvaluations)) {
    return invalidSolution();
  }

  const parsedEvaluations = {} as Record<
    GroupAction,
    GroupActionEvaluationRule
  >;

  for (const action of GROUP_ACTIONS) {
    if (!hasOwn(input.actionEvaluations, action)) {
      return invalidSolution();
    }

    const rawEvaluation = input.actionEvaluations[action];
    if (!isRecord(rawEvaluation)) {
      return invalidSolution();
    }

    const score = rawEvaluation.score;
    const narrativeResult = rawEvaluation.narrativeResult;
    const consequences = rawEvaluation.consequences;
    const feedback = rawEvaluation.feedback;

    if (
      !isGroupDecisionScore(score) ||
      !isNonEmptyString(narrativeResult) ||
      !isNonEmptyStringArray(consequences) ||
      !isNonEmptyString(feedback)
    ) {
      return invalidSolution();
    }

    parsedEvaluations[action] = Object.freeze({
      score,
      narrativeResult,
      consequences: Object.freeze([...consequences]),
      feedback,
    });
  }

  return Object.freeze({
    actionEvaluations: Object.freeze(parsedEvaluations),
  });
}

export function evaluateGroupDecision(
  input: GroupDecisionEvaluationInput,
): GroupDecisionEvaluation {
  if (!isGroupAction(input.answer)) {
    throw new Error("GROUP_DECISION_INVALID_ACTION");
  }

  const solution = parseGroupDecisionSolution(input.solution);
  const selectedEvaluation = solution.actionEvaluations[input.answer];
  const outcome = outcomeForScore(selectedEvaluation.score);
  const points = scoreGroupDecision(outcome) as GroupDecisionScore;

  return {
    action: input.answer,
    outcome,
    points,
    score: points,
    narrativeResult: selectedEvaluation.narrativeResult,
    consequences: [...selectedEvaluation.consequences],
    actionFeedback: selectedEvaluation.feedback,
    feedback: {
      ...input.feedback,
      status: feedbackStatusForOutcome(outcome),
      signals: [...input.feedback.signals],
    },
  };
}
