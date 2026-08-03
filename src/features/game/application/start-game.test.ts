import { describe, expect, it, vi } from "vitest";

import { isSessionToken } from "../../../lib/security/session-token";
import { createMemoryArcadeGateway } from "../infrastructure/memory-arcade-gateway";
import { startGame } from "./start-game";

describe("caso de uso startGame arcade", () => {
  it("rechaza alias no permitido antes de crear sesiÃ³n", async () => {
    const gateway = createMemoryArcadeGateway();
    const startSpy = vi.spyOn(gateway, "startGame");

    for (const alias of ["ab", "a".repeat(21), "ana!"]) {
      const result = await startGame(
        { alias, gameCode: "real-o-ia" },
        { gateway },
      );

      expect(result).toEqual(
        expect.objectContaining({
          ok: false,
          error: expect.objectContaining({ code: "INVALID_ALIAS" }),
        }),
      );
    }

    expect(startSpy).not.toHaveBeenCalled();
  });

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
