import { describe, expect, it } from "vitest";

import {
  RANKING_EMPTY_MESSAGE,
  RANKING_UNAVAILABLE_MESSAGE,
  RESULT_NOT_AVAILABLE_MESSAGE,
  SAFE_SESSION_MESSAGE,
} from "../application/game-error";
import {
  describeRankingErrorState,
  mapArcadeDatabaseError,
  mapArcadeResultRankingError,
  mapDatabaseError,
} from "./map-database-error";

describe("mapeo de errores de base", () => {
  it("mapea todos los códigos sin filtrar detalles internos", () => {
    const codes = [
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
      "LEADERBOARD_UNAVAILABLE",
      "SQLSTATE-42P01",
      "private.game_sessions",
      "stack",
    ];
    for (const code of codes) {
      const result = mapDatabaseError(code, "too_short");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).not.toMatch(/SQLSTATE|private|stack|42P01/i);
        expect(result.error.message.length).toBeGreaterThan(0);
      }
    }
  });

  it("mantiene códigos internos distintos con presentación segura idéntica", () => {
    const notFound = mapDatabaseError("SESSION_NOT_FOUND");
    const invalid = mapDatabaseError("SESSION_INVALID");
    const expired = mapDatabaseError("RESULT_ACCESS_EXPIRED");
    expect(notFound).toEqual({
      ok: false,
      error: {
        code: "SESSION_NOT_FOUND",
        message: SAFE_SESSION_MESSAGE,
        recoverable: false,
      },
    });
    expect(invalid).toEqual({
      ok: false,
      error: {
        code: "SESSION_INVALID",
        message: SAFE_SESSION_MESSAGE,
        recoverable: false,
      },
    });
    expect(expired).toEqual({
      ok: false,
      error: {
        code: "RESULT_ACCESS_EXPIRED",
        message: SAFE_SESSION_MESSAGE,
        recoverable: false,
      },
    });
  });

  it("normaliza LEADERBOARD_UNAVAILABLE al envelope legado retryable", () => {
    const result = mapDatabaseError("LEADERBOARD_UNAVAILABLE");
    expect(result).toEqual({
      ok: false,
      error: {
        code: "RANKING_UNAVAILABLE",
        message: RANKING_UNAVAILABLE_MESSAGE,
        recoverable: true,
      },
    });
  });
});

describe("mapeo arcade de resultado y ranking (T037)", () => {
  it("distingue estado vacío y fallo retryable del ranking", () => {
    const empty = mapArcadeResultRankingError("LEADERBOARD_EMPTY");
    expect(empty).toEqual({
      ok: false,
      error: {
        code: "LEADERBOARD_EMPTY",
        message: RANKING_EMPTY_MESSAGE,
        retryable: false,
      },
    });
    expect(describeRankingErrorState("LEADERBOARD_EMPTY")).toEqual({
      kind: "empty",
      retryable: false,
    });

    const unavailable = mapArcadeResultRankingError("LEADERBOARD_UNAVAILABLE");
    expect(unavailable).toEqual({
      ok: false,
      error: {
        code: "LEADERBOARD_UNAVAILABLE",
        message: RANKING_UNAVAILABLE_MESSAGE,
        retryable: true,
      },
    });
    expect(describeRankingErrorState("RANKING_UNAVAILABLE")).toEqual({
      kind: "retryable",
      retryable: true,
    });
  });

  it("mapea resultado pendiente y acceso expirado sin reintento", () => {
    expect(mapArcadeDatabaseError("RESULT_NOT_AVAILABLE")).toEqual({
      ok: false,
      error: {
        code: "RESULT_NOT_AVAILABLE",
        message: RESULT_NOT_AVAILABLE_MESSAGE,
        retryable: false,
      },
    });
    expect(mapArcadeDatabaseError("RESULT_ACCESS_EXPIRED")).toEqual({
      ok: false,
      error: {
        code: "RESULT_ACCESS_EXPIRED",
        message: SAFE_SESSION_MESSAGE,
        retryable: false,
      },
    });
  });
});
