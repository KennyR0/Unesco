"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  QuestionRefSchema,
  SubmitAnswerInputSchema,
  type AnswerResult,
  type ArcadeOperationResult,
  type ErrorEnvelope,
  type FinalResult,
  type GameResult,
  type GameState,
  type Leaderboard,
  type OperationResult,
  type QuestionGameState,
  type StartGameResult,
} from "@antidoto/contracts";

import {
  advanceArcadeGameServer,
  getArcadeGameResultServer,
  getArcadeGameStateServer,
  getArcadeLeaderboardServer,
  submitArcadeGameActionServer,
} from "../../features/game/application/server-operations";
import {
  startGame,
  startLegacyTriviaGame,
} from "../../features/game/application/start-game";
import { mapDatabaseError } from "../../features/game/infrastructure/map-database-error";
import { createGameGateway } from "../../features/game/infrastructure/supabase-game-gateway";
import {
  buildExpiredSessionCookie,
  buildResultCookie,
  buildSessionCookie,
} from "../../lib/security/session-cookie";
import {
  hashSessionToken,
  isSessionToken,
} from "../../lib/security/session-token";
import { createServerSupabaseClient } from "../../lib/supabase/server";

export async function startGameAction(
  _previous: OperationResult<StartGameResult> | null,
  formData: FormData,
): Promise<OperationResult<StartGameResult>> {
  const rawAlias = String(formData.get("alias") ?? "");
  const result = await startLegacyTriviaGame(rawAlias, {
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

async function tokenForAction(): Promise<
  { token: string; hash: string } | ErrorEnvelope
> {
  const token = (await cookies()).get("antidoto_session")?.value;
  if (!token || !isSessionToken(token)) return mapDatabaseError("SESSION_NOT_FOUND");
  return { token, hash: hashSessionToken(token) };
}

export async function submitAnswerAction(
  _previous: OperationResult<AnswerResult> | null,
  formData: FormData,
): Promise<OperationResult<AnswerResult>> {
  const session = await tokenForAction();
  if (!("token" in session)) return session;
  const questionRef = String(formData.get("questionRef") ?? "");
  const optionRef = String(formData.get("optionRef") ?? "");
  const input = SubmitAnswerInputSchema.safeParse({ questionRef, optionRef });
  if (!input.success) {
    if (!optionRef) return mapDatabaseError("OPTION_NOT_SELECTED");
    return mapDatabaseError(
      QuestionRefSchema.safeParse(questionRef).success
        ? "OPTION_NOT_ALLOWED"
        : "QUESTION_NOT_ASSIGNED",
    );
  }
  if (!input.data.optionRef) return mapDatabaseError("OPTION_NOT_SELECTED");

  try {
    const result = await createGameGateway(
      createServerSupabaseClient(),
    ).submitAnswer(session.hash, input.data.questionRef, input.data.optionRef);
    if (!result.ok) return mapDatabaseError(result.code);
    (await cookies()).set(
      buildSessionCookie({
        token: session.token,
        expiresAt: result.data.sessionExpiresAt,
        secure: process.env.NODE_ENV !== "development",
      }),
    );
    return { ok: true, data: result.data.answer };
  } catch {
    return mapDatabaseError("ANSWER_SAVE_FAILED");
  }
}

export async function advanceGameAction(
  _previous: OperationResult<QuestionGameState> | null,
  _formData: FormData,
): Promise<OperationResult<QuestionGameState>> {
  const session = await tokenForAction();
  if (!("token" in session)) return session;
  try {
    const result = await createGameGateway(
      createServerSupabaseClient(),
    ).advanceGame(session.hash);
    if (!result.ok) return mapDatabaseError(result.code);
    return { ok: true, data: result.data };
  } catch {
    return mapDatabaseError("ADVANCE_NOT_ALLOWED");
  }
}

export async function finishGameAction(
  _previous: OperationResult<FinalResult> | null,
  _formData: FormData,
): Promise<OperationResult<FinalResult>> {
  const session = await tokenForAction();
  if (!("token" in session)) return session;
  try {
    const result = await createGameGateway(
      createServerSupabaseClient(),
    ).finishGame(session.hash);
    if (!result.ok) return mapDatabaseError(result.code);
    (await cookies()).set(
      buildResultCookie({
        token: session.token,
        expiresAt: result.data.resultAccessUntil,
        secure: process.env.NODE_ENV !== "development",
      }),
    );
    return { ok: true, data: result.data.result };
  } catch {
    return mapDatabaseError("GAME_FINISH_FAILED");
  }
}

/** Acciones arcade: startGame + cookie opaca vinculada a gameCode. */
export async function startArcadeGameAction(
  payload: unknown,
): Promise<ArcadeOperationResult<GameState>> {
  const jar = await cookies();
  const secure = process.env.NODE_ENV !== "development";
  return startGame(payload, {
    onSessionCreated: async ({ token, expiresAt, gameCode }) => {
      jar.set(
        buildSessionCookie({
          token,
          expiresAt,
          secure,
          gameCode,
        }),
      );
    },
  });
}

export async function getArcadeGameStateAction(
  payload: unknown,
): Promise<ArcadeOperationResult<GameState>> {
  return getArcadeGameStateServer(payload);
}

export async function submitGameActionAction(
  payload: unknown,
): Promise<ArcadeOperationResult<GameState>> {
  return submitArcadeGameActionServer(payload);
}

export async function advanceArcadeGameAction(
  payload: unknown,
): Promise<ArcadeOperationResult<GameState>> {
  return advanceArcadeGameServer(payload);
}

export async function getArcadeGameResultAction(
  payload: unknown,
): Promise<ArcadeOperationResult<GameResult>> {
  return getArcadeGameResultServer(payload);
}

export async function getArcadeLeaderboardAction(): Promise<
  ArcadeOperationResult<Leaderboard>
> {
  return getArcadeLeaderboardServer();
}
