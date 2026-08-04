"use client";

import { useEffect, useState } from "react";

import { useI18n } from "../../lib/i18n/provider";

const MOTION_STORAGE_KEY = "antidoto:motion:v1";
type MotionPreference = "active" | "paused";

function currentPreference(): MotionPreference {
  return document.documentElement.dataset.motion === "paused"
    ? "paused"
    : "active";
}

function applyPreference(preference: MotionPreference): void {
  document.documentElement.dataset.motion = preference;
  window.dispatchEvent(
    new CustomEvent("antidoto:motion-change", { detail: preference }),
  );
}

export function MotionToggle() {
  const { messages } = useI18n();
  const [preference, setPreference] = useState<MotionPreference>("active");

  useEffect(() => {
    const syncFromDocument = () => setPreference(currentPreference());
    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    const syncFromSystem = (event: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(MOTION_STORAGE_KEY);
      } catch {
        // Storage is optional; the document preference remains authoritative.
      }
      if (stored !== "active" && stored !== "paused") {
        applyPreference(event.matches ? "paused" : "active");
      }
    };

    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(MOTION_STORAGE_KEY);
    } catch {
      // Storage is optional; fall through to the document or system preference.
    }
    if (stored !== "active" && stored !== "paused") {
      applyPreference(mediaQuery?.matches ? "paused" : "active");
    } else {
      applyPreference(stored);
    }
    syncFromDocument();
    window.addEventListener("antidoto:motion-change", syncFromDocument);
    mediaQuery?.addEventListener("change", syncFromSystem);

    return () => {
      window.removeEventListener("antidoto:motion-change", syncFromDocument);
      mediaQuery?.removeEventListener("change", syncFromSystem);
    };
  }, []);

  const paused = preference === "paused";

  function toggleMotion() {
    const nextPreference: MotionPreference = paused ? "active" : "paused";
    applyPreference(nextPreference);
    setPreference(nextPreference);
    try {
      window.localStorage.setItem(MOTION_STORAGE_KEY, nextPreference);
    } catch {
      // A disabled storage API must never disable the control itself.
    }
  }

  return (
    <button
      className="motion-toggle"
      type="button"
      aria-label={paused ? messages.motion.activate : messages.motion.pause}
      aria-pressed={paused}
      onClick={toggleMotion}
    >
      <span className="motion-toggle__icon" aria-hidden="true">
        {paused ? "▶" : "Ⅱ"}
      </span>
      <span className="motion-toggle__label motion-toggle__label--active">
        {messages.motion.pause}
      </span>
      <span className="motion-toggle__label motion-toggle__label--paused">
        {messages.motion.activate}
      </span>
    </button>
  );
}
