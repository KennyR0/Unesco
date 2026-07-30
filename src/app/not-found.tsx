import Link from "next/link";

export default function NotFound() {
  return (
    <main className="landing-shell">
      <section className="landing-content" aria-labelledby="not-found-title">
        <p className="eyebrow">404</p>
        <h1 id="not-found-title">No encontramos esa vista</h1>
        <p className="supporting-copy">
          Regresa al inicio para continuar con Antídoto.
        </p>
        <Link className="primary-action" href="/">
          Ir al inicio
        </Link>
      </section>
    </main>
  );
}
