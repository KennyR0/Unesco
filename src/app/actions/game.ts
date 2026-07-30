"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { ErrorEnvelope, OperationResult, StartGameResult } from "@antidoto/contracts";

import { startGame } from "../../features/game/application/start-game";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { buildExpiredSessionCookie, buildResultCookie, buildSessionCookie } from "../../lib/security/session-cookie";
import { hashSessionToken, isSessionToken } from "../../lib/security/session-token";
import { mapDatabaseError } from "../../features/game/infrastructure/map-database-error";
import { createGameGateway } from "../../features/game/infrastructure/supabase-game-gateway";

export async function startGameAction(_previous: OperationResult<StartGameResult> | null, formData: FormData): Promise<OperationResult<StartGameResult>> {
  const rawAlias = String(formData.get("alias") ?? "");
  const result = await startGame(rawAlias, {
    onSessionCreated: async (token, expiresAt) => {
      const secure = process.env.NODE_ENV !== "development";
      (await cookies()).set(buildSessionCookie({ token, expiresAt, secure }));
    },
  });
  if (result.ok) redirect(result.data.nextPath);
  return result;
}

export async function clearInvalidSessionAction(): Promise<never> {
  const secure = process.env.NODE_ENV !== "development";
  (await cookies()).set(buildExpiredSessionCookie(secure));
  redirect("/");
}

async function tokenForAction(): Promise<{ token: string; hash: string } | ErrorEnvelope> {
  const token = (await cookies()).get("antidoto_session")?.value;
  if (!token || !isSessionToken(token)) return mapDatabaseError("SESSION_NOT_FOUND");
  return { token, hash: hashSessionToken(token) };
}

export async function submitAnswerAction(_previous: OperationResult<unknown> | null, formData: FormData): Promise<OperationResult<unknown>> {
  const session = await tokenForAction();
  if (!("token" in session)) return session;
  const questionRef = String(formData.get("questionRef") ?? "");
  const optionRef = String(formData.get("optionRef") ?? "");
  try {
    const result = await createGameGateway(createServerSupabaseClient()).submitAnswer(session.hash, questionRef, optionRef);
    if (result.ok !== true) return mapDatabaseError(String(result.code));
    const expiresAt = typeof result.data === "object" && result.data && "sessionExpiresAt" in result.data ? new Date(String(result.data.sessionExpiresAt)) : null;
    if (expiresAt && !Number.isNaN(expiresAt.getTime())) (await cookies()).set(buildSessionCookie({ token: session.token, expiresAt, secure: process.env.NODE_ENV !== "development" }));
    return { ok: true, data: result.data };
  } catch {
    return mapDatabaseError("ANSWER_SAVE_FAILED");
  }
}

export async function advanceGameAction(_previous: OperationResult<unknown> | null, _formData: FormData): Promise<OperationResult<unknown>> {
  const session = await tokenForAction();
  if (!("token" in session)) return session;
  try {
    const result = await createGameGateway(createServerSupabaseClient()).advanceGame(session.hash);
    if (result.ok !== true) return mapDatabaseError(String(result.code));
    return { ok: true, data: result.data };
  } catch {
    return mapDatabaseError("ADVANCE_NOT_ALLOWED");
  }
}

export async function finishGameAction(_previous: OperationResult<unknown> | null, _formData: FormData): Promise<OperationResult<unknown>> {
  const session = await tokenForAction();
  if (!("token" in session)) return session;
  try {
    const result = await createGameGateway(createServerSupabaseClient()).finishGame(session.hash);
    if (result.ok !== true) return mapDatabaseError(String(result.code));
    const expiresAt = typeof result.data === "object" && result.data && "resultAccessUntil" in result.data ? new Date(String(result.data.resultAccessUntil)) : null;
    if (expiresAt && !Number.isNaN(expiresAt.getTime())) (await cookies()).set(buildResultCookie({ token: session.token, expiresAt, secure: process.env.NODE_ENV !== "development" }));
    return { ok: true, data: result.data };
  } catch {
    return mapDatabaseError("GAME_FINISH_FAILED");
  }
}
