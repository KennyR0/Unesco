import Link from "next/link";

import type { GameCode } from "@antidoto/contracts";

import { ArcadeHeader } from "../../components/arcade/arcade-header";
import { LeaderboardTable } from "../../components/game/leaderboard-table";
import { getArcadeLeaderboardServer } from "../../features/game/application/server-operations";
import { listAvailableArcadeCatalog } from "../../features/game/content/catalog";
import { getMessages } from "../../lib/i18n/i18n";
import { getServerLocale } from "../../lib/i18n/server";
import { localizeErrorMessage } from "../../lib/i18n/errors";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const locale = await getServerLocale();
  const messages = getMessages(locale);
  const result = await getArcadeLeaderboardServer();
  const gameLabels = Object.fromEntries(
    listAvailableArcadeCatalog().map((game) => [game.gameCode, messages.gameLabels[game.gameCode] ?? game.name]),
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
          supportingCopy={messages.leaderboard.supporting}
          emptyMessage={messages.leaderboard.empty}
          errorMessage={isError ? localizeErrorMessage(result.error.code, result.error.message, locale) : null}
          errorRetryable={isError ? result.error.retryable : false}
          gameLabels={gameLabels}
          locale={locale}
        />

        <nav
          className="leaderboard-page__actions"
          aria-label={messages.leaderboard.actions}
        >
          <Link className="primary-action" href="/">
            {messages.games.backToArcade}
          </Link>
          {isError && result.error.retryable ? (
            <Link className="secondary-action" href="/leaderboard">
              {messages.leaderboard.retry}
            </Link>
          ) : null}
        </nav>
      </main>
    </>
  );
}
