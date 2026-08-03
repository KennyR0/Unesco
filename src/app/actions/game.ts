"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type {
  ArcadeOperationResult,
  GameResult,
  GameState,
  Leaderboard,
} from "@antidoto/contracts";

import {
  advanceArcadeGameServer,
  getArcadeGameResultServer,
  getArcadeGameStateServer,
  getArcadeLeaderboardServer,
  submitArcadeGameActionServer,
} from "../../features/game/application/server-operations";
import { startGame } from "../../features/game/application/start-game";
import { GameCodeSchema } from "../../features/game/domain/schemas";
import {
  buildExpiredSessionCookie,
  buildSessionCookie,
} from "../../lib/security/session-cookie";

export async function clearInvalidSessionAction(
  formData?: FormData,
): Promise<never> {
  const secure = process.env.NODE_ENV !== "development";
  const gameCode = GameCodeSchema.safeParse(formData?.get("gameCode"));
  (await cookies()).set(
    buildExpiredSessionCookie(
      secure,
      new Date(),
      gameCode.success ? gameCode.data : undefined,
    ),
  );
  redirect("/");
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

/** submitGameAction: rechaza solution, score, nextItem y completed del cliente. */
export async function submitGameAction(
  payload: unknown,
): Promise<ArcadeOperationResult<GameState>> {
  return submitArcadeGameActionServer(payload);
}

/** advanceGame: rechaza solution, score, nextItem y completed del cliente. */
export async function advanceGame(
  payload: unknown,
): Promise<ArcadeOperationResult<GameState>> {
  return advanceArcadeGameServer(payload);
}

export async function submitGameActionAction(
  payload: unknown,
): Promise<ArcadeOperationResult<GameState>> {
  return submitGameAction(payload);
}

export async function advanceArcadeGameAction(
  payload: unknown,
): Promise<ArcadeOperationResult<GameState>> {
  return advanceGame(payload);
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
