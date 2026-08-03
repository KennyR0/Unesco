import "server-only";

import type {
  GameAction,
  PublicFeedback,
} from "@antidoto/contracts";

import type { ContentRepository } from "../content/content-repository";
import {
  evaluateHeadlineClassification,
  parseHeadlineClassificationSolution,
  type HeadlineClassification,
} from "../domain/mechanics/headline-classification";

export type ClickbaitAnswerRecord = Readonly<{
  itemId: string;
  correct: boolean;
  points: number;
  bonusPoints: number;
}>;

export type ClickbaitSubmitEvaluation = Readonly<{
  feedback: PublicFeedback;
  answer: ClickbaitAnswerRecord;
}>;

function isHeadlineClassification(
  value: unknown,
): value is HeadlineClassification {
  return value === "journalism" || value === "clickbait";
}

/**
 * Evalúa headline_classification con solución privada y racha de sesión.
 * streakBefore y bonusPointsAwarded los deriva el gateway de las respuestas
 * ya aceptadas; el cliente nunca los aporta.
 */
export function evaluateClickbaitSubmit(input: {
  repository: ContentRepository;
  itemId: string;
  action: GameAction;
  streakBefore: number;
  bonusPointsAwarded: number;
}): ClickbaitSubmitEvaluation | null {
  if (input.action.gameCode !== "clickbait-swipe") return null;
  if (input.action.input.kind !== "headline_classification") return null;
  if (!isHeadlineClassification(input.action.input.value)) return null;

  const content = input.repository.getContentItem(
    "clickbait-swipe",
    input.itemId,
  );
  if (!content) return null;

  const evaluation = evaluateHeadlineClassification({
    answer: input.action.input.value,
    solution: parseHeadlineClassificationSolution(content.solutionPrivate),
    feedback: content.feedback,
    streakBefore: input.streakBefore,
    bonusPointsAwarded: input.bonusPointsAwarded,
  });

  return {
    answer: {
      itemId: input.itemId,
      correct: evaluation.correct,
      points: evaluation.points,
      bonusPoints: evaluation.bonusPoints,
    },
    feedback: evaluation.feedback,
  };
}
