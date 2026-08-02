import Link from "next/link";

import type { GameCatalogEntry } from "@antidoto/contracts";

type GameCardProps = Readonly<{
  game: GameCatalogEntry;
  index: number;
}>;

export function GameCard({ game, index }: GameCardProps) {
  const mechanicLabel = game.mechanic.replaceAll("_", " ");
  const missionNumber = String(index + 1).padStart(2, "0");

  return (
    <article
      className={`arcade-card${game.available ? "" : " arcade-card--unavailable"}`}
      data-game-code={game.gameCode}
      data-availability={game.available ? "available" : "unavailable"}
    >
      <div className="arcade-card__topline">
        <span className="arcade-card__number" aria-hidden="true">
          {missionNumber}
        </span>
        <span className="arcade-card__availability">
          {game.available ? "Misión abierta" : "En preparación"}
        </span>
      </div>
      <div className="arcade-card__body">
        <p className="arcade-card__code">{game.gameCode}</p>
        <h3>{game.name}</h3>
        <p className="arcade-card__objective">{game.objective}</p>
        <p className="arcade-card__mechanic">Práctica / {mechanicLabel}</p>
      </div>
      {game.available ? (
        <Link
          className="arcade-card__link"
          href={game.route}
          aria-label={`Abrir ${game.name}`}
        >
          <span>Entrar al juego</span>
          <span aria-hidden="true">↗</span>
        </Link>
      ) : (
        <p className="arcade-card__status" role="status">Próximamente</p>
      )}
    </article>
  );
}
