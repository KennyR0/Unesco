"use client";

import {
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";

import type { AnswerResult, PublicFeedback } from "@antidoto/contracts";

import {
  describeFeedbackAnnouncement,
  FeedbackCard,
} from "./feedback-card";

type FeedbackPanelProps = Readonly<{
  feedback: PublicFeedback | AnswerResult;
  nextAction?: ReactNode;
  id?: string;
  acceptLabel?: string;
}>;

function feedbackIdentity(feedback: PublicFeedback | AnswerResult): string {
  if ("outcome" in feedback) {
    return [
      feedback.questionRef,
      feedback.outcome,
      feedback.feedback.explanation,
      feedback.feedback.recommendation,
    ].join("|");
  }

  return [
    feedback.status,
    feedback.explanation,
    feedback.recommendation,
    feedback.revealedAnswer ?? "",
    feedback.signals.join("^"),
  ].join("|");
}

/**
 * Feedback inline persistente: anuncia el resultado y bloquea el avance
 * hasta que la persona acepte el feedback educativo.
 */
export function FeedbackPanel({
  feedback,
  nextAction,
  id = "game-feedback",
  acceptLabel = "Aceptar feedback",
}: FeedbackPanelProps) {
  const reactId = useId();
  const identity = feedbackIdentity(feedback);
  const [acceptedIdentity, setAcceptedIdentity] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState(() =>
    describeFeedbackAnnouncement(feedback),
  );
  const accepted = acceptedIdentity === identity;
  const liveId = `${id}-live-${reactId}`;
  const requiresAcceptance = Boolean(nextAction);

  useEffect(() => {
    setAcceptedIdentity(null);
    setAnnouncement(describeFeedbackAnnouncement(feedback));
  }, [feedback, identity]);

  function handleAccept() {
    setAcceptedIdentity(identity);
    setAnnouncement(
      `${describeFeedbackAnnouncement(feedback)} Siguiente acción disponible.`,
    );
  }

  return (
    <section
      className="feedback-panel"
      id={id}
      role="region"
      aria-label="Feedback educativo"
      aria-describedby={liveId}
      data-feedback-accepted={accepted ? "true" : "false"}
      data-feedback-persistent="true"
    >
      <div
        id={liveId}
        className="feedback-panel__live"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>

      <FeedbackCard feedback={feedback} id={`${id}-card`} />

      {requiresAcceptance && !accepted ? (
        <div className="feedback-panel__action">
          <p className="feedback-panel__action-label">Antes de avanzar</p>
          <button
            type="button"
            className="primary-action"
            onClick={handleAccept}
          >
            {acceptLabel}
          </button>
        </div>
      ) : null}

      {requiresAcceptance && accepted ? (
        <div className="feedback-panel__action">
          <p className="feedback-panel__action-label">Siguiente acción</p>
          {nextAction}
        </div>
      ) : null}
    </section>
  );
}
