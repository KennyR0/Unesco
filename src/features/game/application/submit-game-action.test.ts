import { describe, expect, it, vi } from "vitest";

import type { ArcadeOperationResult, GameState } from "@antidoto/contracts";

import type { ArcadeGameGateway } from "../infrastructure/game-gateway";
import { createArcadePublicError } from "./game-operations";
import { advanceGame, submitGameAction } from "./submit-game-action";

const baseState: GameState = {
  sessionId: "session-1",
  gameCode: "real-o-ia",
  mechanic: "image_verdict",
  status: "feedback",
  alias: "Ana",
  position: 1,
  total: 8,
  item: null,
  feedback: {
    status: "instructive",
    explanation: "Explicación",
    signals: ["Señal"],
    recommendation: "Recomendación",
    revealedAnswer: null,
  },
  provisionalScore: null,
  nextAction: "advance",
};

function createGateway(
  overrides: Partial<ArcadeGameGateway> = {},
): ArcadeGameGateway {
  const unimplemented = async (): Promise<ArcadeOperationResult<never>> => ({
    ok: false,
    error: createArcadePublicError("INTERNAL_ERROR"),
  });

  return {
    startGame: vi.fn(unimplemented),
    getGameState: vi.fn(unimplemented),
    submitGameAction: vi.fn(async () => ({ ok: true as const, data: baseState })),
    advanceGame: vi.fn(async () => ({
      ok: true as const,
      data: {
        ...baseState,
        status: "active" as const,
        nextAction: "submit" as const,
        feedback: null,
      },
    })),
    getGameResult: vi.fn(unimplemented),
    getLeaderboard: vi.fn(unimplemented),
    ...overrides,
  };
}

const deps = {
  gateway: createGateway(),
  resolveSessionId: async () => "session-1",
};

describe("submitGameAction / advanceGame (T032)", () => {
  it.each([
    ["solution", { solution: { verdict: "ai" } }],
    ["score", { score: 99 }],
    ["nextItem", { nextItem: "item-2" }],
    ["completed", { completed: true }],
  ] as const)(
    "submitGameAction rechaza %s enviado por el cliente",
    async (_field, forbidden) => {
      const gateway = createGateway();
      const result = await submitGameAction(
        {
          gameCode: "real-o-ia",
          itemId: "item-1",
          input: { kind: "verdict", value: "real" },
          ...forbidden,
        },
        { gateway, resolveSessionId: async () => "session-1" },
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ACTION");
        expect(result.error.message).toMatch(/autoridad/i);
      }
      expect(gateway.submitGameAction).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["solution", { solution: { verdict: "ai" } }],
    ["score", { score: 99 }],
    ["nextItem", { nextItem: "item-2" }],
    ["completed", { completed: true }],
  ] as const)(
    "advanceGame rechaza %s enviado por el cliente",
    async (_field, forbidden) => {
      const gateway = createGateway();
      const result = await advanceGame(
        {
          gameCode: "real-o-ia",
          itemId: "item-1",
          ...forbidden,
        },
        { gateway, resolveSessionId: async () => "session-1" },
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ACTION");
        expect(result.error.message).toMatch(/autoridad/i);
      }
      expect(gateway.advanceGame).not.toHaveBeenCalled();
    },
  );

  it("acepta submit y advance válidos sin campos de autoridad", async () => {
    const gateway = createGateway();
    const resolveSessionId = vi.fn(async () => "session-1");

    const submitted = await submitGameAction(
      {
        gameCode: "real-o-ia",
        itemId: "item-1",
        input: { kind: "verdict", value: "real" },
        sessionId: "forged-client-session",
      },
      { gateway, resolveSessionId },
    );
    expect(submitted.ok).toBe(true);
    expect(gateway.submitGameAction).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "session-1",
        gameCode: "real-o-ia",
        itemId: "item-1",
      }),
    );

    const advanced = await advanceGame(
      { gameCode: "real-o-ia", itemId: "item-1" },
      { gateway, resolveSessionId },
    );
    expect(advanced.ok).toBe(true);
    expect(gateway.advanceGame).toHaveBeenCalledWith({
      sessionId: "session-1",
      itemId: "item-1",
    });
  });

  it("no resuelve sesión si el payload ya trae autoridad prohibida", async () => {
    const resolveSessionId = vi.fn(async () => "session-1");
    const result = await advanceGame(
      {
        gameCode: "real-o-ia",
        itemId: "item-1",
        completed: true,
        nextItem: "item-9",
      },
      { ...deps, resolveSessionId },
    );
    expect(result.ok).toBe(false);
    expect(resolveSessionId).not.toHaveBeenCalled();
  });
});
