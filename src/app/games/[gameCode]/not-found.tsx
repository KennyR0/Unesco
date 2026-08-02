import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="game-shell game-route__not-found"
      aria-labelledby="game-not-found-title"
    >
      <header className="game-shell__header">
        <p className="eyebrow">404 / ARCADE</p>
        <h1 id="game-not-found-title">Juego no encontrado</h1>
      </header>

      <section className="game-shell__content">
        <p>
          Ese código no corresponde a una misión disponible. Vuelve al arcade
          para elegir un juego válido.
        </p>
        <Link className="primary-action" href="/">
          Volver al arcade
        </Link>
      </section>
    </main>
  );
}
