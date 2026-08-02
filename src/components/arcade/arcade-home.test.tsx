import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { listAvailableArcadeCatalog } from "../../features/game/content/catalog";
import { ArcadeHome } from "./arcade-home";

describe("ArcadeHome", () => {
  it("muestra la firma visual, seis juegos y sus acciones", () => {
    render(<ArcadeHome games={listAvailableArcadeCatalog()} />);

    expect(
      screen.getByRole("heading", {
        name: /la mentira es viral\. la verdad se entrena/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /entrena el ojo.*rompe la cadena/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /navegación principal/i }),
    ).toBeVisible();
    expect(screen.getByText(/sift antes de compartir/i)).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(6);

    for (const game of listAvailableArcadeCatalog()) {
      const heading = screen.getByRole("heading", { name: game.name });
      const card = heading.closest("article");

      expect(heading).toBeInTheDocument();
      expect(card).toHaveAttribute("data-game-code", game.gameCode);
      expect(screen.getByText(game.objective)).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: new RegExp(`abrir ${game.name}`, "i") }),
      ).toHaveAttribute("href", game.route);
    }

    expect(screen.queryByText(/ranking/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
