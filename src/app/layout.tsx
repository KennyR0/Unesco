import type { Metadata } from "next";
import { Anton, Archivo, Space_Mono } from "next/font/google";

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

export const metadata: Metadata = {
  title: "Antídoto Arcade MIL",
  description:
    "Seis misiones para entrenar la mirada contra la desinformación.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      data-motion="active"
      className={`${anton.variable} ${archivo.variable} ${spaceMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionInitializer }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
