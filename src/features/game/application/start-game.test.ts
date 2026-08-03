import { describe, expect, it, vi } from "vitest";

import { isSessionToken } from "../../../lib/security/session-token";
import { createMemoryArcadeGateway } from "../infrastructure/memory-arcade-gateway";
import { startGame, startLegacyTriviaGame } from "./start-game";

describe("caso de uso startGame arcade", () => {
  it("rechaza alias bloqueado sin crear cookie ni invocar gateway", async () => {
    const gateway = createMemoryArcadeGateway();
    const startSpy = vi.spyOn(gateway, "startGame");
    const onSessionCreated = vi.fn();

    const result = await startGame(
      { alias: "ADMIN", gameCode: "real-o-ia" },
      { gateway, onSessionCreated },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_ALIAS");
    }
    expect(startSpy).not.toHaveBeenCalled();
    expect(onSessionCreated).not.toHaveBeenCalled();
  });

  it("vincula credencial opaca al gameCode y no la expone en el estado", async () => {
    const gateway = createMemoryArcadeGateway();
    const onSessionCreated = vi.fn();

    const result = await startGame(
      { alias: " Ana ", gameCode: "real-o-ia" },
      { gateway, onSessionCreated },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.gameCode).toBe("real-o-ia");
    expect(result.data.alias).toBe("Ana");
    expect(onSessionCreated).toHaveBeenCalledTimes(1);

    const credential = onSessionCreated.mock.calls[0]?.[0] as {
      token: string;
      gameCode: string;
      expiresAt: Date;
    };
    expect(credential.gameCode).toBe("real-o-ia");
    expect(isSessionToken(credential.token)).toBe(true);
    expect(credential.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(JSON.stringify(result.data)).not.toContain(credential.token);
  });

  it("rechaza un gameCode desconocido sin crear cookie", async () => {
    const onSessionCreated = vi.fn();
    const result = await startGame(
      { alias: "Ana", gameCode: "no-existe" },
      { gateway: createMemoryArcadeGateway(), onSessionCreated },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_GAME");
    }
    expect(onSessionCreated).not.toHaveBeenCalled();
  });

  it("aisla la sesión por gameCode en el callback de cookie", async () => {
    const gateway = createMemoryArcadeGateway();
    const credentials: Array<{ gameCode: string; token: string }> = [];

    const first = await startGame(
      { alias: "Ana", gameCode: "grupo" },
      {
        gateway,
        onSessionCreated: async ({ token, gameCode }) => {
          credentials.push({ token, gameCode });
        },
      },
    );
    const second = await startGame(
      { alias: "Ana", gameCode: "feed-60" },
      {
        gateway,
        onSessionCreated: async ({ token, gameCode }) => {
          credentials.push({ token, gameCode });
        },
      },
    );

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(credentials).toEqual([
      expect.objectContaining({ gameCode: "grupo" }),
      expect.objectContaining({ gameCode: "feed-60" }),
    ]);
    expect(credentials[0]?.token).not.toBe(credentials[1]?.token);
  });
});

describe("caso de uso legado startLegacyTriviaGame", () => {
  it("rechaza alias bloqueado sin invocar Supabase", async () => {
    const gateway = { startGame: vi.fn() };
    const result = await startLegacyTriviaGame("ADMIN", {
      gateway: gateway as never,
      env: {
        SUPABASE_URL: "http://localhost",
        SUPABASE_SECRET_KEY: "secret",
        GAME_ROUND_SIZE: "5",
      },
    });
    expect(result.ok).toBe(false);
    expect(gateway.startGame).not.toHaveBeenCalled();
  });

  it("valida alias, genera credencial opaca y devuelve solo /play", async () => {
    const gateway = {
      startGame: vi.fn().mockResolvedValue({
        ok: true,
        data: {
          sessionExpiresAt: new Date("2026-07-31T00:00:00.000Z"),
          idempotent: false,
        },
      }),
    };
    const result = await startLegacyTriviaGame(" Ana ", {
      gateway: gateway as never,
      env: {
        SUPABASE_URL: "http://localhost",
        SUPABASE_SECRET_KEY: "secret",
        GAME_ROUND_SIZE: "5",
      },
    });
    expect(result).toEqual({ ok: true, data: { nextPath: "/play" } });
    expect(gateway.startGame).toHaveBeenCalledWith(
      "Ana",
      expect.stringMatching(/^[0-9a-f]{64}$/),
      5,
    );
  });
});
