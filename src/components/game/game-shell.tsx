"use client";

import type { ReactNode } from "react";

import type { GameCode, PublicFeedback, SessionStatus } from "@antidoto/contracts";

import { useI18n } from "../../lib/i18n/provider";
import { ArcadeHeader } from "../arcade/arcade-header";
import { FeedbackPanel } from "./feedback-panel";

export type GameProgress = Readonly<{ current: number; total: number }>;

export type GameShellProps = Readonly<{
  title: string;
  gameCode?: GameCode;
  eyebrow?: string;
  status?: SessionStatus;
  statusMessage?: string;
  progress?: GameProgress | null;
  error?: string | null;
  feedback?: PublicFeedback | null;
  nextAction?: ReactNode;
  children: ReactNode;
  id?: string;
  className?: string;
}>;

function normalizeProgress(progress: GameProgress): Required<GameProgress> {
  const total = Number.isFinite(progress.total) ? Math.max(1, Math.floor(progress.total)) : 1;
  const current = Number.isFinite(progress.current)
    ? Math.min(total, Math.max(0, Math.floor(progress.current)))
    : 0;
  return { current, total };
}

export function GameShell({
  title,
  gameCode,
  eyebrow,
  status,
  statusMessage,
  progress,
  error,
  feedback,
  nextAction,
  children,
  id = "game-shell",
  className,
}: GameShellProps) {
  const { messages } = useI18n();
  const titleId = `${id}-title`;
  const errorId = `${id}-error`;
  const shellClassName = ["game-shell", className].filter(Boolean).join(" ");
  const feedbackPending = Boolean(feedback);
  const progressLabel = progress
    ? (() => {
        const safe = normalizeProgress(progress);
        return `${messages.games.training === "MIL training" ? "Progress" : "Progreso"}: ${safe.current} ${messages.games.training === "MIL training" ? "of" : "de"} ${safe.total}`;
      })()
    : null;

  return (
    <>
      <ArcadeHeader />
      <main
        id="main-content"
        className={shellClassName}
        data-game-code={gameCode}
        data-session-status={status}
        data-feedback-pending={feedbackPending ? "true" : "false"}
        aria-labelledby={titleId}
        aria-describedby={error ? errorId : undefined}
        aria-busy={status === "processing"}
      >
        <header className="game-shell__header">
          <div className="game-shell__topline">
            <p className="game-shell__mission-sticker">
              {gameCode ? `${messages.games.mission} / ${gameCode}` : messages.games.training}
            </p>
            {status ? (
              <p className="game-shell__status" role="status" aria-live="polite">
                <span aria-hidden="true">●</span>
                {statusMessage ?? (status === "processing"
                  ? (messages.games.training === "MIL training" ? "Processing answer" : "Procesando respuesta")
                  : status === "active"
                    ? messages.games.missionInProgress
                    : status === "feedback"
                      ? (messages.games.training === "MIL training" ? "Answer received" : "Respuesta recibida")
                      : status === "finished"
                        ? messages.games.gameFinished
                        : status === "expired"
                          ? messages.games.gameExpired
                          : messages.games.missionReady)}
              </p>
            ) : null}
          </div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 id={titleId}>{title}</h1>
          {progressLabel ? (
            <div className="game-shell__progress">
              <p className="progress-label">{progressLabel}</p>
              <div
                className="progress-track"
                role="progressbar"
                aria-label={messages.games.mission}
                aria-valuemin={0}
                aria-valuemax={normalizeProgress(progress as GameProgress).total}
                aria-valuenow={normalizeProgress(progress as GameProgress).current}
                aria-valuetext={progressLabel}
              >
                <span
                  style={{
                    width: `${(normalizeProgress(progress as GameProgress).current / normalizeProgress(progress as GameProgress).total) * 100}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </header>

        {error ? (
          <div id={errorId} className="game-shell__error" role="alert">
            <strong>Error /</strong> {error}
          </div>
        ) : null}

        <section className="game-shell__content" hidden={feedbackPending} inert={feedbackPending || undefined}>
          {children}
        </section>

        {feedback ? <FeedbackPanel feedback={feedback} nextAction={nextAction} /> : null}
      </main>
    </>
  );
}
