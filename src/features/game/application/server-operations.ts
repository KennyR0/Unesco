import "server-only";

import { cookies } from "next/headers";

import type {
  ArcadeOperationResult,
  FinalResult,
  GameCode,
  GameResult,
  GameState,
  Leaderboard,
  LeaderboardSnapshot,
  LegacyGameState,
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
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { GameCodeSchema } from "../domain/schemas";
import type { ArcadeGameGateway } from "../infrastructure/game-gateway";
import { mapDatabaseError } from "../infrastructure/map-database-error";
import {
  getSharedMemoryArcadeGateway,
  type MemoryArcadeGateway,
} from "../infrastructure/memory-arcade-gateway";
import { createGameGateway } from "../infrastructure/supabase-game-gateway";
import {
  advanceGameOperation,
  arcadeFailure,
  getGameResultOperation,
  getGameStateOperation,
  getLeaderboardOperation,
} from "./game-operations";
import { startGame } from "./start-game";
import { submitGameAction } from "./submit-game-action";

export type ArcadeServerDependencies = Readonly<{
  gateway?: ArcadeGameGateway;
  cookieStore?: Awaited<ReturnType<typeof cookies>>;
  secure?: boolean;
}>;

function isMemoryGateway(
  gateway: ArcadeGameGateway,
): gateway is MemoryArcadeGateway {
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

function resolveGateway(
  dependencies: ArcadeServerDependencies = {},
): ArcadeGameGateway {
  return dependencies.gateway ?? getSharedMemoryArcadeGateway();
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

export async function resolveArcadeSessionId(
  gameCode: GameCode,
  dependencies: ArcadeServerDependencies = {},
): Promise<string | null> {
  const token = await readArcadeSessionToken(gameCode, dependencies);
  if (!token) return null;
  const gateway = resolveGateway(dependencies);
  const tokenHash = hashSessionToken(token);
  if (isMemoryGateway(gateway)) {
    return gateway.resolveSessionId(tokenHash);
  }
  return tokenHash;
}

async function currentLegacyToken(): Promise<string | null> {
  const value = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return value && isSessionToken(value) ? value : null;
}

export async function getGameStateServer(): Promise<
  OperationResult<LegacyGameState>
> {
  const token = await currentLegacyToken();
  if (!token) return mapDatabaseError("SESSION_NOT_FOUND");
  try {
    const result = await createGameGateway(
      createServerSupabaseClient(),
    ).getGameState(hashSessionToken(token));
    if (!result.ok) return mapDatabaseError(result.code);
    return { ok: true, data: result.data };
  } catch {
    return mapDatabaseError("UNEXPECTED_ERROR");
  }
}

export async function getGameResultServer(): Promise<
  OperationResult<FinalResult>
> {
  const token = await currentLegacyToken();
  if (!token) return mapDatabaseError("SESSION_NOT_FOUND");
  try {
    const result = await createGameGateway(
      createServerSupabaseClient(),
    ).getGameResult(hashSessionToken(token));
    if (!result.ok) return mapDatabaseError(result.code);
    return { ok: true, data: result.data };
  } catch {
    return mapDatabaseError("UNEXPECTED_ERROR");
  }
}

export async function getLeaderboardServer(): Promise<
  OperationResult<LeaderboardSnapshot>
> {
  const token = await currentLegacyToken();
  try {
    const result = await createGameGateway(
      createServerSupabaseClient(),
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

  const sessionId = await resolveArcadeSessionId(gameCode, dependencies);
  if (!sessionId) return arcadeFailure("SESSION_NOT_FOUND");

  return getGameStateOperation(
    {
      sessionId,
      gameCode,
    },
    { gateway: resolveGateway(dependencies) },
  );
}

export async function submitArcadeGameActionServer(
  payload: unknown,
  dependencies: ArcadeServerDependencies = {},
): Promise<ArcadeOperationResult<GameState>> {
  return submitGameAction(payload, {
    gateway: resolveGateway(dependencies),
    resolveSessionId: (gameCode) =>
      resolveArcadeSessionId(gameCode, dependencies),
  });
}

export async function advanceArcadeGameServer(
  payload: unknown,
  dependencies: ArcadeServerDependencies = {},
): Promise<ArcadeOperationResult<GameState>> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return arcadeFailure("INVALID_ACTION");
  }

  const gameCodeResult = GameCodeSchema.safeParse(
    (payload as { gameCode?: unknown }).gameCode,
  );
  if (!gameCodeResult.success) return arcadeFailure("INVALID_GAME");

  const sessionId = await resolveArcadeSessionId(
    gameCodeResult.data,
    dependencies,
  );
  if (!sessionId) return arcadeFailure("SESSION_NOT_FOUND");

  return advanceGameOperation(
    {
      sessionId,
      itemId: (payload as { itemId?: unknown }).itemId,
    },
    { gateway: resolveGateway(dependencies) },
  );
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

  const sessionId = await resolveArcadeSessionId(
    gameCodeResult.data,
    dependencies,
  );
  if (!sessionId) return arcadeFailure("SESSION_NOT_FOUND");

  return getGameResultOperation(
    { sessionId },
    { gateway: resolveGateway(dependencies) },
  );
}

export async function getArcadeLeaderboardServer(
  dependencies: ArcadeServerDependencies = {},
): Promise<ArcadeOperationResult<Leaderboard>> {
  return getLeaderboardOperation({ gateway: resolveGateway(dependencies) });
}
