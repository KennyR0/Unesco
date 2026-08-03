import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FeedbackCard } from "./feedback-card";

describe("FeedbackCard", () => {
  it("muestra vista compacta por defecto y revela el detalle bajo demanda", async () => {
    const user = userEvent.setup();

    render(
      <FeedbackCard
        feedback={{
          status: "instructive",
          explanation: "Revisa el tono del mensaje.",
          signals: ["Urgencia artificial", "Fuente sin verificar"],
          recommendation: "Pausa antes de reenviar.",
          revealedAnswer: "Verificar",
        }}
      />,
    );

    expect(screen.getByText("Pista para seguir")).toBeVisible();
    expect(screen.getByText("Revisa el tono del mensaje.")).toBeVisible();
    expect(screen.getByText("Urgencia artificial")).toBeVisible();
    expect(screen.getByText("Pausa antes de reenviar.")).toBeVisible();

    expect(screen.queryByText("Fuente sin verificar")).not.toBeInTheDocument();
    expect(screen.queryByText("Verificar")).not.toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: "Ver detalle" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);

    expect(screen.getByText("Fuente sin verificar")).toBeVisible();
    expect(screen.getByText("Verificar")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Ocultar detalle" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("expone todo el contenido cuando una sola señal no necesita detalle", () => {
    render(
      <FeedbackCard
        feedback={{
          status: "correct",
          explanation: "Coincide con el contexto.",
          signals: ["La fecha es visible."],
          recommendation: "Sigue comprobando la fuente.",
          revealedAnswer: null,
        }}
      />,
    );

    expect(screen.getByText("La fecha es visible.")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /detalle/i }),
    ).not.toBeInTheDocument();
  });
});
