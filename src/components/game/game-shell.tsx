import type { ReactNode } from "react";

import type { PublicFeedback, SessionStatus } from "@antidoto/contracts";

import { FeedbackPanel } from "./feedback-panel";

export type GameProgress = Readonly<{
  current: number;
  total: number;
}>;

export type GameShellProps = Readonly<{
  title: string;
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

const STATUS_MESSAGES: Record<SessionStatus, string> = {
  intro: "Instrucciones listas",
  active: "Item listo para responder",
  processing: "Procesando respuesta",
  feedback: "Respuesta recibida",
  expired: "Partida expirada",
  finished: "Partida terminada",
  invalid: "Estado no disponible",
};

function normalizeProgress(progress: GameProgress): Required<GameProgress> {
  const total = Number.isFinite(progress.total)
    ? Math.max(1, Math.floor(progress.total))
    : 1;
  const current = Number.isFinite(progress.current)
    ? Math.min(total, Math.max(0, Math.floor(progress.current)))
    : 0;
  return { current, total };
}

function ProgressIndicator({ progress }: { progress: GameProgress }) {
  const safeProgress = normalizeProgress(progress);
  const label = `Progreso: ${safeProgress.current} de ${safeProgress.total}`;

  return (
    <div className="game-shell__progress">
      <p className="progress-label">{label}</p>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Progreso de la partida"
        aria-valuemin={0}
        aria-valuemax={safeProgress.total}
        aria-valuenow={safeProgress.current}
        aria-valuetext={label}
      >
        <span
          style={{
            width: `${(safeProgress.current / safeProgress.total) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

export function GameShell({
  title,
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
  const titleId = `${id}-title`;
  const errorId = `${id}-error`;
  const shellClassName = ["game-shell", className].filter(Boolean).join(" ");

  return (
    <main
      className={shellClassName}
      aria-labelledby={titleId}
      aria-describedby={error ? errorId : undefined}
      aria-busy={status === "processing"}
    >
      <header className="game-shell__header">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 id={titleId}>{title}</h1>
        {progress ? <ProgressIndicator progress={progress} /> : null}
        {status ? (
          <p className="game-shell__status" role="status" aria-live="polite">
            {statusMessage ?? STATUS_MESSAGES[status]}
          </p>
        ) : null}
      </header>

      {error ? (
        <div id={errorId} className="game-shell__error" role="alert">
          {error}
        </div>
      ) : null}

      {feedback ? (
        <FeedbackPanel feedback={feedback} nextAction={nextAction} />
      ) : null}

      <section className="game-shell__content">{children}</section>
    </main>
  );
}
