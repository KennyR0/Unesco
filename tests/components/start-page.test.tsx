import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import HomePage from "../../src/app/page";

const arcadeLinks = [
  "Abrir ¿Real o IA?",
  "Abrir El Grupo",
  "Abrir Clickbait Swipe",
  "Abrir Radar de Fuentes",
  "Abrir Feed 60”",
  "Abrir Mente Maestra",
];

describe("página inicial", () => {
  it("presenta las misiones del arcade sin formulario legacy ni ranking principal", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: "Juega a detectar lo que intenta engañarte.",
      }),
    ).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /ranking/i }),
    ).not.toBeInTheDocument();
  });

  it("permite alcanzar la primera misión con teclado", async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.tab();

    expect(screen.getByRole("link", { name: arcadeLinks[0] })).toHaveFocus();
  });
});