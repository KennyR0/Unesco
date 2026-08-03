import "server-only";

import {
  CLIENT_FORBIDDEN_AUTHORITY_FIELDS,
  type AdvanceGameCommand,
  type ArcadeOperationResult,
  type ArcadePublicErrorCode,
  type GameResult,
  type GameState,
  type Leaderboard,
  type PublicError,
  type PublicFeedback,
  type StartGameCommand,
  type SubmitGameActionCommand,
} from "@antidoto/contracts";

import { requireArcadeCatalogEntry } from "../content/catalog";
import { validateAlias } from "../domain/alias";
import {
  coerceFeedClockAuthority,
  createFeedClock,
  emptyTimedFeedItemState,
  remainingFeedSeconds,
  resolveTimedFeedAction,
  type FeedAction,
  type FeedClock,
  type TimedFeedItemState,
  type TimedFeedResolution,
} from "../domain/mechanics/timed-feed";
import {
  AdvanceGameCommandSchema,
  GameCodeSchema,
  GetGameResultCommandSchema,
  GetGameStateCommandSchema,
  PublicErrorSchema,
  StartGameCommandSchema,
  SubmitGameActionCommandSchema,
} from "../domain/schemas";
import type {
  ArcadeGameGateway,
  GetGameResultCommand,
  GetGameStateCommand,
} from "../infrastructure/game-gateway";
import {
  RANKING_EMPTY_MESSAGE,
  RANKING_UNAVAILABLE_MESSAGE,
  RESULT_NOT_AVAILABLE_MESSAGE,
} from "./game-error";

/** Límite contractual de cada acción cliente → servidor. */
export const MAX_ACTION_PAYLOAD_BYTES = 16 * 1024;

export const SAFE_ARCADE_SESSION_MESSAGE =
  "No hay una partida recuperable. Puedes volver al arcade e iniciar otra.";

const RETRYABLE_CODES = new Set<ArcadePublicErrorCode>([
  "INVALID_ALIAS",
  "INVALID_ACTION",
  "LEADERBOARD_UNAVAILABLE",
  "CONFLICT",
  "CONTENT_UNAVAILABLE",
  "INTERNAL_ERROR",
]);

const PUBLIC_MESSAGES: Record<ArcadePublicErrorCode, string> = {
  INVALID_GAME: "Ese juego no está disponible. Vuelve al arcade para elegir otro.",
  INVALID_ALIAS: "Revisa el alias e inténtalo de nuevo.",
  SESSION_NOT_FOUND: SAFE_ARCADE_SESSION_MESSAGE,
  SESSION_INVALID: SAFE_ARCADE_SESSION_MESSAGE,
  GAME_MISMATCH: "Esta partida pertenece a otro juego. Vuelve a la misión correcta.",
  ITEM_NOT_FOUND: "No encontramos ese contenido. Recupera el estado de la partida.",
  ITEM_NOT_IN_SESSION: "Ese contenido no pertenece a tu partida. Recupera el estado.",
  INVALID_ACTION: "La acción no es válida para este momento del juego.",
  ANSWER_ALREADY_ACCEPTED: "Ya aceptamos esa respuesta. Continúa con el feedback.",
  SESSION_EXPIRED: "La partida expiró. Consulta el resultado o inicia otra.",
  RESULT_NOT_AVAILABLE: RESULT_NOT_AVAILABLE_MESSAGE,
  RESULT_ACCESS_EXPIRED: SAFE_ARCADE_SESSION_MESSAGE,
  LEADERBOARD_UNAVAILABLE: RANKING_UNAVAILABLE_MESSAGE,
  LEADERBOARD_EMPTY: RANKING_EMPTY_MESSAGE,
  CONFLICT: "Hubo un conflicto al guardar. Recupera el estado e inténtalo de nuevo.",
  CONTENT_UNAVAILABLE: "El contenido no está disponible. Usa el fallback o reintenta.",
  INTERNAL_ERROR: "Ocurrió un problema inesperado. Reintenta sin duplicar la acción.",
};

export type ArcadeOperationDependencies = Readonly<{
  gateway: ArcadeGameGateway;
  sessionTokenHash?: string;
}>;

export function createArcadePublicError(
  code: ArcadePublicErrorCode,
  message?: string,
): PublicError {
  return PublicErrorSchema.parse({
    code,
    message: message ?? PUBLIC_MESSAGES[code],
    retryable: RETRYABLE_CODES.has(code),
  });
}

