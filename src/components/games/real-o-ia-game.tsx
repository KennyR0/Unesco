"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { PublicItem } from "@antidoto/contracts";

import { useI18n } from "../../lib/i18n/provider";

export type RealOrIaItem = Extract<PublicItem, { gameCode: "real-o-ia" }>;
export type VerdictChoice = RealOrIaItem["choices"][number];

const MOBILE_FIRST_SIZES = "(max-width: 480px) 100vw, (max-width: 768px) 100vw, 640px";

export type RealOrIaGameProps = Readonly<{
  item: RealOrIaItem;
  onVerdict: (verdict: VerdictChoice) => void;
  selectedVerdict?: VerdictChoice | null;
  disabled?: boolean;
  priority?: boolean;
}>;

function buildSrcSet(srcSet: RealOrIaItem["media"]["srcSet"] | undefined): string | undefined {
  if (!srcSet) return undefined;
  const parts: string[] = [];
  if (srcSet["480"]) parts.push(`${srcSet["480"]} 480w`);
  if (srcSet["768"]) parts.push(`${srcSet["768"]} 768w`);
  if (srcSet["1280"]) parts.push(`${srcSet["1280"]} 1280w`);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

export function RealOrIaGame({ item, onVerdict, selectedVerdict = null, disabled = false, priority = false }: RealOrIaGameProps) {
  const { messages } = useI18n();
  const chrome = messages.chrome;
  const choiceLabels: Record<VerdictChoice, string> = {
    real: chrome.real,
    ai: chrome.aiGenerated,
  };
  const [failedImageKey, setFailedImageKey] = useState<string | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const promptId = `real-o-ia-${item.itemId}-prompt`;
  const controlsDisabled = disabled || selectedVerdict !== null;
  const { media } = item;
  const imageKey = `${item.itemId}:${media.src ?? "none"}`;
  const showFallback = failedImageKey === imageKey || media.kind === "none" || media.src === null;
  const responsiveSrcSet = buildSrcSet(media.srcSet);

  function focusSibling(currentIndex: number, direction: 1 | -1) {
    const total = item.choices.length;
    buttonRefs.current[(currentIndex + direction + total) % total]?.focus();
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (["ArrowRight", "ArrowDown"].includes(event.key)) { event.preventDefault(); focusSibling(index, 1); }
    if (["ArrowLeft", "ArrowUp"].includes(event.key)) { event.preventDefault(); focusSibling(index, -1); }
  }

  return (
    <section className="verdict-game" aria-labelledby={promptId}>
      <p className="verdict-game__context"><span className="verdict-game__context-label">{chrome.sharedAs}</span>{item.context}</p>
      <figure className="verdict-game__frame">
        {showFallback ? (
          <p className="image-fallback" role="status">
            {media.fallbackText ?? chrome.imageUnavailable}
          </p>
        ) : responsiveSrcSet ? (
          // eslint-disable-next-line @next/next/no-img-element -- static responsive srcSet is part of the media contract.
          <img
            src={media.src as string}
            srcSet={responsiveSrcSet}
            sizes={MOBILE_FIRST_SIZES}
            width={media.width ?? 768}
            height={media.height ?? 432}
            alt={media.decorative ? "" : (media.alt ?? "")}
            className="verdict-game__image"
            decoding="async"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            onError={() => setFailedImageKey(imageKey)}
          />
        ) : (
          <Image
            src={media.src as string}
            alt={media.decorative ? "" : (media.alt ?? "")}
            width={media.width ?? 768}
            height={media.height ?? 432}
            sizes={MOBILE_FIRST_SIZES}
            className="verdict-game__image"
            priority={priority}
            onError={() => setFailedImageKey(imageKey)}
          />
        )}
      </figure>
      <h2 id={promptId} className="verdict-game__prompt">{item.prompt}</h2>
      <div className="verdict-game__controls" role="group" aria-label={chrome.verdictOptions}>
        {item.choices.map((choice, index) => {
          const chosen = selectedVerdict === choice;
          return (
            <button key={choice} ref={(element) => { buttonRefs.current[index] = element; }} type="button" className={["verdict-game__button", `verdict-game__button--${choice}`, chosen ? "verdict-game__button--chosen" : null].filter(Boolean).join(" ")} disabled={controlsDisabled} aria-pressed={chosen} onClick={() => onVerdict(choice)} onKeyDown={(event) => handleKeyDown(event, index)}>
              {choiceLabels[choice]}
            </button>
          );
        })}
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">{selectedVerdict === null ? "" : `${chrome.youChose}: ${choiceLabels[selectedVerdict]}.`}</p>
    </section>
  );
}
