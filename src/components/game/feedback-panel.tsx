"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

import type { AnswerResult, PublicFeedback } from "@antidoto/contracts";

import {
  describeFeedbackAnnouncement,
  FeedbackCard,
} from "./feedback-card";

type FeedbackPanelProps = Readonly<{
  feedback: PublicFeedback | AnswerResult;
  nextAction?: ReactNode;
  id?: string;
}>;

/**
 * Feedback inline persistente: anuncia el resultado íntegro en la live
 * region y ofrece la acción siguiente de inmediato (un solo clic).
 */
export function FeedbackPanel({
  feedback,
  nextAction,
  id = "game-feedback",
}: FeedbackPanelProps) {
  const reactId = useId();
  const [announcement, setAnnouncement] = useState(() =>
    describeFeedbackAnnouncement(feedback),
  );
  const liveId = `${id}-live-${reactId}`;

  useEffect(() => {
    setAnnouncement(describeFeedbackAnnouncement(feedback));
  }, [feedback]);

  return (
    <section
      className="feedback-panel"
      id={id}
      role="region"
      aria-label="Feedback educativo"
      aria-describedby={liveId}
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

      {nextAction ? (
        <div className="feedback-panel__action">
          <p className="feedback-panel__action-label">Siguiente acción</p>
          {nextAction}
        </div>
      ) : null}
    </section>
  );
}
