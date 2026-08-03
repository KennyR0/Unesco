import { describe, expect, it } from "vitest";

import type { GameCode } from "@antidoto/contracts";

import { arcadeSessionCookieName } from "../../../lib/security/session-cookie";
import { createSessionToken } from "../../../lib/security/session-token";
import { createMemoryArcadeGateway } from "../infrastructure/memory-arcade-gateway";
import {
  advanceArcadeGameServer,
  getArcadeGameResultServer,
  getArcadeGameStateServer,
  startArcadeGameServer,
  submitArcadeGameActionServer,
} from "./server-operations";
import { submitGameAction } from "./submit-game-action";

type MemoryCookie = {
  value: string;
  name: string;
};

function createMemoryCookieStore() {
  const jar = new Map<string, MemoryCookie>();
  return {
    get(name: string) {
      const entry = jar.get(name);
      return entry ? { name, value: entry.value } : undefined;
    },
    set(options: {
      name: string;
      value: string;
      httpOnly?: boolean;
      sameSite?: string;
      path?: string;
      secure?: boolean;
      expires?: Date;
      maxAge?: number;
    }) {
      jar.set(options.name, { name: options.name, value: options.value });
    },
    jar,
  };
}

describe("transporte server-only arcade", () => {
  it("inicia, recupera estado y rechaza sessionId del cliente en submit", async () => {
    const gateway = createMemoryArcadeGateway();
    const cookieStore = createMemoryCookieStore();

    const started = await startArcadeGameServer(
      { alias: "Ana", gameCode: "real-o-ia" },
      { gateway, cookieStore: cookieStore as never, secure: false },
    );
    expect(started.ok).toBe(true);
    if (!started.ok) return;

    expect(cookieStore.jar.has("antidoto_session.real-o-ia")).toBe(true);

    const state = await getArcadeGameStateServer(
      { gameCode: "real-o-ia" },
      { gateway, cookieStore: cookieStore as never },
    );
    expect(state.ok).toBe(true);
    if (!state.ok) return;
    expect(state.data.sessionId).toBe(started.data.sessionId);

    const forged = await submitGameAction(
      {
        sessionId: "forged-session",
        gameCode: "real-o-ia",
        itemId: "item-1",
        input: { kind: "verdict", value: "real" },
      },
      {
        gateway,
        resolveSessionId: async () => started.data.sessionId,
      },
    );
    expect(forged.ok).toBe(true);
    if (!forged.ok) return;
    expect(forged.data.sessionId).toBe(started.data.sessionId);
    expect(forged.data.status).toBe("feedback");
  });

  it("exige cookie opaca por gameCode y no mezcla partidas", async () => {
    const gateway = createMemoryArcadeGateway();
    const cookieStore = createMemoryCookieStore();

    await startArcadeGameServer(
      { alias: "Ana", gameCode: "grupo" as GameCode },
      { gateway, cookieStore: cookieStore as never, secure: false },
    );

    const otherGame = await getArcadeGameStateServer(
      { gameCode: "feed-60" },
      { gateway, cookieStore: cookieStore as never },
    );
    expect(otherGame.ok).toBe(false);
    if (!otherGame.ok) {
      expect(otherGame.error.code).toBe("SESSION_NOT_FOUND");
    }

    const submitted = await submitArcadeGameActionServer(
      {
        gameCode: "grupo",
        itemId: "item-1",
        input: { kind: "group_action", value: "verify" },
        score: 99,
      },
      { gateway, cookieStore: cookieStore as never },
    );
    expect(submitted.ok).toBe(false);
    if (!submitted.ok) {
      expect(submitted.error.code).toBe("INVALID_ACTION");
    }
  });

  it("clasifica cookie arcade ausente, malformada y desconocida sin filtrar detalles", async () => {
    const gateway = createMemoryArcadeGateway();
    const cookieStore = createMemoryCookieStore();
    const dependencies = { gateway, cookieStore: cookieStore as never };

    const missing = await getArcadeGameStateServer(
      { gameCode: "real-o-ia" },
      dependencies,
    );
    expect(missing).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: "SESSION_NOT_FOUND" }),
      }),
    );

    cookieStore.set({
      name: arcadeSessionCookieName("real-o-ia"),
      value: "not-a-session-token",
    });
    const malformed = await getArcadeGameStateServer(
      { gameCode: "real-o-ia" },
      dependencies,
    );
    expect(malformed).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: "SESSION_INVALID" }),
      }),
    );

    cookieStore.set({
      name: arcadeSessionCookieName("real-o-ia"),
      value: createSessionToken(),
    });
    const unknown = await getArcadeGameStateServer(
      { gameCode: "real-o-ia" },
      dependencies,
    );
    expect(unknown).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: "SESSION_INVALID" }),
      }),
    );
    if (!unknown.ok) {
      expect(unknown.error.message).not.toMatch(/token|hash|cookie|sessionId/i);
    }
  });

  it("avanza y recupera resultado solo desde sesión server-only", async () => {
    const gateway = createMemoryArcadeGateway();
    const cookieStore = createMemoryCookieStore();
    const deps = { gateway, cookieStore: cookieStore as never, secure: false };

    await startArcadeGameServer(
      { alias: "Ana", gameCode: "clickbait-swipe" },
      deps,
    );
    await submitArcadeGameActionServer(
      {
        gameCode: "clickbait-swipe",
        itemId: "item-1",
        input: {
          kind: "headline_classification",
          value: "journalism",
          source: "button",
        },
      },
      deps,
    );

    const advanced = await advanceArcadeGameServer(
      { gameCode: "clickbait-swipe", itemId: "item-1" },
      deps,
    );
    expect(advanced.ok).toBe(true);

    const result = await getArcadeGameResultServer(
      { gameCode: "clickbait-swipe" },
      deps,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.status).toBe("finished");
    expect(result.data.gameCode).toBe("clickbait-swipe");
  });
});
