import {
  GAME_CODE_TO_MECHANIC,
  MECHANICS,
  type GameAction,
  type GameCode,
  type Mechanic,
} from "@antidoto/contracts";

/** Kind of input accepted by a mechanic's discriminated action. */
export type MechanicActionKind = GameAction["input"]["kind"];

/** Stable domain metadata shared by the arcade mechanic registry. */
export type MechanicDefinition = Readonly<{
  mechanic: Mechanic;
  gameCode: GameCode;
  actionKind: MechanicActionKind;
}>;

/**
 * The six mechanics are deliberately explicit. A new game must add a
 * contract-level mechanic and a definition here before it can be registered.
 */
export const MECHANIC_DEFINITIONS = {
  image_verdict: {
    mechanic: "image_verdict",
    gameCode: "real-o-ia",
    actionKind: "verdict",
  },
  group_decision: {
    mechanic: "group_decision",
    gameCode: "grupo",
    actionKind: "group_action",
  },
  headline_classification: {
    mechanic: "headline_classification",
    gameCode: "clickbait-swipe",
    actionKind: "headline_classification",
  },
  source_classification: {
    mechanic: "source_classification",
    gameCode: "radar-de-fuentes",
    actionKind: "source_classification",
  },
  timed_feed: {
    mechanic: "timed_feed",
    gameCode: "feed-60",
    actionKind: "feed_action",
  },
  guided_autopsy: {
    mechanic: "guided_autopsy",
    gameCode: "mente-maestra",
    actionKind: "autopsy_choice",
  },
} as const satisfies Record<Mechanic, MechanicDefinition>;

export function isMechanic(value: string): value is Mechanic {
  return MECHANICS.some((mechanic) => mechanic === value);
}

export function mechanicForGameCode(gameCode: GameCode): Mechanic {
  return GAME_CODE_TO_MECHANIC[gameCode];
}

export function definitionForMechanic(
  mechanic: Mechanic,
): MechanicDefinition {
  return MECHANIC_DEFINITIONS[mechanic];
}

export function definitionForGameCode(
  gameCode: GameCode,
): MechanicDefinition {
  return definitionForMechanic(mechanicForGameCode(gameCode));
}
