import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import HomePage from "../../src/app/page";

describe("página inicial", () => {
  it("presenta la firma visual y seis misiones sin formulario ni ranking", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: /la mentira es viral\. la verdad se entrena/i,
      }),
    ).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ranking/i })).not.toBeInTheDocument();
  });

  it("permite alcanzar la primera misión con teclado", async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    const firstMission = screen.getByRole("link", { name: "Abrir ¿Real o IA?" });

    for (let index = 0; index < 12 && document.activeElement !== firstMission; index += 1) {
      await user.tab();
    }

    expect(firstMission).toHaveFocus();
  });
});
