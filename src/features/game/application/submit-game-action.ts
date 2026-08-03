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
  advanceGameOperation,
  arcadeFailure,
  assertActionPayloadWithinLimit,
  containsForbiddenAuthorityFields,
  submitGameActionOperation,
} from "./game-operations";

export type SessionBoundGameActionDependencies = Readonly<{
  gateway: ArcadeGameGateway;
  resolveSessionId: (
    gameCode: GameCode,
  ) => Promise<string | null>;
}>;

export type SubmitGameActionDependencies = SessionBoundGameActionDependencies;

const FORBIDDEN_AUTHORITY_MESSAGE =
  "La acción no puede incluir campos de autoridad del servidor.";

function rejectClientAuthority(
  payload: unknown,
): ArcadeOperationResult<never> | null {
  const sizeError = assertActionPayloadWithinLimit(payload);
  if (sizeError) return { ok: false, error: sizeError };

  if (containsForbiddenAuthorityFields(payload)) {
    return arcadeFailure("INVALID_ACTION", FORBIDDEN_AUTHORITY_MESSAGE);
  }

  return null;
}

function readGameCode(payload: object): GameCode | null {
  const parsed = GameCodeSchema.safeParse(
    (payload as { gameCode?: unknown }).gameCode,
  );
  return parsed.success ? parsed.data : null;
}

/**
 * Transporte server-only de submitGameAction.
 * El sessionId autoritativo sale de la cookie opaca, no del cliente.
 * Rechaza solution, score, nextItem, completed y demás autoridad del cliente.
 */
export async function submitGameAction(
  payload: unknown,
  dependencies: SessionBoundGameActionDependencies,
): Promise<ArcadeOperationResult<GameState>> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return arcadeFailure("INVALID_ACTION");
  }

  const authorityRejection = rejectClientAuthority(payload);
  if (authorityRejection) return authorityRejection;

  const gameCode = readGameCode(payload);
  if (!gameCode) {
    return arcadeFailure("INVALID_GAME");
  }

  const sessionId = await dependencies.resolveSessionId(gameCode);
  if (!sessionId) {
    return arcadeFailure("SESSION_NOT_FOUND");
  }

  const commandPayload: SubmitGameActionCommand | Record<string, unknown> = {
    ...(payload as Record<string, unknown>),
    sessionId,
    gameCode,
  };

  return submitGameActionOperation(commandPayload, {
    gateway: dependencies.gateway,
  });
}

/**
 * Transporte server-only de advanceGame.
 * Exige itemId con feedback aceptado; el siguiente item y completed solo los
 * resuelve el servidor. Rechaza solution, score, nextItem y completed del cliente.
 */
export async function advanceGame(
  payload: unknown,
  dependencies: SessionBoundGameActionDependencies,
): Promise<ArcadeOperationResult<GameState>> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return arcadeFailure("INVALID_ACTION");
  }

  const authorityRejection = rejectClientAuthority(payload);
  if (authorityRejection) return authorityRejection;

  const gameCode = readGameCode(payload);
  if (!gameCode) {
    return arcadeFailure("INVALID_GAME");
  }

  const sessionId = await dependencies.resolveSessionId(gameCode);
  if (!sessionId) {
    return arcadeFailure("SESSION_NOT_FOUND");
  }

  return advanceGameOperation(
    {
      sessionId,
      itemId: (payload as { itemId?: unknown }).itemId,
    },
    { gateway: dependencies.gateway },
  );
}
