"use client";

import Link from "next/link";

import type { GameCode } from "@antidoto/contracts";

import { clearInvalidSessionAction } from "../../app/actions/game";
import { useI18n } from "../../lib/i18n/provider";

export type SecureStateReason = "missing" | "invalid" | "expired" | "result-expired";

type SecureStateViewProps = Readonly<{ canClear?: boolean; gameCode?: GameCode; reason?: SecureStateReason }>;

export function SecureStateView({ canClear = false, gameCode, reason = "missing" }: SecureStateViewProps) {
  const { messages } = useI18n();
  const isExpired = reason === "expired";
  const title = isExpired ? messages.state.secureExpiredTitle : messages.state.secureMissingTitle;
  const body = isExpired ? messages.state.secureExpired : messages.state.secureMissing;
  return (
    <main className="landing-shell" aria-labelledby="secure-state-title" data-recovery-state={reason} data-game-code={gameCode}>
      <section className="landing-content">
        <p className="eyebrow">{messages.state.secureEyebrow}</p>
        <h1 id="secure-state-title">{title}</h1>
        <p className="supporting-copy" role="status" aria-live="polite">{body}</p>
        <div className="action-row">
          <Link className="primary-action" href="/leaderboard">{messages.state.consultRanking}</Link>
          {canClear ? (
            <form action={clearInvalidSessionAction}>
              {gameCode ? <input type="hidden" name="gameCode" value={gameCode} /> : null}
              <button className="secondary-action" type="submit">{messages.state.startAnother}</button>
            </form>
          ) : <Link className="secondary-action" href="/">{messages.state.startAnother}</Link>}
        </div>
      </section>
    </main>
  );
}
