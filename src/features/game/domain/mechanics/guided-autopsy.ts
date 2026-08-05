import type { PublicFeedback } from "@antidoto/contracts";

import { calculateGameScore, scoreAutopsyStep } from "../scoring";

export const AUTOPSY_STEPS = [
  "objective",
  "emotion",
  "headline",
  "evidence",
] as const;

export type AutopsyStep = (typeof AUTOPSY_STEPS)[number];

/** Alcance simulado acotado; nunca forma parte de GameScore. */
export const SIMULATED_REACH_MIN = 65;
export const SIMULATED_REACH_MAX = 95;

export type AutopsyOptionEvaluation = Readonly<{
  reachWeight: number;
  techniqueId: string;
  autopsyTitle: string;
  autopsyTip: string;
  includeInAutopsy: boolean;
}>;

export type GuidedAutopsySimulationAssets = Readonly<{
  educationalDisclaimer: string;
  fictionalComments: readonly string[];
}>;

export type GuidedAutopsySolution = Readonly<{
  step: AutopsyStep;
  optionEvaluations: Readonly<Record<string, AutopsyOptionEvaluation>>;
  simulationAssets: GuidedAutopsySimulationAssets | null;
}>;

/** Paso SIFT que cada técnica de autopsia refuerza (I o T). */
export type AutopsySiftStep = "investigate" | "trace";

export type AutopsyEntry = Readonly<{
  step: AutopsyStep;
  optionId: string;
  techniqueId: string;
  title: string;
  tip: string;
  siftStep: AutopsySiftStep;
}>;

/** Objetivo/emoción/titular → Investiga; prueba → Rastrea. */
export function siftStepForAutopsy(step: AutopsyStep): AutopsySiftStep {
  return step === "evidence" ? "trace" : "investigate";
}

export type GuidedAutopsyStepEvaluationInput = Readonly<{
  step: AutopsyStep;
  optionId: string;
  solution: GuidedAutopsySolution | unknown;
  feedback: PublicFeedback;
}>;

export type GuidedAutopsyStepEvaluation = Readonly<{
  step: AutopsyStep;
  optionId: string;
  completed: true;
  /** +1 por paso completado; independiente del alcance simulado. */
  points: number;
  /**
   * Peso privado para acumular simulatedReach en servidor.
   * No debe sumarse a GameScore ni mostrarse como premio.
   */
  reachWeight: number;
  autopsyEntry: AutopsyEntry | null;
  feedback: PublicFeedback;
}>;

export type GuidedAutopsySelection = Readonly<{
  step: AutopsyStep;
  optionId: string;
  reachWeight: number;
  autopsyEntry: AutopsyEntry | null;
}>;

