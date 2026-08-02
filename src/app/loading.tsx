import { ArcadeHeader } from "../components/arcade/arcade-header";

export default function Loading() {
  return (
    <>
      <ArcadeHeader />
      <main id="main-content" className="state-page" aria-busy="true">
        <section className="state-panel state-panel--loading" aria-labelledby="loading-title">
          <p className="state-panel__code">ANTÍDOTO / CARGANDO</p>
          <h1 id="loading-title">Afinando<br />la mirada.</h1>
          <p role="status" aria-live="polite">Preparando el arcade…</p>
          <span className="state-panel__ticker" aria-hidden="true">•••</span>
        </section>
      </main>
    </>
  );
}
