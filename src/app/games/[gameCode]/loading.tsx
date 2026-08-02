import { ArcadeHeader } from "../../../components/arcade/arcade-header";

export default function Loading() {
  return (
    <>
      <ArcadeHeader />
      <main id="main-content" className="game-shell game-route__loading" aria-busy="true">
        <header className="game-shell__header">
          <p className="game-shell__mission-sticker">Antídoto / Arcade MIL</p>
          <h1 id="game-loading-title">Preparando<br />tu misión.</h1>
          <p className="game-shell__status" role="status" aria-live="polite">
            <span aria-hidden="true">●</span> Cargando la misión…
          </p>
        </header>
      </main>
    </>
  );
}
