import "server-only";

import type {
  ArcadeOperationResult,
  GameCode,
  GameState,
} from "@antidoto/contracts";

import { resolveArcadeGatewayMode } from "../../../lib/env/arcade-gateway";
import { createSessionToken, hashSessionToken } from "../../../lib/security/session-token";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { SESSION_ACTIVITY_RETENTION_MS } from "../domain/session";
import type { ArcadeGameGateway } from "../infrastructure/game-gateway";
import { getSharedMemoryArcadeGateway } from "../infrastructure/memory-arcade-gateway";
import { getSharedSupabaseArcadeGateway } from "../infrastructure/supabase-arcade-gateway";
import { startGameOperation } from "./game-operations";

function defaultGateway(): ArcadeGameGateway {
  if (resolveArcadeGatewayMode() === "supabase") {
    return getSharedSupabaseArcadeGateway(createServerSupabaseClient());
  }
  return getSharedMemoryArcadeGateway();
}

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
  const gateway = dependencies.gateway ?? defaultGateway();
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