export function arcadeFailure(
  code: ArcadePublicErrorCode,
  message?: string,
): ArcadeOperationResult<never> {
  return { ok: false, error: createArcadePublicError(code, message) };
}

export function measurePayloadBytes(payload: unknown): number {
  return new TextEncoder().encode(JSON.stringify(payload)).byteLength;
}

export function assertActionPayloadWithinLimit(
  payload: unknown,
): PublicError | null {
  if (measurePayloadBytes(payload) > MAX_ACTION_PAYLOAD_BYTES) {
    return createArcadePublicError(
      "INVALID_ACTION",
      "La acción supera el límite de 16 KB permitido.",
    );
  }
  return null;
}

export function containsForbiddenAuthorityFields(
  payload: unknown,
): boolean {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }

  const queue: unknown[] = [payload];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;
    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      if (
        (CLIENT_FORBIDDEN_AUTHORITY_FIELDS as readonly string[]).includes(key)
      ) {
        return true;
      }
      if (value && typeof value === "object") {
        queue.push(value);
      }
    }
  }

  return false;
}

function rejectForbiddenAuthority(payload: unknown): PublicError | null {
  if (containsForbiddenAuthorityFields(payload)) {
    return createArcadePublicError(
      "INVALID_ACTION",
      "La acción no puede incluir campos de autoridad del servidor.",
    );
  }
  return null;
}

/**
 * Reloj inicial autoritativo de Feed 60”. El cliente no aporta ni extiende
 * este instante de expiración.
 */
export function createTimedFeedSessionClock(
  startedAt: Date = new Date(),
): FeedClock {
  return createFeedClock(startedAt);
}

/** Proyecta remainingSeconds solo desde el reloj del servidor. */
export function projectTimedFeedRemainingSeconds(
  clock: FeedClock,
  now: Date = new Date(),
): number {
  return remainingFeedSeconds(clock, now);
}

/**
 * Resuelve verify / decisión / expiración en una sola pasada autoritativa.
 * Usado por el gateway o transporte server-only; no acepta remainingSeconds
 * del cliente.
 */
export function resolveTimedFeedSubmit(input: {
  action: FeedAction;
  itemId: string;
  sessionItemIds: readonly string[];
  clock: FeedClock;
  itemState?: TimedFeedItemState;
  solution: unknown;
  feedback: PublicFeedback;
  now?: Date;
  /** Cualquier expiresAt propuesto por el cliente se ignora. */
  clientProposedExpiresAt?: Date | null;
}): TimedFeedResolution {
  const clock = coerceFeedClockAuthority(
    input.clock,
    input.clientProposedExpiresAt,
  );

  return resolveTimedFeedAction({
    action: input.action,
    itemId: input.itemId,
    sessionItemIds: input.sessionItemIds,
    clock,
    itemState: input.itemState ?? emptyTimedFeedItemState(),
    solution: input.solution,
    feedback: input.feedback,
    now: input.now,
  });
}

function mapGatewayResult<T>(
  result: ArcadeOperationResult<T>,
): ArcadeOperationResult<T> {
  if (result.ok) return result;
  // El gateway puede usar diagnÃ³sticos internos; solo el catÃ¡logo pÃºblico de
  // mensajes puede llegar al cliente.
  return arcadeFailure(result.error.code);
}

function isArcadeSuccess<T>(
  result: ArcadeOperationResult<T>,
): result is { ok: true; data: T } {
  return result.ok === true;
}

function validateIncomingPayload<T>(
  payload: unknown,
  parse: (
    value: unknown,
  ) => { success: true; data: T } | { success: false },
): ArcadeOperationResult<T> {
  const sizeError = assertActionPayloadWithinLimit(payload);
  if (sizeError) return { ok: false, error: sizeError };

  const authorityError = rejectForbiddenAuthority(payload);
  if (authorityError) return { ok: false, error: authorityError };

  const parsed = parse(payload);
  if (!parsed.success) {
    return arcadeFailure("INVALID_ACTION");
  }
  return { ok: true, data: parsed.data };
}

