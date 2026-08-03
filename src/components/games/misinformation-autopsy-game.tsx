"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { PublicItem } from "@antidoto/contracts";

export type MisinformationAutopsyItem = Extract<
  PublicItem,
  { gameCode: "mente-maestra" }
>;

export type AutopsyStepKind = MisinformationAutopsyItem["step"];

export type AutopsyChoiceSelection = Readonly<{
  optionId: string;
}>;

/** Selección ya aceptada y persistida solo en la sesión del juego. */
export type PersistedAutopsySelection = Readonly<{
  step: AutopsyStepKind;
  optionId: string;
  label: string;
}>;

/** Entrada de autopsia ya proyectada por el servidor (sin solución privada). */
export type InlineAutopsyEntry = Readonly<{
  step: AutopsyStepKind;
  title: string;
  tip: string;
}>;

export type MisinformationAutopsyGameProps = Readonly<{
  /** Paso actual. Null cuando solo se muestra la simulación/autopsia final. */
  item?: MisinformationAutopsyItem | null;
  stepNumber?: number;
  totalSteps?: number;
  /** Historial de elecciones persistidas en la sesión. */
  sessionSelections?: readonly PersistedAutopsySelection[];
  selectedOptionId?: string | null;
  onChoose?: (selection: AutopsyChoiceSelection) => void;
  disabled?: boolean;
  /** Alcance simulado 65–95; nunca es un premio ni parte del score. */
  simulatedReach?: number | null;
  autopsyEntries?: readonly InlineAutopsyEntry[];
  fictionalComments?: readonly string[];
  educationalDisclaimer?: string | null;
}>;

const STEP_LABELS: Record<AutopsyStepKind, string> = {
  objective: "Objetivo",
  emotion: "Emoción",
  headline: "Titular",
  evidence: "Prueba",
};

const TOTAL_STEPS_DEFAULT = 4;

function clampReach(value: number): number {
  if (!Number.isFinite(value)) return 65;
  return Math.min(95, Math.max(65, Math.round(value)));
}

/**
 * Mente Maestra: cuatro pasos, alcance simulado y autopsia inline.
 * La selección queda en la sesión; no hay publicación ni cuenta externa.
 */
