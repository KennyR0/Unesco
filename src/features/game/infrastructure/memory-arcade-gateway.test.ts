import { afterEach, describe, expect, it, vi } from "vitest";

import { SESSION_ACTIVITY_RETENTION_MS } from "../domain/session";
import { createMemoryArcadeGateway } from "./memory-arcade-gateway";

const action = {
  sessionId: "session-not-used-by-gateway",
  gameCode: "real-o-ia" as const,
  itemId: "item-1",
  input: { kind: "verdict" as const, value: "real" as const },
};

afterEach(() => {
  vi.useRealTimers();
});

describe("memory arcade gateway: T028", () => {
  it("repite startGame de forma idempotente para el mismo hash de sesiÃ³n", async () => {
    const gateway = createMemoryArcadeGateway();
    const command = {
      alias: "Ana",
      gameCode: "real-o-ia" as const,
      sessionTokenHash: "repeated-token-hash",
    };

    const first = await gateway.startGame(command);
    const retry = await gateway.startGame(command);

    expect(retry).toEqual(first);
  });

  it("rejects an item that is not assigned to the session", async () => {
    const gateway = createMemoryArcadeGateway();
    const started = await gateway.startGame({
      alias: "Ana",
      gameCode: "real-o-ia",
      sessionTokenHash: "token-hash",
    });

    expect(started.ok).toBe(true);
    if (!started.ok) return;

    const result = await gateway.submitGameAction({
      ...action,
      sessionId: started.data.sessionId,
      itemId: "item-from-another-session",
    });

    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: "ITEM_NOT_IN_SESSION" }),
    });
  });

  it("replays the same accepted action and rejects a conflicting retry", async () => {
    const gateway = createMemoryArcadeGateway();
    const started = await gateway.startGame({
      alias: "Ana",
      gameCode: "real-o-ia",
      sessionTokenHash: "token-hash",
    });

    expect(started.ok).toBe(true);
    if (!started.ok) return;

    const accepted = await gateway.submitGameAction({
      ...action,
      sessionId: started.data.sessionId,
    });
    const replay = await gateway.submitGameAction({
      ...action,
      sessionId: started.data.sessionId,
    });
    const conflict = await gateway.submitGameAction({
      ...action,
      sessionId: started.data.sessionId,
      input: { kind: "verdict", value: "ai" },
    });

    expect(accepted).toEqual(replay);
    expect(replay).toEqual(
      expect.objectContaining({ ok: true, data: expect.objectContaining({ status: "feedback" }) }),
    );
    expect(conflict).toEqual({
      ok: false,
      error: expect.objectContaining({ code: "ANSWER_ALREADY_ACCEPTED" }),
    });
  });

  it("requires feedback before advance and materializes finished result", async () => {
    const gateway = createMemoryArcadeGateway();
    const started = await gateway.startGame({
      alias: "Ana",
      gameCode: "real-o-ia",
      sessionTokenHash: "token-hash",
    });

    expect(started.ok).toBe(true);
    if (!started.ok) return;

    const premature = await gateway.advanceGame({
      sessionId: started.data.sessionId,
      itemId: "item-1",
    });
    expect(premature).toEqual({
      ok: false,
      error: expect.objectContaining({ code: "INVALID_ACTION" }),
    });

    await gateway.submitGameAction({
      ...action,
      sessionId: started.data.sessionId,
    });
    const finished = await gateway.advanceGame({
      sessionId: started.data.sessionId,
      itemId: "item-1",
    });

    expect(finished).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({ status: "finished", nextAction: "result" }),
      }),
    );

    const result = await gateway.getGameResult({ sessionId: started.data.sessionId });
    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({ status: "finished", answered: 1, total: 1 }),
      }),
    );
  });

  it("advances only through the assigned item order", async () => {
    const gateway = createMemoryArcadeGateway({
      itemIdsByGameCode: { "real-o-ia": ["item-1", "item-2"] },
    });
    const started = await gateway.startGame({
      alias: "Ana",
      gameCode: "real-o-ia",
      sessionTokenHash: "token-hash",
    });

    expect(started.ok).toBe(true);
    if (!started.ok) return;
    expect(started.data).toEqual(
      expect.objectContaining({ status: "active", position: 0, total: 2 }),
    );

    const skipped = await gateway.submitGameAction({
      ...action,
      sessionId: started.data.sessionId,
      itemId: "item-2",
    });
    expect(skipped).toEqual({
      ok: false,
      error: expect.objectContaining({ code: "ITEM_NOT_IN_SESSION" }),
    });

    await gateway.submitGameAction({
      ...action,
      sessionId: started.data.sessionId,
      itemId: "item-1",
    });
    const next = await gateway.advanceGame({
      sessionId: started.data.sessionId,
      itemId: "item-1",
    });
    expect(next).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({ status: "active", position: 1, total: 2 }),
      }),
    );
  });

  it("transitions an expired session to a terminal result exactly once", async () => {
    const startedAt = new Date("2026-08-02T12:00:00.000Z");
    vi.useFakeTimers({ now: startedAt });
    const gateway = createMemoryArcadeGateway();
    const started = await gateway.startGame({
      alias: "Ana",
      gameCode: "real-o-ia",
      sessionTokenHash: "token-hash",
    });

    expect(started.ok).toBe(true);
    if (!started.ok) return;

    vi.setSystemTime(startedAt.getTime() + SESSION_ACTIVITY_RETENTION_MS + 1);
    const expired = await gateway.getGameState({
      sessionId: started.data.sessionId,
      gameCode: "real-o-ia",
    });
    const expiredAgain = await gateway.getGameState({
      sessionId: started.data.sessionId,
      gameCode: "real-o-ia",
    });

    expect(expired).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({ status: "expired", nextAction: "result" }),
      }),
    );
    expect(expiredAgain).toEqual(expired);

    const result = await gateway.getGameResult({ sessionId: started.data.sessionId });
    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({ status: "expired", answered: 0, total: 1 }),
      }),
    );
  });
});
