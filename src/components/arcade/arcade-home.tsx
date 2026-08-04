"use client";

import type { GameCatalogEntry } from "@antidoto/contracts";

import { useI18n } from "../../lib/i18n/provider";
import { ArcadeHeader } from "./arcade-header";
import { GameCard } from "./game-card";

type ArcadeHomeProps = Readonly<{
  games: readonly GameCatalogEntry[];
}>;

export function ArcadeHome({ games }: ArcadeHomeProps) {
  const { messages } = useI18n();
  const localizedGames = games;

  return (
    <>
      <ArcadeHeader home />
      <main id="main-content" className="arcade-home" aria-labelledby="arcade-title">
        <section className="arcade-hero" aria-labelledby="arcade-title">
          <div className="arcade-hero__copy">
            <p className="arcade-kicker">{messages.home.kicker}</p>
            <h1 id="arcade-title">
              {messages.home.heroLines.map((line, index) => (
                <span
                  key={line}
                  className={index === 1 ? "arcade-hero__viral" : index === 3 ? "arcade-hero__trained" : undefined}
                  data-text={index === 1 ? line : undefined}
                >
                  {line}
                </span>
              ))}
            </h1>
            <p className="arcade-hero__lede">{messages.home.lede}</p>
            <div className="arcade-hero__actions">
              <a className="physical-button physical-button--acid" href="#arcade">
                {messages.home.chooseMission} <span aria-hidden="true">↘</span>
              </a>
              <a className="text-action" href="#metodo">{messages.home.seeMethod}</a>
            </div>
          </div>

          <div className="signal-collage" aria-hidden="true">
            <div className="signal-card signal-card--false">
              <span>{messages.home.signalAlert}</span>
              <strong>{messages.home.signalShare}</strong>
              <small>{messages.home.signalSource}</small>
            </div>
            <div className="signal-card signal-card--verified">
              <span>{messages.home.signalVerified}</span>
              <strong>{messages.home.signalTrace}</strong>
              <small>{messages.home.signalContext}</small>
            </div>
            <div className="signal-stamp signal-stamp--question">?</div>
            <div className="signal-stamp signal-stamp--check">✓</div>
            <p className="signal-tape">{messages.home.signalTape}</p>
          </div>

          <p className="arcade-hero__counter" aria-label={messages.home.missionCount(localizedGames.length)}>
            <strong>{String(localizedGames.length).padStart(2, "0")}</strong>
            <span>{messages.home.missionCountLabel}</span>
          </p>
        </section>

        <div className="kinetic-marquee" aria-label={messages.home.marquee}>
          <div className="kinetic-marquee__track">
            <span>{messages.home.marquee}</span>
            <span aria-hidden="true">{messages.home.marquee}</span>
          </div>
        </div>

        <section id="arcade" className="arcade-missions" aria-labelledby="missions-title">
          <header className="section-intro section-intro--split">
            <div>
              <p className="section-label">{messages.home.missionSection}</p>
              <h2 id="missions-title">{messages.home.missionTitle}</h2>
            </div>
            <p>{messages.home.missionDescription}</p>
          </header>

          <ol className="arcade-grid">
            {localizedGames.map((game, index) => (
              <li key={game.gameCode}>
                <GameCard game={game} index={index} />
              </li>
            ))}
          </ol>
        </section>

        <section id="manifiesto" className="arcade-manifesto" aria-labelledby="manifesto-title">
          <p className="section-label section-label--inverse">{messages.home.manifestoSection}</p>
          <div className="arcade-manifesto__grid">
            <h2 id="manifesto-title">{messages.home.manifestoTitle}</h2>
            <div>
              <p>{messages.home.manifestoBody}</p>
              <p className="arcade-manifesto__declaration">{messages.home.manifestoDeclaration}</p>
            </div>
          </div>
        </section>

        <section id="metodo" className="sift-method" aria-labelledby="method-title">
          <header className="section-intro">
            <p className="section-label">{messages.home.methodSection}</p>
            <h2 id="method-title">{messages.home.methodTitle}</h2>
          </header>
          <ol className="sift-method__steps">
            {messages.home.sift.map(({ title, description }, index) => (
              <li key={title}>
                <span aria-hidden="true">{"SIFT"[index]}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <footer className="arcade-footer">
          <p>{messages.home.footer}</p>
          <a href="#main-content">{messages.home.backToTop}</a>
        </footer>
      </main>
    </>
  );
}
