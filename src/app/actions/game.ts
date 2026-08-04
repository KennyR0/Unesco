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
import { localizeGameResult, localizeGameState } from "../../lib/i18n/localize-game";
import { getServerLocale } from "../../lib/i18n/server";
import {
  buildExpiredSessionCookie,
} from "../../lib/security/session-cookie";

async function withLocalizedState(
  result: ArcadeOperationResult<GameState>,
): Promise<ArcadeOperationResult<GameState>> {
  if (!result.ok) return result;
  const locale = await getServerLocale();
  return { ok: true, data: localizeGameState(result.data, locale) };
}

async function withLocalizedResult(
  result: ArcadeOperationResult<GameResult>,
): Promise<ArcadeOperationResult<GameResult>> {
  if (!result.ok) return result;
  const locale = await getServerLocale();
  return { ok: true, data: localizeGameResult(result.data, locale) };
}

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
  return withLocalizedState(await startArcadeGameServer(payload));
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
      `/games/grupo?startErrorCode=${encodeURIComponent(result.error.code)}`,
    );
  }

  redirect("/games/grupo");
}

export async function getArcadeGameStateAction(
  payload: unknown,
): Promise<ArcadeOperationResult<GameState>> {
  return withLocalizedState(await getArcadeGameStateServer(payload));
}

/** submitGameAction: rechaza solution, score, nextItem y completed del cliente. */
export async function submitGameAction(
  payload: unknown,
): Promise<ArcadeOperationResult<GameState>> {
  return withLocalizedState(await submitArcadeGameActionServer(payload));
}

/** advanceGame: rechaza solution, score, nextItem y completed del cliente. */
export async function advanceGame(
  payload: unknown,
): Promise<ArcadeOperationResult<GameState>> {
  return withLocalizedState(await advanceArcadeGameServer(payload));
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
  return withLocalizedResult(await getArcadeGameResultServer(payload));
}

export async function getArcadeLeaderboardAction(): Promise<
  ArcadeOperationResult<Leaderboard>
> {
  return getArcadeLeaderboardServer();
}
