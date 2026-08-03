import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FeedbackPanel } from "./feedback-panel";

describe("FeedbackPanel arcade", () => {
  it("anuncia el resultado completo y ofrece la siguiente acción de inmediato", async () => {
    const user = userEvent.setup();

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

    const region = screen.getByRole("region", { name: "Feedback educativo" });
    expect(region).toBeVisible();
    expect(region).toHaveAttribute("data-feedback-persistent", "true");

    expect(
      screen.getByText("La respuesta coincide con las señales observables."),
    ).toBeVisible();
    expect(screen.getByText("La fuente conserva contexto.")).toBeVisible();
    expect(
      screen.getByText("Comprueba la fuente original antes de compartir."),
    ).toBeVisible();

    // Un solo clic: la acción siguiente está disponible sin gate previo.
    expect(screen.getByRole("button", { name: "Continuar" })).toBeVisible();

    // La respuesta revelada se expone al abrir el detalle progresivo.
    await user.click(screen.getByRole("button", { name: "Ver detalle" }));
    expect(screen.getByText("Respuesta revelada:")).toBeVisible();
    expect(screen.getByText("Verificar")).toBeVisible();

    const live = screen.getByRole("status");
    expect(live).toHaveAttribute("aria-live", "polite");
    expect(live).toHaveTextContent(/Resultado:/i);
    expect(live).toHaveTextContent(
      "La respuesta coincide con las señales observables.",
    );
  });

  it("mantiene el feedback visible sin auto-ocultarlo", () => {
    const { rerender } = render(
      <FeedbackPanel
        feedback={{
          status: "incorrect",
          explanation: "Falta contexto.",
          signals: ["Fecha dudosa"],
          recommendation: "Busca la fuente.",
          revealedAnswer: null,
        }}
      />,
    );

    expect(screen.getByText("Falta contexto.")).toBeVisible();
    rerender(
      <FeedbackPanel
        feedback={{
          status: "incorrect",
          explanation: "Falta contexto.",
          signals: ["Fecha dudosa"],
          recommendation: "Busca la fuente.",
          revealedAnswer: null,
        }}
      />,
    );
    expect(screen.getByText("Falta contexto.")).toBeVisible();
    expect(
      screen.getByRole("region", { name: "Feedback educativo" }),
    ).toHaveAttribute("data-feedback-persistent", "true");
  });
});
