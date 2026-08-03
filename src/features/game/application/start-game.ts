import "server-only";

import {
  RoundSizeSchema,
  type ArcadeOperationResult,
  type GameCode,
  type GameState,
  type OperationResult,
  type StartGameResult,
} from "@antidoto/contracts";

import { parseServerEnv } from "../../../lib/env/server";
import {
  createSessionToken,
  hashSessionToken,
} from "../../../lib/security/session-token";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { validateAlias } from "../domain/alias";
import { SESSION_ACTIVITY_RETENTION_MS } from "../domain/session";
import type { ArcadeGameGateway } from "../infrastructure/game-gateway";
import { mapDatabaseError } from "../infrastructure/map-database-error";
import { getSharedMemoryArcadeGateway } from "../infrastructure/memory-arcade-gateway";
import {
  createGameGateway,
  type SupabaseGameGateway,
} from "../infrastructure/supabase-game-gateway";
import { toGameError } from "./game-error";
import { startGameOperation } from "./game-operations";

export type ArcadeSessionCredential = Readonly<{
  token: string;
  expiresAt: Date;
  gameCode: GameCode;
}>;

export type StartGameDependencies = Readonly<{
  gateway?: ArcadeGameGateway;
  onSessionCreated?: (session: ArcadeSessionCredential) => void | Promise<void>;
  now?: () => Date;
}>;

function resolveExpiresAt(
  gateway: ArcadeGameGateway,
  sessionId: string,
  now: Date,
): Date {
  if (
    "getSessionExpiresAt" in gateway &&
    typeof (gateway as { getSessionExpiresAt?: unknown }).getSessionExpiresAt ===
      "function"
  ) {
    const expiresAt = (
      gateway as { getSessionExpiresAt: (id: string) => Date | null }
    ).getSessionExpiresAt(sessionId);
    if (expiresAt) return expiresAt;
  }
  return new Date(now.getTime() + SESSION_ACTIVITY_RETENTION_MS);
}

/**
 * startGame arcade: valida alias + gameCode, crea credencial opaca y deja que
 * el caller vincule la cookie al gameCode sin exponer el token en el estado.
 */
export async function startGame(
  payload: unknown,
  dependencies: StartGameDependencies = {},
): Promise<ArcadeOperationResult<GameState>> {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const gateway = dependencies.gateway ?? getSharedMemoryArcadeGateway();
  const now = dependencies.now?.() ?? new Date();

  const result = await startGameOperation(payload, {
    gateway,
    sessionTokenHash: tokenHash,
  });
  if (!result.ok) return result;

  const credential: ArcadeSessionCredential = {
    token,
    expiresAt: resolveExpiresAt(gateway, result.data.sessionId, now),
    gameCode: result.data.gameCode,
  };

  if (dependencies.onSessionCreated) {
    await dependencies.onSessionCreated(credential);
  }

  return result;
}

/** Línea single_choice legada; se retira con T066. */
export async function startLegacyTriviaGame(
  rawAlias: string,
  dependencies: {
    gateway?: SupabaseGameGateway;
    env?: Record<string, string | undefined>;
    onSessionCreated?: (token: string, expiresAt: Date) => Promise<void>;
  } = {},
): Promise<OperationResult<StartGameResult>> {
  const alias = validateAlias(rawAlias);
  if (!alias.ok) {
    return {
      ok: false,
      error: toGameError(
        alias.issue === "blocked"
          ? { code: "BLOCKED_ALIAS" }
          : { code: "INVALID_ALIAS", issue: alias.issue },
      ),
    };
  }
  try {
    const env = parseServerEnv(dependencies.env);
    const roundSize = RoundSizeSchema.parse(env.GAME_ROUND_SIZE);
    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    const gateway =
      dependencies.gateway ??
      createGameGateway(createServerSupabaseClient(dependencies.env));
    const result = await gateway.startGame(alias.alias, tokenHash, roundSize);
    if (!result.ok) return mapDatabaseError(result.code);
    if (dependencies.onSessionCreated) {
      await dependencies.onSessionCreated(token, result.data.sessionExpiresAt);
    }
    return { ok: true, data: { nextPath: "/play" } };
  } catch (cause) {
    console.error(
      "startLegacyTriviaGame failed",
      cause instanceof Error ? cause.name : "unknown",
    );
    return { ok: false, error: toGameError({ code: "GAME_START_FAILED" }) };
  }
}
