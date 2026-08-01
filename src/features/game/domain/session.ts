import { createHash, randomUUID } from "node:crypto";

import type {
  GameAction,
  GameCode,
  Mechanic,
  SessionStatus,
} from "@antidoto/contracts";
import { GAME_CODE_TO_MECHANIC } from "@antidoto/contracts";

/** Retención de partida activa y purga post-cierre (data-model). */
export const SESSION_ACTIVITY_RETENTION_MS = 24 * 60 * 60 * 1000;

/** Ventana de acceso al resultado propio (data-model). */
export const RESULT_ACCESS_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

const TERMINAL_STATUSES = new Set<SessionStatus>([
  "expired",
  "finished",
  "invalid",
]);

const ALLOWED_TRANSITIONS: Readonly<
  Record<SessionStatus, readonly SessionStatus[]>
> = {
  intro: ["active", "invalid"],
  active: ["processing", "expired", "invalid"],
  processing: ["feedback", "expired", "invalid"],
  feedback: ["active", "finished", "invalid"],
  expired: [],
  finished: [],
  invalid: [],
};

export type ArcadeSessionRecord = Readonly<{
  sessionId: string;
  gameCode: GameCode;
  mechanic: Mechanic;
  alias: string;
  status: SessionStatus;
  startedAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  finishedAt: Date | null;
  resultAccessUntil: Date | null;
  position: number;
  total: number;
}>;

export type AcceptedAnswerSnapshot = Readonly<{
  itemId: string;
  idempotencyKey: string;
  inputFingerprint: string;
}>;

export type IdempotencyResolution =
  | { kind: "accept"; idempotencyKey: string; inputFingerprint: string }
  | { kind: "replay"; idempotencyKey: string; inputFingerprint: string }
  | { kind: "conflict"; idempotencyKey: string };

export function createArcadeSession(input: {
  alias: string;
  gameCode: GameCode;
  total: number;
  now?: Date;
  sessionId?: string;
}): ArcadeSessionRecord {
  const now = input.now ?? new Date();
  if (input.total <= 0) {
    throw new Error("Una sesión arcade requiere total > 0.");
  }

  return {
    sessionId: input.sessionId ?? randomUUID(),
    gameCode: input.gameCode,
    mechanic: GAME_CODE_TO_MECHANIC[input.gameCode],
    alias: input.alias,
    status: "intro",
    startedAt: now,
    expiresAt: new Date(now.getTime() + SESSION_ACTIVITY_RETENTION_MS),
    lastActivityAt: now,
    finishedAt: null,
    resultAccessUntil: null,
    position: 0,
    total: input.total,
  };
}

export function computeResultAccessUntil(finishedAt: Date): Date {
  return new Date(finishedAt.getTime() + RESULT_ACCESS_RETENTION_MS);
}

export function isTerminalSessionStatus(status: SessionStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function canTransitionSession(
  from: SessionStatus,
  to: SessionStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertSessionGameCode(
  session: ArcadeSessionRecord,
  gameCode: GameCode,
): "ok" | "GAME_MISMATCH" {
  return session.gameCode === gameCode ? "ok" : "GAME_MISMATCH";
}

export function isSessionExpired(
  session: ArcadeSessionRecord,
  now = new Date(),
): boolean {
  if (session.status === "expired") return true;
  if (isTerminalSessionStatus(session.status)) return false;
  return now.getTime() >= session.expiresAt.getTime();
}

export function isResultAccessExpired(
  session: ArcadeSessionRecord,
  now = new Date(),
): boolean {
  if (!session.resultAccessUntil) return false;
  return now.getTime() >= session.resultAccessUntil.getTime();
}

export function touchSessionActivity(
  session: ArcadeSessionRecord,
  now = new Date(),
): ArcadeSessionRecord {
  if (isTerminalSessionStatus(session.status)) return session;
  return {
    ...session,
    lastActivityAt: now,
    expiresAt: new Date(now.getTime() + SESSION_ACTIVITY_RETENTION_MS),
  };
}

export function transitionSession(
  session: ArcadeSessionRecord,
  nextStatus: SessionStatus,
  now = new Date(),
): ArcadeSessionRecord {
  if (!canTransitionSession(session.status, nextStatus)) {
    throw new Error(
      `Transición inválida de sesión: ${session.status} -> ${nextStatus}`,
    );
  }

  if (session.status === nextStatus) {
    return touchSessionActivity(session, now);
  }

  if (nextStatus === "expired" || nextStatus === "finished") {
    const finishedAt = now;
    return {
      ...session,
      status: nextStatus,
      lastActivityAt: now,
      finishedAt,
      resultAccessUntil: computeResultAccessUntil(finishedAt),
    };
  }

  if (nextStatus === "invalid") {
    return {
      ...session,
      status: nextStatus,
      lastActivityAt: now,
      finishedAt: session.finishedAt ?? now,
      resultAccessUntil: session.resultAccessUntil,
    };
  }

  return touchSessionActivity(
    {
      ...session,
      status: nextStatus,
    },
    now,
  );
}

export function expireSessionIfNeeded(
  session: ArcadeSessionRecord,
  now = new Date(),
): ArcadeSessionRecord {
  if (!isSessionExpired(session, now) || session.status === "expired") {
    return session;
  }
  return transitionSession(session, "expired", now);
}

export function buildAnswerIdempotencyKey(
  sessionId: string,
  itemId: string,
): string {
  return createHash("sha256")
    .update(`submit:${sessionId}:${itemId}`, "utf8")
    .digest("hex");
}

export function fingerprintGameActionInput(
  action: Pick<GameAction, "gameCode" | "itemId" | "input">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        gameCode: action.gameCode,
        itemId: action.itemId,
        input: action.input,
      }),
      "utf8",
    )
    .digest("hex");
}

export function resolveAnswerIdempotency(input: {
  sessionId: string;
  action: Pick<GameAction, "gameCode" | "itemId" | "input">;
  previous: AcceptedAnswerSnapshot | null;
}): IdempotencyResolution {
  const idempotencyKey = buildAnswerIdempotencyKey(
    input.sessionId,
    input.action.itemId,
  );
  const inputFingerprint = fingerprintGameActionInput(input.action);

  if (!input.previous) {
    return { kind: "accept", idempotencyKey, inputFingerprint };
  }

  if (input.previous.idempotencyKey !== idempotencyKey) {
    return { kind: "conflict", idempotencyKey };
  }

  if (input.previous.inputFingerprint === inputFingerprint) {
    return { kind: "replay", idempotencyKey, inputFingerprint };
  }

  return { kind: "conflict", idempotencyKey };
}

export function canAcceptNewAnswer(session: ArcadeSessionRecord): boolean {
  return session.status === "active" || session.status === "processing";
}
