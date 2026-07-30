import { RoundSizeSchema, type OperationResult, type StartGameResult } from "@antidoto/contracts";

import { parseServerEnv } from "../../../lib/env/server";
import { hashSessionToken, createSessionToken } from "../../../lib/security/session-token";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { toGameError } from "./game-error";
import { validateAlias } from "../domain/alias";
import { createGameGateway, type SupabaseGameGateway } from "../infrastructure/supabase-game-gateway";
import { mapDatabaseError } from "../infrastructure/map-database-error";

export async function startGame(
  rawAlias: string,
  dependencies: { gateway?: SupabaseGameGateway; env?: Record<string, string | undefined>; onSessionCreated?: (token: string, expiresAt: Date) => Promise<void> } = {},
): Promise<OperationResult<StartGameResult>> {
  const alias = validateAlias(rawAlias);
  if (!alias.ok) return { ok: false, error: toGameError(alias.issue === "blocked" ? { code: "BLOCKED_ALIAS" } : { code: "INVALID_ALIAS", issue: alias.issue }) };
  try {
    const env = parseServerEnv(dependencies.env);
    const roundSize = RoundSizeSchema.parse(env.GAME_ROUND_SIZE);
    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    const gateway = dependencies.gateway ?? createGameGateway(createServerSupabaseClient(dependencies.env));
    const result = await gateway.startGame(alias.alias, tokenHash, roundSize);
    if (result.ok !== true) return mapDatabaseError(String(result.code));
    if (dependencies.onSessionCreated && typeof result.sessionExpiresAt === "string") {
      await dependencies.onSessionCreated(token, new Date(result.sessionExpiresAt));
    }
    return { ok: true, data: { nextPath: "/play" } };
  } catch (cause) {
    console.error("startGame failed", cause instanceof Error ? cause.name : "unknown");
    return { ok: false, error: toGameError({ code: "GAME_START_FAILED" }) };
  }
}
