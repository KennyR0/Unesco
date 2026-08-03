import Link from "next/link";

import type { GameCode } from "@antidoto/contracts";

import { ArcadeHeader } from "../../components/arcade/arcade-header";
import { LeaderboardTable } from "../../components/game/leaderboard-table";
import { LEADERBOARD_COPY } from "../../features/game/application/leaderboard";
import { getArcadeLeaderboardServer } from "../../features/game/application/server-operations";
import { listAvailableArcadeCatalog } from "../../features/game/content/catalog";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const result = await getArcadeLeaderboardServer();
  const gameLabels = Object.fromEntries(
    listAvailableArcadeCatalog().map((game) => [game.gameCode, game.name]),
  ) as Partial<Record<GameCode, string>>;

  const isEmpty = !result.ok && result.error.code === "LEADERBOARD_EMPTY";
  const isError = !result.ok && result.error.code !== "LEADERBOARD_EMPTY";

  return (
    <>
      <ArcadeHeader />
      <main
        id="main-content"
        className="game-shell leaderboard-page"
        aria-labelledby="leaderboard-title"
        data-leaderboard-state={
          result.ok ? "ready" : isEmpty ? "empty" : "error"
        }
      >
        <LeaderboardTable
          id="leaderboard"
          entries={result.ok ? result.data.entries : []}
          limit={result.ok ? result.data.limit : 10}
          supportingCopy={LEADERBOARD_COPY.supporting}
          emptyMessage={LEADERBOARD_COPY.empty}
          errorMessage={isError ? result.error.message : null}
          errorRetryable={isError ? result.error.retryable : false}
          gameLabels={gameLabels}
        />

        <nav
          className="leaderboard-page__actions"
          aria-label="Acciones del ranking"
        >
          <Link className="primary-action" href="/">
            Volver al arcade
          </Link>
          {isError && result.error.retryable ? (
            <Link className="secondary-action" href="/leaderboard">
              Reintentar lectura
            </Link>
          ) : null}
        </nav>
      </main>
    </>
  );
}
