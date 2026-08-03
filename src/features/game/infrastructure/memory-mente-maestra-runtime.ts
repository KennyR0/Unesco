import "server-only";

import type {
  GameAction,
  PublicFeedback,
  PublicItem,
} from "@antidoto/contracts";

import type { ContentRepository } from "../content/content-repository";
import {
  assembleGuidedAutopsySession,
  evaluateGuidedAutopsyStep,
  SIMULATED_REACH_MIN,
  type AutopsyEntry,
  type AutopsyStep,
  type GuidedAutopsySelection,
  type GuidedAutopsySimulationAssets,
  type GuidedAutopsySolution,
  parseGuidedAutopsySolution,
} from "../domain/mechanics/guided-autopsy";

export type MenteMaestraAnswerRecord = Readonly<{
  itemId: string;
  step: AutopsyStep;
  optionId: string;
  label: string;
  reachWeight: number;
  autopsyEntry: AutopsyEntry | null;
}>;

export type MenteMaestraSubmitEvaluation = Readonly<{
  feedback: PublicFeedback;
  answer: MenteMaestraAnswerRecord;
}>;

type MenteMaestraPublicItem = Extract<
  PublicItem,
  { gameCode: "mente-maestra" }
>;

/**
 * Evalúa autopsy_choice contra la solución privada del paso. La etiqueta
 * visible se proyecta desde el item público, nunca desde el cliente.
 */
export function evaluateMenteMaestraSubmit(input: {
  repository: ContentRepository;
  itemId: string;
  action: GameAction;
}): MenteMaestraSubmitEvaluation | null {
  if (input.action.gameCode !== "mente-maestra") return null;
  if (input.action.input.kind !== "autopsy_choice") return null;

  const content = input.repository.getContentItem(
    "mente-maestra",
    input.itemId,
  );
  if (!content) return null;

  const optionId = input.action.input.optionId;
  const publicItem = content.publicItem as MenteMaestraPublicItem;
  const option = publicItem.options.find(
    (candidate) => candidate.optionId === optionId,
  );
  if (!option) return null;

  let evaluation;
  try {
    evaluation = evaluateGuidedAutopsyStep({
      step: input.action.input.step,
      optionId,
      solution: content.solutionPrivate,
      feedback: content.feedback,
    });
  } catch {
    return null;
  }

  return {
    answer: {
      itemId: input.itemId,
      step: evaluation.step,
      optionId: evaluation.optionId,
      label: option.label,
      reachWeight: evaluation.reachWeight,
      autopsyEntry: evaluation.autopsyEntry,
    },
    feedback: evaluation.feedback,
  };
}

function findSimulationAssets(
  repository: ContentRepository,
): GuidedAutopsySimulationAssets | null {
  for (const item of repository.listPublishedItems("mente-maestra")) {
    let solution: GuidedAutopsySolution;
    try {
      solution = parseGuidedAutopsySolution(item.solutionPrivate);
    } catch {
      continue;
    }
    if (solution.simulationAssets) {
      return solution.simulationAssets;
    }
  }
  return null;
}

export type MenteMaestraSessionAssembly = Readonly<{
  simulatedReach: number;
  autopsyEntries: readonly AutopsyEntry[];
  fictionalComments: readonly string[];
  educationalDisclaimer: string | null;
}>;

/**
 * Ensambla alcance simulado y panel de autopsia al cerrar la partida.
 * Sin selecciones aceptadas el alcance queda en el piso contractual (65).
 */
export function assembleMenteMaestraSession(input: {
  repository: ContentRepository;
  selections: readonly GuidedAutopsySelection[];
}): MenteMaestraSessionAssembly {
  const simulationAssets = findSimulationAssets(input.repository);

  if (input.selections.length === 0) {
    return {
      simulatedReach: SIMULATED_REACH_MIN,
      autopsyEntries: [],
      fictionalComments: Object.freeze([
        ...(simulationAssets?.fictionalComments ?? []),
      ]),
      educationalDisclaimer: simulationAssets?.educationalDisclaimer ?? null,
    };
  }

  const assembled = assembleGuidedAutopsySession({
    selections: input.selections,
    simulationAssets,
  });

  return {
    simulatedReach: assembled.simulatedReach,
    autopsyEntries: assembled.autopsyEntries,
    fictionalComments: assembled.fictionalComments,
    educationalDisclaimer: assembled.educationalDisclaimer,
  };
}
