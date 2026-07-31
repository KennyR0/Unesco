import type { AnswerResult } from "@antidoto/contracts";

export function FeedbackPanel({ feedback }: { feedback: AnswerResult }) {
  return (
    <section className="feedback-card" role="status" aria-live="polite" aria-atomic="true">
      <p className="eyebrow">{feedback.outcome === "correct" ? "Respuesta correcta" : "Respuesta para revisar"}</p>
      <h1>{feedback.outcome === "correct" ? `+${feedback.pointsAwarded} puntos` : "Esta vez no"}</h1>
      <p>{feedback.feedback.explanation}</p>
      <h2>Señales</h2>
      <ul>{feedback.feedback.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
      <h2>Qué hacer</h2>
      <p>{feedback.feedback.recommendation}</p>
    </section>
  );
}
