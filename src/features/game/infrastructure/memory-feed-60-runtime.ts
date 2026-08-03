import "server-only";

import type {
  GameAction,
  PublicFeedback,
} from "@antidoto/contracts";

import {
  resolveTimedFeedSubmit,
} from "../application/game-operations";
import type { ContentRepository } from "../content/content-repository";
import {
  createFeedClock,
  type FeedClock,
  type TimedFeedItemState,
  type TimedFeedResolution,
} from "../domain/mechanics/timed-feed";

export type Feed60AnswerRecord = Readonly<{
  itemId: string;
  decisionCorrect: boolean;
  verified: boolean;
  points: number;
}>;

/** Estado autoritativo de una partida Feed 60” en el gateway en memoria. */
export type Feed60SessionState = {
  clock: FeedClock;
  itemStates: Map<string, TimedFeedItemState>;
  hintsByItem: Map<string, readonly string[]>;
};

export function createFeed60SessionState(now: Date): Feed60SessionState {
  return {
    clock: createFeedClock(now),
    itemStates: new Map(),
    hintsByItem: new Map(),
  };
}

/**
 * Resuelve una acción feed_action contra el reloj autoritativo de la sesión.
 * Devuelve null cuando el contenido no está publicado (modo transporte) o la
 * acción no corresponde a la mecánica.
 */
export function evaluateFeed60Submit(input: {
  repository: ContentRepository;
  itemId: string;
  action: GameAction;
  sessionItemIds: readonly string[];
  clock: FeedClock;
  itemState: TimedFeedItemState;
  now: Date;
}): TimedFeedResolution | null {
  if (input.action.gameCode !== "feed-60") return null;
  if (input.action.input.kind !== "feed_action") return null;

  const content = input.repository.getContentItem("feed-60", input.itemId);
  if (!content) return null;

  return resolveTimedFeedSubmit({
    action: input.action.input.value,
    itemId: input.itemId,
    sessionItemIds: input.sessionItemIds,
    clock: input.clock,
    itemState: input.itemState,
    solution: content.solutionPrivate,
    feedback: content.feedback,
    now: input.now,
  });
}
