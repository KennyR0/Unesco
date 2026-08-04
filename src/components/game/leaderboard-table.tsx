import type { GameCode, LeaderboardEntry } from "@antidoto/contracts";

import { getMessages, type Locale } from "../../lib/i18n/i18n";

export type LeaderboardTableProps = Readonly<{
  entries: readonly LeaderboardEntry[];
  limit?: number;
  supportingCopy?: string;
  emptyMessage?: string;
  errorMessage?: string | null;
  errorRetryable?: boolean;
  gameLabels?: Partial<Record<GameCode, string>>;
  id?: string;
  locale?: Locale;
}>;

function formatCompletedAt(value: string, locale: Locale): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return value;
  return new Intl.DateTimeFormat(locale === "en" ? "en" : "es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
}

function gameLabel(gameCode: GameCode, labels: LeaderboardTableProps["gameLabels"], locale: Locale): string {
  return labels?.[gameCode] ?? getMessages(locale).gameLabels[gameCode] ?? gameCode;
}

export function LeaderboardTable({
  entries,
  limit = 10,
  supportingCopy,
  emptyMessage,
  errorMessage = null,
  errorRetryable = false,
  gameLabels,
  id = "leaderboard",
  locale = "es",
}: LeaderboardTableProps) {
  const messages = getMessages(locale);
  const titleId = `${id}-title`;
  const supportId = `${id}-support`;
  const isEmpty = entries.length === 0 && !errorMessage;
  return (
    <section className="leaderboard" aria-labelledby={titleId} aria-describedby={supportId} data-leaderboard-scope="global" data-leaderboard-limit={limit}>
      <p className="eyebrow">{messages.leaderboard.scope}</p>
      <h1 id={titleId}>{messages.leaderboard.title}</h1>
      <p id={supportId} className="leaderboard__support">{supportingCopy ?? messages.leaderboard.supporting}</p>
      {errorMessage ? (
        <p className="leaderboard__error" role="alert">
          {errorMessage}{errorRetryable ? ` ${locale === "en" ? "You can retry without affecting your game." : "Puedes reintentar sin afectar tu partida."}` : null}
        </p>
      ) : null}
      {isEmpty ? <p className="leaderboard__empty" role="status">{emptyMessage ?? messages.leaderboard.empty}</p> : null}
      {!isEmpty && !errorMessage ? (
        <div className="leaderboard__table-wrap">
          <table className="leaderboard__table">
            <caption className="leaderboard__caption">{messages.leaderboard.caption(limit)}</caption>
            <thead><tr>
              <th scope="col">{messages.leaderboard.position}</th>
              <th scope="col">{messages.leaderboard.alias}</th>
              <th scope="col">{messages.leaderboard.game}</th>
              <th scope="col">{messages.leaderboard.points}</th>
              <th scope="col">{messages.leaderboard.comparison}</th>
              <th scope="col">{messages.leaderboard.completed}</th>
            </tr></thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={`${entry.rank}-${entry.alias}-${entry.completedAt}`}>
                  <th scope="row">{entry.rank}</th>
                  <td>{entry.alias}</td>
                  <td>{gameLabel(entry.gameCode, gameLabels, locale)}</td>
                  <td>{entry.points} {locale === "en" ? "of" : "de"} {entry.maxPoints}</td>
                  <td><span className="leaderboard__score-text">{messages.leaderboard.normalized(entry.rankingScore)}</span></td>
                  <td><time dateTime={entry.completedAt}>{formatCompletedAt(entry.completedAt, locale)}</time></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
