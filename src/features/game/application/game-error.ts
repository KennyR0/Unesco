import {
  type AliasValidationIssue,
  type ArcadePublicErrorCode,
  type GameError,
  type GameErrorCode,
  type PublicError,
} from "@antidoto/contracts";

import { PublicErrorSchema } from "../domain/schemas";

export type InternalGameError = Readonly<{
  code: GameErrorCode;
  issue?: AliasValidationIssue;
  cause?: unknown;
}>;

export const SAFE_SESSION_MESSAGE =
  "No hay una partida recuperable en este navegador. Puedes consultar el ranking o iniciar otra.";

/** Resultado todavía no materializado; no es reintentable como fallo de red. */
export const RESULT_NOT_AVAILABLE_MESSAGE =
  "El resultado estará disponible cuando termine la partida.";

/** Ranking global secundario sin entradas elegibles (estado vacío). */
export const RANKING_EMPTY_MESSAGE =
  "Todavía no hay resultados elegibles en el ranking.";

/** Fallo retryable de lectura del ranking; no afecta la partida. */
export const RANKING_UNAVAILABLE_MESSAGE =
  "El ranking no está disponible ahora. Puedes reintentar sin afectar tu partida.";

const messages: Record<
  Exclude<
    GameErrorCode,
    | "INVALID_ALIAS"
    | "BLOCKED_ALIAS"
    | "SESSION_NOT_FOUND"
    | "SESSION_INVALID"
    | "RESULT_ACCESS_EXPIRED"
    | "OPTION_NOT_SELECTED"
  >,
  string
> = {
  SESSION_FINISHED: "Esta partida ya terminó. Puedes consultar tu resultado.",
  QUESTIONS_UNAVAILABLE:
    "No hay suficientes preguntas disponibles para crear la ronda.",
  QUESTION_NOT_ASSIGNED:
    "Esa pregunta no pertenece al estado actual de tu partida.",
  QUESTION_ALREADY_ANSWERED:
    "Esta pregunta ya fue respondida. Recuperaremos tu avance.",
  OPTION_NOT_ALLOWED: "La opción seleccionada no pertenece a esta pregunta.",
  ANSWER_SAVE_FAILED:
    "No pudimos confirmar tu respuesta. Reintenta para recuperar el estado guardado.",
  GAME_START_FAILED:
    "No pudimos iniciar la partida. Tu alias se conserva para reintentar.",
  ADVANCE_NOT_ALLOWED: "Todavía no puedes avanzar desde este estado.",
  GAME_NOT_COMPLETE:
    "Aún faltan preguntas por completar antes de ver el resultado.",
  GAME_FINISH_FAILED:
    "No pudimos confirmar el resultado. Reintenta o vuelve a consultarlo.",
  RESULT_NOT_AVAILABLE: RESULT_NOT_AVAILABLE_MESSAGE,
  RANKING_UNAVAILABLE: RANKING_UNAVAILABLE_MESSAGE,
  UNEXPECTED_ERROR:
    "Ocurrió un problema inesperado. Reintenta o vuelve al inicio.",
};

export type ResultRankingErrorKind =
  | "result-pending"
  | "result-expired"
  | "ranking-empty"
  | "ranking-retryable";

const RESULT_RANKING_KIND_BY_CODE: Record<string, ResultRankingErrorKind> = {
  RESULT_NOT_AVAILABLE: "result-pending",
  RESULT_ACCESS_EXPIRED: "result-expired",
  LEADERBOARD_EMPTY: "ranking-empty",
  LEADERBOARD_UNAVAILABLE: "ranking-retryable",
  RANKING_UNAVAILABLE: "ranking-retryable",
};

export function classifyResultRankingError(
  code: string,
): ResultRankingErrorKind | null {
  return RESULT_RANKING_KIND_BY_CODE[code] ?? null;
}

export function isRankingEmptyError(code: string): boolean {
  return classifyResultRankingError(code) === "ranking-empty";
}

export function isRankingRetryableError(code: string): boolean {
  return classifyResultRankingError(code) === "ranking-retryable";
}

function arcadeCodeForResultRanking(
  kind: ResultRankingErrorKind,
): ArcadePublicErrorCode {
  switch (kind) {
    case "result-pending":
      return "RESULT_NOT_AVAILABLE";
    case "result-expired":
      return "RESULT_ACCESS_EXPIRED";
    case "ranking-empty":
      return "LEADERBOARD_EMPTY";
    case "ranking-retryable":
      return "LEADERBOARD_UNAVAILABLE";
  }
}

function messageForResultRankingKind(kind: ResultRankingErrorKind): string {
  switch (kind) {
    case "result-pending":
      return RESULT_NOT_AVAILABLE_MESSAGE;
    case "result-expired":
      return SAFE_SESSION_MESSAGE;
    case "ranking-empty":
      return RANKING_EMPTY_MESSAGE;
    case "ranking-retryable":
      return RANKING_UNAVAILABLE_MESSAGE;
  }
}

/**
 * Proyecta errores de resultado/ranking al envelope arcade (retryable / vacío).
 * RANKING_UNAVAILABLE legado se normaliza a LEADERBOARD_UNAVAILABLE.
 */
export function toArcadeResultRankingError(code: string): PublicError | null {
  const kind = classifyResultRankingError(code);
  if (!kind) return null;

  const arcadeCode = arcadeCodeForResultRanking(kind);
  return PublicErrorSchema.parse({
    code: arcadeCode,
    message: messageForResultRankingKind(kind),
    retryable: kind === "ranking-retryable",
  });
}

export function toGameError(input: InternalGameError): GameError {
  if (input.code === "INVALID_ALIAS") {
    return {
      code: "INVALID_ALIAS",
      message:
        input.issue === "required"
          ? "Escribe un alias para comenzar."
          : input.issue === "too_short"
            ? "El alias debe tener al menos 3 caracteres visibles."
            : input.issue === "too_long"
              ? "El alias debe tener como máximo 20 caracteres visibles."
              : "Usa solo letras, números, espacios internos, guiones y guiones bajos.",
      recoverable: true,
      field: "alias",
      issue: input.issue ?? "invalid_characters",
    };
  }
  if (input.code === "BLOCKED_ALIAS") {
    return {
      code: "BLOCKED_ALIAS",
      message: "Ese alias no está permitido. Elige otro.",
      recoverable: true,
      field: "alias",
    };
  }
  if (input.code === "OPTION_NOT_SELECTED") {
    return {
      code: "OPTION_NOT_SELECTED",
      message: "Selecciona una opción antes de responder.",
      recoverable: true,
      field: "option",
    };
  }
  if (
    input.code === "SESSION_NOT_FOUND" ||
    input.code === "SESSION_INVALID" ||
    input.code === "RESULT_ACCESS_EXPIRED"
  ) {
    return {
      code: input.code,
      message: SAFE_SESSION_MESSAGE,
      recoverable: false,
    };
  }
  if (input.code === "SESSION_FINISHED") {
    return {
      code: input.code,
      message: messages[input.code],
      recoverable: false,
    };
  }
  return {
    code: input.code,
    message: messages[input.code],
    recoverable: true,
  } as GameError;
}
