import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { listAvailableArcadeCatalog } from "../../features/game/content/catalog";
import { ArcadeHome } from "./arcade-home";

describe("ArcadeHome", () => {
  it("muestra los seis juegos, sus objetivos y acciones de apertura", () => {
    render(<ArcadeHome games={listAvailableArcadeCatalog()} />);

    expect(
      screen.getByRole("heading", { name: /por dónde quieres empezar/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(6);

    for (const game of listAvailableArcadeCatalog()) {
      expect(screen.getByRole("heading", { name: game.name })).toBeInTheDocument();
      expect(screen.getByText(game.objective)).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: new RegExp(`abrir ${game.name}`, "i") }),
      ).toHaveAttribute("href", game.route);
    }

    expect(screen.queryByText(/ranking/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
