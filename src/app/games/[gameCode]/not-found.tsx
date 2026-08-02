import Link from "next/link";

import { ArcadeHeader } from "../../../components/arcade/arcade-header";

export default function NotFound() {
  return (
    <>
      <ArcadeHeader />
      <main id="main-content" className="game-shell game-route__not-found" aria-labelledby="game-not-found-title">
        <header className="game-shell__header">
          <p className="game-shell__mission-sticker">404 / ARCADE</p>
          <h1 id="game-not-found-title">Juego no<br />encontrado.</h1>
        </header>
        <section className="game-shell__content">
          <p>
            Ese código no corresponde a una misión disponible. Vuelve al arcade
            para elegir un juego válido.
          </p>
          <Link className="primary-action" href="/">Volver al arcade</Link>
        </section>
      </main>
    </>
  );
}
