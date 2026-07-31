import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnswerResultSchema } from "@antidoto/contracts";

import { FeedbackPanel } from "./feedback-panel";

describe("FeedbackPanel", () => {
  it("muestra explicación, señal y recomendación en la misma vista", () => {
    const feedback = AnswerResultSchema.parse({
      questionRef: "Q000000000000000000001",
      selectedOptionRef: "O000000000000000000001",
      correctOptionRef: "O000000000000000000002",
      outcome: "incorrect",
      pointsAwarded: 0,
      feedback: {
        explanation: "Comprueba el contexto.",
        signals: ["Fecha visible"],
        recommendation: "Busca la fuente original.",
      },
      progress: {
        currentQuestion: 1,
        totalQuestions: 5,
        answeredQuestions: 1,
      },
    });
    render(<FeedbackPanel feedback={feedback} />);
    expect(screen.getByText("Comprueba el contexto.")).toBeVisible();
    expect(screen.getByText("Fecha visible")).toBeVisible();
    expect(screen.getByText("Busca la fuente original.")).toBeVisible();
  });
});
