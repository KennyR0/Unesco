import {
  GameErrorCodeSchema,
  type ArcadeOperationResult,
  type ErrorEnvelope,
  type GameErrorCode,
  type PublicError,
} from "@antidoto/contracts";

import {
  isRankingEmptyError,
  isRankingRetryableError,
  toArcadeResultRankingError,
  toGameError,
  type InternalGameError,
} from "../application/game-error";

const databaseCodes = new Set<GameErrorCode>([
  "SESSION_NOT_FOUND",
  "SESSION_FINISHED",
  "SESSION_INVALID",
  "QUESTIONS_UNAVAILABLE",
  "QUESTION_NOT_ASSIGNED",
  "QUESTION_ALREADY_ANSWERED",
  "OPTION_NOT_SELECTED",
  "OPTION_NOT_ALLOWED",
  "ANSWER_SAVE_FAILED",
  "GAME_START_FAILED",
  "ADVANCE_NOT_ALLOWED",
  "GAME_NOT_COMPLETE",
  "GAME_FINISH_FAILED",
  "RESULT_NOT_AVAILABLE",
  "RESULT_ACCESS_EXPIRED",
  "RANKING_UNAVAILABLE",
]);

/** Códigos arcade o legado que el mapeo de resultado/ranking reconoce. */
const RESULT_RANKING_INPUT_CODES = new Set([
  "RESULT_NOT_AVAILABLE",
  "RESULT_ACCESS_EXPIRED",
  "LEADERBOARD_EMPTY",
  "LEADERBOARD_UNAVAILABLE",
  "RANKING_UNAVAILABLE",
]);

function legacyCodeForDatabaseInput(code: string): string {
  if (code === "LEADERBOARD_UNAVAILABLE") return "RANKING_UNAVAILABLE";
  return code;
}

export function mapDatabaseError(
  code: string,
  issue?: InternalGameError["issue"],
): ErrorEnvelope {
  const normalized = legacyCodeForDatabaseInput(code);
  const parsedCode = GameErrorCodeSchema.safeParse(normalized);
  const internal: InternalGameError =
    parsedCode.success && databaseCodes.has(parsedCode.data)
      ? { code: parsedCode.data, issue }
      : { code: "UNEXPECTED_ERROR", cause: code };
  return { ok: false, error: toGameError(internal) };
}

/**
 * Mapeo arcade de resultado y ranking: vacío no retryable; fallo de ranking sí.
 * No filtra SQL ni detalles internos en el mensaje público.
 */
export function mapArcadeResultRankingError(
  code: string,
): ArcadeOperationResult<never> | null {
  if (!RESULT_RANKING_INPUT_CODES.has(code)) return null;

  const error = toArcadeResultRankingError(code);
  if (!error) return null;
  return { ok: false, error };
}

export function mapArcadeDatabaseError(
  code: string,
): ArcadeOperationResult<never> {
  const ranked = mapArcadeResultRankingError(code);
  if (ranked) return ranked;

  const legacy = mapDatabaseError(code);
  if (!legacy.ok) {
    const arcade = toArcadeResultRankingError(legacy.error.code);
    if (arcade) return { ok: false, error: arcade };
  }

  return {
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        "Ocurrió un problema inesperado. Reintenta sin duplicar la acción.",
      retryable: true,
    } satisfies PublicError,
  };
}

export function describeRankingErrorState(code: string): {
  kind: "empty" | "retryable" | "other";
  retryable: boolean;
} {
  if (isRankingEmptyError(code)) {
    return { kind: "empty", retryable: false };
  }
  if (isRankingRetryableError(code)) {
    return { kind: "retryable", retryable: true };
  }
  return { kind: "other", retryable: false };
}
