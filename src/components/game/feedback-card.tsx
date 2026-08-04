"use client";

import { useState } from "react";

import type { AnswerResult, PublicFeedback } from "@antidoto/contracts";

import { getMessages, type Locale } from "../../lib/i18n/i18n";
import { useI18n } from "../../lib/i18n/provider";

export type FeedbackCardProps = Readonly<{
  feedback: PublicFeedback | AnswerResult;
  id?: string;
}>;

function isLegacyFeedback(feedback: PublicFeedback | AnswerResult): feedback is AnswerResult {
  return "outcome" in feedback;
}

function feedbackEyebrow(status: PublicFeedback["status"], locale: Locale): string {
  const messages = getMessages(locale);
  switch (status) {
    case "correct": return messages.feedback.correct;
    case "incorrect": return messages.feedback.review;
    case "instructive": return messages.feedback.hint;
    case "expired": return messages.feedback.timeUp;
  }
}

function resolveFeedbackCopy(feedback: PublicFeedback | AnswerResult, locale: Locale) {
  const messages = getMessages(locale);
  if (isLegacyFeedback(feedback)) {
    return {
      eyebrow: feedback.outcome === "correct" ? messages.feedback.correct : messages.feedback.review,
      title: feedback.outcome === "correct" ? `+${feedback.pointsAwarded} ${messages.result.points.toLowerCase()}` : messages.feedback.signalToReview,
      explanation: feedback.feedback.explanation,
      signals: feedback.feedback.signals,
      recommendation: feedback.feedback.recommendation,
      revealedAnswer: null as string | null,
      resultLabel: feedback.outcome === "correct" ? messages.feedback.correct.toLowerCase() : messages.feedback.review.toLowerCase(),
    };
  }
  return {
    eyebrow: feedbackEyebrow(feedback.status, locale),
    title: feedback.status === "correct" ? messages.feedback.accepted : messages.feedback.signalToReview,
    explanation: feedback.explanation,
    signals: feedback.signals,
    recommendation: feedback.recommendation,
    revealedAnswer: feedback.revealedAnswer,
    resultLabel: feedbackEyebrow(feedback.status, locale).toLowerCase(),
  };
}

export function FeedbackCard({ feedback, id = "game-feedback-card" }: FeedbackCardProps) {
  const { locale, messages } = useI18n();
  const copy = resolveFeedbackCopy(feedback, locale);
  const titleId = `${id}-title`;
  const detailId = `${id}-detail`;
  const [expanded, setExpanded] = useState(false);
  const [keySignal, ...extraSignals] = copy.signals;
  const hasDetail = extraSignals.length > 0 || copy.revealedAnswer !== null;

  return (
    <article
      className="feedback-card"
      id={id}
      aria-labelledby={titleId}
      data-feedback-status={isLegacyFeedback(feedback) ? feedback.outcome : feedback.status}
      data-feedback-expanded={expanded ? "true" : "false"}
    >
      <p className="eyebrow">{copy.eyebrow}</p>
      <h2 id={titleId}>{copy.title}</h2>
      <p data-feedback-field="explanation">{copy.explanation}</p>
      {keySignal ? (
        <p className="feedback-card__key-signal" data-feedback-field="signals">
          <span className="feedback-card__key-signal-label">{messages.feedback.keySignal}</span>{" "}
          {keySignal}
        </p>
      ) : null}
      <p data-feedback-field="recommendation">
        <strong>{messages.feedback.whatToDo}</strong> {copy.recommendation}
      </p>

      {hasDetail ? (
        <>
          <button
            type="button"
            className="feedback-card__detail-toggle"
            aria-expanded={expanded}
            aria-controls={detailId}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? messages.feedback.hideDetails : messages.feedback.showDetails}
          </button>
          {expanded ? (
            <div className="feedback-card__detail" id={detailId}>
              {extraSignals.length > 0 ? (
                <>
                  <h3>{messages.feedback.moreSignals}</h3>
                  <ul data-feedback-field="signals-extra">
                    {extraSignals.map((signal, index) => <li key={`${signal}-${index}`}>{signal}</li>)}
                  </ul>
                </>
              ) : null}
              {copy.revealedAnswer ? (
                <p className="feedback-panel__answer" data-feedback-field="revealed">
                  <strong>{messages.feedback.revealedAnswer}</strong> {copy.revealedAnswer}
                </p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </article>
  );
}

export function describeFeedbackAnnouncement(feedback: PublicFeedback | AnswerResult, locale: Locale = "es"): string {
  const messages = getMessages(locale);
  const copy = resolveFeedbackCopy(feedback, locale);
  const signals = copy.signals.join(". ");
  const revealed = copy.revealedAnswer ? ` ${messages.feedback.revealedAnswer} ${copy.revealedAnswer}.` : "";
  return [
    `${messages.feedback.result}: ${copy.resultLabel}.`,
    copy.explanation,
    signals ? `${messages.feedback.explanation}: ${signals}.` : null,
    `${messages.feedback.recommendation}: ${copy.recommendation}.`,
    revealed.trim() || null,
  ].filter(Boolean).join(" ");
}
