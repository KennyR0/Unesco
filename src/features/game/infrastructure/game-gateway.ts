import type {
  AdvanceGameCommand,
  ArcadeOperationResult,
  ArcadePublicErrorCode,
  GameResult,
  GameState,
  Leaderboard,
  SessionStatus,
  StartGameCommand,
  SubmitGameActionCommand,
} from "@antidoto/contracts";

/**
 * Puerto server-only de operaciones arcade (game-api.md).
 * La implementación física (fixtures o Supabase) vive fuera de este contrato.
 */
export type ArcadeGatewayResult<T> = ArcadeOperationResult<T>;

/** Transiciones permitidas; la implementaciÃ³n del gateway debe hacerlas cumplir. */
export const ARCADE_SESSION_TRANSITIONS: Readonly<
  Record<SessionStatus, readonly SessionStatus[]>
> = {
  intro: ["active", "invalid"],
  active: ["processing", "expired", "invalid"],
  processing: ["feedback", "expired", "invalid"],
  feedback: ["active", "finished", "invalid"],
  expired: [],
  finished: [],
  invalid: [],
};

export function canTransitionArcadeSession(
  from: SessionStatus,
  to: SessionStatus,
): boolean {
  return from === to || ARCADE_SESSION_TRANSITIONS[from].includes(to);
}

export type GetGameStateCommand = Readonly<{
  sessionId: string;
  gameCode?: StartGameCommand["gameCode"];
}>;

export type GetGameResultCommand = Readonly<{
  sessionId: string;
}>;

export interface ArcadeGameGateway {
  startGame(
    command: StartGameCommand & { sessionTokenHash: string },
  ): Promise<ArcadeGatewayResult<GameState>>;

  getGameState(
    command: GetGameStateCommand,
  ): Promise<ArcadeGatewayResult<GameState>>;

  submitGameAction(
    command: SubmitGameActionCommand,
  ): Promise<ArcadeGatewayResult<GameState>>;

  advanceGame(
    command: AdvanceGameCommand,
  ): Promise<ArcadeGatewayResult<GameState>>;

  getGameResult(
    command: GetGameResultCommand,
  ): Promise<ArcadeGatewayResult<GameResult>>;

  getLeaderboard(): Promise<ArcadeGatewayResult<Leaderboard>>;
}

export type ArcadeGatewayFailureCode = Extract<
  ArcadePublicErrorCode,
  | "INVALID_GAME"
  | "INVALID_ALIAS"
  | "SESSION_NOT_FOUND"
  | "SESSION_INVALID"
  | "GAME_MISMATCH"
  | "ITEM_NOT_FOUND"
  | "ITEM_NOT_IN_SESSION"
  | "INVALID_ACTION"
  | "ANSWER_ALREADY_ACCEPTED"
  | "SESSION_EXPIRED"
  | "RESULT_NOT_AVAILABLE"
  | "RESULT_ACCESS_EXPIRED"
  | "LEADERBOARD_UNAVAILABLE"
  | "LEADERBOARD_EMPTY"
  | "CONFLICT"
  | "CONTENT_UNAVAILABLE"
  | "INTERNAL_ERROR"
>;

export const ARCADE_GATEWAY_OPERATIONS = [
  "startGame",
  "getGameState",
  "submitGameAction",
  "advanceGame",
  "getGameResult",
  "getLeaderboard",
] as const;

export type ArcadeGatewayOperation = (typeof ARCADE_GATEWAY_OPERATIONS)[number];
