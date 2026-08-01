"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { PublicItem } from "@antidoto/contracts";

export type SourceRadarItem = Extract<
  PublicItem,
  { gameCode: "radar-de-fuentes" }
>;

export type SourceCategoryValue = SourceRadarItem["categories"][number];

export type SourceRadarSelection = Readonly<{
  value: SourceCategoryValue;
}>;

export type SourceRadarGameProps = Readonly<{
  item: SourceRadarItem;
  onClassify: (selection: SourceRadarSelection) => void;
  selectedCategory?: SourceCategoryValue | null;
  disabled?: boolean;
}>;

const CATEGORY_LABELS: Record<SourceCategoryValue, string> = {
  reliable: "Confiable",
  doubtful: "Dudosa",
  fraudulent: "Fraudulenta",
};

const CATEGORY_DESCRIPTIONS: Record<SourceCategoryValue, string> = {
  reliable: "Verificable, con autor y rendición de cuentas",
  doubtful: "Opinión, sátira o información incompleta",
  fraudulent: "Engaño deliberado: suplantación o estafa",
};

/**
 * Radar de Fuentes: una fuente y tres categorías seleccionables.
 * La URL visible es la señal principal; el foco se gestiona con flechas y la
 * decisión se anuncia en la live region tras resolver.
 */
export function SourceRadarGame({
  item,
  onClassify,
  selectedCategory = null,
  disabled = false,
}: SourceRadarGameProps) {
  const [pendingCategory, setPendingCategory] =
    useState<SourceCategoryValue | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const promptId = `source-radar-${item.itemId}-prompt`;
  const sourceLabelId = `source-radar-${item.itemId}-source-label`;
  const urlLabelId = `source-radar-${item.itemId}-url-label`;
  const descriptionId = `source-radar-${item.itemId}-description`;
  const selectionStatusId = `source-radar-${item.itemId}-selection`;

  const resolved = selectedCategory !== null;
  const controlsDisabled = disabled || resolved;

  useEffect(() => {
    if (resolved) {
      cardRef.current?.focus();
    }
  }, [resolved, item.itemId]);

  function commitCategory(value: SourceCategoryValue) {
    if (controlsDisabled) {
      return;
    }
    setPendingCategory(value);
    onClassify({ value });
  }

  function focusSibling(currentIndex: number, direction: 1 | -1) {
    const total = item.categories.length;
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
    <section
      className="source-radar"
      aria-labelledby={promptId}
      aria-describedby={selectionStatusId}
    >
      <h2 id={promptId} className="source-radar__prompt">
        {item.prompt}
      </h2>

      <div
        ref={cardRef}
        tabIndex={-1}
        role="group"
        aria-roledescription="Tarjeta de fuente"
        aria-labelledby={sourceLabelId}
        aria-describedby={`${urlLabelId} ${descriptionId}`}
        className={[
          "source-radar__card",
          resolved ? "source-radar__card--resolved" : null,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <p className="source-radar__url-label" id={urlLabelId}>
          {item.urlLabel}
        </p>
        <h3 id={sourceLabelId} className="source-radar__source">
          {item.sourceName}
        </h3>
        <p id={descriptionId} className="source-radar__description">
          {item.description}
        </p>
      </div>

      <div
        className="source-radar__controls"
        role="group"
        aria-label="Categorías del radar"
      >
        {item.categories.map((category, index) => {
          const chosen = selectedCategory === category;
          const className = [
            "source-radar__button",
            `source-radar__button--${category}`,
            chosen ? "source-radar__button--chosen" : null,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={category}
              ref={(element) => {
                buttonRefs.current[index] = element;
              }}
              type="button"
              className={className}
              disabled={controlsDisabled}
              aria-pressed={chosen}
              onClick={() => commitCategory(category)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="source-radar__button-label">
                {CATEGORY_LABELS[category]}
              </span>
              <span className="source-radar__button-description">
                {CATEGORY_DESCRIPTIONS[category]}
              </span>
            </button>
          );
        })}
      </div>

      <p
        id={selectionStatusId}
        className="visually-hidden"
        role="status"
        aria-live="polite"
      >
        {selectedCategory === null
          ? ""
          : `Clasificaste ${CATEGORY_LABELS[selectedCategory]}.`}
      </p>
    </section>
  );
}
