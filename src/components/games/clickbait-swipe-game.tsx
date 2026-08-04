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

const CLASSIFICATION_LABELS: Record<HeadlineClassificationValue, string> = {
  journalism: "Periodismo",
  clickbait: "Clickbait",
};

const CLASSIFICATION_HINTS: Record<HeadlineClassificationValue, string> = {
  journalism: "Arrastra a la izquierda o pulsa ←",
  clickbait: "Arrastra a la derecha o pulsa →",
};

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

function describeSource(source: ClassificationSource): string {
  switch (source) {
    case "swipe":
      return "gesto";
    case "button":
      return "botón";
    case "keyboard":
      return "teclado";
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
  const { locale } = useI18n();
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
        <span className="headline-swipe__context-label">Se publica desde</span>
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
          aria-roledescription="Tarjeta clasificable"
          aria-labelledby={headlineId}
          aria-grabbed={dragging}
          className={[
            "headline-swipe__card",
            dragging ? "headline-swipe__card--dragging" : null,
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
          <p className="headline-swipe__kicker">Titular a clasificar</p>
          <p id={headlineId} className="headline-swipe__headline">
            {item.headline}
          </p>

          <div className="headline-swipe__meter" aria-hidden="true">
            <span className="headline-swipe__meter-fill" />
            <span className="headline-swipe__meter-threshold" />
          </div>

          <p className="headline-swipe__cancel-note">
            {dragging && !readyToCommit
              ? "Suelta aquí para cancelar; cruza la marca para enviar."
              : "Suelta más allá de la marca para enviar."}
          </p>
        </article>
      </div>

      <div
        className="headline-swipe__controls"
        role="group"
        aria-label="Opciones de clasificación"
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
                {locale === "en" && action === "journalism" ? "Journalism" : CLASSIFICATION_LABELS[action]}
              </span>
              <span className="headline-swipe__button-hint">
                {locale === "en" ? (action === "journalism" ? "Drag left or press ←" : "Drag right or press →") : CLASSIFICATION_HINTS[action]}
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
          : `${locale === "en" ? "You classified" : "Clasificaste"} ${locale === "en" && selectedClassification === "journalism" ? "Journalism" : CLASSIFICATION_LABELS[selectedClassification]} ${locale === "en" ? "using" : "mediante"} ${describeSource(
              pendingSource ?? "button",
            )}.`}
      </p>
    </section>
  );
}
