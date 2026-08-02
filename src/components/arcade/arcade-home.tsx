import type { GameCatalogEntry } from "@antidoto/contracts";

import { GameCard } from "./game-card";

type ArcadeHomeProps = Readonly<{
  games: readonly GameCatalogEntry[];
}>;

export function ArcadeHome({ games }: ArcadeHomeProps) {
  return (
    <main className="arcade-home" aria-labelledby="arcade-title">
      <header className="arcade-home__hero">
        <p className="eyebrow">UNESCO Youth Hackathon 2026</p>
        <div className="arcade-home__hero-row">
          <div>
            <p className="arcade-home__kicker">Antídoto / Arcade MIL</p>
            <h1 id="arcade-title">Juega a detectar lo que intenta engañarte.</h1>
          </div>
          <p className="arcade-home__count" aria-label={`${games.length} juegos disponibles`}>
            <span>{String(games.length).padStart(2, "0")}</span>
            juegos para
            <br />
            mirar mejor
          </p>
        </div>
        <p className="arcade-home__lede">
          Seis experiencias breves para practicar cómo verificar imágenes,
          mensajes, titulares y fuentes antes de compartir.
        </p>
      </header>

      <section className="arcade-home__missions" aria-labelledby="missions-title">
        <div className="arcade-home__section-heading">
          <div>
            <p className="arcade-home__label">Elige tu misión</p>
            <h2 id="missions-title">¿Por dónde quieres empezar?</h2>
          </div>
          <p className="arcade-home__hint">
            Cada juego enseña una señal distinta. Entra, prueba y aprende de la
            consecuencia.
          </p>
        </div>

        <ul className="arcade-home__grid">
          {games.map((game, index) => (
            <li key={game.gameCode}>
              <GameCard game={game} index={index} />
            </li>
          ))}
        </ul>
      </section>

      <footer className="arcade-home__footer">
        <p>Una decisión pequeña puede cambiar lo que compartes.</p>
        <span aria-hidden="true">✳</span>
      </footer>
    </main>
  );
}