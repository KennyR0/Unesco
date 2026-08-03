import Link from "next/link";

import type { GameResult, GameScore } from "@antidoto/contracts";

export type ResultCardProps = Readonly<{
  result: GameResult;
  gameName?: string;
  id?: string;
}>;

function statusCopy(status: GameResult["status"]): string {
  return status === "finished" ? "Partida completada" : "Partida expirada";
}

function ScoreMetrics({ score }: { score: GameScore }) {
  const rows: Array<{ label: string; value: string }> = [
    {
      label: "Puntos",
      value: `${score.points} de ${score.maxPoints}`,
    },
    {
      label: "Aciertos",
      value: score.correct === null ? "No aplica" : String(score.correct),
    },
    {
      label: "Errores",
      value: String(score.errors),
    },
  ];

  if (score.bonusPoints > 0) {
    rows.push({ label: "Bonos", value: String(score.bonusPoints) });
  }
  if (score.penaltyPoints > 0) {
    rows.push({ label: "Penalizaciones", value: String(score.penaltyPoints) });
  }
  if (score.timeLimitSeconds !== null) {
    rows.push({
      label: "Tiempo",
      value:
        score.timeUsedSeconds === null
          ? `Límite ${score.timeLimitSeconds}s`
          : `${score.timeUsedSeconds}s de ${score.timeLimitSeconds}s`,
    });
  }

  return (
    <dl className="result-card__score" aria-label="Puntuación de la partida">
      {rows.map((row) => (
        <div key={row.label} className="result-card__score-row">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Proyección post-partida: aprendizaje, GameScore y enlace discreto al ranking.
 * No sustituye el feedback educativo inline del shell.
 */
export function ResultCard({
  result,
  gameName,
  id = "game-result",
}: ResultCardProps) {
  const titleId = `${id}-title`;
  const summaryId = `${id}-learning`;

  return (
    <article
      className="result-card"
      id={id}
      aria-labelledby={titleId}
      aria-describedby={summaryId}
      data-game-code={result.gameCode}
      data-result-status={result.status}
      data-feedback-relocated="false"
    >
      <p className="eyebrow">Resultado / {result.gameCode}</p>
      <h2 id={titleId}>{statusCopy(result.status)}</h2>
      <p className="result-card__alias">
        Alias <strong>{result.alias}</strong>
        {gameName ? (
          <>
            {" "}
            · <span>{gameName}</span>
          </>
        ) : null}
      </p>
      <p className="result-card__progress">
        Respuestas aceptadas: {result.answered} de {result.total}
      </p>

      <section className="result-card__learning" aria-labelledby={summaryId}>
        <h3 id={summaryId}>Aprendizaje</h3>
        <p>{result.learningSummary}</p>
      </section>

      <section className="result-card__score-block" aria-labelledby={`${id}-score`}>
        <h3 id={`${id}-score`}>Puntuación</h3>
        <ScoreMetrics score={result.score} />
      </section>

      {result.simulatedReach !== null ? (
        <p className="result-card__reach" role="note">
          Alcance simulado: {result.simulatedReach}. No forma parte de la
          puntuación ni del ranking.
        </p>
      ) : null}

      <nav className="result-card__actions" aria-label="Acciones del resultado">
        <Link className="primary-action" href="/">
          Volver al arcade
        </Link>
        <Link
          className="secondary-action result-card__ranking-link"
          href="/leaderboard"
        >
          Consultar ranking global (opcional)
        </Link>
      </nav>
      <p className="result-card__ranking-note">
        El ranking es una lectura secundaria y no es requisito para jugar ni
        para ver este resultado.
      </p>
    </article>
  );
}
