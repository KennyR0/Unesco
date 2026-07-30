import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antídoto | Trivia educativa",
  description: "Una trivia breve para aprender a reconocer desinformación.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
