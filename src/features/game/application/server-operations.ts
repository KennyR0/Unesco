import "server-only";

import { cookies } from "next/headers";

import type { OperationResult } from "@antidoto/contracts";

import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { hashSessionToken, isSessionToken } from "../../../lib/security/session-token";
import { mapDatabaseError } from "../infrastructure/map-database-error";
import { createGameGateway } from "../infrastructure/supabase-game-gateway";

async function currentToken(): Promise<string | null> {
  const value = (await cookies()).get("antidoto_session")?.value;
  return value && isSessionToken(value) ? value : null;
}

export async function getGameStateServer(): Promise<OperationResult<unknown>> {
  const token = await currentToken();
  if (!token) return mapDatabaseError("SESSION_NOT_FOUND");
  try {
    const result = await createGameGateway(createServerSupabaseClient()).getGameState(hashSessionToken(token));
    if (result.ok !== true) return mapDatabaseError(String(result.code));
    return { ok: true, data: result.data } as OperationResult<unknown>;
  } catch {
    return mapDatabaseError("UNEXPECTED_ERROR");
  }
}

export async function getGameResultServer(): Promise<OperationResult<unknown>> {
  const token = await currentToken();
  if (!token) return mapDatabaseError("SESSION_NOT_FOUND");
  try {
    const result = await createGameGateway(createServerSupabaseClient()).getGameResult(hashSessionToken(token));
    if (result.ok !== true) return mapDatabaseError(String(result.code));
    return { ok: true, data: result.data } as OperationResult<unknown>;
  } catch {
    return mapDatabaseError("UNEXPECTED_ERROR");
  }
}

export async function getLeaderboardServer(): Promise<OperationResult<unknown>> {
  const token = await currentToken();
  try {
    const result = await createGameGateway(createServerSupabaseClient()).getLeaderboard(token ? hashSessionToken(token) : undefined);
    if (result.ok !== true) return mapDatabaseError(String(result.code));
    return { ok: true, data: result.data } as OperationResult<unknown>;
  } catch {
    return mapDatabaseError("RANKING_UNAVAILABLE");
  }
}
