import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GameShell } from "./game-shell";

describe("GameShell arcade", () => {
  it("expone progreso, estado, error y feedback inline en una sola vista", () => {
    render(
      <GameShell
        title="¿Real o IA?"
        eyebrow="Misión 1"
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
      </GameShell>,
    );

    expect(screen.getByRole("main", { name: "¿Real o IA?" })).toBeVisible();
    expect(screen.getByText("Misión 1")).toBeVisible();
    expect(screen.getByText("Progreso: 2 de 8")).toBeVisible();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
    expect(screen.getByRole("status")).toHaveTextContent("Respuesta recibida");
    expect(screen.getByRole("alert")).toHaveTextContent("Debes revisar esta acción.");
    expect(screen.getByText("Contenido público del item.")).toBeVisible();
    expect(screen.getByText("La decisión necesita más contexto.")).toBeVisible();
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

