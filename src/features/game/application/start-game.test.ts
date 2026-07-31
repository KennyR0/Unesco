import { describe, expect, it, vi } from "vitest";

import { startGame } from "./start-game";

describe("caso de uso startGame", () => {
  it("rechaza alias bloqueado sin invocar Supabase", async () => {
    const gateway = { startGame: vi.fn() };
    const result = await startGame("ADMIN", { gateway: gateway as never, env: { SUPABASE_URL: "http://localhost", SUPABASE_SECRET_KEY: "secret", GAME_ROUND_SIZE: "5" } });
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
    const result = await startGame(" Ana ", { gateway: gateway as never, env: { SUPABASE_URL: "http://localhost", SUPABASE_SECRET_KEY: "secret", GAME_ROUND_SIZE: "5" } });
    expect(result).toEqual({ ok: true, data: { nextPath: "/play" } });
    expect(gateway.startGame).toHaveBeenCalledWith("Ana", expect.stringMatching(/^[0-9a-f]{64}$/), 5);
  });
});