export async function startGameOperation(
  payload: unknown,
  dependencies: ArcadeOperationDependencies,
): Promise<ArcadeOperationResult<GameState>> {
  const sizeError = assertActionPayloadWithinLimit(payload);
  if (sizeError) return { ok: false, error: sizeError };

  const authorityError = rejectForbiddenAuthority(payload);
  if (authorityError) return { ok: false, error: authorityError };

  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    "gameCode" in payload &&
    !GameCodeSchema.safeParse((payload as { gameCode: unknown }).gameCode)
      .success
  ) {
    return arcadeFailure("INVALID_GAME");
  }

  const parsed = StartGameCommandSchema.safeParse(payload);
  if (!parsed.success) {
    return arcadeFailure("INVALID_ACTION");
  }

  const alias = validateAlias(parsed.data.alias);
  if (!alias.ok) {
    return arcadeFailure("INVALID_ALIAS");
  }

  try {
    requireArcadeCatalogEntry(parsed.data.gameCode);
  } catch {
    return arcadeFailure("INVALID_GAME");
  }

  const command: StartGameCommand = {
    alias: alias.alias,
    gameCode: parsed.data.gameCode,
  };

  if (!dependencies.sessionTokenHash) {
    return arcadeFailure("INTERNAL_ERROR");
  }

  try {
    return mapGatewayResult(
      await dependencies.gateway.startGame({
        ...command,
        sessionTokenHash: dependencies.sessionTokenHash,
      }),
    );
  } catch {
    return arcadeFailure("INTERNAL_ERROR");
  }
}

export async function getGameStateOperation(
  payload: unknown,
  dependencies: ArcadeOperationDependencies,
): Promise<ArcadeOperationResult<GameState>> {
  const validated = validateIncomingPayload<GetGameStateCommand>(
    payload,
    (value) => {
      const parsed = GetGameStateCommandSchema.safeParse(value);
      if (!parsed.success) return { success: false as const };
      return { success: true as const, data: parsed.data };
    },
  );
  if (!isArcadeSuccess(validated)) return validated;

  try {
    return mapGatewayResult(
      await dependencies.gateway.getGameState(validated.data),
    );
  } catch {
    return arcadeFailure("INTERNAL_ERROR");
  }
}

export async function submitGameActionOperation(
  payload: unknown,
  dependencies: ArcadeOperationDependencies,
): Promise<ArcadeOperationResult<GameState>> {
  const validated = validateIncomingPayload<SubmitGameActionCommand>(
    payload,
    (value) => {
      const parsed = SubmitGameActionCommandSchema.safeParse(value);
      if (!parsed.success) return { success: false as const };
      return {
        success: true as const,
        data: parsed.data as SubmitGameActionCommand,
      };
    },
  );
  if (!isArcadeSuccess(validated)) return validated;

  // Feed 60”: remainingSeconds / expiresAt del cliente ya se rechazan como
  // autoridad prohibida; la decisión temporal vive en resolveTimedFeedSubmit.
  if (
    validated.data.gameCode === "feed-60" &&
    validated.data.input.kind !== "feed_action"
  ) {
    return arcadeFailure("INVALID_ACTION");
  }

  try {
    return mapGatewayResult(
      await dependencies.gateway.submitGameAction(validated.data),
    );
  } catch {
    return arcadeFailure("INTERNAL_ERROR");
  }
}

export async function advanceGameOperation(
  payload: unknown,
  dependencies: ArcadeOperationDependencies,
): Promise<ArcadeOperationResult<GameState>> {
  const validated = validateIncomingPayload<AdvanceGameCommand>(
    payload,
    (value) => {
      const parsed = AdvanceGameCommandSchema.safeParse(value);
      if (!parsed.success) return { success: false as const };
      return { success: true as const, data: parsed.data };
    },
  );
  if (!isArcadeSuccess(validated)) return validated;

  try {
    return mapGatewayResult(
      await dependencies.gateway.advanceGame(validated.data),
    );
  } catch {
    return arcadeFailure("INTERNAL_ERROR");
  }
}

export async function getGameResultOperation(
  payload: unknown,
  dependencies: ArcadeOperationDependencies,
): Promise<ArcadeOperationResult<GameResult>> {
  const validated = validateIncomingPayload<GetGameResultCommand>(
    payload,
    (value) => {
      const parsed = GetGameResultCommandSchema.safeParse(value);
      if (!parsed.success) return { success: false as const };
      return { success: true as const, data: parsed.data };
    },
  );
  if (!isArcadeSuccess(validated)) return validated;

  try {
    return mapGatewayResult(
      await dependencies.gateway.getGameResult(validated.data),
    );
  } catch {
    return arcadeFailure("INTERNAL_ERROR");
  }
}

export async function getLeaderboardOperation(
  dependencies: ArcadeOperationDependencies,
): Promise<ArcadeOperationResult<Leaderboard>> {
  try {
    return mapGatewayResult(await dependencies.gateway.getLeaderboard());
  } catch {
    return arcadeFailure("LEADERBOARD_UNAVAILABLE");
  }
}
