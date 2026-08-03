import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { LeaderboardEntry } from "@antidoto/contracts";

import { LeaderboardTable } from "../../src/components/game/leaderboard-table";
import { LEADERBOARD_COPY } from "../../src/features/game/application/leaderboard";

function entry(
  overrides: Partial<LeaderboardEntry> &
    Pick<LeaderboardEntry, "rank" | "alias" | "rankingScore">,
): LeaderboardEntry {
  return {
    gameCode: "real-o-ia",
    points: 40,
    maxPoints: 80,
    completedAt: "2026-08-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("LeaderboardTable (T039)", () => {
  it("anuncia ranking global secundario limitado a diez con alias y score en texto", () => {
    const entries = Array.from({ length: 10 }, (_, index) =>
      entry({
        rank: index + 1,
        alias: `Jugador ${index + 1}`,
        points: 80 - index,
        maxPoints: 80,
        rankingScore: Math.round(((80 - index) / 80) * 100),
        completedAt: `2026-08-01T10:${String(index).padStart(2, "0")}:00.000Z`,
      }),
    );

    render(
      <LeaderboardTable
        entries={entries}
        limit={10}
        supportingCopy={LEADERBOARD_COPY.supporting}
        gameLabels={{ "real-o-ia": "¿Real o IA?" }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Ranking global secundario" }),
    ).toBeVisible();
    expect(screen.getByText(/opcional y no es un objetivo/i)).toBeVisible();

    const section = screen.getByRole("region", {
      name: "Ranking global secundario",
    });
    expect(section).toHaveAttribute("data-leaderboard-scope", "global");
    expect(section).toHaveAttribute("data-leaderboard-limit", "10");

    const table = screen.getByRole("table");
    expect(within(table).getByText(/hasta 10 resultados elegibles/i)).toBeVisible();
    expect(within(table).getAllByRole("row")).toHaveLength(11); // header + 10
    expect(within(table).getByText("Jugador 1")).toBeVisible();
    expect(within(table).getByText("80 de 80")).toBeVisible();
    expect(within(table).getByText("100 por ciento")).toBeVisible();
    expect(within(table).getAllByText("¿Real o IA?")).toHaveLength(10);
  });

  it("renderiza alias como texto seguro sin interpretar markup", () => {
    render(
      <LeaderboardTable
        entries={[
          entry({
            rank: 1,
            alias: `<img src=x onerror=alert(1)>Ana`,
            rankingScore: 50,
          }),
        ]}
      />,
    );

    expect(
      screen.getByText("<img src=x onerror=alert(1)>Ana"),
    ).toBeVisible();
    expect(document.querySelector("img")).toBeNull();
  });

  it("muestra rankingScore clampado en el rango 0–100", () => {
    render(
      <LeaderboardTable
        entries={[
          entry({ rank: 1, alias: "Cero", rankingScore: 0, points: 0 }),
          entry({
            rank: 2,
            alias: "Techo",
            rankingScore: 100,
            points: 80,
          }),
        ]}
      />,
    );

    const table = screen.getByRole("table");
    expect(within(table).getByText("0 por ciento")).toBeVisible();
    expect(within(table).getByText("100 por ciento")).toBeVisible();
  });

  it("muestra vacío comprensible sin tabla cuando no hay elegibles", () => {
    render(
      <LeaderboardTable
        entries={[]}
        emptyMessage={LEADERBOARD_COPY.empty}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      /todavía no hay resultados elegibles/i,
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("expone fallo independiente retryable sin bloquear la lectura secundaria", () => {
    render(
      <LeaderboardTable
        entries={[]}
        errorMessage={LEADERBOARD_COPY.unavailable}
        errorRetryable
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      /no está disponible.*reintentar sin afectar/i,
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ranking global secundario" }),
    ).toBeVisible();
  });
});
