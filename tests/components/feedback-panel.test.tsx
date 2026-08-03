import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { PublicFeedback } from "@antidoto/contracts";

import { FeedbackPanel } from "../../src/components/game/feedback-panel";
import { GameShell } from "../../src/components/game/game-shell";
import { ResultCard } from "../../src/components/game/result-card";
import { createMemoryArcadeGateway } from "../../src/features/game/infrastructure/memory-arcade-gateway";

const arcadeFeedback: PublicFeedback = {
  status: "correct",
  explanation: "La decisión coincide con las señales observables.",
  signals: ["El contexto permanece visible."],
  recommendation: "Verifica la fuente original antes de compartir.",
  revealedAnswer: "Real",
};

describe("FeedbackPanel / US3 (T038)", () => {
  it("muestra feedback inline con anuncio accesible y avance disponible de inmediato", () => {
    render(
      <GameShell
        title="¿Real o IA?"
        gameCode="real-o-ia"
        status="feedback"
        feedback={arcadeFeedback}
        nextAction={<button type="button">Siguiente item</button>}
      >
        <p>Estímulo público del item.</p>
      </GameShell>,
    );

    const region = screen.getByRole("region", { name: "Feedback educativo" });
    expect(region).toHaveAttribute("data-feedback-persistent", "true");
    expect(within(region).getByText(arcadeFeedback.explanation)).toBeVisible();
    expect(within(region).getByText(arcadeFeedback.signals[0]!)).toBeVisible();
    expect(within(region).getByText(arcadeFeedback.recommendation)).toBeVisible();
    expect(within(region).getByRole("status")).toHaveAttribute(
      "aria-live",
      "polite",
    );
    // Un solo clic: el avance no exige una aceptación previa.
    expect(screen.getByRole("button", { name: "Siguiente item" })).toBeVisible();
    expect(region.outerHTML).not.toContain("solutionPrivate");
  });

  it("mantiene el feedback estable ante un reintento idéntico de presentación", () => {
    const { rerender } = render(
      <FeedbackPanel
        feedback={arcadeFeedback}
        nextAction={<button type="button">Continuar</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Continuar" })).toBeVisible();

    rerender(
      <FeedbackPanel
        feedback={{ ...arcadeFeedback }}
        nextAction={<button type="button">Continuar</button>}
      />,
    );

    // Misma identidad de feedback: el panel sigue visible con su acción.
    expect(
      screen.getByRole("region", { name: "Feedback educativo" }),
    ).toHaveAttribute("data-feedback-persistent", "true");
    expect(screen.getByRole("button", { name: "Continuar" })).toBeVisible();
    expect(screen.getByText(arcadeFeedback.explanation)).toBeVisible();
  });

  it("el resultado post-partida no mueve el feedback educativo ni expone solución", () => {
    render(
      <ResultCard
        result={{
          sessionId: "session-1",
          gameCode: "real-o-ia",
          alias: "Ana",
          status: "finished",
          answered: 8,
          total: 8,
          learningSummary: "Observaste señales antes de decidir.",
          score: {
            points: 70,
            maxPoints: 80,
            correct: 7,
            errors: 1,
            bonusPoints: 0,
            penaltyPoints: 0,
            timeLimitSeconds: null,
            timeUsedSeconds: null,
          },
          simulatedReach: null,
        }}
        gameName="¿Real o IA?"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Partida completada" }),
    ).toBeVisible();
    expect(screen.getByLabelText("Puntuación de la partida")).toHaveTextContent(
      "70 de 80",
    );
    expect(
      screen.queryByRole("region", { name: "Feedback educativo" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Señales" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveAttribute(
      "data-feedback-relocated",
      "false",
    );
  });

  it("un submit idéntico es idempotente y no revela solución privada", async () => {
    const gateway = createMemoryArcadeGateway();
    const started = await gateway.startGame({
      alias: "Ana",
      gameCode: "real-o-ia",
      sessionTokenHash: "a".repeat(64),
    });
    expect(started.ok).toBe(true);
    if (!started.ok) return;

    const action = {
      sessionId: started.data.sessionId,
      gameCode: "real-o-ia" as const,
      itemId: "item-1",
      input: { kind: "verdict" as const, value: "real" as const },
    };

    const first = await gateway.submitGameAction(action);
    const replay = await gateway.submitGameAction(action);
    const conflict = await gateway.submitGameAction({
      ...action,
      input: { kind: "verdict", value: "ai" },
    });

    expect(first.ok).toBe(true);
    expect(replay).toEqual(first);
    expect(conflict.ok).toBe(false);
    if (!conflict.ok) {
      expect(conflict.error.code).toBe("ANSWER_ALREADY_ACCEPTED");
    }

    if (first.ok) {
      const serialized = JSON.stringify(first.data);
      expect(serialized).not.toContain("solutionPrivate");
      expect(serialized).not.toContain("solution");
      expect(first.data.feedback).not.toBeNull();
      expect(first.data.status).toBe("feedback");
    }
  });
});
