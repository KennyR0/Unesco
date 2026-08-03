import { describe, expect, it } from "vitest";

import { createContentRepository } from "../content/content-repository";
import contentPack from "../content/game-items/grupo.v1.json";
import { createMemoryArcadeGateway } from "./memory-arcade-gateway";

const repository = createContentRepository(contentPack, {
  activeVersion: "2026-07-30.1",
});

describe("memory arcade gateway: El Grupo con contenido", () => {
  it("inicia con seis escenas públicas y evalúa group_action", async () => {
    const gateway = createMemoryArcadeGateway({ contentRepository: repository });
    const started = await gateway.startGame({
      alias: "Ana",
      gameCode: "grupo",
      sessionTokenHash: "grupo-token",
    });

    expect(started.ok).toBe(true);
    if (!started.ok) return;

    expect(started.data).toMatchObject({
      gameCode: "grupo",
      status: "active",
      total: 6,
      position: 0,
      nextAction: "submit",
      item: {
        gameCode: "grupo",
        itemId: "grupo-001",
      },
    });
    expect(JSON.stringify(started.data)).not.toMatch(
      /solutionPrivate|actionEvaluations/,
    );

    const submitted = await gateway.submitGameAction({
      sessionId: started.data.sessionId,
      gameCode: "grupo",
      itemId: "grupo-001",
      input: { kind: "group_action", value: "verify" },
    });

    expect(submitted.ok).toBe(true);
    if (!submitted.ok) return;
    expect(submitted.data).toMatchObject({
      status: "feedback",
      nextAction: "advance",
      feedback: { status: "correct" },
      provisionalScore: { points: 2, maxPoints: 12 },
    });
    expect(submitted.data.feedback?.explanation.length).toBeGreaterThan(20);
  });

  it("completa el flujo y materializa score autoritativo", async () => {
    const gateway = createMemoryArcadeGateway({ contentRepository: repository });
    const started = await gateway.startGame({
      alias: "Lina",
      gameCode: "grupo",
      sessionTokenHash: "grupo-full",
    });
    expect(started.ok).toBe(true);
    if (!started.ok) return;

    for (const itemId of [
      "grupo-001",
      "grupo-002",
      "grupo-003",
      "grupo-004",
      "grupo-005",
      "grupo-006",
    ]) {
      const submitted = await gateway.submitGameAction({
        sessionId: started.data.sessionId,
        gameCode: "grupo",
        itemId,
        input: { kind: "group_action", value: "verify" },
      });
      expect(submitted.ok).toBe(true);
      if (!submitted.ok) return;

      const advanced = await gateway.advanceGame({
        sessionId: started.data.sessionId,
        itemId,
      });
      expect(advanced.ok).toBe(true);
      if (!advanced.ok) return;
    }

    const finished = await gateway.getGameState({
      sessionId: started.data.sessionId,
      gameCode: "grupo",
    });
    expect(finished).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          status: "finished",
          nextAction: "result",
        }),
      }),
    );

    const result = await gateway.getGameResult({
      sessionId: started.data.sessionId,
    });
    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          status: "finished",
          answered: 6,
          total: 6,
          score: expect.objectContaining({
            points: 12,
            maxPoints: 12,
            correct: null,
            errors: 0,
          }),
        }),
      }),
    );
  });
});
