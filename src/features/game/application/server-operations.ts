import "server-only";

import { cookies } from "next/headers";

import type {
  ArcadeOperationResult,
  GameCode,
  GameResult,
  GameState,
  Leaderboard,
  LeaderboardSnapshot,
  OperationResult,
} from "@antidoto/contracts";

import {
  arcadeSessionCookieName,
  buildSessionCookie,
  parseOpaqueSessionToken,
  SESSION_COOKIE_NAME,
} from "../../../lib/security/session-cookie";
import {
  hashSessionToken,
  isSessionToken,
} from "../../../lib/security/session-token";
import { resolveArcadeGatewayMode } from "../../../lib/env/arcade-gateway";
import {
  createLegacyApiSupabaseClient,
  createServerSupabaseClient,
} from "../../../lib/supabase/server";
import { GameCodeSchema } from "../domain/schemas";
import type { ArcadeGameGateway } from "../infrastructure/game-gateway";
import { mapDatabaseError } from "../infrastructure/map-database-error";
import { getSharedMemoryArcadeGateway } from "../infrastructure/memory-arcade-gateway";
import { getSharedSupabaseArcadeGateway } from "../infrastructure/supabase-arcade-gateway";
import { createGameGateway } from "../infrastructure/supabase-game-gateway";
import {
  arcadeFailure,
  assertActionPayloadWithinLimit,
  containsForbiddenAuthorityFields,
  getGameResultOperation,
  getGameStateOperation,
} from "./game-operations";
import { getLeaderboard as getArcadeLeaderboard } from "./leaderboard";
import { startGame } from "./start-game";
import { advanceGame, submitGameAction } from "./submit-game-action";

function rejectClientAuthorityPayload(
  payload: unknown,
): ArcadeOperationResult<never> | null {
  const sizeError = assertActionPayloadWithinLimit(payload);
  if (sizeError) return { ok: false, error: sizeError };
  if (containsForbiddenAuthorityFields(payload)) {
    return arcadeFailure(
      "INVALID_ACTION",
      "La acción no puede incluir campos de autoridad del servidor.",
    );
  }
  return null;
}

export type ArcadeServerDependencies = Readonly<{
  gateway?: ArcadeGameGateway;
  cookieStore?: Awaited<ReturnType<typeof cookies>>;
  secure?: boolean;
}>;

type ResolvedArcadeSession = Readonly<{
  sessionId: string;
  token: string;
}>;

type ArcadeSessionResolution =
  | Readonly<{ kind: "missing" }>
  | Readonly<{ kind: "invalid" }>
  | Readonly<{ kind: "valid"; token: string }>;

type SessionResolvingGateway = ArcadeGameGateway & {
  resolveSessionId(
    tokenHash: string,
  ): string | null | Promise<string | null>;
};

function hasResolveSessionId(
  gateway: ArcadeGameGateway,
): gateway is SessionResolvingGateway {
  return (
    "resolveSessionId" in gateway &&
    typeof (gateway as { resolveSessionId?: unknown }).resolveSessionId ===
      "function"
  );
}

async function cookieJar(
  dependencies: ArcadeServerDependencies = {},
): Promise<Awaited<ReturnType<typeof cookies>>> {
  return dependencies.cookieStore ?? (await cookies());
}

function isSecure(dependencies: ArcadeServerDependencies): boolean {
  return dependencies.secure ?? process.env.NODE_ENV !== "development";
}

export function resolveGateway(
  dependencies: ArcadeServerDependencies = {},
): ArcadeGameGateway {
  if (dependencies.gateway) return dependencies.gateway;

  const mode = resolveArcadeGatewayMode();
  if (mode === "supabase") {
    return getSharedSupabaseArcadeGateway(createServerSupabaseClient());
  }
  return getSharedMemoryArcadeGateway();
}

export async function readArcadeSessionToken(
  gameCode: GameCode,
  dependencies: ArcadeServerDependencies = {},
): Promise<string | null> {
  const jar = await cookieJar(dependencies);
  return parseOpaqueSessionToken(
    jar.get(arcadeSessionCookieName(gameCode))?.value,
  );
}

async function resolveArcadeSessionCookie(
  gameCode: GameCode,
  dependencies: ArcadeServerDependencies = {},
): Promise<ArcadeSessionResolution> {
  const jar = await cookieJar(dependencies);
  const rawValue = jar.get(arcadeSessionCookieName(gameCode))?.value;
  if (rawValue === undefined) return { kind: "missing" };

  const token = parseOpaqueSessionToken(rawValue);
  if (!token) return { kind: "invalid" };
  return { kind: "valid", token };
}

async function resolveArcadeSession(
  gameCode: GameCode,
  dependencies: ArcadeServerDependencies = {},
): Promise<ArcadeOperationResult<ResolvedArcadeSession>> {
  const cookie = await resolveArcadeSessionCookie(gameCode, dependencies);
  if (cookie.kind === "missing") return arcadeFailure("SESSION_NOT_FOUND");
  if (cookie.kind === "invalid") return arcadeFailure("SESSION_INVALID");

  const gateway = resolveGateway(dependencies);
  const tokenHash = hashSessionToken(cookie.token);
  if (!hasResolveSessionId(gateway)) {
    return arcadeFailure("SESSION_INVALID");
  }
  const sessionId = await gateway.resolveSessionId(tokenHash);

  if (!sessionId) return arcadeFailure("SESSION_INVALID");
  return { ok: true, data: { sessionId, token: cookie.token } };
}

