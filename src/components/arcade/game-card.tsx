import Link from "next/link";

import type { GameCatalogEntry } from "@antidoto/contracts";

type GameCardProps = Readonly<{
  game: GameCatalogEntry;
  index: number;
}>;

export function GameCard({ game, index }: GameCardProps) {
  const tone = (index % 3) + 1;
  const mechanicLabel = game.mechanic.replaceAll("_", " ");

  return (
    <article
      className={`arcade-card arcade-card--${tone}${game.available ? "" : " arcade-card--unavailable"}`}
      data-availability={game.available ? "available" : "unavailable"}
    >
      <div className="arcade-card__meta">
        <span>{game.gameCode}</span>
        <span>{game.available ? "Disponible" : "No disponible"}</span>
      </div>
      <h3>{game.name}</h3>
      <p>{game.objective}</p>
      <p className="arcade-card__mechanic">Práctica: {mechanicLabel}</p>
      {game.available ? (
        <Link
          className="arcade-card__link"
          href={game.route}
          aria-label={`Abrir ${game.name}`}
        >
          <span>Jugar ahora</span>
          <span aria-hidden="true">↗</span>
        </Link>
      ) : (
        <p className="arcade-card__status" role="status">
          Próximamente
        </p>
      )}
    </article>
  );
}