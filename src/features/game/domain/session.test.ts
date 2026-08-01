import { describe, expect, it } from "vitest";

import {
  RESULT_ACCESS_RETENTION_MS,
  SESSION_ACTIVITY_RETENTION_MS,
  assertSessionGameCode,
  buildAnswerIdempotencyKey,
  canTransitionSession,
  createArcadeSession,
  expireSessionIfNeeded,
  fingerprintGameActionInput,
  isResultAccessExpired,
  resolveAnswerIdempotency,
  touchSessionActivity,
  transitionSession,
} from "./session";

describe("sesión arcade independiente", () => {
  const now = new Date("2026-08-01T15:00:00.000Z");

  it("crea una sesión ligada a un solo gameCode con expiración de 24 h", () => {
    const session = createArcadeSession({
      alias: "Ana",
      gameCode: "grupo",
      total: 6,
      now,
      sessionId: "session-grupo",
    });

    expect(session.gameCode).toBe("grupo");
    expect(session.mechanic).toBe("group_decision");
    expect(session.status).toBe("intro");
    expect(session.expiresAt.getTime()).toBe(
      now.getTime() + SESSION_ACTIVITY_RETENTION_MS,
    );
    expect(assertSessionGameCode(session, "grupo")).toBe("ok");
    expect(assertSessionGameCode(session, "feed-60")).toBe("GAME_MISMATCH");
  });

  it("respeta la máquina de estados y materializa acceso a resultado por 30 días", () => {
    let session = createArcadeSession({
      alias: "Ana",
      gameCode: "real-o-ia",
      total: 8,
      now,
    });
    session = transitionSession(session, "active", now);
    session = transitionSession(session, "processing", now);
    session = transitionSession(session, "feedback", now);
    session = transitionSession(session, "finished", now);

    expect(session.status).toBe("finished");
    expect(session.finishedAt?.toISOString()).toBe(now.toISOString());
    expect(session.resultAccessUntil?.getTime()).toBe(
      now.getTime() + RESULT_ACCESS_RETENTION_MS,
    );
    expect(canTransitionSession("finished", "active")).toBe(false);
    expect(() => transitionSession(session, "active", now)).toThrow(
      /Transición inválida/,
    );
  });

  it("expira por reloj autoritativo y renueva actividad sin cambiar de juego", () => {
    const started = createArcadeSession({
      alias: "Ana",
      gameCode: "feed-60",
      total: 10,
      now,
    });
    const active = transitionSession(started, "active", now);
    const touchedAt = new Date(now.getTime() + 60_000);
    const touched = touchSessionActivity(active, touchedAt);
    expect(touched.expiresAt.getTime()).toBe(
      touchedAt.getTime() + SESSION_ACTIVITY_RETENTION_MS,
    );
    expect(touched.gameCode).toBe("feed-60");

    const later = new Date(touched.expiresAt.getTime() + 1);
    const expired = expireSessionIfNeeded(touched, later);
    expect(expired.status).toBe("expired");
    expect(expired.resultAccessUntil?.getTime()).toBe(
      later.getTime() + RESULT_ACCESS_RETENTION_MS,
    );
    expect(
      isResultAccessExpired(
        expired,
        new Date(expired.resultAccessUntil!.getTime() + 1),
      ),
    ).toBe(true);
  });

  it("resuelve idempotencia: replay idéntico y conflicto si cambia la entrada", () => {
    const action = {
      gameCode: "real-o-ia" as const,
      itemId: "item-1",
      input: { kind: "verdict" as const, value: "real" as const },
    };
    const key = buildAnswerIdempotencyKey("session-1", "item-1");
    const fingerprint = fingerprintGameActionInput(action);

    expect(
      resolveAnswerIdempotency({
        sessionId: "session-1",
        action,
        previous: null,
      }),
    ).toEqual({ kind: "accept", idempotencyKey: key, inputFingerprint: fingerprint });

    expect(
      resolveAnswerIdempotency({
        sessionId: "session-1",
        action,
        previous: {
          itemId: "item-1",
          idempotencyKey: key,
          inputFingerprint: fingerprint,
        },
      }).kind,
    ).toBe("replay");

    expect(
      resolveAnswerIdempotency({
        sessionId: "session-1",
        action: {
          ...action,
          input: { kind: "verdict", value: "ai" },
        },
        previous: {
          itemId: "item-1",
          idempotencyKey: key,
          inputFingerprint: fingerprint,
        },
      }).kind,
    ).toBe("conflict");
  });
});
