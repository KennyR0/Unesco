import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { GameResult } from "@antidoto/contracts";

import { ResultCard } from "./result-card";

vi.mock("../../app/actions/game", () => ({
  playAgainArcadeGameFormAction: vi.fn(),
}));

const finishedResult: GameResult = {
  sessionId: "session-result-1",
  gameCode: "real-o-ia",
  alias: "Ana",
  status: "finished",
  answered: 8,
  total: 8,
  learningSummary: "Observaste contexto y señales antes de decidir.",
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
  itemDigests: null,
};

describe("ResultCard", () => {
  it("proyecta aprendizaje, GameScore y enlace discreto al ranking", () => {
    render(<ResultCard result={finishedResult} gameName="¿Real o IA?" />);

    expect(
      screen.getByRole("heading", { name: "Partida completada" }),
    ).toBeVisible();
    expect(screen.getByText("Ana")).toBeVisible();
    expect(
      screen.getByText("Observaste contexto y señales antes de decidir."),
    ).toBeVisible();
    expect(screen.getByLabelText("Puntuación de la partida")).toHaveTextContent(
      "70 de 80",
    );
    expect(screen.getByText("7")).toBeVisible();
    expect(screen.getByText("1")).toBeVisible();

    expect(
      screen.getByRole("button", { name: /jugar de nuevo/i }),
    ).toBeVisible();
    const rankingLink = screen.getByRole("link", {
      name: /consultar ranking global \(opcional\)/i,
    });
    expect(rankingLink).toHaveAttribute("href", "/leaderboard");
    expect(rankingLink).toHaveClass("secondary-action");
    expect(
      screen.getByText(/lectura secundaria y no es requisito/i),
    ).toBeVisible();

    expect(screen.getByRole("link", { name: /volver al arcade/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("article")).toHaveAttribute(
      "data-feedback-relocated",
      "false",
    );
    expect(
      screen.queryByRole("heading", { name: "Señales" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Qué hacer" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Feedback educativo")).not.toBeInTheDocument();
  });

  it("lista digests colapsables en el resultado de Feed 60", () => {
    render(
      <ResultCard
        result={{
          ...finishedResult,
          gameCode: "feed-60",
          answered: 1,
          total: 10,
          learningSummary: "Bajo presión, practicaste Buscar cobertura.",
          score: {
            ...finishedResult.score,
            points: 2,
            maxPoints: 30,
            correct: 1,
            errors: 0,
            timeLimitSeconds: 60,
          },
          itemDigests: [
            {
              itemId: "feed-60-001",
              prompt: "Minsa: campaña de vacunación gratuita.",
              decisionCorrect: true,
              keySignal: "Encuentra mejor cobertura: medios serios replican.",
              explanation: "Es un aviso oficial útil.",
              recommendation: "Comparte cuando la fuente oficial coincide.",
              revealedAnswer: "Compartir",
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Revisión del feed" }),
    ).toBeVisible();
    expect(
      screen.getByText(/Minsa: campaña de vacunación gratuita/i),
    ).toBeVisible();
    expect(
      screen.getByText(/Encuentra mejor cobertura: medios serios replican/i),
    ).toBeVisible();
  });

  it("separa el alcance simulado de la puntuación en Mente Maestra", () => {
    render(
      <ResultCard
        result={{
          ...finishedResult,
          gameCode: "mente-maestra",
          simulatedReach: 82,
          score: {
            ...finishedResult.score,
            points: 3,
            maxPoints: 4,
            correct: null,
            errors: 0,
          },
        }}
      />,
    );

    expect(screen.getByRole("note")).toHaveTextContent(
      /Alcance simulado: 82.*no forma parte/i,
    );
    expect(screen.getByLabelText("Puntuación de la partida")).toHaveTextContent(
      "3 de 4",
    );
  });
});
