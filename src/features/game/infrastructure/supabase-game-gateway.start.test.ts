import { describe, expect, it, vi } from "vitest";

import { SupabaseGameGateway } from "./supabase-game-gateway";

describe("gateway de inicio", () => {
  it("solo devuelve el envelope interno necesario y nunca el token/hash", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: { ok: true, sessionId: "internal", sessionExpiresAt: "date" }, error: null });
    const gateway = new SupabaseGameGateway({ rpc } as never);
    const result = await gateway.startGame("Ana", "a".repeat(64), 5);
    expect(result).toEqual({ ok: true, sessionId: "internal", sessionExpiresAt: "date" });
    expect(rpc).toHaveBeenCalledWith("start_game", expect.objectContaining({ p_alias: "Ana", p_round_size: 5 }));
    expect(JSON.stringify(result)).not.toContain("a".repeat(64));
  });
});
