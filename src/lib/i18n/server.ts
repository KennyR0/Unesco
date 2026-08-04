import { cookies } from "next/headers";

import { LOCALE_COOKIE, resolveLocale, type Locale } from "./i18n";

export async function getServerLocale(): Promise<Locale> {
  try {
    return resolveLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  } catch (error) {
    if (error instanceof Error && error.message.includes("outside a request scope")) {
      return "es";
    }
    throw error;
  }
}
