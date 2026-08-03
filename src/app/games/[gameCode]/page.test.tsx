import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import GamePage from "./page";

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

describe("GamePage", () => {
  beforeEach(() => {
    notFoundMock.mockClear();
  });

  it("resuelve un juego permitido desde el catálogo", async () => {
    render(
      await GamePage({
        params: Promise.resolve({ gameCode: "real-o-ia" }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(screen.getByRole("heading", { name: "¿Real o IA?" })).toBeInTheDocument();
    expect(
      screen.getByText(/Detectar señales visuales de imágenes sintéticas/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver al arcade/i })).toHaveAttribute(
      "href",
      "/",
    );
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
