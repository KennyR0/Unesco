import { afterEach, describe, expect, it, vi } from "vitest";

import { createMemoryArcadeGateway } from "./memory-arcade-gateway";
import type { GameStateWithCompanion } from "./session-companion";

afterEach(() => {
  vi.useRealTimers();
});

async function startSession(
  gateway: ReturnType<typeof createMemoryArcadeGateway>,
  gameCode: Parameters<typeof gateway.startGame>[0]["gameCode"],
  alias = "Ana",
) {
  const started = await gateway.startGame({
    alias,
    gameCode,
    sessionTokenHash: `${gameCode}-${alias}-${Math.random()}`,
  });
  expect(started.ok).toBe(true);
  if (!started.ok) throw new Error("no se pudo iniciar la sesión");
  return started.data as GameStateWithCompanion;
}

describe("memory arcade gateway: seis misiones con contenido", () => {
  it("real-o-ia: asigna las ocho imágenes y puntúa el verdict", async () => {
    const gateway = createMemoryArcadeGateway();
    const started = await startSession(gateway, "real-o-ia");

    expect(started).toMatchObject({
      gameCode: "real-o-ia",
      status: "active",
      total: 8,
      position: 0,
      nextAction: "submit",
      item: { gameCode: "real-o-ia", itemId: "real-o-ia-001" },
    });
    expect(JSON.stringify(started)).not.toMatch(
      /solutionPrivate|evaluationSignals/,
    );

    const correct = await gateway.submitGameAction({
      sessionId: started.sessionId,
      gameCode: "real-o-ia",
      itemId: "real-o-ia-001",
      input: { kind: "verdict", value: "ai" },
    });
    expect(correct).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          status: "feedback",
          nextAction: "advance",
          feedback: expect.objectContaining({ status: "correct" }),
          provisionalScore: expect.objectContaining({
            points: 10,
            maxPoints: 80,
          }),
        }),
      }),
    );
    expect(JSON.stringify(correct)).not.toMatch(/solutionPrivate/);

    const advanced = await gateway.advanceGame({
      sessionId: started.sessionId,
      itemId: "real-o-ia-001",
    });
    expect(advanced).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          status: "active",
          position: 1,
          item: expect.objectContaining({ itemId: "real-o-ia-002" }),
        }),
      }),
    );

    const wrong = await gateway.submitGameAction({
      sessionId: started.sessionId,
      gameCode: "real-o-ia",
      itemId: "real-o-ia-002",
      input: { kind: "verdict", value: "ai" },
    });
    expect(wrong).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          feedback: expect.objectContaining({ status: "incorrect" }),
          provisionalScore: expect.objectContaining({ points: 10, errors: 1 }),
        }),
      }),
    );
  });

  it("clickbait-swipe: conserva la racha y otorga el bono al tercer acierto", async () => {
    const gateway = createMemoryArcadeGateway();
    const started = await startSession(gateway, "clickbait-swipe", "Leo");

    const plays: Array<{
      itemId: string;
      value: "journalism" | "clickbait";
    }> = [
      { itemId: "clickbait-swipe-001", value: "clickbait" },
      { itemId: "clickbait-swipe-002", value: "journalism" },
      { itemId: "clickbait-swipe-003", value: "clickbait" },
    ];

    let lastState: GameStateWithCompanion | null = null;
    for (const play of plays) {
      const submitted = await gateway.submitGameAction({
        sessionId: started.sessionId,
        gameCode: "clickbait-swipe",
        itemId: play.itemId,
        input: {
          kind: "headline_classification",
          value: play.value,
          source: "button",
        },
      });
      expect(submitted.ok).toBe(true);
      if (!submitted.ok) throw new Error("submit falló");
      lastState = submitted.data as GameStateWithCompanion;

      const advanced = await gateway.advanceGame({
        sessionId: started.sessionId,
        itemId: play.itemId,
      });
      expect(advanced.ok).toBe(true);
    }

    expect(lastState?.feedback?.status).toBe("correct");
    expect(lastState?.provisionalScore).toEqual(
      expect.objectContaining({ points: 4, bonusPoints: 1, correct: 3 }),
    );
  });

  it("radar-de-fuentes: evalúa la clasificación y proyecta feedback", async () => {
    const gateway = createMemoryArcadeGateway();
    const started = await startSession(gateway, "radar-de-fuentes", "Ira");

    expect(started.item).toEqual(
      expect.objectContaining({ itemId: "radar-de-fuentes-001" }),
    );

    const submitted = await gateway.submitGameAction({
      sessionId: started.sessionId,
      gameCode: "radar-de-fuentes",
      itemId: "radar-de-fuentes-001",
      input: { kind: "source_classification", value: "reliable" },
    });

    expect(submitted).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          status: "feedback",
          feedback: expect.objectContaining({ status: "correct" }),
          provisionalScore: expect.objectContaining({
            points: 1,
            maxPoints: 9,
          }),
        }),
      }),
    );
  });

  it("feed-60: verify descuenta 4 s, expone hints y bonifica la decisión", async () => {
    const startedAt = new Date("2026-08-02T12:00:00.000Z");
    vi.useFakeTimers({ now: startedAt });
    const gateway = createMemoryArcadeGateway();
    const started = await startSession(gateway, "feed-60", "Max");

    expect(started).toMatchObject({
      gameCode: "feed-60",
      total: 10,
      item: expect.objectContaining({
        itemId: "feed-60-001",
        remainingSeconds: 60,
      }),
    });
    expect(started.companion).toEqual(
      expect.objectContaining({ kind: "feed-60", verified: false }),
    );

    vi.setSystemTime(startedAt.getTime() + 2_000);
    const verified = await gateway.submitGameAction({
      sessionId: started.sessionId,
      gameCode: "feed-60",
      itemId: "feed-60-001",
      input: { kind: "feed_action", value: "verify" },
    });
    expect(verified.ok).toBe(true);
    if (!verified.ok) throw new Error("verify falló");

    const verifiedState = verified.data as GameStateWithCompanion;
    expect(verifiedState.status).toBe("active");
    expect(verifiedState.nextAction).toBe("submit");
    expect(verifiedState.companion).toEqual(
      expect.objectContaining({
        kind: "feed-60",
        verified: true,
        verificationHints: expect.arrayContaining([
          expect.stringMatching(/Ministerio de Salud/),
        ]),
      }),
    );
    const remaining =
      verifiedState.companion?.kind === "feed-60"
        ? verifiedState.companion.remainingSeconds
        : null;
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(54);

    const repeatedVerify = await gateway.submitGameAction({
      sessionId: started.sessionId,
      gameCode: "feed-60",
      itemId: "feed-60-001",
      input: { kind: "feed_action", value: "verify" },
    });
    expect(repeatedVerify).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: "INVALID_ACTION" }),
      }),
    );

    const decided = await gateway.submitGameAction({
      sessionId: started.sessionId,
      gameCode: "feed-60",
      itemId: "feed-60-001",
      input: { kind: "feed_action", value: "share" },
    });
    expect(decided).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          status: "feedback",
          feedback: expect.objectContaining({ status: "correct" }),
          provisionalScore: expect.objectContaining({
            points: 3,
            bonusPoints: 1,
            timeLimitSeconds: 60,
          }),
        }),
      }),
    );
  });

  it("feed-60: el reloj expira la partida aunque el cliente siga en línea", async () => {
    const startedAt = new Date("2026-08-02T12:00:00.000Z");
    vi.useFakeTimers({ now: startedAt });
    const gateway = createMemoryArcadeGateway();
    const started = await startSession(gateway, "feed-60", "Ada");

    vi.setSystemTime(startedAt.getTime() + 61_000);
    const late = await gateway.submitGameAction({
      sessionId: started.sessionId,
      gameCode: "feed-60",
      itemId: "feed-60-001",
      input: { kind: "feed_action", value: "share" },
    });
    expect(late).toEqual(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: "SESSION_EXPIRED" }),
      }),
    );

    const state = await gateway.getGameState({
      sessionId: started.sessionId,
      gameCode: "feed-60",
    });
    expect(state).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          status: "expired",
          nextAction: "result",
          item: null,
        }),
      }),
    );

    const result = await gateway.getGameResult({
      sessionId: started.sessionId,
    });
    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({
          status: "expired",
          answered: 0,
          total: 10,
          score: expect.objectContaining({
            points: 0,
            timeLimitSeconds: 60,
          }),
        }),
      }),
    );
  });

  it("mente-maestra: acumula selecciones y ensambla alcance simulado al cerrar", async () => {
    const gateway = createMemoryArcadeGateway();
    const started = await startSession(gateway, "mente-maestra", "Luz");

    expect(started).toMatchObject({
      gameCode: "mente-maestra",
      total: 4,
      item: expect.objectContaining({
        itemId: "mente-maestra-001",
        step: "objective",
      }),
    });
    expect(JSON.stringify(started)).not.toMatch(/reachWeight|solutionPrivate/);

    const steps: Array<{ itemId: string; optionId: string; step: string }> = [
      {
        itemId: "mente-maestra-001",
        optionId: "objective-health-panic",
        step: "objective",
      },
      {
        itemId: "mente-maestra-002",
        optionId: "emotion-fear",
        step: "emotion",
      },
      {
        itemId: "mente-maestra-003",
        optionId: "headline-conspiracy-caps",
        step: "headline",
      },
      {
        itemId: "mente-maestra-004",
        optionId: "evidence-ai-image",
        step: "evidence",
      },
    ];

    for (const [index, play] of steps.entries()) {
      const submitted = await gateway.submitGameAction({
        sessionId: started.sessionId,
        gameCode: "mente-maestra",
        itemId: play.itemId,
        input: {
          kind: "autopsy_choice",
          step: play.step as "objective",
          optionId: play.optionId,
        },
      });
      expect(submitted.ok).toBe(true);
      if (!submitted.ok) throw new Error("submit falló");

      const state = submitted.data as GameStateWithCompanion;
      expect(state.companion).toEqual(
        expect.objectContaining({
          kind: "mente-maestra",
          selectedOptionId: play.optionId,
        }),
      );
      if (state.companion?.kind === "mente-maestra") {
        expect(state.companion.selections).toHaveLength(index + 1);
      }

      const advanced = await gateway.advanceGame({
        sessionId: started.sessionId,
        itemId: play.itemId,
      });
      expect(advanced.ok).toBe(true);
    }

    const result = await gateway.getGameResult({
      sessionId: started.sessionId,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("resultado no disponible");
    expect(result.data.status).toBe("finished");
    expect(result.data.answered).toBe(4);
    expect(result.data.score).toEqual(
      expect.objectContaining({ points: 4, maxPoints: 4 }),
    );
    expect(result.data.simulatedReach).toBeGreaterThanOrEqual(65);
    expect(result.data.simulatedReach).toBeLessThanOrEqual(95);
    expect(result.data.score.points).not.toBe(result.data.simulatedReach);
  });
});
