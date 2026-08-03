import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import GamePage from "./page";

const { notFoundMock, getArcadeGameStateServerMock, push } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  getArcadeGameStateServerMock: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
  useRouter: () => ({ push }),
}));

vi.mock("../../actions/game", () => ({
  startArcadeGameFormAction: vi.fn(),
  submitGameActionAction: vi.fn(),
  advanceArcadeGameAction: vi.fn(),
}));

vi.mock("../../../features/game/application/server-operations", () => ({
  getArcadeGameStateServer: (...args: unknown[]) =>
    getArcadeGameStateServerMock(...args),
}));

describe("GamePage", () => {
  beforeEach(() => {
    notFoundMock.mockClear();
    push.mockReset();
    getArcadeGameStateServerMock.mockReset();
    getArcadeGameStateServerMock.mockResolvedValue({
      ok: false,
      error: {
        code: "SESSION_NOT_FOUND",
        message: "No hay una partida recuperable.",
        retryable: false,
      },
    });
  });

  it("monta el intro jugable con formulario de alias para un juego del catálogo", async () => {
    render(
      await GamePage({
        params: Promise.resolve({ gameCode: "real-o-ia" }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(screen.getByRole("heading", { name: "¿Real o IA?" })).toBeInTheDocument();
    expect(
      screen.getAllByText(/Detectar señales visuales de imágenes sintéticas/i)
        .length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(/Mecánica: image verdict · 8 imágenes · máximo 80 puntos/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/elige un alias temporal/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /empezar a analizar imágenes/i }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: /volver al arcade/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(getArcadeGameStateServerMock).toHaveBeenCalledWith({
      gameCode: "real-o-ia",
    });
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it("monta el intro jugable de cualquier misión disponible", async () => {
    render(
      await GamePage({
        params: Promise.resolve({ gameCode: "mente-maestra" }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(
      screen.getByLabelText(/elige un alias temporal/i),
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: /entrar al laboratorio de desinformación/i,
      }),
    ).toBeVisible();
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it("envía códigos desconocidos al not-found sin usar un juego por defecto", async () => {
    await expect(
      GamePage({
        params: Promise.resolve({ gameCode: "no-existe" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFoundMock).toHaveBeenCalledOnce();
  });
});
