import Link from "next/link";

import { clearInvalidSessionAction } from "../../app/actions/game";

export function SecureStateView({ canClear = false }: { canClear?: boolean }) {
  return (
    <main className="landing-shell" aria-labelledby="secure-state-title">
      <section className="landing-content">
        <p className="eyebrow">Estado seguro</p>
        <h1 id="secure-state-title">No hay una partida recuperable en este navegador.</h1>
        <p className="supporting-copy">Puedes consultar el ranking o iniciar otra.</p>
        <div className="action-row"><Link className="primary-action" href="/leaderboard">Consultar ranking</Link>{canClear ? <form action={clearInvalidSessionAction}><button className="secondary-action" type="submit">Iniciar otra partida</button></form> : <Link className="secondary-action" href="/">Iniciar otra partida</Link>}</div>
      </section>
    </main>
  );
}
