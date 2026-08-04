"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import {
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  getMessages,
  type Locale,
  type Messages,
} from "./i18n";

type I18nContextValue = Readonly<{
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
}>;

const I18nContext = createContext<I18nContextValue | null>(null);

function persistLocale(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // The cookie remains enough for server-rendered persistence.
  }
}

export function LanguageProvider({
  initialLocale,
  children,
}: Readonly<{ initialLocale: Locale; children: ReactNode }>) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      messages: getMessages(locale),
      setLocale: (nextLocale) => {
        if (nextLocale === locale) return;
        persistLocale(nextLocale);
        setLocaleState(nextLocale);
        window.location.reload();
      },
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  return value ?? {
    locale: "es",
    messages: getMessages("es"),
    setLocale: () => undefined,
  };
}
