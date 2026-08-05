"use client";

import { useEffect, useRef } from "react";

import type { PublicFeedback } from "@antidoto/contracts";

import { useI18n } from "../../lib/i18n/provider";

export const FEED_DECISION_PULSE_MS = 900;

export type FeedDecisionPulseProps = Readonly<{
  feedback: PublicFeedback;
  onAdvance: () => void;
  disabled?: boolean;
}>;

/**
 * Micro-feedback de Feed 60”: correcto/incorrecto + señal clave, auto-avance.
 * No bloquea el post; el reloj autoritativo sigue corriendo.
 */
export function FeedDecisionPulse({
  feedback,
  onAdvance,
  disabled = false,
}: FeedDecisionPulseProps) {
  const { messages } = useI18n();
  const advancedRef = useRef(false);
  const onAdvanceRef = useRef(onAdvance);

  const correct = feedback.status === "correct";
  const keySignal = feedback.signals[0] ?? feedback.explanation;

  useEffect(() => {
    onAdvanceRef.current = onAdvance;
  }, [onAdvance]);

  useEffect(() => {
    advancedRef.current = false;
    if (disabled) return;

    const timer = window.setTimeout(() => {
      if (advancedRef.current) return;
      advancedRef.current = true;
      onAdvanceRef.current();
    }, FEED_DECISION_PULSE_MS);

    return () => window.clearTimeout(timer);
  }, [feedback, disabled]);

  function skip() {
    if (disabled || advancedRef.current) return;
    advancedRef.current = true;
    onAdvance();
  }

  return (
    <aside
      className={[
        "feed-decision-pulse",
        correct
          ? "feed-decision-pulse--correct"
          : "feed-decision-pulse--incorrect",
      ].join(" ")}
      role="status"
      aria-live="polite"
      data-testid="feed-decision-pulse"
    >
      <p className="feed-decision-pulse__status">
        {correct ? messages.feedback.correct : messages.feedback.review}
      </p>
      <p className="feed-decision-pulse__signal">
        <span className="feed-decision-pulse__signal-label">
          {messages.feedback.keySignal}
        </span>{" "}
        {keySignal}
      </p>
      <button
        type="button"
        className="feed-decision-pulse__skip"
        onClick={skip}
        disabled={disabled}
      >
        {messages.games.continue}
      </button>
    </aside>
  );
}
