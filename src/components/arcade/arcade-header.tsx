import Link from "next/link";

import { MotionToggle } from "./motion-toggle";

type ArcadeHeaderProps = Readonly<{
  home?: boolean;
}>;

export function ArcadeHeader({ home = false }: ArcadeHeaderProps) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <header className="arcade-header">
        <Link
          className="arcade-header__brand"
          href="/"
          aria-label="Antídoto, ir al arcade"
        >
          <span className="arcade-header__mark" aria-hidden="true">A!</span>
          <span>
            <strong>ANTÍDOTO</strong>
            <small>Arcade MIL</small>
          </span>
        </Link>

        <nav className="arcade-header__nav" aria-label="Navegación principal">
          <Link href={home ? "#arcade" : "/#arcade"}>Arcade</Link>
          <Link href={home ? "#manifiesto" : "/#manifiesto"}>Manifiesto</Link>
          <Link href={home ? "#metodo" : "/#metodo"}>Método</Link>
        </nav>

        <MotionToggle />
      </header>
    </>
  );
}
