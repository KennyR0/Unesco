import type {
  GameCode,
  GameState,
} from "@antidoto/contracts";
import { GAME_CODES, GAME_CODE_TO_MECHANIC } from "@antidoto/contracts";

export const ARCADE_GAME_CODES = GAME_CODES;

export const ARCADE_GAME_ROUTES: Readonly<Record<GameCode, string>> = {
  "real-o-ia": "/games/real-o-ia",
  grupo: "/games/grupo",
  "clickbait-swipe": "/games/clickbait-swipe",
  "radar-de-fuentes": "/games/radar-de-fuentes",
  "feed-60": "/games/feed-60",
  "mente-maestra": "/games/mente-maestra",
};

export function createArcadeGameStateFixture(
  gameCode: GameCode = "real-o-ia",
  overrides: Partial<GameState> = {},
): GameState {
  return {
    sessionId: "test-session-id",
    gameCode,
    mechanic: GAME_CODE_TO_MECHANIC[gameCode],
    status: "active",
    alias: "Test Player",
    position: 0,
    total: 1,
    item: null,
    feedback: null,
    provisionalScore: null,
    nextAction: "submit",
    ...overrides,
  };
}
