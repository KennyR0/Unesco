import "server-only";

import type {
  GameAction,
  PublicFeedback,
  PublicItem,
} from "@antidoto/contracts";

import type { ContentRepository } from "../content/content-repository";
import {
  evaluateGroupDecision,
  parseGroupDecisionSolution,
  type GroupAction,
  type GroupDecisionOutcome,
} from "../domain/mechanics/group-decision";

export type GrupoAnswerRecord = Readonly<{
  itemId: string;
  outcome: GroupDecisionOutcome;
  points: number;
}>;

export type GrupoSubmitEvaluation = Readonly<{
  feedback: PublicFeedback;
  answer: GrupoAnswerRecord;
}>;

function isGroupAction(value: unknown): value is GroupAction {
  return value === "forward" || value === "verify" || value === "pause";
}

export function resolveGrupoPublicItem(
  repository: ContentRepository,
  itemId: string | null,
): PublicItem | null {
  if (!itemId) return null;
  const item = repository.getPublicItem("grupo", itemId);
  return item?.gameCode === "grupo" ? item : null;
}

/**
 * Evalúa group_action con solución privada y proyecta feedback público acotado:
 * la explicación es la consecuencia de la decisión, las señales se limitan al
 * paquete editorial y la consecuencia narrativa viaja como línea destacada.
 */
export function evaluateGrupoSubmit(input: {
  repository: ContentRepository;
  itemId: string;
  action: GameAction;
}): GrupoSubmitEvaluation | null {
  if (input.action.gameCode !== "grupo") return null;
  if (input.action.input.kind !== "group_action") return null;
  if (!isGroupAction(input.action.input.value)) return null;

  const content = input.repository.getContentItem("grupo", input.itemId);
  if (!content) return null;

  const evaluation = evaluateGroupDecision({
    answer: input.action.input.value,
    solution: parseGroupDecisionSolution(content.solutionPrivate),
    feedback: content.feedback,
  });

  return {
    answer: {
      itemId: input.itemId,
      outcome: evaluation.outcome,
      points: evaluation.points,
    },
    feedback: {
      ...evaluation.feedback,
      explanation: evaluation.actionFeedback,
      signals: [...evaluation.feedback.signals],
      revealedAnswer: evaluation.narrativeResult,
    },
  };
}
