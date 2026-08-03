import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  SourceRadarGame,
  type SourceRadarItem,
} from "../../src/components/games/source-radar-game";

function makeItem(): SourceRadarItem {
  return {
    gameCode: "radar-de-fuentes",
    mechanic: "source_classification",
    itemId: "radar-de-fuentes-t056",
    prompt: "¿Dónde ubicas esta fuente?",
    sourceName: "Observatorio con autoría",
    urlLabel: "https://observatorio.example.org/informe",
    description:
      "Publica autor, fecha, metodología y enlaces a sus fuentes primarias.",
    categories: ["reliable", "doubtful", "fraudulent"],
  };
}

describe("SourceRadarGame (T056)", () => {
  it("presenta la fuente y las tres categorías con nombres textuales", () => {
    render(<SourceRadarGame item={makeItem()} onClassify={() => {}} />);

    expect(
      screen.getByRole("heading", { name: "¿Dónde ubicas esta fuente?" }),
    ).toBeVisible();
    expect(
      screen.getByRole("group", { name: "Observatorio con autoría" }),
    ).toHaveAccessibleDescription(
      expect.stringContaining("https://observatorio.example.org/informe"),
    );
    expect(
      screen.getByRole("group", { name: "Categorías del radar" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /Confiable/ })).toHaveTextContent(
      "Verificable, con autor y rendición de cuentas",
    );
    expect(screen.getByRole("button", { name: /Dudosa/ })).toHaveTextContent(
      "Opinión, sátira o información incompleta",
    );
    expect(
      screen.getByRole("button", { name: /Fraudulenta/ }),
    ).toHaveTextContent("Engaño deliberado: suplantación o estafa");
  });

  it("emite una clasificación y anuncia en texto la categoría aceptada", async () => {
    const user = userEvent.setup();
    const onClassify = vi.fn();
    const item = makeItem();
    const { rerender } = render(
      <SourceRadarGame item={item} onClassify={onClassify} />,
    );

    await user.click(screen.getByRole("button", { name: /Dudosa/ }));

    expect(onClassify).toHaveBeenCalledTimes(1);
    expect(onClassify).toHaveBeenCalledWith({ value: "doubtful" });

    rerender(
      <SourceRadarGame
        item={item}
        onClassify={onClassify}
        selectedCategory="doubtful"
      />,
    );

    const chosen = screen.getByRole("button", { name: /Dudosa/ });
    expect(chosen).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Clasificaste Dudosa.",
    );
    expect(
      screen.getByRole("group", { name: "Observatorio con autoría" }),
    ).toHaveFocus();
    expect(screen.getAllByRole("button")).toHaveLength(3);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });

  it("recorre las categorías con flechas y confirma con teclado", async () => {
    const user = userEvent.setup();
    const onClassify = vi.fn();
    render(<SourceRadarGame item={makeItem()} onClassify={onClassify} />);

    const reliable = screen.getByRole("button", { name: /Confiable/ });
    const doubtful = screen.getByRole("button", { name: /Dudosa/ });
    const fraudulent = screen.getByRole("button", { name: /Fraudulenta/ });

    reliable.focus();
    await user.keyboard("{ArrowRight}");
    expect(doubtful).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(fraudulent).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(reliable).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(fraudulent).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(onClassify).toHaveBeenCalledWith({ value: "fraudulent" });
  });
});
