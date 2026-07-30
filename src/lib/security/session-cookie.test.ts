import { describe, expect, it } from "vitest";

import { buildExpiredSessionCookie, buildResultCookie, buildSessionCookie, SESSION_COOKIE_NAME } from "./session-cookie";

describe("cookie antidoto_session", () => {
  const now = new Date("2026-07-30T12:00:00Z");
  it("usa atributos seguros y alinea actividad con PostgreSQL", () => {
    const cookie = buildSessionCookie({ token: "token", secure: true, expiresAt: new Date("2026-07-31T12:00:00Z") }, now);
    expect(cookie.name).toBe(SESSION_COOKIE_NAME);
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe("lax");
    expect(cookie.path).toBe("/");
    expect(cookie.maxAge).toBe(86400);
  });
  it("limita resultado a siete días y expira de forma fija", () => {
    const result = buildResultCookie({ token: "token", secure: true, expiresAt: new Date("2026-08-06T12:00:00Z") }, now);
    expect(result.maxAge).toBe(604800);
    const expired = buildExpiredSessionCookie(false, now);
    expect(expired.name).toBe(SESSION_COOKIE_NAME);
    expect(expired.maxAge).toBe(0);
    expect(expired.value).toBe("");
  });
});
