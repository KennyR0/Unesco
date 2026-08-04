"use client";

import Link from "next/link";

import { ArcadeHeader } from "../../../components/arcade/arcade-header";
import { useI18n } from "../../../lib/i18n/provider";

export default function NotFound() {
  const { messages } = useI18n();
  return (
    <>
      <ArcadeHeader />
      <main id="main-content" className="game-shell game-route__not-found" aria-labelledby="game-not-found-title">
        <header className="game-shell__header">
          <p className="game-shell__mission-sticker">404 / ARCADE</p>
          <h1 id="game-not-found-title">{messages.state.gameNotFoundTitle}</h1>
        </header>
        <section className="game-shell__content">
          <p>{messages.state.gameNotFoundBody}</p>
          <Link className="primary-action" href="/">{messages.games.backToArcade}</Link>
        </section>
      </main>
    </>
  );
}
