import { ArcadeHeader } from "../components/arcade/arcade-header";
import { getMessages } from "../lib/i18n/i18n";
import { getServerLocale } from "../lib/i18n/server";

export default async function Loading() {
  const messages = getMessages(await getServerLocale());
  return (
    <>
      <ArcadeHeader />
      <main id="main-content" className="state-page" aria-busy="true">
        <section className="state-panel state-panel--loading" aria-labelledby="loading-title">
          <p className="state-panel__code">{messages.state.loadingCode}</p>
          <h1 id="loading-title">{messages.state.loadingTitle}</h1>
          <p role="status" aria-live="polite">{messages.state.loadingBody}</p>
          <span className="state-panel__ticker" aria-hidden="true">•••</span>
        </section>
      </main>
    </>
  );
}
