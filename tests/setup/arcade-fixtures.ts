import type {
  GameCode,
  GameState,
  Mechanic,
} from "@antidoto/contracts";

export const ARCADE_GAME_CODES = [
  "real-o-ia",
  "grupo",
  "clickbait-swipe",
  "radar-de-fuentes",
  "feed-60",
  "mente-maestra",
] as const satisfies readonly GameCode[];

export const ARCADE_GAME_ROUTES: Readonly<Record<GameCode, string>> = {
  "real-o-ia": "/games/real-o-ia",
  grupo: "/games/grupo",
  "clickbait-swipe": "/games/clickbait-swipe",
  "radar-de-fuentes": "/games/radar-de-fuentes",
  "feed-60": "/games/feed-60",
  "mente-maestra": "/games/mente-maestra",
};

const MECHANICS: Readonly<Record<GameCode, Mechanic>> = {
  "real-o-ia": "image_verdict",
  grupo: "group_decision",
  "clickbait-swipe": "headline_classification",
  "radar-de-fuentes": "source_classification",
  "feed-60": "timed_feed",
  "mente-maestra": "guided_autopsy",
};

export function createArcadeGameStateFixture(
  gameCode: GameCode = "real-o-ia",
  overrides: Partial<GameState> = {},
): GameState {
  return {
    sessionId: "test-session-id",
    gameCode,
    mechanic: MECHANICS[gameCode],
    status: "active",
    alias: "Test Player",
    position: 0,
    total: 1,
    item: null,
    feedback: null,
    nextAction: "submit",
    ...overrides,
  };
}
