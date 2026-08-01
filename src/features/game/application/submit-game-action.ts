import "server-only";

import type {
  ArcadeOperationResult,
  GameCode,
  GameState,
  SubmitGameActionCommand,
} from "@antidoto/contracts";

import { GameCodeSchema } from "../domain/schemas";
import type { ArcadeGameGateway } from "../infrastructure/game-gateway";
import {
  arcadeFailure,
  submitGameActionOperation,
} from "./game-operations";

export type SubmitGameActionDependencies = Readonly<{
  gateway: ArcadeGameGateway;
  resolveSessionId: (
    gameCode: GameCode,
  ) => Promise<string | null>;
}>;

/**
 * Transporte server-only de submitGameAction.
 * El sessionId autoritativo sale de la cookie opaca, no del cliente.
 */
export async function submitGameAction(
  payload: unknown,
  dependencies: SubmitGameActionDependencies,
): Promise<ArcadeOperationResult<GameState>> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return arcadeFailure("INVALID_ACTION");
  }

  const gameCodeResult = GameCodeSchema.safeParse(
    (payload as { gameCode?: unknown }).gameCode,
  );
  if (!gameCodeResult.success) {
    return arcadeFailure("INVALID_GAME");
  }

  const sessionId = await dependencies.resolveSessionId(gameCodeResult.data);
  if (!sessionId) {
    return arcadeFailure("SESSION_NOT_FOUND");
  }

  const commandPayload: SubmitGameActionCommand | Record<string, unknown> = {
    ...(payload as Record<string, unknown>),
    sessionId,
    gameCode: gameCodeResult.data,
  };

  return submitGameActionOperation(commandPayload, {
    gateway: dependencies.gateway,
  });
}
