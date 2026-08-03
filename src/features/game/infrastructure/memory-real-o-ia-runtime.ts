import "server-only";

import type {
  GameAction,
  PublicFeedback,
} from "@antidoto/contracts";

import type { ContentRepository } from "../content/content-repository";
import {
  evaluateImageVerdict,
  parseImageVerdictSolution,
  type ImageVerdict,
} from "../domain/mechanics/image-verdict";

export type RealOrIaAnswerRecord = Readonly<{
  itemId: string;
  correct: boolean;
  points: number;
}>;

export type RealOrIaSubmitEvaluation = Readonly<{
  feedback: PublicFeedback;
  answer: RealOrIaAnswerRecord;
}>;

function isImageVerdict(value: unknown): value is ImageVerdict {
  return value === "real" || value === "ai";
}

/**
 * Evalúa verdict con solución privada y proyecta feedback público acotado.
 */
export function evaluateRealOrIaSubmit(input: {
  repository: ContentRepository;
  itemId: string;
  action: GameAction;
}): RealOrIaSubmitEvaluation | null {
  if (input.action.gameCode !== "real-o-ia") return null;
  if (input.action.input.kind !== "verdict") return null;
  if (!isImageVerdict(input.action.input.value)) return null;

  const content = input.repository.getContentItem("real-o-ia", input.itemId);
  if (!content) return null;

  const evaluation = evaluateImageVerdict({
    answer: input.action.input.value,
    solution: parseImageVerdictSolution(content.solutionPrivate),
    feedback: content.feedback,
  });

  return {
    answer: {
      itemId: input.itemId,
      correct: evaluation.correct,
      points: evaluation.points,
    },
    feedback: evaluation.feedback,
  };
}
