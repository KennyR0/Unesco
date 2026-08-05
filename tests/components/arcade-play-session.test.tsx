import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GameState } from "@antidoto/contracts";

import { ArcadePlaySession } from "../../src/components/game/arcade-play-session";
import type { GameStateWithCompanion } from "../../src/features/game/infrastructure/session-companion";
import { createContentRepository } from "../../src/features/game/content/content-repository";
import clickbaitPack from "../../src/features/game/content/game-items/clickbait-swipe.v1.json";
import feed60Pack from "../../src/features/game/content/game-items/feed-60.v1.json";
import menteMaestraPack from "../../src/features/game/content/game-items/mente-maestra.v1.json";
import realOrIaPack from "../../src/features/game/content/game-items/real-o-ia.v1.json";

const startArcadeGameFormAction = vi.fn();
const playAgainArcadeGameFormAction = vi.fn();
const submitGameActionAction = vi.fn();
const advanceArcadeGameAction = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("../../src/app/actions/game", () => ({
  startArcadeGameFormAction: (...args: unknown[]) =>
    startArcadeGameFormAction(...args),
  playAgainArcadeGameFormAction: (...args: unknown[]) =>
    playAgainArcadeGameFormAction(...args),
  submitGameActionAction: (...args: unknown[]) => submitGameActionAction(...args),
  advanceArcadeGameAction: (...args: unknown[]) =>
    advanceArcadeGameAction(...args),
}));

const repository = createContentRepository(
  [...realOrIaPack, ...clickbaitPack, ...feed60Pack, ...menteMaestraPack],
  { activeVersion: "2026-07-30.1" },
);

function activeState(
  gameCode: GameState["gameCode"],
  itemId: string,
  total: number,
  overrides: Partial<GameState> = {},
): GameStateWithCompanion {
  const item = repository.getPublicItem(gameCode, itemId);
  if (!item) throw new Error(`missing item ${itemId}`);

  return {
    sessionId: `session-${gameCode}`,
    gameCode,
    mechanic: item.mechanic,
    status: "active",
    alias: "Ana",
    position: 0,
    total,
    item,
    feedback: null,
    provisionalScore: null,
    nextAction: "submit",
    ...overrides,
  };
}

