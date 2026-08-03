import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GameShell } from "./game-shell";

describe("GameShell arcade", () => {
  it("expone progreso, estado, error y feedback inline en una sola vista", () => {
    render(
      <GameShell
        title="¿Real o IA?"
        eyebrow="Misión 1"
        gameCode="real-o-ia"
        status="feedback"
        progress={{ current: 2, total: 8 }}
        error="Debes revisar esta acción."
        feedback={{
          status: "incorrect",
          explanation: "La decisión necesita más contexto.",
          signals: ["La fecha no está confirmada."],
          recommendation: "Busca la fuente original.",
          revealedAnswer: "Real",
        }}
        nextAction={<button type="button">Siguiente item</button>}
      >
        <p>Contenido público del item.</p>
        <button type="button">Responder otra vez</button>
      </GameShell>,
    );

    expect(screen.getByRole("main", { name: "¿Real o IA?" })).toBeVisible();
    expect(screen.getByText("Misión 1")).toBeVisible();
    expect(screen.getByText("Progreso: 2 de 8")).toBeVisible();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
    expect(screen.getByRole("main")).toHaveAttribute(
      "data-game-code",
      "real-o-ia",
    );
    expect(screen.getByRole("main")).toHaveAttribute(
      "data-feedback-pending",
      "true",
    );
    expect(screen.getByText("Respuesta recibida")).toBeVisible();
    expect(
      screen.getByRole("region", { name: "Feedback educativo" }),
    ).toHaveAttribute("aria-describedby");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Debes revisar esta acción.",
    );
    // Con feedback pendiente, el área de juego se oculta (no solo inert).
    const content = screen
      .getByText("Contenido público del item.")
      .closest(".game-shell__content");
    expect(content).not.toBeVisible();
    expect(content).toHaveAttribute("inert");
    expect(screen.getByText("La decisión necesita más contexto.")).toBeVisible();

    // La acción siguiente se ofrece de inmediato (flujo de un solo clic).
    expect(screen.getByRole("button", { name: "Siguiente item" })).toBeVisible();
  });

  it("anuncia procesamiento y limita el progreso a sus bordes", () => {
    render(
      <GameShell
        title="Feed 60"
        status="processing"
        progress={{ current: 99, total: 10 }}
      >
        <p>Procesando respuesta.</p>
      </GameShell>,
    );

    expect(screen.getByRole("main", { name: "Feed 60" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByText("Procesando respuesta")).toBeVisible();
    expect(screen.getByText("Progreso: 10 de 10")).toBeVisible();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "10");
  });
});