export function MisinformationAutopsyGame({
  item = null,
  stepNumber,
  totalSteps = TOTAL_STEPS_DEFAULT,
  sessionSelections = [],
  selectedOptionId = null,
  onChoose,
  disabled = false,
  simulatedReach = null,
  autopsyEntries = [],
  fictionalComments = [],
  educationalDisclaimer = null,
}: MisinformationAutopsyGameProps) {
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);
  const stepRef = useRef<HTMLHeadingElement | null>(null);
  const autopsyRef = useRef<HTMLElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const resolved = selectedOptionId !== null;
  const controlsDisabled = disabled || resolved || !item || !onChoose;
  const showAutopsy =
    autopsyEntries.length > 0 ||
    simulatedReach !== null ||
    fictionalComments.length > 0;

  const currentStepNumber =
    stepNumber ??
    (item
      ? (["objective", "emotion", "headline", "evidence"] as const).indexOf(
          item.step,
        ) + 1
      : totalSteps);

  const progressId = item
    ? `mente-maestra-${item.itemId}-progress`
    : "mente-maestra-progress";
  const promptId = item
    ? `mente-maestra-${item.itemId}-prompt`
    : "mente-maestra-prompt";
  const selectionStatusId = item
    ? `mente-maestra-${item.itemId}-selection`
    : "mente-maestra-selection";
  const sessionId = "mente-maestra-session-selections";
  const autopsyId = "mente-maestra-autopsy";
  const reachId = "mente-maestra-reach";

  const selectedLabel =
    item?.options.find((option) => option.optionId === selectedOptionId)
      ?.label ?? null;

  useEffect(() => {
    if (showAutopsy && !item) {
      autopsyRef.current?.focus();
      return;
    }
    if (resolved || item) {
      stepRef.current?.focus();
    }
  }, [resolved, item?.itemId, showAutopsy, item]);

  function commitOption(optionId: string) {
    if (controlsDisabled || !onChoose) {
      return;
    }
    setPendingOptionId(optionId);
    onChoose({ optionId });
  }

  function focusSibling(currentIndex: number, direction: 1 | -1) {
    if (!item) return;
    const total = item.options.length;
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

  const reachValue =
    simulatedReach === null ? null : clampReach(simulatedReach);
  const reachPercent =
    reachValue === null
      ? 0
      : ((reachValue - 65) / (95 - 65)) * 100;

  return (
    <section
      className="mente-maestra"
      data-game-code="mente-maestra"
      aria-labelledby={item ? promptId : autopsyId}
      aria-describedby={`${progressId} ${selectionStatusId}`}
    >
      <p id={progressId} className="mente-maestra__progress">
        {item
          ? `Paso ${currentStepNumber} de ${totalSteps}: ${STEP_LABELS[item.step]}`
          : `Simulación completa · ${totalSteps} pasos`}
      </p>

      {sessionSelections.length > 0 ? (
        <section
          className="mente-maestra__session"
          aria-labelledby={sessionId}
        >
          <h3 id={sessionId} className="mente-maestra__session-title">
            Selecciones de esta sesión
          </h3>
          <ol className="mente-maestra__session-list">
            {sessionSelections.map((selection) => (
              <li key={`${selection.step}-${selection.optionId}`}>
                <span className="mente-maestra__session-step">
                  {STEP_LABELS[selection.step]}
                </span>
                <span className="mente-maestra__session-label">
                  {selection.label}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {item ? (
        <>
          <h2
            ref={stepRef}
            id={promptId}
            className="mente-maestra__prompt"
            tabIndex={-1}
          >
            {item.prompt}
          </h2>

          <div
            className="mente-maestra__options"
            role="group"
            aria-label={`Opciones del paso ${STEP_LABELS[item.step]}`}
          >
            {item.options.map((option, index) => {
              const chosen =
                selectedOptionId === option.optionId ||
                pendingOptionId === option.optionId;
              const className = [
                "mente-maestra__option",
                chosen ? "mente-maestra__option--chosen" : null,
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={option.optionId}
                  ref={(element) => {
                    buttonRefs.current[index] = element;
                  }}
                  type="button"
                  className={className}
                  disabled={controlsDisabled}
                  aria-pressed={chosen}
                  onClick={() => commitOption(option.optionId)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                >
                  <span className="mente-maestra__option-label">
                    {option.label}
                  </span>
                  <span className="mente-maestra__option-description">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      <p
        id={selectionStatusId}
        className="visually-hidden"
        role="status"
        aria-live="polite"
      >
        {selectedLabel ? `Elegiste ${selectedLabel}.` : ""}
      </p>

      {showAutopsy ? (
        <section
          ref={autopsyRef}
          id={autopsyId}
          className="mente-maestra__autopsy"
          tabIndex={-1}
          aria-label="Autopsia de la simulación"
        >
          <p className="mente-maestra__kicker">Simulación educativa</p>
          <h2 className="mente-maestra__autopsy-title">
            Autopsia de tu fake news
          </h2>
          <p className="mente-maestra__disclaimer">
            {educationalDisclaimer ??
              "Simulación educativa: no se publica contenido externo ni se crea una cuenta real. El alcance simulado explica el mecanismo; no es un premio."}
          </p>

          {reachValue !== null ? (
            <div
              className="mente-maestra__reach"
              aria-labelledby={reachId}
            >
              <div className="mente-maestra__reach-meta">
                <span id={reachId}>Alcance simulado</span>
                <span className="mente-maestra__reach-value">
                  {reachValue} de 95
                </span>
              </div>
              <div
                className="mente-maestra__reach-track"
                role="meter"
                aria-valuemin={65}
                aria-valuemax={95}
                aria-valuenow={reachValue}
                aria-label="Medidor de alcance simulado"
              >
                <span
                  className="mente-maestra__reach-fill"
                  style={{ width: `${reachPercent}%` }}
                />
              </div>
              <p className="mente-maestra__reach-note">
                Este medidor es ficticio y no suma puntos. No hay publicación
                externa.
              </p>
            </div>
          ) : null}

          {fictionalComments.length > 0 ? (
            <ul className="mente-maestra__comments" aria-label="Comentarios ficticios">
              {fictionalComments.map((comment) => (
                <li key={comment} className="mente-maestra__comment">
                  {comment}
                </li>
              ))}
            </ul>
          ) : null}

          {autopsyEntries.length > 0 ? (
            <ol className="mente-maestra__autopsy-list">
              {autopsyEntries.map((entry) => (
                <li
                  key={`${entry.step}-${entry.title}`}
                  className="mente-maestra__autopsy-item"
                >
                  <p className="mente-maestra__autopsy-step">
                    {STEP_LABELS[entry.step]}
                  </p>
                  <h3 className="mente-maestra__autopsy-technique">
                    {entry.title}
                  </h3>
                  <p className="mente-maestra__autopsy-tip">{entry.tip}</p>
                </li>
              ))}
            </ol>
          ) : null}

          <p className="mente-maestra__no-publish" role="status">
            No se publicó nada fuera de esta simulación.
          </p>
        </section>
      ) : null}
    </section>
  );
}
