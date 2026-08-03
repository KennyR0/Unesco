import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  MisinformationAutopsyGame,
  type MisinformationAutopsyItem,
} from "./misinformation-autopsy-game";

function makeItem(
  overrides: Partial<MisinformationAutopsyItem> = {},
): MisinformationAutopsyItem {
  return {
    gameCode: "mente-maestra",
    mechanic: "guided_autopsy",
    itemId: "mente-maestra-test",
    step: "emotion",
    prompt: "Paso 2 · Elige la emoción-gancho que empujaría a compartir sin verificar.",
    options: [
      {
        optionId: "emotion-fear",
        label: "Miedo",
        description: "Asusta para saltarse la verificación.",
      },
      {
        optionId: "emotion-anger",
        label: "Enojo",
        description: "Indignación fabricada para el reenvío.",
      },
      {
        optionId: "emotion-miracle-hope",
        label: "Esperanza milagrosa",
        description: "Promesa imposible sin pruebas.",
      },
    ],
    ...overrides,
  };
}

describe("MisinformationAutopsyGame (smoke T064)", () => {
  it("presenta progreso textual, prompt y opciones del paso", () => {
    render(
      <MisinformationAutopsyGame item={makeItem()} onChoose={() => {}} />,
    );

    expect(screen.getByText(/Paso 2 de 4: Emoción/)).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: /Elige la emoción-gancho/,
      }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /Miedo/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Enojo/ })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: /Esperanza milagrosa/ }),
    ).toBeEnabled();
  });

  it("emite la opción elegida y muestra selecciones persistidas de sesión", async () => {
    const user = userEvent.setup();
    const onChoose = vi.fn();

    render(
      <MisinformationAutopsyGame
        item={makeItem()}
        onChoose={onChoose}
        sessionSelections={[
          {
            step: "objective",
            optionId: "objective-health-panic",
            label: "Pánico sanitario",
          },
        ]}
      />,
    );

    expect(screen.getByText(/Selecciones de esta sesión/)).toBeVisible();
    expect(screen.getByText(/Pánico sanitario/)).toBeVisible();

    await user.click(screen.getByRole("button", { name: /Miedo/ }));
    expect(onChoose).toHaveBeenCalledWith({ optionId: "emotion-fear" });
  });

  it("anuncia la selección persistida y bloquea controles al resolver", () => {
    render(
      <MisinformationAutopsyGame
        item={makeItem()}
        onChoose={() => {}}
        selectedOptionId="emotion-fear"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Elegiste Miedo.");
    expect(screen.getByRole("button", { name: /Miedo/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Miedo/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("heading", { name: /emoción-gancho/ })).toHaveFocus();
  });

  it("muestra alcance simulado y autopsia inline sin publicación externa", () => {
    render(
      <MisinformationAutopsyGame
        item={null}
        simulatedReach={82}
        fictionalComments={[
          "@esceptico_ok: ¿Fuente? Esto huele raro.",
        ]}
        educationalDisclaimer="Simulación educativa: no se publica contenido externo."
        autopsyEntries={[
          {
            step: "emotion",
            title: "Miedo",
            tip: "Si una publicación te asusta, detente.",
          },
          {
            step: "evidence",
            title: "Foto antigua reciclada",
            tip: "Usa búsqueda inversa de imágenes.",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /Autopsia de tu fake news/ }),
    ).toBeVisible();
    expect(screen.getByText(/82 de 95/)).toBeVisible();
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "82");
    expect(screen.getByText(/Miedo/)).toBeVisible();
    expect(screen.getByText(/Foto antigua reciclada/)).toBeVisible();
    expect(
      screen.getByText(/no se publica contenido externo/i),
    ).toBeVisible();
    expect(
      screen.getByText(/No se publicó nada fuera de esta simulación/),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /publicar|compartir|cuenta/i }),
    ).toBeNull();
  });

  it("navega opciones con flechas y confirma con teclado", async () => {
    const user = userEvent.setup();
    const onChoose = vi.fn();
    render(
      <MisinformationAutopsyGame item={makeItem()} onChoose={onChoose} />,
    );

    const buttons = screen.getAllByRole("button");
    buttons[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(buttons[1]).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onChoose).toHaveBeenCalledWith({ optionId: "emotion-anger" });
  });
});
