import type { GameCatalogEntry } from "@antidoto/contracts";

import { ArcadeHeader } from "./arcade-header";
import { GameCard } from "./game-card";

type ArcadeHomeProps = Readonly<{
  games: readonly GameCatalogEntry[];
}>;

const SIFT_STEPS = [
  ["S", "Stop", "Frena antes de reaccionar o compartir."],
  ["I", "Investiga", "Pregunta quién está detrás de la información."],
  ["F", "Busca cobertura", "Compara con fuentes mejores y diversas."],
  ["T", "Rastrea", "Vuelve al contexto y a la fuente original."],
] as const;

export function ArcadeHome({ games }: ArcadeHomeProps) {
  return (
    <>
      <ArcadeHeader home />
      <main
        id="main-content"
        className="arcade-home"
        aria-labelledby="arcade-title"
      >
        <section className="arcade-hero" aria-labelledby="arcade-title">
          <div className="arcade-hero__copy">
            <p className="arcade-kicker">
              UNESCO Youth Hackathon 2026 / Arcade MIL
            </p>
            <h1 id="arcade-title">
              <span>La mentira</span>
              <span className="arcade-hero__viral" data-text="es viral.">
                es viral.
              </span>
              <span>La verdad</span>
              <span className="arcade-hero__trained">se entrena.</span>
            </h1>
            <p className="arcade-hero__lede">
              Juega a detectar lo que intenta engañarte.
            </p>
            <div className="arcade-hero__actions">
              <a className="physical-button physical-button--acid" href="#arcade">
                Elegir misión <span aria-hidden="true">↘</span>
              </a>
              <a className="text-action" href="#metodo">Ver el método SIFT</a>
            </div>
          </div>

          <div className="signal-collage" aria-hidden="true">
            <div className="signal-card signal-card--false">
              <span>ALERTA</span>
              <strong>¡COMPÁRTELO YA!</strong>
              <small>fuente: “me llegó”</small>
            </div>
            <div className="signal-card signal-card--verified">
              <span>VERIFICADO</span>
              <strong>RASTREA LA FUENTE</strong>
              <small>contexto + fecha + autor</small>
            </div>
            <div className="signal-stamp signal-stamp--question">¿?</div>
            <div className="signal-stamp signal-stamp--check">✓</div>
            <p className="signal-tape">NO TODO LO VIRAL ES VERDAD</p>
          </div>

          <p
            className="arcade-hero__counter"
            aria-label={`${games.length} misiones disponibles`}
          >
            <strong>{String(games.length).padStart(2, "0")}</strong>
            <span>misiones para<br />mirar mejor</span>
          </p>
        </section>

        <div
          className="kinetic-marquee"
          aria-label="Observa, verifica, decide y comparte con cuidado"
        >
          <div className="kinetic-marquee__track">
            <span>OBSERVA ✦ VERIFICA ✦ DECIDE ✦ COMPARTE CON CUIDADO ✦ </span>
            <span aria-hidden="true">
              OBSERVA ✦ VERIFICA ✦ DECIDE ✦ COMPARTE CON CUIDADO ✦
            </span>
          </div>
        </div>

        <section
          id="arcade"
          className="arcade-missions"
          aria-labelledby="missions-title"
        >
          <header className="section-intro section-intro--split">
            <div>
              <p className="section-label">01 / Elige tu misión</p>
              <h2 id="missions-title">Entrena el ojo.<br />Rompe la cadena.</h2>
            </div>
            <p>
              Seis experiencias breves. Cada una entrena una señal distinta y
              te devuelve una explicación antes de avanzar.
            </p>
          </header>

          <ol className="arcade-grid">
            {games.map((game, index) => (
              <li key={game.gameCode}>
                <GameCard game={game} index={index} />
              </li>
            ))}
          </ol>
        </section>

        <section
          id="manifiesto"
          className="arcade-manifesto"
          aria-labelledby="manifesto-title"
        >
          <p className="section-label section-label--inverse">02 / Manifiesto</p>
          <div className="arcade-manifesto__grid">
            <h2 id="manifesto-title">Dudar también<br />es una habilidad.</h2>
            <div>
              <p>
                La desinformación busca velocidad. Antídoto entrena una pausa:
                mirar mejor, preguntar de dónde viene y decidir con evidencia.
              </p>
              <p className="arcade-manifesto__declaration">
                No se trata de desconfiar de todo.<br />Se trata de verificar mejor.
              </p>
            </div>
          </div>
        </section>

        <section id="metodo" className="sift-method" aria-labelledby="method-title">
          <header className="section-intro">
            <p className="section-label">03 / Método de bolsillo</p>
            <h2 id="method-title">SIFT antes de compartir.</h2>
          </header>
          <ol className="sift-method__steps">
            {SIFT_STEPS.map(([letter, title, description]) => (
              <li key={letter}>
                <span aria-hidden="true">{letter}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <footer className="arcade-footer">
          <p>ANTÍDOTO / Una pausa puede cortar la cadena.</p>
          <a href="#main-content">Volver arriba ↑</a>
        </footer>
      </main>
    </>
  );
}
