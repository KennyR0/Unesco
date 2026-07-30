import { describe, expect, it } from "vitest";

import { SAFE_SESSION_MESSAGE } from "../application/game-error";
import { mapDatabaseError } from "./map-database-error";

describe("mapeo de errores de base", () => {
  it("mapea todos los códigos sin filtrar detalles internos", () => {
    const codes = [
      "SESSION_NOT_FOUND", "SESSION_FINISHED", "SESSION_INVALID", "QUESTIONS_UNAVAILABLE",
      "QUESTION_NOT_ASSIGNED", "QUESTION_ALREADY_ANSWERED", "OPTION_NOT_SELECTED",
      "OPTION_NOT_ALLOWED", "ANSWER_SAVE_FAILED", "GAME_START_FAILED", "ADVANCE_NOT_ALLOWED",
      "GAME_NOT_COMPLETE", "GAME_FINISH_FAILED", "RESULT_NOT_AVAILABLE", "RESULT_ACCESS_EXPIRED",
      "RANKING_UNAVAILABLE", "SQLSTATE-42P01", "private.game_sessions", "stack",
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
    expect(notFound).toEqual({ ok: false, error: { code: "SESSION_NOT_FOUND", message: SAFE_SESSION_MESSAGE, recoverable: false } });
    expect(invalid).toEqual({ ok: false, error: { code: "SESSION_INVALID", message: SAFE_SESSION_MESSAGE, recoverable: false } });
    expect(expired).toEqual({ ok: false, error: { code: "RESULT_ACCESS_EXPIRED", message: SAFE_SESSION_MESSAGE, recoverable: false } });
  });
});
