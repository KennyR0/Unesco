"use server";

import type { ArcadeOperationResult, GameState } from "@antidoto/contracts";

import { startArcadeGameServer } from "../../features/game/application/server-operations";
import { localizeGameState } from "../../lib/i18n/localize-game";
import { getServerLocale } from "../../lib/i18n/server";

/**
 * Arranque arcade callable desde el cliente. Vive en módulo propio para que
 * ArcadePlaySession lo cargue en diferido y no sume al JS inicial de /games/*.
 */
export async function startArcadeGameAction(
  payload: unknown,
): Promise<ArcadeOperationResult<GameState>> {
  const result = await startArcadeGameServer(payload);
  if (!result.ok) return result;
  const locale = await getServerLocale();
  return { ok: true, data: localizeGameState(result.data, locale) };
}
