"use client";

import { ArcadeHeader } from "../../../components/arcade/arcade-header";
import { useI18n } from "../../../lib/i18n/provider";

export default function Loading() {
  const { messages } = useI18n();
  return (
    <>
      <ArcadeHeader />
      <main id="main-content" className="game-shell game-route__loading" aria-busy="true">
        <header className="game-shell__header">
          <p className="game-shell__mission-sticker">Antídoto / Arcade MIL</p>
          <h1 id="game-loading-title">{messages.state.gameLoadingTitle}</h1>
          <p className="game-shell__status" role="status" aria-live="polite"><span aria-hidden="true">●</span> {messages.state.gameLoadingBody}</p>
        </header>
      </main>
    </>
  );
}
