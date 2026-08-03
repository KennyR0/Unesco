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
  startArcadeGameServer,
  submitArcadeGameActionServer,
} from "../../features/game/application/server-operations";
import { GameCodeSchema } from "../../features/game/domain/schemas";
import {
  buildExpiredSessionCookie,
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
  return startArcadeGameServer(payload);
}

/**
 * Inicio de cualquier misión arcade vía <form action>.
 * Funciona aunque la hidratación cliente falle (p. ej. localhost vs 127.0.0.1).
 * El gameCode viaja en un campo oculto y se valida en servidor.
 */
export async function startArcadeGameFormAction(
  formData: FormData,
): Promise<void> {
  const parsedCode = GameCodeSchema.safeParse(formData.get("gameCode"));
  if (!parsedCode.success) {
    redirect("/");
  }

  const gameCode = parsedCode.data;
  const alias = String(formData.get("alias") ?? "");
  const result = await startArcadeGameAction({ alias, gameCode });

  if (!result.ok) {
    redirect(
      `/games/${gameCode}?startError=${encodeURIComponent(result.error.message)}`,
    );
  }

  redirect(`/games/${gameCode}`);
}

/** Conserva el arranque directo de El Grupo para clientes existentes. */
export async function startGrupoGameFormAction(
  formData: FormData,
): Promise<void> {
  const alias = String(formData.get("alias") ?? "");
  const result = await startArcadeGameAction({
    alias,
    gameCode: "grupo",
  });

  if (!result.ok) {
    redirect(
      `/games/grupo?startError=${encodeURIComponent(result.error.message)}`,
    );
  }

  redirect("/games/grupo");
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
