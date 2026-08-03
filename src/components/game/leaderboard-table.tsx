import type { GameCode, LeaderboardEntry } from "@antidoto/contracts";

export type LeaderboardTableProps = Readonly<{
  entries: readonly LeaderboardEntry[];
  limit?: number;
  supportingCopy?: string;
  emptyMessage?: string;
  errorMessage?: string | null;
  errorRetryable?: boolean;
  gameLabels?: Partial<Record<GameCode, string>>;
  id?: string;
}>;

function formatCompletedAt(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return value;
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function gameLabel(
  gameCode: GameCode,
  labels: LeaderboardTableProps["gameLabels"],
): string {
  return labels?.[gameCode] ?? gameCode;
}

/**
 * Tabla accesible del ranking global secundario.
 * Posición, alias y puntuación se expresan en texto (nunca solo con color).
 */
export function LeaderboardTable({
  entries,
  limit = 10,
  supportingCopy = "Esta lectura es opcional y no es un objetivo de aprendizaje ni un requisito para jugar.",
  emptyMessage = "Todavía no hay resultados elegibles en el ranking.",
  errorMessage = null,
  errorRetryable = false,
  gameLabels,
  id = "leaderboard",
}: LeaderboardTableProps) {
  const titleId = `${id}-title`;
  const supportId = `${id}-support`;
  const isEmpty = entries.length === 0 && !errorMessage;

  return (
    <section
      className="leaderboard"
      aria-labelledby={titleId}
      aria-describedby={supportId}
      data-leaderboard-scope="global"
      data-leaderboard-limit={limit}
    >
      <p className="eyebrow">Secundario / Opcional</p>
      <h1 id={titleId}>Ranking global secundario</h1>
      <p id={supportId} className="leaderboard__support">
        {supportingCopy}
      </p>

      {errorMessage ? (
        <p className="leaderboard__error" role="alert">
          {errorMessage}
          {errorRetryable
            ? " Puedes reintentar sin afectar tu partida."
            : null}
        </p>
      ) : null}

      {isEmpty ? (
        <p className="leaderboard__empty" role="status">
          {emptyMessage}
        </p>
      ) : null}

      {!isEmpty && !errorMessage ? (
        <div className="leaderboard__table-wrap">
          <table className="leaderboard__table">
            <caption className="leaderboard__caption">
              Hasta {limit} resultados elegibles. La comparación normalizada no
              sustituye la puntuación educativa de cada juego.
            </caption>
            <thead>
              <tr>
                <th scope="col">Posición</th>
                <th scope="col">Alias</th>
                <th scope="col">Juego</th>
                <th scope="col">Puntos</th>
                <th scope="col">Comparación</th>
                <th scope="col">Completado</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={`${entry.rank}-${entry.alias}-${entry.completedAt}`}>
                  <th scope="row">{entry.rank}</th>
                  <td>{entry.alias}</td>
                  <td>{gameLabel(entry.gameCode, gameLabels)}</td>
                  <td>
                    {entry.points} de {entry.maxPoints}
                  </td>
                  <td>
                    <span className="leaderboard__score-text">
                      {entry.rankingScore} por ciento
                    </span>
                  </td>
                  <td>
                    <time dateTime={entry.completedAt}>
                      {formatCompletedAt(entry.completedAt)}
                    </time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