export async function resolveArcadeSessionId(
  gameCode: GameCode,
  dependencies: ArcadeServerDependencies = {},
): Promise<string | null> {
  const resolved = await resolveArcadeSession(gameCode, dependencies);
  return resolved.ok ? resolved.data.sessionId : null;
}

async function currentLegacyToken(): Promise<string | null> {
  const value = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return value && isSessionToken(value) ? value : null;
}

/** Ranking secundario: todavía proyecta el snapshot legado hasta T070. */
export async function getLeaderboardServer(): Promise<
  OperationResult<LeaderboardSnapshot>
> {
  const token = await currentLegacyToken();
  try {
    const result = await createGameGateway(
      createLegacyApiSupabaseClient(),
    ).getLeaderboard(token ? hashSessionToken(token) : undefined);
    if (!result.ok) return mapDatabaseError(result.code);
    return { ok: true, data: result.data };
  } catch {
    return mapDatabaseError("RANKING_UNAVAILABLE");
  }
}

export async function startArcadeGameServer(
  payload: unknown,
  dependencies: ArcadeServerDependencies = {},
): Promise<ArcadeOperationResult<GameState>> {
  const jar = await cookieJar(dependencies);
  return startGame(payload, {
    gateway: resolveGateway(dependencies),
    onSessionCreated: async ({ token, expiresAt, gameCode }) => {
      jar.set(
        buildSessionCookie({
          token,
          expiresAt,
          secure: isSecure(dependencies),
          gameCode,
        }),
      );
    },
  });
}

export async function getArcadeGameStateServer(
  payload: unknown,
  dependencies: ArcadeServerDependencies = {},
): Promise<ArcadeOperationResult<GameState>> {
  const parsedCode =
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    "gameCode" in payload
      ? GameCodeSchema.safeParse((payload as { gameCode: unknown }).gameCode)
      : null;

  if (parsedCode && !parsedCode.success) {
    return arcadeFailure("INVALID_GAME");
  }

  const gameCode = parsedCode?.success ? parsedCode.data : null;
  if (!gameCode) {
    return arcadeFailure("INVALID_ACTION");
  }

  const session = await resolveArcadeSession(gameCode, dependencies);
  if (!session.ok) return session;

  return getGameStateOperation(
    {
      sessionId: session.data.sessionId,
      gameCode,
    },
    { gateway: resolveGateway(dependencies) },
  );
}

export async function submitArcadeGameActionServer(
  payload: unknown,
  dependencies: ArcadeServerDependencies = {},
): Promise<ArcadeOperationResult<GameState>> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return arcadeFailure("INVALID_ACTION");
  }

  const authorityRejection = rejectClientAuthorityPayload(payload);
  if (authorityRejection) return authorityRejection;

  const gameCodeResult = GameCodeSchema.safeParse(
    (payload as { gameCode?: unknown }).gameCode,
  );
  if (!gameCodeResult.success) return arcadeFailure("INVALID_GAME");

  const session = await resolveArcadeSession(gameCodeResult.data, dependencies);
  if (!session.ok) return session;

  return submitGameAction(payload, {
    gateway: resolveGateway(dependencies),
    resolveSessionId: async () => session.data.sessionId,
  });
}

export async function advanceArcadeGameServer(
  payload: unknown,
  dependencies: ArcadeServerDependencies = {},
): Promise<ArcadeOperationResult<GameState>> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return arcadeFailure("INVALID_ACTION");
  }

  const authorityRejection = rejectClientAuthorityPayload(payload);
  if (authorityRejection) return authorityRejection;

  const gameCodeResult = GameCodeSchema.safeParse(
    (payload as { gameCode?: unknown }).gameCode,
  );
  if (!gameCodeResult.success) return arcadeFailure("INVALID_GAME");

  const session = await resolveArcadeSession(gameCodeResult.data, dependencies);
  if (!session.ok) return session;

  return advanceGame(payload, {
    gateway: resolveGateway(dependencies),
    resolveSessionId: async () => session.data.sessionId,
  });
}

export async function getArcadeGameResultServer(
  payload: unknown,
  dependencies: ArcadeServerDependencies = {},
): Promise<ArcadeOperationResult<GameResult>> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return arcadeFailure("INVALID_ACTION");
  }

  const gameCodeResult = GameCodeSchema.safeParse(
    (payload as { gameCode?: unknown }).gameCode,
  );
  if (!gameCodeResult.success) return arcadeFailure("INVALID_GAME");

  const session = await resolveArcadeSession(gameCodeResult.data, dependencies);
  if (!session.ok) return session;

  return getGameResultOperation(
    { sessionId: session.data.sessionId },
    { gateway: resolveGateway(dependencies) },
  );
}

export async function getArcadeLeaderboardServer(
  dependencies: ArcadeServerDependencies = {},
): Promise<ArcadeOperationResult<Leaderboard>> {
  return getArcadeLeaderboard({ gateway: resolveGateway(dependencies) });
}
