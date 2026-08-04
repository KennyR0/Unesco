"use client";

import { useI18n } from "../../lib/i18n/provider";
import type { Locale } from "../../lib/i18n/i18n";

export function LanguageToggle() {
  const { locale, messages, setLocale } = useI18n();

  function choose(nextLocale: Locale) {
    setLocale(nextLocale);
  }

  return (
    <div className="language-toggle" role="group" aria-label={messages.header.language}>
      <button
        className="language-toggle__option"
        type="button"
        aria-pressed={locale === "es"}
        aria-label={messages.header.spanish}
        onClick={() => choose("es")}
      >
        ES
      </button>
      <span className="language-toggle__divider" aria-hidden="true">/</span>
      <button
        className="language-toggle__option"
        type="button"
        aria-pressed={locale === "en"}
        aria-label={messages.header.english}
        onClick={() => choose("en")}
      >
        EN
      </button>
    </div>
  );
}
