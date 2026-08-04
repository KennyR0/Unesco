"use client";

import Link from "next/link";

import type { GameCatalogEntry } from "@antidoto/contracts";

import { translateMechanic } from "../../lib/i18n/content";
import { useI18n } from "../../lib/i18n/provider";

type GameCardProps = Readonly<{
  game: GameCatalogEntry;
  index: number;
}>;

export function GameCard({ game, index }: GameCardProps) {
  const { locale, messages } = useI18n();
  const missionNumber = String(index + 1).padStart(2, "0");

  return (
    <article
      className={`arcade-card${game.available ? "" : " arcade-card--unavailable"}`}
      data-game-code={game.gameCode}
      data-availability={game.available ? "available" : "unavailable"}
    >
      <div className="arcade-card__topline">
        <span className="arcade-card__number" aria-hidden="true">{missionNumber}</span>
        <span className="arcade-card__availability">
          {game.available ? messages.games.missionOpen : messages.games.preparing}
        </span>
      </div>
      <div className="arcade-card__body">
        <p className="arcade-card__code">{game.gameCode}</p>
        <h3>{game.name}</h3>
        <p className="arcade-card__objective">{game.objective}</p>
        <p className="arcade-card__mechanic">
          {messages.games.practice} / {translateMechanic(game.mechanic, locale)}
        </p>
      </div>
      {game.available ? (
        <Link className="arcade-card__link" href={game.route} aria-label={messages.games.openLabel(game.name)}>
          <span>{messages.games.enter}</span>
          <span aria-hidden="true">↗</span>
        </Link>
      ) : (
        <p className="arcade-card__status" role="status">{messages.games.upcoming}</p>
      )}
    </article>
  );
}
