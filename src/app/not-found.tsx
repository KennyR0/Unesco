import Link from "next/link";

import { ArcadeHeader } from "../components/arcade/arcade-header";

export default function NotFound() {
  return (
    <>
      <ArcadeHeader />
      <main id="main-content" className="state-page">
        <section className="state-panel state-panel--not-found" aria-labelledby="not-found-title">
          <p className="state-panel__code">ERROR / 404</p>
          <p className="state-panel__number" aria-hidden="true">404</p>
          <h1 id="not-found-title">Esa señal<br />no existe.</h1>
          <p className="supporting-copy">
            La ruta se perdió, pero puedes volver al arcade y elegir una misión válida.
          </p>
          <Link className="primary-action" href="/">Volver al arcade</Link>
        </section>
      </main>
    </>
  );
}
