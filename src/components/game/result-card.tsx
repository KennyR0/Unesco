"use client";

import Link from "next/link";

import type { FeedItemDigest, GameResult, GameScore } from "@antidoto/contracts";

import { playAgainArcadeGameFormAction } from "../../app/actions/game";
import { GUEST_DISPLAY_ALIAS } from "../../features/game/domain/alias";
import { useI18n } from "../../lib/i18n/provider";

export type ResultCardProps = Readonly<{ result: GameResult; gameName?: string; id?: string }>;

function ScoreMetrics({ score }: { score: GameScore }) {
  const { messages } = useI18n();
  const rows: Array<{ label: string; value: string }> = [
    { label: messages.result.points, value: `${score.points} ${messages.chrome.ofWord} ${score.maxPoints}` },
    { label: messages.result.correct, value: score.correct === null ? messages.result.notApplicable : String(score.correct) },
    { label: messages.result.errors, value: String(score.errors) },
  ];
  if (score.bonusPoints > 0) rows.push({ label: messages.result.bonuses, value: String(score.bonusPoints) });
  if (score.penaltyPoints > 0) rows.push({ label: messages.result.penalties, value: String(score.penaltyPoints) });
  if (score.timeLimitSeconds !== null) rows.push({ label: messages.result.time, value: score.timeUsedSeconds === null ? messages.result.limit(score.timeLimitSeconds) : messages.result.used(score.timeUsedSeconds, score.timeLimitSeconds) });
  return <dl className="result-card__score" aria-label={messages.result.scoreAriaLabel}>{rows.map((row) => <div key={row.label} className="result-card__score-row"><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>;
}

function FeedDigestList({
  digests,
  id,
}: {
  digests: readonly FeedItemDigest[];
  id: string;
}) {
  const { messages } = useI18n();
  if (digests.length === 0) return null;
  const headingId = `${id}-digests`;
  return (
    <section className="result-card__digests" aria-labelledby={headingId}>
      <h3 id={headingId}>{messages.result.feedReview}</h3>
      {digests.map((digest) => (
        <details key={digest.itemId} className="result-card__digest">
          <summary>
            <span
              className={[
                "result-card__digest-mark",
                digest.decisionCorrect
                  ? "result-card__digest-mark--correct"
                  : "result-card__digest-mark--incorrect",
              ].join(" ")}
            >
              {digest.decisionCorrect
                ? messages.feedback.correct
                : messages.feedback.review}
            </span>
            <span className="result-card__digest-prompt">{digest.prompt}</span>
            <p className="result-card__digest-signal">
              <span className="feed-decision-pulse__signal-label">
                {messages.feedback.keySignal}
              </span>{" "}
              {digest.keySignal}
            </p>
          </summary>
          <div className="result-card__digest-body">
            <p>
              <strong>{messages.feedback.explanation}</strong> {digest.explanation}
            </p>
            <p>
              <strong>{messages.feedback.whatToDo}</strong> {digest.recommendation}
            </p>
            {digest.revealedAnswer ? (
              <p>
                <strong>{messages.feedback.revealedAnswer}</strong>{" "}
                {digest.revealedAnswer}
              </p>
            ) : null}
          </div>
        </details>
      ))}
    </section>
  );
}

export function ResultCard({ result, gameName, id = "game-result" }: ResultCardProps) {
  const { messages } = useI18n();
  const titleId = `${id}-title`;
  const summaryId = `${id}-learning`;
  const status = result.status === "finished" ? messages.result.completed : messages.result.expired;
  const isGuest =
    result.alias === GUEST_DISPLAY_ALIAS ||
    result.alias === messages.result.guestAlias;
  const aliasLabel = isGuest ? messages.result.guestAlias : result.alias;

  return (
    <article className="result-card" id={id} aria-labelledby={titleId} aria-describedby={summaryId} data-game-code={result.gameCode} data-result-status={result.status} data-feedback-relocated="false">
      <p className="eyebrow">{messages.result.result} / {result.gameCode}</p>
      <h2 id={titleId}>{status}</h2>
      <p className="result-card__alias">{messages.result.alias} <strong>{aliasLabel}</strong>{gameName ? <> · <span>{gameName}</span></> : null}</p>
      {isGuest ? (
        <p className="result-card__guest-note" role="note">
          {messages.result.guestResultNote}
        </p>
      ) : null}
      <p className="result-card__progress">{messages.result.answers(result.answered, result.total)}</p>
      <section className="result-card__learning" aria-labelledby={summaryId}><h3 id={summaryId}>{messages.result.learning}</h3><p>{result.learningSummary}</p></section>
      {result.itemDigests ? (
        <FeedDigestList digests={result.itemDigests} id={id} />
      ) : null}
      <section className="result-card__score-block" aria-labelledby={`${id}-score`}><h3 id={`${id}-score`}>{messages.result.score}</h3><ScoreMetrics score={result.score} /></section>
      {result.simulatedReach !== null ? <p className="result-card__reach" role="note">{messages.result.simulatedReach(result.simulatedReach)}</p> : null}
      <nav className="result-card__actions" aria-label={messages.result.actions}>
        <form action={playAgainArcadeGameFormAction}>
          <input type="hidden" name="gameCode" value={result.gameCode} />
          <button className="primary-action" type="submit">
            {messages.result.playAgain}
          </button>
        </form>
        <Link className="secondary-action" href="/">
          {messages.games.backToArcade}
        </Link>
        {!isGuest ? (
          <Link className="secondary-action result-card__ranking-link" href="/leaderboard">
            {messages.result.rankingOptional}
          </Link>
        ) : null}
      </nav>
      {!isGuest ? (
        <p className="result-card__ranking-note">{messages.result.rankingNote}</p>
      ) : null}
    </article>
  );
}
