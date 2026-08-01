import type { GameCode } from "@antidoto/contracts";

import { isSessionToken } from "./session-token";

export const SESSION_COOKIE_NAME = "antidoto_session";

/** Retención máxima de cookie mientras la partida sigue activa (24 h). */
export const SESSION_COOKIE_MAX_AGE_SECONDS = 86_400;

/** Retención máxima de cookie para consultar el resultado propio (30 días). */
export const RESULT_COOKIE_MAX_AGE_SECONDS = 2_592_000;

export type SessionCookieValue = {
  token: string;
  expiresAt: Date;
  secure: boolean;
  gameCode?: GameCode;
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
  return Math.floor(
    Math.max(0, Math.min(maximum, (expiresAt.getTime() - now.getTime()) / 1000)),
  );
}

/** Cookie opaca por juego: no reutiliza la sesión de otro gameCode. */
export function arcadeSessionCookieName(gameCode: GameCode): string {
  return `${SESSION_COOKIE_NAME}.${gameCode}`;
}

export function resolveSessionCookieName(gameCode?: GameCode): string {
  return gameCode ? arcadeSessionCookieName(gameCode) : SESSION_COOKIE_NAME;
}

export function parseOpaqueSessionToken(
  value: string | undefined | null,
): string | null {
  if (!value || !isSessionToken(value)) return null;
  return value;
}

export function buildSessionCookie(
  value: SessionCookieValue,
  now = new Date(),
): CookieOptions {
  return {
    name: resolveSessionCookieName(value.gameCode),
    value: value.token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: value.secure,
    expires: value.expiresAt,
    maxAge: clampAge(
      value.expiresAt,
      now,
      SESSION_COOKIE_MAX_AGE_SECONDS,
    ),
  };
}

export function buildResultCookie(
  value: SessionCookieValue,
  now = new Date(),
): CookieOptions {
  return {
    ...buildSessionCookie(value, now),
    maxAge: clampAge(value.expiresAt, now, RESULT_COOKIE_MAX_AGE_SECONDS),
  };
}

export function buildExpiredSessionCookie(
  secure: boolean,
  now = new Date(),
  gameCode?: GameCode,
): CookieOptions {
  return {
    name: resolveSessionCookieName(gameCode),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    expires: new Date(now.getTime() - 1000),
    maxAge: 0,
  };
}
