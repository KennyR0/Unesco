import type { LegacyLeaderboardEntry } from "@antidoto/contracts";

export function LeaderboardTable({ entries, currentPlayerEntry }: { entries: LegacyLeaderboardEntry[]; currentPlayerEntry: LegacyLeaderboardEntry | null }) {
  return <section className="leaderboard" aria-labelledby="ranking-title"><h1 id="ranking-title">Ranking</h1>{entries.length === 0 ? <p>Aún no hay resultados. Sé la primera persona en jugar.</p> : <ol>{entries.map((entry) => <li key={`${entry.position}-${entry.alias}`} className={entry.isCurrentPlayer ? "current-entry" : undefined}><span>{entry.position}. {entry.alias}</span><strong>{entry.score}</strong></li>)}</ol>}{currentPlayerEntry ? <p className="current-position">Tu posición: {currentPlayerEntry.position} — {currentPlayerEntry.score} puntos</p> : null}</section>;
}
