import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeedbackPanel } from "./feedback-panel";

describe("FeedbackPanel", () => {
  it("muestra explicación, señal y recomendación en la misma vista", () => {
    render(<FeedbackPanel feedback={{ outcome: "incorrect", pointsAwarded: 0, feedback: { explanation: "Comprueba el contexto.", signals: ["Fecha visible"], recommendation: "Busca la fuente original." }, nextAction: "advance" }} />);
    expect(screen.getByText("Comprueba el contexto.")).toBeVisible();
    expect(screen.getByText("Fecha visible")).toBeVisible();
    expect(screen.getByText("Busca la fuente original.")).toBeVisible();
  });
});
