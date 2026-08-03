import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GameResult } from "@antidoto/contracts";

import GameResultPage from "./page";

const { notFoundMock, getArcadeGameResultServerMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  getArcadeGameResultServerMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("../../../../features/game/application/server-operations", () => ({
  getArcadeGameResultServer: getArcadeGameResultServerMock,
}));

const sampleResult: GameResult = {
  sessionId: "session-1",
  gameCode: "grupo",
  alias: "Lina",
  status: "finished",
  answered: 6,
  total: 6,
  learningSummary: "Elegiste cuidado antes de reenviar.",
  score: {
    points: 10,
    maxPoints: 12,
    correct: null,
    errors: 1,
    bonusPoints: 0,
    penaltyPoints: 0,
    timeLimitSeconds: null,
    timeUsedSeconds: null,
  },
  simulatedReach: null,
};

describe("GameResultPage", () => {
  beforeEach(() => {
    notFoundMock.mockClear();
    getArcadeGameResultServerMock.mockReset();
  });

  it("proyecta el cierre de partida sin mover el feedback educativo", async () => {
    getArcadeGameResultServerMock.mockResolvedValue({
      ok: true,
      data: sampleResult,
    });

    render(
      await GameResultPage({
        params: Promise.resolve({ gameCode: "grupo" }),
      }),
    );

    expect(getArcadeGameResultServerMock).toHaveBeenCalledWith({
      gameCode: "grupo",
    });
    expect(screen.getByRole("main")).toHaveAttribute("data-game-code", "grupo");
    expect(screen.getByRole("main")).toHaveAttribute(
      "data-session-status",
      "finished",
    );
    expect(
      screen.getByText("Elegiste cuidado antes de reenviar."),
    ).toBeVisible();
    expect(screen.getByLabelText("Puntuación de la partida")).toHaveTextContent(
      "10 de 12",
    );
    expect(
      screen.getByRole("link", { name: /consultar ranking global \(opcional\)/i }),
    ).toHaveAttribute("href", "/leaderboard");
    expect(
      screen.queryByRole("region", { name: "Feedback educativo" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Qué hacer")).not.toBeInTheDocument();
  });

  it("envía códigos desconocidos al not-found", async () => {
    await expect(
      GameResultPage({
        params: Promise.resolve({ gameCode: "no-existe" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledOnce();
    expect(getArcadeGameResultServerMock).not.toHaveBeenCalled();
  });

  it("muestra estado seguro cuando no hay sesión recuperable", async () => {
    getArcadeGameResultServerMock.mockResolvedValue({
      ok: false,
      error: {
        code: "SESSION_NOT_FOUND",
        message: "No hay una partida recuperable.",
        retryable: false,
      },
    });

    render(
      await GameResultPage({
        params: Promise.resolve({ gameCode: "feed-60" }),
      }),
    );

    expect(screen.getByRole("main")).toHaveAttribute(
      "data-recovery-state",
      "missing",
    );
    expect(
      screen.queryByRole("region", { name: "Feedback educativo" }),
    ).not.toBeInTheDocument();
  });
});
