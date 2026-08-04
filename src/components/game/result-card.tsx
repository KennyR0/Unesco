"use client";

import Link from "next/link";

import type { GameResult, GameScore } from "@antidoto/contracts";

import { useI18n } from "../../lib/i18n/provider";

export type ResultCardProps = Readonly<{ result: GameResult; gameName?: string; id?: string }>;

function ScoreMetrics({ score }: { score: GameScore }) {
  const { messages } = useI18n();
  const rows: Array<{ label: string; value: string }> = [
    { label: messages.result.points, value: `${score.points} ${messages.result.points === "Points" ? "of" : "de"} ${score.maxPoints}` },
    { label: messages.result.correct, value: score.correct === null ? messages.result.notApplicable : String(score.correct) },
    { label: messages.result.errors, value: String(score.errors) },
  ];
  if (score.bonusPoints > 0) rows.push({ label: messages.result.bonuses, value: String(score.bonusPoints) });
  if (score.penaltyPoints > 0) rows.push({ label: messages.result.penalties, value: String(score.penaltyPoints) });
  if (score.timeLimitSeconds !== null) rows.push({ label: messages.result.time, value: score.timeUsedSeconds === null ? messages.result.limit(score.timeLimitSeconds) : messages.result.used(score.timeUsedSeconds, score.timeLimitSeconds) });
  return <dl className="result-card__score" aria-label={messages.result.scoreAriaLabel}>{rows.map((row) => <div key={row.label} className="result-card__score-row"><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>;
}

export function ResultCard({ result, gameName, id = "game-result" }: ResultCardProps) {
  const { messages } = useI18n();
  const titleId = `${id}-title`;
  const summaryId = `${id}-learning`;
  const status = result.status === "finished" ? messages.result.completed : messages.result.expired;
  return (
    <article className="result-card" id={id} aria-labelledby={titleId} aria-describedby={summaryId} data-game-code={result.gameCode} data-result-status={result.status} data-feedback-relocated="false">
      <p className="eyebrow">{messages.result.result} / {result.gameCode}</p>
      <h2 id={titleId}>{status}</h2>
      <p className="result-card__alias">{messages.result.alias} <strong>{result.alias}</strong>{gameName ? <> · <span>{gameName}</span></> : null}</p>
      <p className="result-card__progress">{messages.result.answers(result.answered, result.total)}</p>
      <section className="result-card__learning" aria-labelledby={summaryId}><h3 id={summaryId}>{messages.result.learning}</h3><p>{result.learningSummary}</p></section>
      <section className="result-card__score-block" aria-labelledby={`${id}-score`}><h3 id={`${id}-score`}>{messages.result.score}</h3><ScoreMetrics score={result.score} /></section>
      {result.simulatedReach !== null ? <p className="result-card__reach" role="note">{messages.result.simulatedReach(result.simulatedReach)}</p> : null}
      <nav className="result-card__actions" aria-label={messages.result.actions}>
        <Link className="primary-action" href="/">{messages.games.backToArcade}</Link>
        <Link className="secondary-action result-card__ranking-link" href="/leaderboard">{messages.result.rankingOptional}</Link>
      </nav>
      <p className="result-card__ranking-note">{messages.result.rankingNote}</p>
    </article>
  );
}
