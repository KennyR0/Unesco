export const SESSION_COOKIE_NAME = "antidoto_session";
const ACTIVE_MAX_AGE = 86_400;
const RESULT_MAX_AGE = 604_800;

export type SessionCookieValue = {
  token: string;
  expiresAt: Date;
  secure: boolean;
};

type CookieOptions = {
  name: string;
  value: string;
  httpOnly: boolean;
  sameSite: "lax";
  path: "/";
  secure: boolean;
  expires: Date;
  maxAge: number;
};

function clampAge(expiresAt: Date, now: Date, maximum: number): number {
  return Math.floor(Math.max(0, Math.min(maximum, (expiresAt.getTime() - now.getTime()) / 1000)));
}

export function buildSessionCookie(value: SessionCookieValue, now = new Date()): CookieOptions {
  return {
    name: SESSION_COOKIE_NAME,
    value: value.token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: value.secure,
    expires: value.expiresAt,
    maxAge: clampAge(value.expiresAt, now, ACTIVE_MAX_AGE),
  };
}

export function buildResultCookie(value: SessionCookieValue, now = new Date()): CookieOptions {
  return { ...buildSessionCookie(value, now), maxAge: clampAge(value.expiresAt, now, RESULT_MAX_AGE) };
}

export function buildExpiredSessionCookie(secure: boolean, now = new Date()): CookieOptions {
  return { name: SESSION_COOKIE_NAME, value: "", httpOnly: true, sameSite: "lax", path: "/", secure, expires: new Date(now.getTime() - 1000), maxAge: 0 };
}
