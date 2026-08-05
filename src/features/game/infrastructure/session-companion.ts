import type { GameState, PublicItem } from "@antidoto/contracts";

type AutopsyStep = Extract<PublicItem, { gameCode: "mente-maestra" }>["step"];

/** Proyección pública adicional de sesión para Feed 60” (reloj y verify). */
export type FeedSessionCompanion = Readonly<{
  kind: "feed-60";
  verified: boolean;
  verificationHints: readonly string[];
  remainingSeconds: number;
}>;

/** Elección de Mente Maestra ya aceptada y visible para la propia sesión. */
export type AutopsySelectionSnapshot = Readonly<{
  step: AutopsyStep;
  optionId: string;
  label: string;
}>;

/** Entrada de autopsia proyectada por el servidor (sin solución privada). */
export type AutopsyEntrySnapshot = Readonly<{
  step: AutopsyStep;
  title: string;
  tip: string;
  siftStep: "investigate" | "trace";
}>;

/** Proyección pública adicional de sesión para Mente Maestra. */
export type AutopsySessionCompanion = Readonly<{
  kind: "mente-maestra";
  selections: readonly AutopsySelectionSnapshot[];
  selectedOptionId: string | null;
  simulatedReach: number | null;
  autopsyEntries: readonly AutopsyEntrySnapshot[];
  fictionalComments: readonly string[];
  educationalDisclaimer: string | null;
}>;

/**
 * Datos de sesión específicos por mecánica que no caben en GameState.
 * Viajan como campo opcional en los resultados de operación; los esquemas
 * públicos del contrato no cambian.
 */
export type ArcadeSessionCompanion =
  | FeedSessionCompanion
  | AutopsySessionCompanion;

export type GameStateWithCompanion = GameState &
  Readonly<{ companion?: ArcadeSessionCompanion }>;
