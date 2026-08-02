import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { GameCatalogEntry } from "@antidoto/contracts";

import { GameCard } from "./game-card";

const availableGame: GameCatalogEntry = {
  gameCode: "real-o-ia",
  mechanic: "image_verdict",
  name: "¿Real o IA?",
  objective: "Detectar señales visuales antes de dar una imagen por real.",
  route: "/games/real-o-ia",
  contentVersion: "2026-07-30.1",
  available: true,
};

const unavailableGame: GameCatalogEntry = {
  ...availableGame,
  gameCode: "grupo",
  mechanic: "group_decision",
  name: "El Grupo",
  route: "/games/grupo",
  available: false,
};

describe("GameCard", () => {
  it("expone una tarjeta disponible como enlace accesible a su ruta", () => {
    render(<GameCard game={availableGame} index={0} />);

    const card = screen.getByRole("article");
    const link = screen.getByRole("link", { name: /abrir ¿real o ia\?/i });

    expect(card).toHaveAttribute("data-availability", "available");
    expect(card).toHaveAttribute("data-game-code", "real-o-ia");
    expect(screen.getByRole("heading", { name: availableGame.name })).toBeInTheDocument();
    expect(screen.getByText(availableGame.objective)).toBeInTheDocument();
    expect(link).toHaveAttribute("href", availableGame.route);
    expect(link).toHaveAttribute("aria-label", `Abrir ${availableGame.name}`);
    expect(link).not.toHaveAttribute("aria-disabled");
  });

  it("comunica una tarjeta no disponible sin crear un enlace inactivo", () => {
    render(<GameCard game={unavailableGame} index={1} />);

    const card = screen.getByRole("article");

    expect(card).toHaveAttribute("data-availability", "unavailable");
    expect(screen.getByRole("heading", { name: unavailableGame.name })).toBeInTheDocument();
    expect(screen.getByText(/próximamente/i)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
