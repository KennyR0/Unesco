"use client";

import Link from "next/link";

import { useI18n } from "../../lib/i18n/provider";
import { LanguageToggle } from "./language-toggle";
import { MotionToggle } from "./motion-toggle";

type ArcadeHeaderProps = Readonly<{
  home?: boolean;
}>;

export function ArcadeHeader({ home = false }: ArcadeHeaderProps) {
  const { messages } = useI18n();

  return (
    <>
      <a className="skip-link" href="#main-content">
        {messages.header.skip}
      </a>
      <header className="arcade-header">
        <Link
          className="arcade-header__brand"
          href="/"
          aria-label={messages.header.brandLabel}
        >
          <span className="arcade-header__mark" aria-hidden="true">A!</span>
          <span>
            <strong>{messages.chrome.brandMark}</strong>
            <small>{messages.chrome.brandSub}</small>
          </span>
        </Link>

        <nav className="arcade-header__nav" aria-label={messages.header.primaryNav}>
          <Link href={home ? "#arcade" : "/#arcade"}>{messages.header.arcade}</Link>
          <Link href={home ? "#manifiesto" : "/#manifiesto"}>{messages.header.manifesto}</Link>
          <Link href={home ? "#metodo" : "/#metodo"}>{messages.header.method}</Link>
        </nav>

        <div className="arcade-header__tools">
          <LanguageToggle />
          <MotionToggle />
        </div>
      </header>
    </>
  );
}
