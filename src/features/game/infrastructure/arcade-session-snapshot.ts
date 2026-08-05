import type { GameResult } from "@antidoto/contracts";

import type { ArcadeSessionRecord } from "../domain/session";
import type { FeedClock, TimedFeedItemState } from "../domain/mechanics/timed-feed";
import type { GameStateWithCompanion } from "./session-companion";

/** Respuesta aceptada serializable (incluye records de mecánica). */
export type SerializedAnswer = Readonly<{
  itemId: string;
  idempotencyKey: string;
  inputFingerprint: string;
  grupo?: unknown;
  realOrIa?: unknown;
  clickbait?: unknown;
  radar?: unknown;
  feed60?: unknown;
  menteMaestra?: unknown;
}>;

export type SerializedFeedClock = Readonly<{
  startedAt: string;
  expiresAt: string;
  verifySecondsConsumed: number;
  expired: boolean;
}>;

export type SerializedFeed60State = Readonly<{
  clock: SerializedFeedClock;
  itemStates: ReadonlyArray<readonly [string, TimedFeedItemState]>;
  hintsByItem: ReadonlyArray<readonly [string, readonly string[]]>;
}>;

export function serializeFeedClock(clock: FeedClock): SerializedFeedClock {
  return {
    startedAt: clock.startedAt.toISOString(),
    expiresAt: clock.expiresAt.toISOString(),
    verifySecondsConsumed: clock.verifySecondsConsumed,
    expired: clock.expired,
  };
}

export function deserializeFeedClock(clock: SerializedFeedClock): FeedClock {
  return {
    startedAt: new Date(clock.startedAt),
    expiresAt: new Date(clock.expiresAt),
    verifySecondsConsumed: clock.verifySecondsConsumed,
    expired: clock.expired,
  };
}

/**
 * Snapshot durable de una sesión arcade (memory ↔ Supabase).
 * Las fechas del record viajan como ISO strings.
 */
export type ArcadeSessionSnapshot = Readonly<{
  version: 1;
  tokenHash: string;
  record: {
    sessionId: string;
    gameCode: ArcadeSessionRecord["gameCode"];
    mechanic: ArcadeSessionRecord["mechanic"];
    alias: string;
    aliasAllowed?: boolean;
    status: ArcadeSessionRecord["status"];
    startedAt: string;
    expiresAt: string;
    lastActivityAt: string;
    finishedAt: string | null;
    resultAccessUntil: string | null;
    position: number;
    total: number;
  };
  state: GameStateWithCompanion;
  result: GameResult | null;
  answers: readonly SerializedAnswer[];
  assignedItemIds: readonly string[];
  feed60: SerializedFeed60State | null;
}>;

export function serializeSessionRecord(
  record: ArcadeSessionRecord,
): ArcadeSessionSnapshot["record"] {
  return {
    sessionId: record.sessionId,
    gameCode: record.gameCode,
    mechanic: record.mechanic,
    alias: record.alias,
    aliasAllowed: record.aliasAllowed,
    status: record.status,
    startedAt: record.startedAt.toISOString(),
    expiresAt: record.expiresAt.toISOString(),
    lastActivityAt: record.lastActivityAt.toISOString(),
    finishedAt: record.finishedAt?.toISOString() ?? null,
    resultAccessUntil: record.resultAccessUntil?.toISOString() ?? null,
    position: record.position,
    total: record.total,
  };
}

export function deserializeSessionRecord(
  record: ArcadeSessionSnapshot["record"],
): ArcadeSessionRecord {
  return {
    sessionId: record.sessionId,
    gameCode: record.gameCode,
    mechanic: record.mechanic,
    alias: record.alias,
    aliasAllowed: record.aliasAllowed ?? true,
    status: record.status,
    startedAt: new Date(record.startedAt),
    expiresAt: new Date(record.expiresAt),
    lastActivityAt: new Date(record.lastActivityAt),
    finishedAt: record.finishedAt ? new Date(record.finishedAt) : null,
    resultAccessUntil: record.resultAccessUntil
      ? new Date(record.resultAccessUntil)
      : null,
    position: record.position,
    total: record.total,
  };
}

export function tokenHashToByteaHex(tokenHashHex: string): string {
  // PostgREST acepta \\x<hex> para bytea.
  return `\\x${tokenHashHex}`;
}
