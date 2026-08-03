import { describe, expect, it } from "vitest";

import {
  createMemoryArcadeGateway,
} from "./memory-arcade-gateway";

describe("arcade session snapshot round-trip", () => {
  it("exporta e importa una sesión start de real-o-ia", async () => {
    const gateway = createMemoryArcadeGateway();
    const started = await gateway.startGame({
      alias: "Nola",
      gameCode: "real-o-ia",
      sessionTokenHash: "a".repeat(64),
    });
    expect(started.ok).toBe(true);
    if (!started.ok) return;

    const snapshot = gateway.exportSession(started.data.sessionId);
    expect(snapshot?.version).toBe(1);
    expect(snapshot?.tokenHash).toBe("a".repeat(64));

    const other = createMemoryArcadeGateway();
    other.importSession(snapshot!);
    expect(other.resolveSessionId("a".repeat(64))).toBe(started.data.sessionId);

    const state = await other.getGameState({
      sessionId: started.data.sessionId,
      gameCode: "real-o-ia",
    });
    expect(state.ok).toBe(true);
    if (state.ok) {
      expect(state.data.alias).toBe("Nola");
      expect(state.data.gameCode).toBe("real-o-ia");
    }
  });
});
