import { describe, expect, it, vi } from "vitest";

import { SupabaseGameGateway } from "./supabase-game-gateway";

describe("gateway de inicio", () => {
  it("solo devuelve el envelope interno necesario y nunca el token/hash", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        ok: true,
        sessionExpiresAt: "2026-07-31T00:00:00.000Z",
        idempotent: false,
      },
      error: null,
    });
    const gateway = new SupabaseGameGateway({ rpc } as never);
    const result = await gateway.startGame("Ana", "a".repeat(64), 5);
    expect(result).toEqual({
      ok: true,
      data: {
        sessionExpiresAt: new Date("2026-07-31T00:00:00.000Z"),
        idempotent: false,
      },
    });
    expect(rpc).toHaveBeenCalledWith("start_game", expect.objectContaining({ p_alias: "Ana", p_round_size: 5 }));
    expect(JSON.stringify(result)).not.toContain("a".repeat(64));
  });

  it("rechaza UUID y campos internos no autorizados en la respuesta", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        ok: true,
        sessionId: "00000000-0000-0000-0000-000000000000",
        sessionExpiresAt: "2026-07-31T00:00:00.000Z",
        idempotent: false,
      },
      error: null,
    });
    const gateway = new SupabaseGameGateway({ rpc } as never);

    await expect(
      gateway.startGame("Ana", "a".repeat(64), 5),
    ).rejects.toThrow();
  });
});
