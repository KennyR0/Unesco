"use client";

import { useState } from "react";

import type { AnswerResult, PublicFeedback } from "@antidoto/contracts";

export type FeedbackCardProps = Readonly<{
  feedback: PublicFeedback | AnswerResult;
  id?: string;
}>;

function isLegacyFeedback(
  feedback: PublicFeedback | AnswerResult,
): feedback is AnswerResult {
  return "outcome" in feedback;
}

function feedbackEyebrow(status: PublicFeedback["status"]): string {
  switch (status) {
    case "correct":
      return "Respuesta correcta";
    case "incorrect":
      return "Respuesta para revisar";
    case "instructive":
      return "Pista para seguir";
    case "expired":
      return "Tiempo terminado";
  }
}

function resolveFeedbackCopy(feedback: PublicFeedback | AnswerResult) {
  if (isLegacyFeedback(feedback)) {
    return {
      eyebrow:
        feedback.outcome === "correct"
          ? "Respuesta correcta"
          : "Respuesta para revisar",
      title:
        feedback.outcome === "correct"
          ? `+${feedback.pointsAwarded} puntos`
          : "Esta vez no",
      explanation: feedback.feedback.explanation,
      signals: feedback.feedback.signals,
      recommendation: feedback.feedback.recommendation,
      revealedAnswer: null as string | null,
      resultLabel:
        feedback.outcome === "correct" ? "correcta" : "para revisar",
    };
  }

  return {
    eyebrow: feedbackEyebrow(feedback.status),
    title:
      feedback.status === "correct"
        ? "Decisión aceptada"
        : "Una señal para revisar",
    explanation: feedback.explanation,
    signals: feedback.signals,
    recommendation: feedback.recommendation,
    revealedAnswer: feedback.revealedAnswer,
    resultLabel: feedbackEyebrow(feedback.status).toLowerCase(),
  };
}

/**
 * Feedback educativo con revelado progresivo: por defecto solo la lectura
 * esencial (explicación, una señal clave y recomendación). El detalle se
 * expande solo a petición; el anuncio accesible conserva el texto íntegro.
 */
export function FeedbackCard({
  feedback,
  id = "game-feedback-card",
}: FeedbackCardProps) {
  const copy = resolveFeedbackCopy(feedback);
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
      data-feedback-status={
        isLegacyFeedback(feedback) ? feedback.outcome : feedback.status
      }
      data-feedback-expanded={expanded ? "true" : "false"}
    >
      <p className="eyebrow">{copy.eyebrow}</p>
      <h2 id={titleId}>{copy.title}</h2>
      <p data-feedback-field="explanation">{copy.explanation}</p>
      {keySignal ? (
        <p className="feedback-card__key-signal" data-feedback-field="signals">
          <span className="feedback-card__key-signal-label">Señal clave:</span>{" "}
          {keySignal}
        </p>
      ) : null}
      <p data-feedback-field="recommendation">
        <strong>Qué hacer:</strong> {copy.recommendation}
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
            {expanded ? "Ocultar detalle" : "Ver detalle"}
          </button>

          {expanded ? (
            <div className="feedback-card__detail" id={detailId}>
              {extraSignals.length > 0 ? (
                <>
                  <h3>Más señales</h3>
                  <ul data-feedback-field="signals-extra">
                    {extraSignals.map((signal, index) => (
                      <li key={`${signal}-${index}`}>{signal}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {copy.revealedAnswer ? (
                <p
                  className="feedback-panel__answer"
                  data-feedback-field="revealed"
                >
                  <strong>Respuesta revelada:</strong> {copy.revealedAnswer}
                </p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </article>
  );
}

export function describeFeedbackAnnouncement(
  feedback: PublicFeedback | AnswerResult,
): string {
  const copy = resolveFeedbackCopy(feedback);
  const signals = copy.signals.join(". ");
  const revealed = copy.revealedAnswer
    ? ` Respuesta revelada: ${copy.revealedAnswer}.`
    : "";
  return [
    `Resultado: ${copy.resultLabel}.`,
    copy.explanation,
    signals ? `Señales: ${signals}.` : null,
    `Recomendación: ${copy.recommendation}.`,
    revealed.trim() || null,
  ]
    .filter(Boolean)
    .join(" ");
}
