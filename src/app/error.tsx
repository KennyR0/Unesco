"use client";

import { useEffect } from "react";

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
    <main className="landing-shell" role="alert">
      <section className="landing-content" aria-labelledby="error-title">
        <h1 id="error-title">Algo salió mal</h1>
        <p className="supporting-copy">
          No pudimos cargar esta vista. Intenta de nuevo.
        </p>
        <button className="primary-action" onClick={() => reset()} type="button">
          Reintentar
        </button>
      </section>
    </main>
  );
}
