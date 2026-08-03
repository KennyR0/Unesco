import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RealOrIaGame, type RealOrIaItem } from "./real-o-ia-game";

function makeItem(overrides: Partial<RealOrIaItem> = {}): RealOrIaItem {
  return {
    gameCode: "real-o-ia",
    mechanic: "image_verdict",
    itemId: "real-o-ia-test",
    prompt: "¿Real o generada por IA?",
    context: "Subida hace 2 horas · 12.4k compartidos.",
    media: {
      kind: "image",
      src: "/media/real-o-ia/ai/imagen-01-768.webp",
      alt: "Retrato de una persona sonriendo en un parque.",
      decorative: false,
      width: 768,
      height: 434,
      fallbackText:
        "La imagen no está disponible; la pregunta y el feedback se conservan.",
      srcSet: {
        "480": "/media/real-o-ia/ai/imagen-01-480.webp",
        "768": "/media/real-o-ia/ai/imagen-01-768.webp",
        "1280": "/media/real-o-ia/ai/imagen-01-1280.webp",
      },
    },
    choices: ["real", "ai"],
    ...overrides,
  };
}

describe("RealOrIaGame", () => {
  it("presenta prompt, contexto, imagen con alt y las dos decisiones", () => {
    render(<RealOrIaGame item={makeItem()} onVerdict={() => {}} />);

    expect(
      screen.getByRole("heading", { name: "¿Real o generada por IA?" }),
    ).toBeVisible();
    expect(screen.getByText(/12\.4k compartidos/)).toBeVisible();
    expect(
      screen.getByRole("img", {
        name: "Retrato de una persona sonriendo en un parque.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Real" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Generada por IA" }),
    ).toBeEnabled();
  });

  it("emite el veredicto correspondiente al pulsar cada botón", async () => {
    const user = userEvent.setup();
    const onVerdict = vi.fn();
    render(<RealOrIaGame item={makeItem()} onVerdict={onVerdict} />);

    await user.click(screen.getByRole("button", { name: "Real" }));
    expect(onVerdict).toHaveBeenCalledWith("real");

    await user.click(screen.getByRole("button", { name: "Generada por IA" }));
    expect(onVerdict).toHaveBeenCalledWith("ai");
    expect(onVerdict).toHaveBeenCalledTimes(2);
  });

  it("responde con teclado: Enter, Espacio y flechas entre opciones", async () => {
    const user = userEvent.setup();
    const onVerdict = vi.fn();
    render(<RealOrIaGame item={makeItem()} onVerdict={onVerdict} />);

    const realButton = screen.getByRole("button", { name: "Real" });
    const aiButton = screen.getByRole("button", { name: "Generada por IA" });

    realButton.focus();
    await user.keyboard("{Enter}");
    expect(onVerdict).toHaveBeenCalledWith("real");

    await user.keyboard("{ArrowRight}");
    expect(aiButton).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(realButton).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(aiButton).toHaveFocus();

    await user.keyboard("[Space]");
    expect(onVerdict).toHaveBeenCalledWith("ai");
    expect(onVerdict).toHaveBeenCalledTimes(2);
  });

  it("bloquea los controles tras la elección y anuncia el veredicto elegido", () => {
    render(
      <RealOrIaGame
        item={makeItem()}
        onVerdict={() => {}}
        selectedVerdict="ai"
      />,
    );

    const realButton = screen.getByRole("button", { name: "Real" });
    const aiButton = screen.getByRole("button", { name: "Generada por IA" });

    expect(realButton).toBeDisabled();
    expect(aiButton).toBeDisabled();
    expect(aiButton).toHaveAttribute("aria-pressed", "true");
    expect(realButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Elegiste: Generada por IA.")).toBeInTheDocument();
  });

  it("muestra el fallback textual si la imagen falla y conserva los controles", () => {
    render(<RealOrIaGame item={makeItem()} onVerdict={() => {}} />);

    fireEvent.error(
      screen.getByRole("img", {
        name: "Retrato de una persona sonriendo en un parque.",
      }),
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.getByText(/La imagen no está disponible/),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Real" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Generada por IA" }),
    ).toBeEnabled();
  });

  it("usa el fallback cuando la media es none y sigue permitiendo responder", async () => {
    const user = userEvent.setup();
    const onVerdict = vi.fn();
    const item = makeItem({
      media: {
        kind: "none",
        src: null,
        alt: null,
        decorative: true,
        width: null,
        height: null,
        fallbackText:
          "Caso sin imagen: decide con el contexto y conserva el feedback.",
      },
    });

    render(<RealOrIaGame item={item} onVerdict={onVerdict} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(/Caso sin imagen/)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Real" }));
    expect(onVerdict).toHaveBeenCalledWith("real");
  });
});
