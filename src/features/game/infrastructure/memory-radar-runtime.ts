import "server-only";

import type {
  GameAction,
  PublicFeedback,
} from "@antidoto/contracts";

import type { ContentRepository } from "../content/content-repository";
import {
  evaluateSourceClassification,
  parseSourceClassificationSolution,
  type SourceCategory,
} from "../domain/mechanics/source-classification";

export type RadarAnswerRecord = Readonly<{
  itemId: string;
  correct: boolean;
  points: number;
}>;

export type RadarSubmitEvaluation = Readonly<{
  feedback: PublicFeedback;
  answer: RadarAnswerRecord;
}>;

function isSourceCategory(value: unknown): value is SourceCategory {
  return value === "reliable" || value === "doubtful" || value === "fraudulent";
}

/**
 * Evalúa source_classification con solución privada y proyecta feedback
 * público acotado.
 */
export function evaluateRadarSubmit(input: {
  repository: ContentRepository;
  itemId: string;
  action: GameAction;
}): RadarSubmitEvaluation | null {
  if (input.action.gameCode !== "radar-de-fuentes") return null;
  if (input.action.input.kind !== "source_classification") return null;
  if (!isSourceCategory(input.action.input.value)) return null;

  const content = input.repository.getContentItem(
    "radar-de-fuentes",
    input.itemId,
  );
  if (!content) return null;

  const evaluation = evaluateSourceClassification({
    answer: input.action.input.value,
    solution: parseSourceClassificationSolution(content.solutionPrivate),
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
