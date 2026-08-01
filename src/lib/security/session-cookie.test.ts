import { describe, expect, it } from "vitest";

import { createSessionToken } from "./session-token";
import {
  RESULT_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
  arcadeSessionCookieName,
  buildExpiredSessionCookie,
  buildResultCookie,
  buildSessionCookie,
  parseOpaqueSessionToken,
} from "./session-cookie";

describe("cookie antidoto_session", () => {
  const now = new Date("2026-07-30T12:00:00Z");

  it("usa atributos seguros y alinea actividad con 24 h", () => {
    const cookie = buildSessionCookie(
      {
        token: "token",
        secure: true,
        expiresAt: new Date("2026-07-31T12:00:00Z"),
      },
      now,
    );
    expect(cookie.name).toBe(SESSION_COOKIE_NAME);
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe("lax");
    expect(cookie.path).toBe("/");
    expect(cookie.maxAge).toBe(SESSION_COOKIE_MAX_AGE_SECONDS);
  });

  it("vincula cookie opaca por gameCode y limita resultado a 30 días", () => {
    const arcade = buildSessionCookie(
      {
        token: createSessionToken(),
        secure: true,
        expiresAt: new Date("2026-07-31T12:00:00Z"),
        gameCode: "mente-maestra",
      },
      now,
    );
    expect(arcade.name).toBe(arcadeSessionCookieName("mente-maestra"));
    expect(arcade.name).not.toBe(SESSION_COOKIE_NAME);
    expect(parseOpaqueSessionToken(arcade.value)).toBe(arcade.value);
    expect(parseOpaqueSessionToken("not-a-token")).toBeNull();

    const result = buildResultCookie(
      {
        token: "token",
        secure: true,
        expiresAt: new Date("2026-08-29T12:00:00Z"),
        gameCode: "real-o-ia",
      },
      now,
    );
    expect(result.name).toBe(arcadeSessionCookieName("real-o-ia"));
    expect(result.maxAge).toBe(RESULT_COOKIE_MAX_AGE_SECONDS);

    const expired = buildExpiredSessionCookie(false, now, "grupo");
    expect(expired.name).toBe(arcadeSessionCookieName("grupo"));
    expect(expired.maxAge).toBe(0);
    expect(expired.value).toBe("");
  });
});
