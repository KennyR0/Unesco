"use client";

import { useEffect } from "react";

import { ArcadeHeader } from "../components/arcade/arcade-header";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <ArcadeHeader />
      <main id="main-content" className="state-page" role="alert">
        <section className="state-panel state-panel--error" aria-labelledby="error-title">
          <p className="state-panel__code">SEÑAL INTERRUMPIDA</p>
          <h1 id="error-title">Algo hizo<br />ruido.</h1>
          <p className="supporting-copy">
            No pudimos cargar esta vista. Tu siguiente intento puede recuperarla.
          </p>
          <button className="primary-action" onClick={() => reset()} type="button">
            Reintentar
          </button>
        </section>
      </main>
    </>
  );
}
