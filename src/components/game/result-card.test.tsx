import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { GameResult } from "@antidoto/contracts";

import { ResultCard } from "./result-card";

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
