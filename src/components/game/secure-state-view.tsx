import Link from "next/link";

import type { GameCode } from "@antidoto/contracts";

import { clearInvalidSessionAction } from "../../app/actions/game";

export type SecureStateReason = "missing" | "invalid" | "expired" | "result-expired";

type SecureStateViewProps = Readonly<{
  canClear?: boolean;
  gameCode?: GameCode;
  reason?: SecureStateReason;
}>;

export function SecureStateView({
  canClear = false,
  gameCode,
  reason = "missing",
}: SecureStateViewProps) {
  const isExpired = reason === "expired";
  const statusMessage = isExpired
    ? "La partida expiró de forma segura. Puedes volver al arcade e iniciar otra."
    : "No hay una partida recuperable en este navegador. Puedes volver al arcade e iniciar otra.";

  return (
    <main
      className="landing-shell"
      aria-labelledby="secure-state-title"
      data-recovery-state={reason}
      data-game-code={gameCode}
    >
      <section className="landing-content">
        <p className="eyebrow">Estado seguro</p>
        <h1 id="secure-state-title">
          {isExpired
            ? "La partida expiró de forma segura."
            : "No hay una partida recuperable en este navegador."}
        </h1>
        <p className="supporting-copy" role="status" aria-live="polite">
          {statusMessage}
        </p>
        <div className="action-row">
          <Link className="primary-action" href="/leaderboard">
            Consultar ranking
          </Link>
          {canClear ? (
            <form action={clearInvalidSessionAction}>
              {gameCode ? (
                <input type="hidden" name="gameCode" value={gameCode} />
              ) : null}
              <button className="secondary-action" type="submit">
                Iniciar otra partida
              </button>
            </form>
          ) : (
            <Link className="secondary-action" href="/">
              Iniciar otra partida
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
