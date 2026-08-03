"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { PublicItem } from "@antidoto/contracts";

export type FeedTimerItem = Extract<PublicItem, { gameCode: "feed-60" }>;
export type FeedActionValue = FeedTimerItem["actions"][number];
export type FeedFinalDecision = "share" | "discard";

export type FeedActionSelection = Readonly<{
  value: FeedActionValue;
}>;

export type FeedTimerGameProps = Readonly<{
  item: FeedTimerItem;
  /** Segundos restantes proyectados por el servidor; el cliente solo muestra. */
  remainingSeconds: number;
  onAction: (selection: FeedActionSelection) => void;
  selectedAction?: FeedActionValue | null;
  /** Pistas SIFT reveladas solo después de verify. */
  verificationHints?: readonly string[];
  /** true si el servidor ya aplicó verify sobre este item. */
  verified?: boolean;
  /** true cuando el servidor declara la partida expirada. */
  expired?: boolean;
  disabled?: boolean;
}>;

const ACTION_LABELS: Record<FeedActionValue, string> = {
  verify: "Verificar",
  share: "Compartir",
  discard: "Descartar",
};

const ACTION_HINTS: Record<FeedActionValue, string> = {
  verify: `−4 s para revisar las pistas SIFT`,
  share: "Amplifica si es oficial o útil",
  discard: "Frena lo falso, reciclado o satírico",
};

/** Segundos restantes a partir de los que se anuncia el aviso anticipado. */
const EARLY_WARNING_SECONDS = 10;
const TICK_MS = 200;

function clampSeconds(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(60, Math.max(0, Math.ceil(value)));
}

function formatSeconds(value: number): string {
  const seconds = clampSeconds(value);
  return `${seconds} s`;
}

/**
 * Feed 60”: reloj textual, verify costoso, decisión final y pausa visual que
 * no detiene el reloj autoritativo. El foco se recupera tras verify/decidir
 * y el aviso anticipado se anuncia con texto, nunca solo con la barra.
 */
