import Link from "next/link";

import { StartGameForm } from "../components/game/start-game-form";

export default function HomePage() {
  return (
    <main className="landing-shell">
      <section className="landing-content" aria-labelledby="page-title">
        <p className="eyebrow">UNESCO Youth Hackathon 2026</p>
        <h1 id="page-title">Antídoto</h1>
        <p className="lede">
          Una trivia breve para aprender a reconocer desinformación, contenido
          manipulado y titulares engañosos.
        </p>
        <StartGameForm />
        <div className="landing-actions"><Link className="secondary-action" href="/leaderboard">Consultar ranking</Link></div>
        <p className="supporting-copy">Aprende una señal, toma una decisión y verifica antes de compartir.</p>
      </section>
    </main>
  );
}
