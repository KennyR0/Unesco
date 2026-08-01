"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { PublicItem } from "@antidoto/contracts";

export type RealOrIaItem = Extract<PublicItem, { gameCode: "real-o-ia" }>;
export type VerdictChoice = RealOrIaItem["choices"][number];

const CHOICE_LABELS: Record<VerdictChoice, string> = {
  real: "Real",
  ai: "Generada por IA",
};

const DEFAULT_FALLBACK_TEXT =
  "La imagen no está disponible; puedes responder con el texto del caso.";

export type RealOrIaGameProps = Readonly<{
  item: RealOrIaItem;
  onVerdict: (verdict: VerdictChoice) => void;
  selectedVerdict?: VerdictChoice | null;
  disabled?: boolean;
}>;

export function RealOrIaGame({
  item,
  onVerdict,
  selectedVerdict = null,
  disabled = false,
}: RealOrIaGameProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const promptId = `real-o-ia-${item.itemId}-prompt`;
  const controlsDisabled = disabled || selectedVerdict !== null;
  const { media } = item;
  const showFallback =
    imageFailed || media.kind === "none" || media.src === null;

  function focusSibling(currentIndex: number, direction: 1 | -1) {
    const total = item.choices.length;
    const nextIndex = (currentIndex + direction + total) % total;
    buttonRefs.current[nextIndex]?.focus();
  }

  function handleKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusSibling(index, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusSibling(index, -1);
        break;
    }
  }

  return (
    <section className="verdict-game" aria-labelledby={promptId}>
      <p className="verdict-game__context">
        <span className="verdict-game__context-label">Se comparte como</span>
        {item.context}
      </p>

      <figure className="verdict-game__frame">
        {showFallback ? (
          <p className="image-fallback" role="status">
            {media.fallbackText ?? DEFAULT_FALLBACK_TEXT}
          </p>
        ) : (
          <Image
            src={media.src as string}
            alt={media.decorative ? "" : (media.alt ?? "")}
            width={media.width ?? 640}
            height={media.height ?? 432}
            sizes="(max-width: 768px) 100vw, 640px"
            className="verdict-game__image"
            onError={() => setImageFailed(true)}
          />
        )}
      </figure>

      <h2 id={promptId} className="verdict-game__prompt">
        {item.prompt}
      </h2>

      <div
        className="verdict-game__controls"
        role="group"
        aria-label="Opciones de veredicto"
      >
        {item.choices.map((choice, index) => {
          const chosen = selectedVerdict === choice;
          const className = [
            "verdict-game__button",
            `verdict-game__button--${choice}`,
            chosen ? "verdict-game__button--chosen" : null,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={choice}
              ref={(element) => {
                buttonRefs.current[index] = element;
              }}
              type="button"
              className={className}
              disabled={controlsDisabled}
              aria-pressed={chosen}
              onClick={() => onVerdict(choice)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {CHOICE_LABELS[choice]}
            </button>
          );
        })}
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">
        {selectedVerdict === null
          ? ""
          : `Elegiste: ${CHOICE_LABELS[selectedVerdict]}.`}
      </p>
    </section>
  );
}