describe("ArcadePlaySession", () => {
  beforeEach(() => {
    startArcadeGameFormAction.mockReset();
    submitGameActionAction.mockReset();
    advanceArcadeGameAction.mockReset();
    push.mockReset();
  });

  it("real-o-ia: envía verdict, muestra feedback y avanza", async () => {
    const user = userEvent.setup();
    const base = activeState("real-o-ia", "real-o-ia-001", 8);
    const withFeedback: GameState = {
      ...base,
      status: "feedback",
      nextAction: "advance",
      feedback: {
        status: "correct",
        explanation: "Las manos delatan a la IA.",
        signals: ["Contaste los dedos."],
        recommendation: "Revisa extremidades y textos.",
        revealedAnswer: "Generada por IA",
      },
      provisionalScore: {
        points: 10,
        maxPoints: 80,
        correct: 1,
        errors: 0,
        bonusPoints: 0,
        penaltyPoints: 0,
        timeLimitSeconds: null,
        timeUsedSeconds: null,
      },
    };
    const nextScene = activeState("real-o-ia", "real-o-ia-002", 8, {
      position: 1,
    });

    submitGameActionAction.mockResolvedValue({ ok: true, data: withFeedback });
    advanceArcadeGameAction.mockResolvedValue({ ok: true, data: nextScene });

    render(
      <ArcadePlaySession
        gameCode="real-o-ia"
        gameName="¿Real o IA?"
        objective="Detecta señales visuales."
        introMechanic="Mecánica: image verdict · 8 imágenes · máximo 80 puntos"
        introSubmitLabel="Empezar a analizar imágenes"
        itemNoun="Imagen"
        siftFocus={["investigate"]}
        initialState={base}
      />,
    );

    await user.click(screen.getByRole("button", { name: /generada por ia/i }));

    await waitFor(() => {
      expect(submitGameActionAction).toHaveBeenCalledWith({
        gameCode: "real-o-ia",
        itemId: "real-o-ia-001",
        input: { kind: "verdict", value: "ai" },
      });
    });

    const feedback = await screen.findByRole("region", {
      name: "Feedback educativo",
    });
    expect(feedback).toHaveTextContent(/Las manos delatan a la IA/i);

    await user.click(
      await screen.findByRole("button", { name: /continuar/i }),
    );
    await waitFor(() => {
      expect(advanceArcadeGameAction).toHaveBeenCalledWith({
        gameCode: "real-o-ia",
        itemId: "real-o-ia-001",
      });
    });
  });

  it("feed-60: proyecta el reloj del companion y envía verify sin bloquear", async () => {
    const user = userEvent.setup();
    const base: GameStateWithCompanion = {
      ...activeState("feed-60", "feed-60-001", 10),
      companion: {
        kind: "feed-60",
        verified: false,
        verificationHints: [],
        remainingSeconds: 57,
      },
    };
    const verified: GameStateWithCompanion = {
      ...base,
      companion: {
        kind: "feed-60",
        verified: true,
        verificationHints: ["Fuente: sitio oficial del Ministerio de Salud."],
        remainingSeconds: 53,
      },
    };

    submitGameActionAction.mockResolvedValue({ ok: true, data: verified });

    render(
      <ArcadePlaySession
        gameCode="feed-60"
        gameName="Feed 60”"
        objective="Decide en 60 segundos."
        introMechanic="Mecánica: timed feed · 10 publicaciones · máximo 30 puntos"
        introSubmitLabel="Abrir el feed de 60 segundos"
        itemNoun="Publicación"
        siftFocus={["find", "trace"]}
        initialState={base}
      />,
    );

    expect(screen.getByRole("timer")).toHaveTextContent(/57 s/);

    await user.click(screen.getByRole("button", { name: /verificar/i }));

    await waitFor(() => {
      expect(submitGameActionAction).toHaveBeenCalledWith({
        gameCode: "feed-60",
        itemId: "feed-60-001",
        input: { kind: "feed_action", value: "verify" },
      });
    });

    expect(
      await screen.findByText(/sitio oficial del Ministerio de Salud/i),
    ).toBeVisible();
  });

  it("feed-60: tras decidir muestra pulso y auto-avanza sin Decisión aceptada", async () => {
    const user = userEvent.setup();
    const withFeedback: GameStateWithCompanion = {
      ...activeState("feed-60", "feed-60-001", 10),
      status: "feedback",
      nextAction: "advance",
      feedback: {
        status: "correct",
        explanation: "Es un aviso oficial útil.",
        signals: [
          "Encuentra mejor cobertura: otros medios serios replican la campaña.",
        ],
        recommendation: "Comparte cuando la fuente oficial coincide.",
        revealedAnswer: "Compartir",
      },
      provisionalScore: {
        points: 2,
        maxPoints: 30,
        correct: 1,
        errors: 0,
        bonusPoints: 0,
        penaltyPoints: 0,
        timeLimitSeconds: 60,
        timeUsedSeconds: null,
      },
      companion: {
        kind: "feed-60",
        verified: false,
        verificationHints: [],
        remainingSeconds: 48,
      },
    };
    const nextPost: GameStateWithCompanion = {
      ...activeState("feed-60", "feed-60-002", 10, { position: 1 }),
      companion: {
        kind: "feed-60",
        verified: false,
        verificationHints: [],
        remainingSeconds: 48,
      },
    };

    advanceArcadeGameAction.mockResolvedValue({ ok: true, data: nextPost });

    render(
      <ArcadePlaySession
        gameCode="feed-60"
        gameName="Feed 60”"
        objective="Decide en 60 segundos."
        introMechanic="Mecánica: timed feed · 10 publicaciones · máximo 30 puntos"
        introSubmitLabel="Abrir el feed de 60 segundos"
        itemNoun="Publicación"
        siftFocus={["find", "trace"]}
        initialState={withFeedback}
      />,
    );

    expect(screen.getByTestId("feed-decision-pulse")).toBeVisible();
    expect(
      screen.queryByRole("region", { name: "Feedback educativo" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Decisión aceptada/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/Encuentra mejor cobertura: otros medios serios/i),
    ).toBeVisible();
    expect(screen.getByRole("timer")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /continuar/i }));

    await waitFor(() => {
      expect(advanceArcadeGameAction).toHaveBeenCalledWith({
        gameCode: "feed-60",
        itemId: "feed-60-001",
      });
    });
  });

  it("mente-maestra: al terminar muestra la autopsia sin redirigir", () => {
    const finished: GameStateWithCompanion = {
      ...activeState("mente-maestra", "mente-maestra-004", 4, {
        status: "finished",
        position: 4,
        item: null,
        feedback: null,
        nextAction: "result",
        provisionalScore: {
          points: 4,
          maxPoints: 4,
          correct: 4,
          errors: 0,
          bonusPoints: 0,
          penaltyPoints: 0,
          timeLimitSeconds: null,
          timeUsedSeconds: null,
        },
      }),
      companion: {
        kind: "mente-maestra",
        selections: [
          { step: "objective", optionId: "objective-health-panic", label: "Sembrar pánico sanitario" },
        ],
        selectedOptionId: null,
        simulatedReach: 90,
        autopsyEntries: [
          {
            step: "objective",
            title: "Pánico sanitario",
            tip: "Verifica el canal institucional.",
            siftStep: "investigate",
          },
        ],
        fictionalComments: ["@preocupado22: COMPARTIDO."],
        educationalDisclaimer: "Simulación educativa.",
      },
    };

    render(
      <ArcadePlaySession
        gameCode="mente-maestra"
        gameName="Mente Maestra"
        objective="Desarma una fake news."
        introMechanic="Mecánica: guided autopsy · 4 pasos · máximo 4 puntos"
        introSubmitLabel="Entrar al laboratorio de desinformación"
        itemNoun="Paso"
        siftFocus={["investigate", "trace"]}
        initialState={finished}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /autopsia de tu fake news/i }),
    ).toBeVisible();
    expect(screen.getByText(/90 de 95/)).toBeVisible();
    expect(screen.getByRole("link", { name: /^resultado$/i })).toHaveAttribute(
      "href",
      "/games/mente-maestra/result",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("muestra el formulario de alias sin sesión para cualquier misión", () => {
    render(
      <ArcadePlaySession
        gameCode="radar-de-fuentes"
        gameName="Radar de Fuentes"
        objective="Evalúa la credibilidad."
        introMechanic="Mecánica: source classification · 9 fuentes · máximo 9 puntos"
        introSubmitLabel="Encender el radar"
        itemNoun="Fuente"
        siftFocus={["investigate", "trace"]}
        initialState={null}
      />,
    );

    expect(screen.getByLabelText(/elige un alias temporal/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /encender el radar/i }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: /volver al arcade/i })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
