"use client";

import { useId, type ReactNode } from "react";

import type { AnswerResult, PublicFeedback } from "@antidoto/contracts";

import { useI18n } from "../../lib/i18n/provider";
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
  const { locale, messages } = useI18n();
  const reactId = useId();
  const announcement = describeFeedbackAnnouncement(feedback, locale);
  const liveId = `${id}-live-${reactId}`;

  return (
    <section
      className="feedback-panel"
      id={id}
      role="region"
      aria-label={messages.feedback.region}
      aria-describedby={liveId}
      data-feedback-persistent="true"
    >
      <div
        key={announcement}
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
          <p className="feedback-panel__action-label">{messages.feedback.nextAction}</p>
          {nextAction}
        </div>
      ) : null}
    </section>
  );
}