export function FeedTimerGame({
  item,
  remainingSeconds,
  onAction,
  selectedAction = null,
  verificationHints = [],
  verified = false,
  expired = false,
  disabled = false,
}: FeedTimerGameProps) {
  const [motionPaused, setMotionPaused] = useState(false);
  const authoritativeSeconds = clampSeconds(remainingSeconds);
  const [clockSource, setClockSource] = useState(() => ({
    itemId: item.itemId,
    remaining: authoritativeSeconds,
  }));
  const [displaySeconds, setDisplaySeconds] = useState(authoritativeSeconds);
  const promptRef = useRef<HTMLHeadingElement | null>(null);
  const decisionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const statusRef = useRef<HTMLParagraphElement | null>(null);

  // Reinicia el tick visual cuando el servidor proyecta otro item o tiempo.
  if (
    clockSource.itemId !== item.itemId ||
    clockSource.remaining !== authoritativeSeconds
  ) {
    setClockSource({ itemId: item.itemId, remaining: authoritativeSeconds });
    setDisplaySeconds(authoritativeSeconds);
  }

  const promptId = `feed-60-${item.itemId}-prompt`;
  const timerId = `feed-60-${item.itemId}-timer`;
  const hintsId = `feed-60-${item.itemId}-hints`;
  const statusId = `feed-60-${item.itemId}-status`;

  const resolved = selectedAction !== null;
  const controlsDisabled = disabled || resolved || expired;
  const verifyDisabled =
    controlsDisabled || verified || !item.verificationAvailable;

  const showEarlyWarning =
    !expired && displaySeconds > 0 && displaySeconds <= EARLY_WARNING_SECONDS;
  const showExpiredState = expired || displaySeconds === 0;
  const showHints = verified && verificationHints.length > 0;

  // El tick visual es solo una aproximación local y nunca extiende el límite.
  useEffect(() => {
    if (showExpiredState) return;
    const timer = window.setInterval(() => {
      setDisplaySeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [item.itemId, showExpiredState, authoritativeSeconds]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () =>
      setMotionPaused(document.documentElement.dataset.motion === "paused");
    sync();
    window.addEventListener("antidoto:motion-change", sync);
    return () => window.removeEventListener("antidoto:motion-change", sync);
  }, []);

  useEffect(() => {
    if (verified && !resolved) {
      decisionRefs.current.find((element) => !element?.disabled)?.focus();
    }
  }, [verified, resolved, item.itemId]);

  useEffect(() => {
    if (resolved || showExpiredState) {
      statusRef.current?.focus();
    }
  }, [resolved, showExpiredState, item.itemId]);

  function commitAction(value: FeedActionValue) {
    if (controlsDisabled) return;
    if (value === "verify" && verifyDisabled) return;
    onAction({ value });
  }

  function focusDecision(currentIndex: number, direction: 1 | -1) {
    const total = item.actions.filter((action) => action !== "verify").length;
    const nextIndex = (currentIndex + direction + total) % total;
    decisionRefs.current[nextIndex]?.focus();
  }

  function handleDecisionKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusDecision(index, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusDecision(index, -1);
        break;
    }
  }

  const timerProgress = showExpiredState
    ? 0
    : clampSeconds(displaySeconds) / 60;

  return (
    <section
      className="feed-timer"
      data-game-code="feed-60"
      data-motion-paused={motionPaused ? "true" : undefined}
      aria-labelledby={promptId}
      aria-describedby={`${timerId} ${statusId}`}
    >
      <div className="feed-timer__meta">
        <p className="feed-timer__source">
          <span className="feed-timer__source-label">Desde</span>
          {item.sourceLabel}
        </p>

        <p
          id={timerId}
          className={[
            "feed-timer__clock",
            showEarlyWarning ? "feed-timer__clock--warning" : null,
            showExpiredState ? "feed-timer__clock--expired" : null,
          ]
            .filter(Boolean)
            .join(" ")}
          role="timer"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="feed-timer__clock-label">Tiempo restante</span>
          <span className="feed-timer__clock-value">
            {showExpiredState ? "0 s" : formatSeconds(displaySeconds)}
          </span>
        </p>
      </div>

      <div className="feed-timer__track" aria-hidden="true">
        <span
          className="feed-timer__track-fill"
          style={{ transform: `scaleX(${timerProgress})` }}
        />
      </div>

      {showEarlyWarning ? (
        <p className="feed-timer__warning" role="alert">
          Quedan {formatSeconds(displaySeconds)}. Decide o la partida expira.
        </p>
      ) : null}

      <article className="feed-timer__post">
        <p className="feed-timer__kicker">Publicación {item.itemId.slice(-3)}</p>
        <h2 id={promptId} ref={promptRef} className="feed-timer__prompt">
          {item.prompt}
        </h2>
        <p className="feed-timer__body">{item.post}</p>
      </article>

      {showHints ? (
        <div
          id={hintsId}
          className="feed-timer__hints"
          role="region"
          aria-label="Pistas de verificación SIFT"
        >
          <p className="feed-timer__hints-title">Verificación rápida · SIFT</p>
          <ul className="feed-timer__hints-list">
            {verificationHints.map((hint) => (
              <li key={hint} className="feed-timer__hint">
                {hint}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {showExpiredState ? (
        <p className="feed-timer__expired" role="alert">
          El tiempo se agotó. La partida expiró y la última decisión aceptada
          conserva su feedback.
        </p>
      ) : null}

      <div
        className="feed-timer__controls"
        role="group"
        aria-label="Acciones del feed"
      >
        <button
          type="button"
          className={[
            "feed-timer__button",
            "feed-timer__button--verify",
            verified ? "feed-timer__button--used" : null,
          ]
            .filter(Boolean)
            .join(" ")}
          disabled={verifyDisabled}
          aria-pressed={verified}
          aria-describedby={verified ? hintsId : undefined}
          onClick={() => commitAction("verify")}
        >
          <span className="feed-timer__button-label">{ACTION_LABELS.verify}</span>
          <span className="feed-timer__button-hint">{ACTION_HINTS.verify}</span>
        </button>

        {item.actions
          .filter((action): action is FeedFinalDecision => action !== "verify")
          .map((action, index) => {
            const chosen = selectedAction === action;
            return (
              <button
                key={action}
                ref={(element) => {
                  decisionRefs.current[index] = element;
                }}
                type="button"
                className={[
                  "feed-timer__button",
                  `feed-timer__button--${action}`,
                  chosen ? "feed-timer__button--chosen" : null,
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={controlsDisabled}
                aria-pressed={chosen}
                onClick={() => commitAction(action)}
                onKeyDown={(event) => handleDecisionKeyDown(event, index)}
              >
                <span className="feed-timer__button-label">
                  {ACTION_LABELS[action]}
                </span>
                <span className="feed-timer__button-hint">
                  {ACTION_HINTS[action]}
                </span>
              </button>
            );
          })}
      </div>

      <p
        id={statusId}
        ref={statusRef}
        tabIndex={-1}
        className="visually-hidden"
        role="status"
        aria-live="polite"
      >
        {showExpiredState
          ? "La partida expiró por tiempo."
          : resolved
            ? `Decisión aceptada: ${ACTION_LABELS[selectedAction as FeedActionValue]}.`
            : verified
              ? "Verificación lista; revisa las pistas y decide."
              : ""}
      </p>

      {motionPaused ? (
        <p className="feed-timer__motion-note">
          La pausa visual no detiene el reloj: el tiempo autoritativo sigue
          corriendo.
        </p>
      ) : null}
    </section>
  );
}
