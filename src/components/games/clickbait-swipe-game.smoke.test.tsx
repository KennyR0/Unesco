import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  ClickbaitSwipeGame,
  type ClickbaitSwipeItem,
} from "./clickbait-swipe-game";

function makeItem(overrides: Partial<ClickbaitSwipeItem> = {}): ClickbaitSwipeItem {
  return {
    gameCode: "clickbait-swipe",
    mechanic: "headline_classification",
    itemId: "clickbait-swipe-test",
    prompt: "¿Periodismo o clickbait?",
    headline: "¡¡URGENTE!! Los médicos ODIAN este truco",
    sourceLabel: "salud-milagrosa.xyz",
    actions: ["journalism", "clickbait"],
    keyboardEquivalent: true,
    ...overrides,
  };
}

describe("ClickbaitSwipeGame (smoke)", () => {
  it("presenta prompt, titular, fuente y las dos clasificaciones", () => {
    render(<ClickbaitSwipeGame item={makeItem()} onClassify={() => {}} />);

    expect(
      screen.getByRole("heading", { name: "¿Periodismo o clickbait?" }),
    ).toBeVisible();
    expect(screen.getByText(/Los médicos ODIAN/)).toBeVisible();
    expect(screen.getByText(/salud-milagrosa\.xyz/)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /Periodismo/ }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: /Clickbait/ }),
    ).toBeEnabled();
  });

  it("emite la misma clasificación por botón y por flecha de teclado", async () => {
    const user = userEvent.setup();
    const onClassify = vi.fn();
    render(<ClickbaitSwipeGame item={makeItem()} onClassify={onClassify} />);

    await user.click(screen.getByRole("button", { name: /Periodismo/ }));
    expect(onClassify).toHaveBeenCalledWith({
      value: "journalism",
      source: "button",
    });

    const card = screen.getByRole("group", { name: /Los médicos ODIAN/ });
    card.focus();
    await user.keyboard("{ArrowRight}");
    expect(onClassify).toHaveBeenCalledWith({
      value: "clickbait",
      source: "keyboard",
    });
    expect(onClassify).toHaveBeenCalledTimes(2);
  });

  it("bloquea controles tras resolver y devuelve el foco a la tarjeta", () => {
    render(
      <ClickbaitSwipeGame
        item={makeItem()}
        onClassify={() => {}}
        selectedClassification="clickbait"
      />,
    );

    const card = screen.getByRole("group", { name: /Los médicos ODIAN/ });
    expect(card).toHaveFocus();

    expect(screen.getByRole("button", { name: /Periodismo/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Clickbait/ })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Clickbait/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
