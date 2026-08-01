import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeedbackPanel } from "./feedback-panel";

describe("FeedbackPanel arcade", () => {
  it("anuncia resultado, explicación, señales, recomendación y siguiente acción", () => {
    render(
      <FeedbackPanel
        feedback={{
          status: "correct",
          explanation: "La respuesta coincide con las señales observables.",
          signals: ["La fuente conserva contexto."],
          recommendation: "Comprueba la fuente original antes de compartir.",
          revealedAnswer: "Verificar",
        }}
        nextAction={<button type="button">Continuar</button>}
      />,
    );

    expect(screen.getByRole("region", { name: "Feedback educativo" })).toBeVisible();
    expect(screen.getByText("La respuesta coincide con las señales observables.")).toBeVisible();
    expect(screen.getByText("La fuente conserva contexto.")).toBeVisible();
    expect(screen.getByText("Comprueba la fuente original antes de compartir.")).toBeVisible();
    expect(screen.getByText("Respuesta revelada:")).toBeVisible();
    expect(screen.getByText("Verificar")).toBeVisible();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeVisible();
  });
});
