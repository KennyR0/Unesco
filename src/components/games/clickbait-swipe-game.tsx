"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import type { PublicItem } from "@antidoto/contracts";

import type { Messages } from "../../lib/i18n/i18n";
import { useI18n } from "../../lib/i18n/provider";

export type ClickbaitSwipeItem = Extract<
  PublicItem,
  { gameCode: "clickbait-swipe" }
>;

export type HeadlineClassificationValue = ClickbaitSwipeItem["actions"][number];
export type ClassificationSource = "swipe" | "button" | "keyboard";

export type ClassificationSelection = Readonly<{
  value: HeadlineClassificationValue;
  source: ClassificationSource;
}>;

export type ClickbaitSwipeGameProps = Readonly<{
  item: ClickbaitSwipeItem;
  onClassify: (selection: ClassificationSelection) => void;
  selectedClassification?: HeadlineClassificationValue | null;
  disabled?: boolean;
}>;

const SWIPE_THRESHOLD_PX = 96;
const SWIPE_SLOP_PX = 4;

type DragState = Readonly<{
  pointerId: number;
  startX: number;
  startY: number;
}>;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function describeSource(
  source: ClassificationSource,
  chrome: Messages["chrome"],
): string {
  switch (source) {
    case "swipe":
      return chrome.sourceSwipe;
    case "button":
      return chrome.sourceButton;
    case "keyboard":
      return chrome.sourceKeyboard;
  }
}

/**
 * Clickbait Swipe: tarjeta editorial arrastrable con umbral cancelable.
 * Gesto, botones y flechas producen exactamente la misma clasificación
 * discriminada; el foco se devuelve a la tarjeta tras resolver.
 */
export function ClickbaitSwipeGame({
  item,
  onClassify,
  selectedClassification = null,
  disabled = false,
}: ClickbaitSwipeGameProps) {
  const { messages } = useI18n();
  const chrome = messages.chrome;
  const classificationLabels: Record<HeadlineClassificationValue, string> = {
    journalism: chrome.journalism,
    clickbait: chrome.clickbaitLabel,
  };
  const classificationHints: Record<HeadlineClassificationValue, string> = {
    journalism: chrome.dragLeft,
    clickbait: chrome.dragRight,
  };
  const [drag, setDrag] = useState<DragState | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [pendingSource, setPendingSource] = useState<ClassificationSource | null>(
    null,
  );
  const cardRef = useRef<HTMLElement | null>(null);

  const promptId = `clickbait-swipe-${item.itemId}-prompt`;
  const headlineId = `clickbait-swipe-${item.itemId}-headline`;
  const feedbackId = `clickbait-swipe-${item.itemId}-selection`;

  const resolved = selectedClassification !== null;
  const controlsDisabled = disabled || resolved;
  const dragging = drag !== null;
  const progress = clamp(offsetX / SWIPE_THRESHOLD_PX, -1, 1);
  const readyToCommit = Math.abs(offsetX) >= SWIPE_THRESHOLD_PX;
  // Direction tint must match category buttons: left/acid = journalism, right/magenta = clickbait.
  const dragToward: HeadlineClassificationValue | null =
    offsetX > SWIPE_SLOP_PX
      ? "clickbait"
      : offsetX < -SWIPE_SLOP_PX
        ? "journalism"
        : null;

  useEffect(() => {
    if (resolved) {
      cardRef.current?.focus();
    }
  }, [resolved, item.itemId]);

  function commitSelection(
    value: HeadlineClassificationValue,
    source: ClassificationSource,
  ) {
    if (controlsDisabled) {
      return;
    }
    setPendingSource(source);
    onClassify({ value, source });
  }

  function cancelDrag() {
    setDrag(null);
    setOffsetX(0);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (controlsDisabled) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    });
    setOffsetX(0);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dy) > Math.abs(dx) * 1.6 && Math.abs(dy) > SWIPE_SLOP_PX) {
      cancelDrag();
      return;
    }
    setOffsetX(dx);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLElement>) {
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - drag.startX;
    cancelDrag();
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) {
      return;
    }
    commitSelection(dx > 0 ? "clickbait" : "journalism", "swipe");
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLElement>) {
    if (drag?.pointerId === event.pointerId) {
      cancelDrag();
    }
  }

  function handleCardKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (controlsDisabled) {
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      commitSelection("journalism", "keyboard");
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      commitSelection("clickbait", "keyboard");
    }
  }

  const cardStyle = {
    "--swipe-offset": `${offsetX}px`,
    "--swipe-progress": progress,
  } as CSSProperties;

  return (
    <section
      className="headline-swipe"
      aria-labelledby={promptId}
      aria-describedby={feedbackId}
    >
      <p className="headline-swipe__context">
        <span className="headline-swipe__context-label">{chrome.publishedFrom}</span>
        {item.sourceLabel}
      </p>

      <h2 id={promptId} className="headline-swipe__prompt">
        {item.prompt}
      </h2>

      <div className="headline-swipe__track" aria-hidden={false}>
        <article
          ref={cardRef}
          tabIndex={-1}
          role="group"
          aria-roledescription={chrome.classifiableCard}
          aria-labelledby={headlineId}
          aria-grabbed={dragging}
          className={[
            "headline-swipe__card",
            dragging ? "headline-swipe__card--dragging" : null,
            dragToward ? `headline-swipe__card--toward-${dragToward}` : null,
            readyToCommit ? "headline-swipe__card--armed" : null,
            resolved ? "headline-swipe__card--resolved" : null,
          ]
            .filter(Boolean)
            .join(" ")}
          style={cardStyle}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onKeyDown={handleCardKeyDown}
        >
          <p className="headline-swipe__kicker">{chrome.headlineToClassify}</p>
          <p id={headlineId} className="headline-swipe__headline">
            {item.headline}
          </p>

          <div className="headline-swipe__meter" aria-hidden="true">
            <span className="headline-swipe__meter-fill" />
            <span className="headline-swipe__meter-threshold" />
          </div>

          <p className="headline-swipe__cancel-note">
            {dragging && !readyToCommit ? chrome.dropToCancel : chrome.dropToSubmit}
          </p>
        </article>
      </div>

      <div
        className="headline-swipe__controls"
        role="group"
        aria-label={chrome.classificationOptions}
      >
        {item.actions.map((action) => {
          const chosen = selectedClassification === action;
          const className = [
            "headline-swipe__button",
            `headline-swipe__button--${action}`,
            chosen ? "headline-swipe__button--chosen" : null,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={action}
              type="button"
              className={className}
              disabled={controlsDisabled}
              aria-pressed={chosen}
              onClick={() => commitSelection(action, "button")}
            >
              <span className="headline-swipe__button-label">
                {classificationLabels[action]}
              </span>
              <span className="headline-swipe__button-hint">
                {classificationHints[action]}
              </span>
            </button>
          );
        })}
      </div>

      <p
        id={feedbackId}
        className="visually-hidden"
        role="status"
        aria-live="polite"
      >
        {selectedClassification === null
          ? ""
          : `${chrome.youClassified} ${classificationLabels[selectedClassification]} ${chrome.usingVia} ${describeSource(
              pendingSource ?? "button",
              chrome,
            )}.`}
      </p>
    </section>
  );
}
