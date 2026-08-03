import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { LeaderboardEntry } from "@antidoto/contracts";

import { LeaderboardTable } from "./leaderboard-table";

const entries: LeaderboardEntry[] = [
  {
    rank: 1,
    gameCode: "real-o-ia",
    alias: "Ana",
    points: 70,
    maxPoints: 80,
    rankingScore: 88,
    completedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    rank: 2,
    gameCode: "grupo",
    alias: "Lina",
    points: 9,
    maxPoints: 12,
    rankingScore: 75,
    completedAt: "2026-08-01T11:00:00.000Z",
  },
];

describe("LeaderboardTable", () => {
  it("anuncia ranking secundario y expone tabla navegable con texto", () => {
    render(
      <LeaderboardTable
        entries={entries}
        gameLabels={{
          "real-o-ia": "¿Real o IA?",
          grupo: "El Grupo",
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Ranking global secundario" }),
    ).toBeVisible();
    expect(screen.getByText(/opcional y no es un objetivo/i)).toBeVisible();
    expect(screen.getByText(/Secundario \/ Opcional/i)).toBeVisible();

    const table = screen.getByRole("table");
    expect(within(table).getByText(/hasta 10 resultados elegibles/i)).toBeVisible();
    expect(
      within(table).getByRole("columnheader", { name: "Posición" }),
    ).toBeVisible();
    expect(
      within(table).getByRole("columnheader", { name: "Alias" }),
    ).toBeVisible();
    expect(
      within(table).getByRole("rowheader", { name: "1" }),
    ).toBeVisible();
    expect(within(table).getByText("Ana")).toBeVisible();
    expect(within(table).getByText("¿Real o IA?")).toBeVisible();
    expect(within(table).getByText("70 de 80")).toBeVisible();
    expect(within(table).getByText("88 por ciento")).toBeVisible();
  });

  it("muestra estado vacío comprensible", () => {
    render(
      <LeaderboardTable
        entries={[]}
        emptyMessage="Todavía no hay resultados elegibles en el ranking."
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      /todavía no hay resultados elegibles/i,
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("muestra fallo retryable sin bloquear la navegación", () => {
    render(
      <LeaderboardTable
        entries={[]}
        errorMessage="El ranking no está disponible ahora."
        errorRetryable
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      /no está disponible.*reintentar sin afectar/i,
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
