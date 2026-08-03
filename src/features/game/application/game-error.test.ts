import { describe, expect, it } from "vitest";

import {
  classifyResultRankingError,
  isRankingEmptyError,
  isRankingRetryableError,
  RANKING_EMPTY_MESSAGE,
  RANKING_UNAVAILABLE_MESSAGE,
  RESULT_NOT_AVAILABLE_MESSAGE,
  SAFE_SESSION_MESSAGE,
  toArcadeResultRankingError,
  toGameError,
} from "./game-error";

describe("errores de resultado y ranking (T037)", () => {
  it("clasifica vacío, retryable, pendiente y acceso expirado", () => {
    expect(classifyResultRankingError("LEADERBOARD_EMPTY")).toBe(
      "ranking-empty",
    );
    expect(classifyResultRankingError("LEADERBOARD_UNAVAILABLE")).toBe(
      "ranking-retryable",
    );
    expect(classifyResultRankingError("RANKING_UNAVAILABLE")).toBe(
      "ranking-retryable",
    );
    expect(classifyResultRankingError("RESULT_NOT_AVAILABLE")).toBe(
      "result-pending",
    );
    expect(classifyResultRankingError("RESULT_ACCESS_EXPIRED")).toBe(
      "result-expired",
    );
    expect(isRankingEmptyError("LEADERBOARD_EMPTY")).toBe(true);
    expect(isRankingRetryableError("RANKING_UNAVAILABLE")).toBe(true);
  });

  it("proyecta PublicError arcade con vacío no retryable y ranking retryable", () => {
    const empty = toArcadeResultRankingError("LEADERBOARD_EMPTY");
    expect(empty).toEqual({
      code: "LEADERBOARD_EMPTY",
      message: RANKING_EMPTY_MESSAGE,
      retryable: false,
    });

    const unavailable = toArcadeResultRankingError("RANKING_UNAVAILABLE");
    expect(unavailable).toEqual({
      code: "LEADERBOARD_UNAVAILABLE",
      message: RANKING_UNAVAILABLE_MESSAGE,
      retryable: true,
    });

    const pending = toArcadeResultRankingError("RESULT_NOT_AVAILABLE");
    expect(pending).toEqual({
      code: "RESULT_NOT_AVAILABLE",
      message: RESULT_NOT_AVAILABLE_MESSAGE,
      retryable: false,
    });

    const expired = toArcadeResultRankingError("RESULT_ACCESS_EXPIRED");
    expect(expired).toEqual({
      code: "RESULT_ACCESS_EXPIRED",
      message: SAFE_SESSION_MESSAGE,
      retryable: false,
    });
  });

  it("mantiene mensajes seguros en el envelope legado", () => {
    expect(toGameError({ code: "RESULT_NOT_AVAILABLE" })).toEqual({
      code: "RESULT_NOT_AVAILABLE",
      message: RESULT_NOT_AVAILABLE_MESSAGE,
      recoverable: true,
    });
    expect(toGameError({ code: "RANKING_UNAVAILABLE" })).toEqual({
      code: "RANKING_UNAVAILABLE",
      message: RANKING_UNAVAILABLE_MESSAGE,
      recoverable: true,
    });
    expect(toGameError({ code: "RESULT_ACCESS_EXPIRED" })).toEqual({
      code: "RESULT_ACCESS_EXPIRED",
      message: SAFE_SESSION_MESSAGE,
      recoverable: false,
    });
  });
});
