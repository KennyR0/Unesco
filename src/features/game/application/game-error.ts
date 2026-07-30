import {
  type AliasValidationIssue,
  type GameError,
  type GameErrorCode,
} from "@antidoto/contracts";

export type InternalGameError = Readonly<{
  code: GameErrorCode;
  issue?: AliasValidationIssue;
  cause?: unknown;
}>;

export const SAFE_SESSION_MESSAGE =
  "No hay una partida recuperable en este navegador. Puedes consultar el ranking o iniciar otra.";

const messages: Record<Exclude<GameErrorCode, "INVALID_ALIAS" | "BLOCKED_ALIAS" | "SESSION_NOT_FOUND" | "SESSION_INVALID" | "RESULT_ACCESS_EXPIRED" | "OPTION_NOT_SELECTED">, string> = {
  SESSION_FINISHED: "Esta partida ya terminó. Puedes consultar tu resultado.",
  QUESTIONS_UNAVAILABLE: "No hay suficientes preguntas disponibles para crear la ronda.",
  QUESTION_NOT_ASSIGNED: "Esa pregunta no pertenece al estado actual de tu partida.",
  QUESTION_ALREADY_ANSWERED: "Esta pregunta ya fue respondida. Recuperaremos tu avance.",
  OPTION_NOT_ALLOWED: "La opción seleccionada no pertenece a esta pregunta.",
  ANSWER_SAVE_FAILED: "No pudimos confirmar tu respuesta. Reintenta para recuperar el estado guardado.",
  GAME_START_FAILED: "No pudimos iniciar la partida. Tu alias se conserva para reintentar.",
  ADVANCE_NOT_ALLOWED: "Todavía no puedes avanzar desde este estado.",
  GAME_NOT_COMPLETE: "Aún faltan preguntas por completar antes de ver el resultado.",
  GAME_FINISH_FAILED: "No pudimos confirmar el resultado. Reintenta o vuelve a consultarlo.",
  RESULT_NOT_AVAILABLE: "El resultado estará disponible cuando completes la ronda.",
  RANKING_UNAVAILABLE: "El ranking no está disponible por el momento.",
  UNEXPECTED_ERROR: "Ocurrió un problema inesperado. Reintenta o vuelve al inicio.",
};

export function toGameError(input: InternalGameError): GameError {
  if (input.code === "INVALID_ALIAS") {
    return {
        code: "INVALID_ALIAS",
        message: input.issue === "required"
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
  if (input.code === "SESSION_NOT_FOUND" || input.code === "SESSION_INVALID" || input.code === "RESULT_ACCESS_EXPIRED") {
    return { code: input.code, message: SAFE_SESSION_MESSAGE, recoverable: false };
  }
  if (input.code === "SESSION_FINISHED") {
    return { code: input.code, message: messages[input.code], recoverable: false };
  }
  return { code: input.code, message: messages[input.code], recoverable: true } as GameError;
}
