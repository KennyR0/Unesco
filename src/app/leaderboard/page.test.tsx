import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LEADERBOARD_LIMIT } from "@antidoto/contracts";

import LeaderboardPage from "./page";

const { getArcadeLeaderboardServerMock } = vi.hoisted(() => ({
  getArcadeLeaderboardServerMock: vi.fn(),
}));

vi.mock("../../features/game/application/server-operations", () => ({
  getArcadeLeaderboardServer: getArcadeLeaderboardServerMock,
}));

describe("LeaderboardPage", () => {
  beforeEach(() => {
    getArcadeLeaderboardServerMock.mockReset();
  });

  it("renderiza la tabla arcade secundaria desde el servidor", async () => {
    getArcadeLeaderboardServerMock.mockResolvedValue({
      ok: true,
      data: {
        scope: "global",
        limit: LEADERBOARD_LIMIT,
        entries: [
          {
            rank: 1,
            gameCode: "clickbait-swipe",
            alias: "Nora",
            points: 14,
            maxPoints: 16,
            rankingScore: 88,
            completedAt: "2026-08-02T09:00:00.000Z",
          },
        ],
      },
    });

    render(await LeaderboardPage());

    expect(getArcadeLeaderboardServerMock).toHaveBeenCalledOnce();
    expect(screen.getByRole("main")).toHaveAttribute(
      "data-leaderboard-state",
      "ready",
    );
    expect(
      screen.getByRole("heading", { name: "Ranking global secundario" }),
    ).toBeVisible();
    expect(screen.getByRole("table")).toBeVisible();
    expect(screen.getByText("Nora")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /volver al arcade/i }),
    ).toHaveAttribute("href", "/");
  });

  it("trata el vacío como estado comprensible, no como alerta de fallo", async () => {
    getArcadeLeaderboardServerMock.mockResolvedValue({
      ok: false,
      error: {
        code: "LEADERBOARD_EMPTY",
        message: "Todavía no hay resultados elegibles en el ranking.",
        retryable: false,
      },
    });

    render(await LeaderboardPage());

    expect(screen.getByRole("main")).toHaveAttribute(
      "data-leaderboard-state",
      "empty",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      /todavía no hay resultados elegibles/i,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /reintentar lectura/i }),
    ).not.toBeInTheDocument();
  });

  it("ofrece reintento cuando el fallo es retryable", async () => {
    getArcadeLeaderboardServerMock.mockResolvedValue({
      ok: false,
      error: {
        code: "LEADERBOARD_UNAVAILABLE",
        message: "El ranking no está disponible ahora.",
        retryable: true,
      },
    });

    render(await LeaderboardPage());

    expect(screen.getByRole("main")).toHaveAttribute(
      "data-leaderboard-state",
      "error",
    );
    expect(screen.getByRole("alert")).toBeVisible();
    expect(
      screen.getByRole("link", { name: /reintentar lectura/i }),
    ).toHaveAttribute("href", "/leaderboard");
  });
});
