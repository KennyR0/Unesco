import Link from "next/link";

import { ArcadeHeader } from "../components/arcade/arcade-header";
import { getMessages } from "../lib/i18n/i18n";
import { getServerLocale } from "../lib/i18n/server";

export default async function NotFound() {
  const messages = getMessages(await getServerLocale());
  return (
    <>
      <ArcadeHeader />
      <main id="main-content" className="state-page">
        <section className="state-panel state-panel--not-found" aria-labelledby="not-found-title">
          <p className="state-panel__code">{messages.state.notFoundSignal}</p>
          <p className="state-panel__number" aria-hidden="true">404</p>
          <h1 id="not-found-title">{messages.state.notFoundTitle}</h1>
          <p className="supporting-copy">{messages.state.notFoundBody}</p>
          <Link className="primary-action" href="/">{messages.games.backToArcade}</Link>
        </section>
      </main>
    </>
  );
}
