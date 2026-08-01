import type { ReactNode } from "react";

import type { AnswerResult, PublicFeedback } from "@antidoto/contracts";

type FeedbackPanelProps = {
  feedback: PublicFeedback | AnswerResult;
  nextAction?: ReactNode;
  id?: string;
};

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

export function FeedbackPanel({
  feedback,
  nextAction,
  id = "game-feedback",
}: FeedbackPanelProps) {
  const legacy = isLegacyFeedback(feedback);
  const eyebrow = legacy
    ? feedback.outcome === "correct"
      ? "Respuesta correcta"
      : "Respuesta para revisar"
    : feedbackEyebrow(feedback.status);
  const title = legacy
    ? feedback.outcome === "correct"
      ? `+${feedback.pointsAwarded} puntos`
      : "Esta vez no"
    : feedback.status === "correct"
      ? "Decisión aceptada"
      : "Una señal para revisar";
  const explanation = legacy
    ? feedback.feedback.explanation
    : feedback.explanation;
  const signals = legacy ? feedback.feedback.signals : feedback.signals;
  const recommendation = legacy
    ? feedback.feedback.recommendation
    : feedback.recommendation;
  const revealedAnswer = legacy ? null : feedback.revealedAnswer;

  return (
    <section
      className="feedback-panel feedback-card"
      id={id}
      role="region"
      aria-label="Feedback educativo"
      aria-describedby={`${id}-title`}
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={`${id}-title`}>{title}</h2>
      <p>{explanation}</p>
      <h3>Señales</h3>
      <ul>
        {signals.map((signal, index) => (
          <li key={`${signal}-${index}`}>{signal}</li>
        ))}
      </ul>
      <h3>Qué hacer</h3>
      <p>{recommendation}</p>
      {revealedAnswer ? (
        <p className="feedback-panel__answer">
          <strong>Respuesta revelada:</strong> {revealedAnswer}
        </p>
      ) : null}
      {nextAction ? (
        <div className="feedback-panel__action">
          <p className="feedback-panel__action-label">Siguiente acción</p>
          {nextAction}
        </div>
      ) : null}
    </section>
  );
}
