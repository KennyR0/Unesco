import type { PublicFeedback } from "@antidoto/contracts";

import { scoreRealOrAiAnswer } from "../scoring";

export const IMAGE_VERDICTS = ["real", "ai"] as const;

export type ImageVerdict = (typeof IMAGE_VERDICTS)[number];

export type ImageVerdictSolution = Readonly<{
  verdict: ImageVerdict;
  evaluationSignals: readonly string[];
}>;

export type ImageVerdictEvaluationInput = Readonly<{
  answer: ImageVerdict;
  solution: ImageVerdictSolution;
  feedback: PublicFeedback;
}>;

export type ImageVerdictEvaluation = Readonly<{
  verdict: ImageVerdict;
  correct: boolean;
  points: number;
  feedback: PublicFeedback;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isImageVerdict(value: unknown): value is ImageVerdict {
  return IMAGE_VERDICTS.includes(value as ImageVerdict);
}

/**
 * Narrows the private editorial rule before it reaches the evaluator.
 * The solution stays server-side; only the resulting public feedback leaves
 * the domain boundary after an accepted answer.
 */
export function parseImageVerdictSolution(
  input: unknown,
): ImageVerdictSolution {
  if (!isRecord(input)) {
    throw new Error("IMAGE_VERDICT_INVALID_SOLUTION");
  }

  const evaluationSignals = input.evaluationSignals;
  if (
    !isImageVerdict(input.verdict) ||
    !Array.isArray(evaluationSignals) ||
    evaluationSignals.length === 0 ||
    evaluationSignals.some(
      (signal) => typeof signal !== "string" || signal.trim().length === 0,
    )
  ) {
    throw new Error("IMAGE_VERDICT_INVALID_SOLUTION");
  }

  return Object.freeze({
    verdict: input.verdict,
    evaluationSignals: Object.freeze([...evaluationSignals]),
  });
}

export function evaluateImageVerdict(
  input: ImageVerdictEvaluationInput,
): ImageVerdictEvaluation {
  const solution = parseImageVerdictSolution(input.solution);
  const correct = input.answer === solution.verdict;

  return {
    verdict: input.answer,
    correct,
    points: scoreRealOrAiAnswer(correct),
    feedback: {
      ...input.feedback,
      status: correct ? "correct" : "incorrect",
      signals: [...input.feedback.signals],
    },
  };
}
