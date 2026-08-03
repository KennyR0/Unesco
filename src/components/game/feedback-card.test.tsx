import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeedbackCard } from "./feedback-card";

describe("FeedbackCard", () => {
  it("expone explicación, señales, recomendación y respuesta revelada", () => {
    render(
      <FeedbackCard
        feedback={{
          status: "instructive",
          explanation: "Revisa el tono del mensaje.",
          signals: ["Urgencia artificial"],
          recommendation: "Pausa antes de reenviar.",
          revealedAnswer: "Verificar",
        }}
      />,
    );

    expect(screen.getByText("Pista para seguir")).toBeVisible();
    expect(screen.getByText("Revisa el tono del mensaje.")).toBeVisible();
    expect(screen.getByText("Urgencia artificial")).toBeVisible();
    expect(screen.getByText("Pausa antes de reenviar.")).toBeVisible();
    expect(screen.getByText("Verificar")).toBeVisible();
  });
});