export type GuidedAutopsySessionResult = Readonly<{
  points: number;
  maxPoints: number;
  completedSteps: number;
  /** Alcance simulado 65–95, separado de la puntuación educativa. */
  simulatedReach: number;
  autopsyEntries: readonly AutopsyEntry[];
  fictionalComments: readonly string[];
  educationalDisclaimer: string | null;
  /** Contrato educativo: la simulación nunca publica contenido externo. */
  publishesExternally: false;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAutopsyStep(value: unknown): value is AutopsyStep {
  return AUTOPSY_STEPS.includes(value as AutopsyStep);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function invalidSolution(): never {
  throw new Error("GUIDED_AUTOPSY_INVALID_SOLUTION");
}

function parseOptionEvaluation(
  value: unknown,
): AutopsyOptionEvaluation {
  if (!isRecord(value)) {
    return invalidSolution();
  }

  const {
    reachWeight,
    techniqueId,
    autopsyTitle,
    autopsyTip,
    includeInAutopsy,
  } = value;

  if (
    !isPositiveInteger(reachWeight) ||
    !isNonEmptyString(techniqueId) ||
    !isNonEmptyString(autopsyTitle) ||
    !isNonEmptyString(autopsyTip) ||
    typeof includeInAutopsy !== "boolean"
  ) {
    return invalidSolution();
  }

  return Object.freeze({
    reachWeight,
    techniqueId,
    autopsyTitle,
    autopsyTip,
    includeInAutopsy,
  });
}

function parseSimulationAssets(
  value: unknown,
): GuidedAutopsySimulationAssets | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (!isRecord(value)) {
    return invalidSolution();
  }

  const { educationalDisclaimer, fictionalComments } = value;
  if (
    !isNonEmptyString(educationalDisclaimer) ||
    !Array.isArray(fictionalComments) ||
    fictionalComments.length === 0 ||
    fictionalComments.some((comment) => !isNonEmptyString(comment))
  ) {
    return invalidSolution();
  }

  return Object.freeze({
    educationalDisclaimer,
    fictionalComments: Object.freeze([...fictionalComments]),
  });
}

/**
 * Narrows the private editorial rule before it reaches the evaluator.
 * reachWeight and autopsy tips stay server-side until an accepted choice.
 */
export function parseGuidedAutopsySolution(
  input: unknown,
): GuidedAutopsySolution {
  if (!isRecord(input) || !isAutopsyStep(input.step)) {
    return invalidSolution();
  }

  const optionEvaluations = input.optionEvaluations;
  if (!isRecord(optionEvaluations)) {
    return invalidSolution();
  }

  const optionIds = Object.keys(optionEvaluations);
  if (optionIds.length === 0) {
    return invalidSolution();
  }

  const parsedEvaluations: Record<string, AutopsyOptionEvaluation> = {};
  for (const optionId of optionIds) {
    if (!isNonEmptyString(optionId)) {
      return invalidSolution();
    }
    parsedEvaluations[optionId] = parseOptionEvaluation(
      optionEvaluations[optionId],
    );
  }

  return Object.freeze({
    step: input.step,
    optionEvaluations: Object.freeze(parsedEvaluations),
    simulationAssets: parseSimulationAssets(input.simulationAssets),
  });
}

/**
 * Suma pesos privados y acota el alcance simulado a 65–95.
 * El resultado no entra en GameScore ni en rankingScore.
 */
export function calculateSimulatedReach(
  reachWeights: readonly number[],
): number {
  if (reachWeights.length === 0) {
    throw new Error("GUIDED_AUTOPSY_EMPTY_REACH");
  }

  for (const weight of reachWeights) {
    if (!isPositiveInteger(weight)) {
      throw new Error("GUIDED_AUTOPSY_INVALID_REACH_WEIGHT");
    }
  }

  const raw = reachWeights.reduce((total, weight) => total + weight, 0);
  return Math.min(
    SIMULATED_REACH_MAX,
    Math.max(SIMULATED_REACH_MIN, raw),
  );
}

/**
 * Evalúa una elección de paso: +1 por completar, alcance separado.
 * No hay opción «más dañina» con más puntos educativos.
 */
export function evaluateGuidedAutopsyStep(
  input: GuidedAutopsyStepEvaluationInput,
): GuidedAutopsyStepEvaluation {
  if (!isAutopsyStep(input.step)) {
    throw new Error("GUIDED_AUTOPSY_INVALID_STEP");
  }

  if (!isNonEmptyString(input.optionId)) {
    throw new Error("GUIDED_AUTOPSY_INVALID_OPTION");
  }

  const solution = parseGuidedAutopsySolution(input.solution);

  if (solution.step !== input.step) {
    throw new Error("GUIDED_AUTOPSY_STEP_MISMATCH");
  }

  const selected = solution.optionEvaluations[input.optionId];
  if (selected === undefined) {
    throw new Error("GUIDED_AUTOPSY_INVALID_OPTION");
  }

  const completed = true;
  const points = scoreAutopsyStep(completed);
  const autopsyEntry = selected.includeInAutopsy
    ? Object.freeze({
        step: input.step,
        optionId: input.optionId,
        techniqueId: selected.techniqueId,
        title: selected.autopsyTitle,
        tip: selected.autopsyTip,
        siftStep: siftStepForAutopsy(input.step),
      })
    : null;

  return {
    step: input.step,
    optionId: input.optionId,
    completed,
    points,
    reachWeight: selected.reachWeight,
    autopsyEntry,
    feedback: {
      ...input.feedback,
      status: "instructive",
      signals: [...input.feedback.signals],
    },
  };
}

/**
 * Ensambla el resultado de sesión: score educativo 0–4 y viralidad separada.
 * Declara explícitamente que no hay publicación externa.
 */
export function assembleGuidedAutopsySession(input: {
  selections: readonly GuidedAutopsySelection[];
  simulationAssets?: GuidedAutopsySimulationAssets | null;
}): GuidedAutopsySessionResult {
  if (input.selections.length === 0) {
    throw new Error("GUIDED_AUTOPSY_EMPTY_SESSION");
  }

  const seenSteps = new Set<AutopsyStep>();
  for (const selection of input.selections) {
    if (!isAutopsyStep(selection.step)) {
      throw new Error("GUIDED_AUTOPSY_INVALID_STEP");
    }
    if (seenSteps.has(selection.step)) {
      throw new Error("GUIDED_AUTOPSY_DUPLICATE_STEP");
    }
    seenSteps.add(selection.step);
  }

  const sessionScore = calculateGameScore({
    gameCode: "mente-maestra",
    answers: input.selections.map(() => ({ completed: true })),
  });

  const autopsyEntries = Object.freeze(
    input.selections
      .map((selection) => selection.autopsyEntry)
      .filter((entry): entry is AutopsyEntry => entry !== null),
  );

  const simulatedReach = calculateSimulatedReach(
    input.selections.map((selection) => selection.reachWeight),
  );

  const assets = input.simulationAssets ?? null;

  return {
    points: sessionScore.points,
    maxPoints: sessionScore.maxPoints,
    completedSteps: input.selections.length,
    simulatedReach,
    autopsyEntries,
    fictionalComments: Object.freeze([...(assets?.fictionalComments ?? [])]),
    educationalDisclaimer: assets?.educationalDisclaimer ?? null,
    publishesExternally: false,
  };
}
