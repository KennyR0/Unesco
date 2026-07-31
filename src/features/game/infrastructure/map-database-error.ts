import {
  GameErrorCodeSchema,
  type ErrorEnvelope,
  type GameErrorCode,
} from "@antidoto/contracts";

import { toGameError, type InternalGameError } from "../application/game-error";

const databaseCodes = new Set<GameErrorCode>([
  "SESSION_NOT_FOUND", "SESSION_FINISHED", "SESSION_INVALID", "QUESTIONS_UNAVAILABLE",
  "QUESTION_NOT_ASSIGNED", "QUESTION_ALREADY_ANSWERED", "OPTION_NOT_SELECTED",
  "OPTION_NOT_ALLOWED", "ANSWER_SAVE_FAILED", "GAME_START_FAILED", "ADVANCE_NOT_ALLOWED",
  "GAME_NOT_COMPLETE", "GAME_FINISH_FAILED", "RESULT_NOT_AVAILABLE", "RESULT_ACCESS_EXPIRED",
  "RANKING_UNAVAILABLE",
]);

export function mapDatabaseError(code: string, issue?: InternalGameError["issue"]): ErrorEnvelope {
  const parsedCode = GameErrorCodeSchema.safeParse(code);
  const internal: InternalGameError = parsedCode.success && databaseCodes.has(parsedCode.data)
    ? { code: parsedCode.data, issue }
    : { code: "UNEXPECTED_ERROR", cause: code };
  return { ok: false, error: toGameError(internal) };
}
