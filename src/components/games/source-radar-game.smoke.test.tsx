import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  SourceRadarGame,
  type SourceRadarItem,
} from "./source-radar-game";

function makeItem(overrides: Partial<SourceRadarItem> = {}): SourceRadarItem {
  return {
    gameCode: "radar-de-fuentes",
    mechanic: "source_classification",
    itemId: "radar-de-fuentes-test",
    prompt: "Lee el dominio, la autoría y las referencias. ¿Dónde ubicas esta fuente?",
    sourceName: "UNESCO — sitio oficial",
    urlLabel: "https://www.unesco.org/es/articles",
    description:
      "Artículo con autor institucional, fecha de publicación y referencias a documentos oficiales.",
    categories: ["reliable", "doubtful", "fraudulent"],
    ...overrides,
  };
}

describe("SourceRadarGame (smoke)", () => {
  it("presenta prompt, fuente, URL visible y las tres categorías", () => {
    render(<SourceRadarGame item={makeItem()} onClassify={() => {}} />);

    expect(
      screen.getByRole("heading", { name: /¿Dónde ubicas esta fuente\?/ }),
    ).toBeVisible();
    expect(
      screen.getByText(/UNESCO — sitio oficial/),
    ).toBeVisible();
    expect(
      screen.getByText(/https:\/\/www\.unesco\.org\/es\/articles/),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: /Confiable/ }),
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: /Dudosa/ })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: /Fraudulenta/ }),
    ).toBeEnabled();
  });

  it("emite la misma clasificación por botón y anuncia la categoría elegida", async () => {
    const user = userEvent.setup();
    const onClassify = vi.fn();
    render(<SourceRadarGame item={makeItem()} onClassify={onClassify} />);

    await user.click(screen.getByRole("button", { name: /Confiable/ }));
    expect(onClassify).toHaveBeenCalledWith({ value: "reliable" });
  });

  it("anuncia la categoría elegida cuando la resolución llega del estado", () => {
    render(
      <SourceRadarGame
        item={makeItem()}
        onClassify={() => {}}
        selectedCategory="reliable"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Clasificaste Confiable.",
    );
  });

  it("navega categorías con flechas y emite la selección con teclado", async () => {
    const user = userEvent.setup();
    const onClassify = vi.fn();
    render(<SourceRadarGame item={makeItem()} onClassify={onClassify} />);

    const buttons = screen.getAllByRole("button");
    buttons[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(buttons[1]).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(buttons[2]).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onClassify).toHaveBeenCalledWith({ value: "fraudulent" });
  });

  it("devuelve el foco a la tarjeta al resolver y bloquea los controles", () => {
    render(
      <SourceRadarGame
        item={makeItem()}
        onClassify={() => {}}
        selectedCategory="doubtful"
      />,
    );

    const card = screen.getByRole("group", { name: /UNESCO — sitio oficial/ });
    expect(card).toHaveFocus();

    expect(screen.getByRole("button", { name: /Confiable/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Dudosa/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Fraudulenta/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Dudosa/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
