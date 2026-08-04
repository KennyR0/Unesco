import { describe, expect, it } from "vitest";

import {
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  getMessages,
  resolveLocale,
  type Locale,
} from "./i18n";

describe("i18n arcade", () => {
  it("uses Spanish as the safe default and rejects unknown locales", () => {
    expect(resolveLocale(undefined)).toBe("es");
    expect(resolveLocale("fr")).toBe("es");
    expect(resolveLocale("en")).toBe("en");
    expect(resolveLocale("EN")).toBe("en");
  });

  it("exposes stable browser persistence keys", () => {
    expect(LOCALE_COOKIE).toBe("antidoto:locale:v1");
    expect(LOCALE_STORAGE_KEY).toBe("antidoto:locale:v1");
  });

  it.each<[Locale, string, string]>([
    ["es", "Arcade", "Pausar animación"],
    ["en", "Arcade", "Pause animation"],
  ])("returns complete UI copy for %s", (locale, navigation, motion) => {
    const messages = getMessages(locale);
    expect(messages.header.arcade).toBe(navigation);
    expect(messages.motion.pause).toBe(motion);
    expect(messages.home.heroLines).toHaveLength(4);
    expect(messages.games.enter).toBeTruthy();
    expect(messages.errors.invalidAlias).toBeTruthy();
  });
});
