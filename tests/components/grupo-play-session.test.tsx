import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GameState } from "@antidoto/contracts";

import { GrupoPlaySession } from "../../src/components/game/grupo-play-session";
import { createContentRepository } from "../../src/features/game/content/content-repository";
import contentPack from "../../src/features/game/content/game-items/grupo.v1.json";

const startGrupoGameFormAction = vi.fn();
const startArcadeGameFormAction = vi.fn();
const submitGameActionAction = vi.fn();
const advanceArcadeGameAction = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("../../src/app/actions/game", () => ({
  startGrupoGameFormAction: (...args: unknown[]) =>
    startGrupoGameFormAction(...args),
  startArcadeGameFormAction: (...args: unknown[]) =>
    startArcadeGameFormAction(...args),
  startArcadeGuestGameFormAction: vi.fn(),
  startArcadeGameAction: vi.fn(),
  submitGameActionAction: (...args: unknown[]) => submitGameActionAction(...args),
  advanceArcadeGameAction: (...args: unknown[]) =>
    advanceArcadeGameAction(...args),
}));

const repository = createContentRepository(contentPack, {
  activeVersion: "2026-07-30.1",
});

function activeState(overrides: Partial<GameState> = {}): GameState {
  const item = repository.getPublicItem("grupo", "grupo-001");
  if (!item || item.gameCode !== "grupo") {
    throw new Error("missing grupo item");
  }

  return {
    sessionId: "session-grupo",
    gameCode: "grupo",
    mechanic: "group_decision",
    status: "active",
    alias: "Ana",
    position: 0,
    total: 6,
    item,
    feedback: null,
    provisionalScore: null,
    nextAction: "submit",
    ...overrides,
  };
}

describe("GrupoPlaySession", () => {
  beforeEach(() => {
    startGrupoGameFormAction.mockReset();
    submitGameActionAction.mockReset();
    advanceArcadeGameAction.mockReset();
    push.mockReset();
  });

  it("muestra el formulario de alias sin sesión", () => {
    render(
      <GrupoPlaySession
        gameName="El Grupo"
        objective="Decide con cuidado en el chat familiar."
        initialState={null}
      />,
    );

    expect(
      screen.getByRole("button", { name: /entrar al chat familiar/i }),
    ).toBeVisible();
    expect(screen.getByLabelText(/elige un alias temporal/i)).toBeVisible();
  });

  it("monta el chat cuando ya hay estado activo", () => {
    render(
      <GrupoPlaySession
        gameName="El Grupo"
        objective="Decide con cuidado en el chat familiar."
        initialState={activeState()}
      />,
    );

    expect(screen.getByText(/En el chat familiar llega/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /Verificar/i })).toBeVisible();
  });

  it("envía group_action y avanza tras aceptar feedback", async () => {
    const user = userEvent.setup();
    const base = activeState();
    const withFeedback: GameState = {
      ...base,
      status: "feedback",
      nextAction: "advance",
      feedback: {
        status: "correct",
        explanation: "Verificar protege al grupo.",
        signals: ["Contrastaste la fuente."],
        recommendation: "Sigue verificando.",
        revealedAnswer: "Verificar",
      },
      provisionalScore: {
        points: 2,
        maxPoints: 12,
        correct: null,
        errors: 0,
        bonusPoints: 0,
        penaltyPoints: 0,
        timeLimitSeconds: null,
        timeUsedSeconds: null,
      },
    };
    const nextScene = activeState({
      position: 1,
      item: repository.getPublicItem("grupo", "grupo-002"),
    });

    submitGameActionAction.mockResolvedValue({ ok: true, data: withFeedback });
    advanceArcadeGameAction.mockResolvedValue({ ok: true, data: nextScene });

    render(
      <GrupoPlaySession
        gameName="El Grupo"
        objective="Decide con cuidado."
        initialState={base}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Verificar/i }));
    const feedback = await screen.findByRole("region", {
      name: "Feedback educativo",
    });
    expect(feedback).toHaveTextContent(/Verificar protege al grupo/i);

    await user.click(
      await screen.findByRole("button", { name: /Continuar/i }),
    );

    await waitFor(() => {
      expect(advanceArcadeGameAction).toHaveBeenCalledWith({
        gameCode: "grupo",
        itemId: "grupo-001",
      });
    });
  });
});
