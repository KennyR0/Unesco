import {
  GAME_CODES,
  type GameCode,
  type Mechanic,
} from "@antidoto/contracts";

import {
  definitionForGameCode,
  type MechanicDefinition,
} from "../domain/mechanic";

/** Exhaustive gameCode -> mechanic registry used by application services. */
export const MECHANIC_REGISTRY = {
  "real-o-ia": definitionForGameCode("real-o-ia").mechanic,
  grupo: definitionForGameCode("grupo").mechanic,
  "clickbait-swipe": definitionForGameCode("clickbait-swipe").mechanic,
  "radar-de-fuentes": definitionForGameCode("radar-de-fuentes").mechanic,
  "feed-60": definitionForGameCode("feed-60").mechanic,
  "mente-maestra": definitionForGameCode("mente-maestra").mechanic,
} as const satisfies Readonly<Record<GameCode, Mechanic>>;

/** Domain definitions indexed by gameCode for callers needing action metadata. */
export const MECHANIC_DEFINITIONS_BY_GAME_CODE = {
  "real-o-ia": definitionForGameCode("real-o-ia"),
  grupo: definitionForGameCode("grupo"),
  "clickbait-swipe": definitionForGameCode("clickbait-swipe"),
  "radar-de-fuentes": definitionForGameCode("radar-de-fuentes"),
  "feed-60": definitionForGameCode("feed-60"),
  "mente-maestra": definitionForGameCode("mente-maestra"),
} as const satisfies Readonly<Record<GameCode, MechanicDefinition>>;

export function getMechanicForGameCode(gameCode: GameCode): Mechanic {
  return MECHANIC_REGISTRY[gameCode];
}

export function getMechanicDefinitionForGameCode(
  gameCode: GameCode,
): MechanicDefinition {
  return MECHANIC_DEFINITIONS_BY_GAME_CODE[gameCode];
}

export function hasRegisteredGameCode(value: string): value is GameCode {
  return GAME_CODES.some((gameCode) => gameCode === value);
}

export function resolveMechanicForGameCode(
  value: string,
): Mechanic | null {
  return hasRegisteredGameCode(value) ? getMechanicForGameCode(value) : null;
}
