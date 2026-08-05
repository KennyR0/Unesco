"use client";

import type { SiftStep } from "@antidoto/contracts";

import { useI18n } from "../../lib/i18n/provider";

const SIFT_ORDER = ["stop", "investigate", "find", "trace"] as const;

export type SiftFocusBannerProps = Readonly<{
  steps: readonly SiftStep[];
  /** Cuando hay feedback, enfatiza lo practicado. */
  mode?: "practicing" | "practiced";
}>;

/**
 * Chip editorial que anuncia los 1–2 pasos SIFT del juego activo.
 */
export function SiftFocusBanner({
  steps,
  mode = "practicing",
}: SiftFocusBannerProps) {
  const { messages } = useI18n();
  if (steps.length === 0) return null;

  const label =
    mode === "practiced"
      ? messages.chrome.siftPracticed
      : messages.chrome.siftPracticing;

  return (
    <p className="sift-focus" data-sift-mode={mode} aria-label={label}>
      <span className="sift-focus__label">{label}</span>
      <span className="sift-focus__steps">
        {steps.map((step) => {
          const index = SIFT_ORDER.indexOf(step);
          const letter = "SIFT"[index] ?? "?";
          const title = messages.home.sift[index]?.title ?? step;
          return (
            <span key={step} className="sift-focus__step" data-sift-step={step}>
              <span className="sift-focus__letter" aria-hidden="true">
                {letter}
              </span>
              <span className="sift-focus__title">{title}</span>
            </span>
          );
        })}
      </span>
    </p>
  );
}
