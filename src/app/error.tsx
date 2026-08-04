"use client";

import { useEffect } from "react";

import { useI18n } from "../lib/i18n/provider";
import { ArcadeHeader } from "../components/arcade/arcade-header";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { messages } = useI18n();
  useEffect(() => { console.error(error); }, [error]);
  return (
    <>
      <ArcadeHeader />
      <main id="main-content" className="state-page" role="alert">
        <section className="state-panel state-panel--error" aria-labelledby="error-title">
          <p className="state-panel__code">{messages.state.errorSignal}</p>
          <h1 id="error-title">{messages.state.errorTitle}</h1>
          <p className="supporting-copy">{messages.state.errorBody}</p>
          <button className="primary-action" onClick={() => reset()} type="button">{messages.state.retry}</button>
        </section>
      </main>
    </>
  );
}
