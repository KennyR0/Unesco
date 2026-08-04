import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Anton, Archivo, Space_Mono } from "next/font/google";

import { LanguageProvider } from "../lib/i18n/provider";
import {
  LOCALE_COOKIE,
  resolveLocale,
  type Locale,
} from "../lib/i18n/i18n";

import "./globals.css";
import "./arcade-visual.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

const motionInitializer = `
(function () {
  var key = "antidoto:motion:v1";
  var stored = null;
  try { stored = window.localStorage.getItem(key); } catch (error) {}
  var paused = stored === "paused" ||
    (stored !== "active" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  document.documentElement.dataset.motion = paused ? "paused" : "active";
})();`;

async function getRequestLocale(): Promise<Locale> {
  const cookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  return resolveLocale(cookie);
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale === "en" ? "Antidoto MIL Arcade" : "Antídoto Arcade MIL",
    description:
      locale === "en"
        ? "Six missions to train your eye against misinformation."
        : "Seis misiones para entrenar la mirada contra la desinformación.",
    keywords:
      locale === "en"
        ? ["media literacy", "misinformation", "UNESCO"]
        : ["alfabetización mediática", "desinformación", "UNESCO"],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      data-motion="active"
      className={`${anton.variable} ${archivo.variable} ${spaceMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionInitializer }} />
      </head>
      <body>
        <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
