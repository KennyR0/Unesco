"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { PublicItem } from "@antidoto/contracts";

import { EVIDENCE_MEDIA_BY_OPTION_ID } from "../../features/game/content/mente-maestra-evidence-media";
import { assembleFakeNewsPost } from "../../lib/game/mente-maestra-assembled-post";
import { useI18n } from "../../lib/i18n/provider";

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
  siftStep?: "investigate" | "trace";
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

const TOTAL_STEPS_DEFAULT = 4;
const STEP_ORDER = ["objective", "emotion", "headline", "evidence"] as const;
const EVIDENCE_MEDIA = EVIDENCE_MEDIA_BY_OPTION_ID;

function clampReach(value: number): number {
  if (!Number.isFinite(value)) return 65;
  return Math.min(95, Math.max(65, Math.round(value)));
}

function siftForStep(step: AutopsyStepKind): "investigate" | "trace" {
  return step === "evidence" ? "trace" : "investigate";
}

function AutopsyCommentsList({
  comments,
  motionPaused,
  label,
}: Readonly<{
  comments: readonly string[];
  motionPaused: boolean;
  label: string;
}>) {
  const [revealedCount, setRevealedCount] = useState(1);

  useEffect(() => {
    if (motionPaused || comments.length <= 1) {
      return;
    }
    let index = 1;
    const timer = window.setInterval(() => {
      index += 1;
      setRevealedCount(index);
      if (index >= comments.length) {
        window.clearInterval(timer);
      }
    }, 700);
    return () => window.clearInterval(timer);
  }, [comments, motionPaused]);

  const visibleCount = motionPaused
    ? comments.length
    : Math.min(revealedCount, comments.length);

  return (
    <ul className="mente-maestra__comments" aria-label={label}>
      {comments.slice(0, Math.max(visibleCount, 1)).map((comment, index) => (
        <li
          key={comment}
          className={[
            "mente-maestra__comment",
            index === comments.length - 1
              ? "mente-maestra__comment--factcheck"
              : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {comment}
        </li>
      ))}
    </ul>
  );
}

/**
 * Mente Maestra: cuatro pasos, noticia ensamblada, alcance simulado y autopsia.
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
  const { locale, messages } = useI18n();
  const chrome = messages.chrome;
  const stepLabels: Record<AutopsyStepKind, string> = {
    objective: chrome.stepObjective,
    emotion: chrome.stepEmotion,
    headline: chrome.stepHeadline,
    evidence: chrome.stepEvidence,
  };
  const siftTitles = {
    investigate: messages.home.sift[1].title,
    trace: messages.home.sift[3].title,
  };
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);
  const [failedEvidenceKey, setFailedEvidenceKey] = useState<string | null>(null);
  const [motionPaused, setMotionPaused] = useState(false);
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
    (item ? STEP_ORDER.indexOf(item.step) + 1 : totalSteps);

  const progressId = item
    ? `mente-maestra-${item.itemId}-progress`
    : "mente-maestra-progress";
  const promptId = item
    ? `mente-maestra-${item.itemId}-prompt`
    : "mente-maestra-prompt";
  const selectionStatusId = item
    ? `mente-maestra-${item.itemId}-selection`
    : "mente-maestra-selection";
  const recipeId = "mente-maestra-recipe";
  const autopsyId = "mente-maestra-autopsy";
  const autopsyTitleId = "mente-maestra-autopsy-title";
  const reachId = "mente-maestra-reach";
  const postId = "mente-maestra-fake-post";

  const selectedLabel =
    item?.options.find((option) => option.optionId === selectedOptionId)
      ?.label ?? null;

  const assembledPost = useMemo(
    () => assembleFakeNewsPost(sessionSelections, locale),
    [sessionSelections, locale],
  );

  const stepSift = item ? siftForStep(item.step) : null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () =>
      setMotionPaused(document.documentElement.dataset.motion === "paused");
    sync();
    window.addEventListener("antidoto:motion-change", sync);
    return () => window.removeEventListener("antidoto:motion-change", sync);
  }, []);

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
    reachValue === null ? 0 : ((reachValue - 65) / (95 - 65)) * 100;

  const selectedEvidenceId =
    sessionSelections.find((selection) => selection.step === "evidence")
      ?.optionId ?? null;
  const climaxMedia =
    selectedEvidenceId && EVIDENCE_MEDIA[selectedEvidenceId]
      ? EVIDENCE_MEDIA[selectedEvidenceId]
      : null;
  const climaxMediaKey = climaxMedia
    ? `${selectedEvidenceId}:${climaxMedia.src}`
    : null;
  const showClimaxFallback =
    Boolean(climaxMedia) && failedEvidenceKey === climaxMediaKey;

  return (
    <section
      className="mente-maestra"
      data-game-code="mente-maestra"
      aria-labelledby={item ? promptId : undefined}
      aria-label={item ? undefined : chrome.mastermindLabel}
      aria-describedby={`${progressId} ${selectionStatusId}`}
    >
      <div className="mente-maestra__top">
        <p id={progressId} className="mente-maestra__progress">
          {item
            ? chrome.stepOf(currentStepNumber, totalSteps, stepLabels[item.step])
            : chrome.completeSimulation(totalSteps)}
        </p>
        {stepSift ? (
          <p className="mente-maestra__step-sift" data-sift-step={stepSift}>
            <span className="mente-maestra__step-sift-letter" aria-hidden="true">
              {stepSift === "investigate" ? "I" : "T"}
            </span>
            <span>
              {chrome.siftPracticing}: {siftTitles[stepSift]}
            </span>
          </p>
        ) : null}
      </div>

      <ol className="mente-maestra__dots" aria-label={chrome.recipeProgress}>
        {STEP_ORDER.map((step, index) => {
          const done = sessionSelections.some((selection) => selection.step === step);
          const current = item?.step === step;
          return (
            <li
              key={step}
              className={[
                "mente-maestra__dot",
                done ? "mente-maestra__dot--done" : null,
                current ? "mente-maestra__dot--current" : null,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span aria-hidden="true">{done ? "✓" : index + 1}</span>
              <span className="mente-maestra__dot-label">{stepLabels[step]}</span>
            </li>
          );
        })}
      </ol>

      {assembledPost ? (
        <article
          className="mente-maestra__fake-post mente-maestra__fake-post--preview"
          aria-labelledby={`${postId}-preview`}
        >
          <p className="mente-maestra__fake-kicker">{assembledPost.kicker}</p>
          <h3 id={`${postId}-preview`} className="mente-maestra__fake-headline">
            {assembledPost.headline}
          </h3>
          <p className="mente-maestra__fake-meta">{assembledPost.metaLine}</p>
          {sessionSelections.length >= 2 ? (
            <p className="mente-maestra__fake-lede">{assembledPost.lede}</p>
          ) : null}
        </article>
      ) : null}

      {sessionSelections.length > 0 ? (
        <section className="mente-maestra__session" aria-labelledby={recipeId}>
          <h3 id={recipeId} className="mente-maestra__session-title">
            {chrome.sessionSelections}
          </h3>
          <ol className="mente-maestra__session-list">
            {sessionSelections.map((selection) => (
              <li key={`${selection.step}-${selection.optionId}`}>
                <span className="mente-maestra__session-step">
                  {stepLabels[selection.step]}
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
            className={[
              "mente-maestra__options",
              item.step === "headline" ? "mente-maestra__options--headlines" : null,
              item.step === "evidence" ? "mente-maestra__options--evidence" : null,
            ]
              .filter(Boolean)
              .join(" ")}
            role="group"
            aria-label={chrome.optionsFor(stepLabels[item.step])}
          >
            {item.options.map((option, index) => {
              const chosen =
                selectedOptionId === option.optionId ||
                pendingOptionId === option.optionId;
              const media = EVIDENCE_MEDIA[option.optionId];
              const mediaKey = media
                ? `${option.optionId}:${media.src}`
                : null;
              const showFallback =
                Boolean(media) && failedEvidenceKey === mediaKey;
              const className = [
                "mente-maestra__option",
                item.step === "headline" ? "mente-maestra__option--headline" : null,
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
                  {media && item.step === "evidence" ? (
                    <span className="mente-maestra__option-media">
                      {showFallback ? (
                        <span className="image-fallback" role="status">
                          {media.fallbackText}
                        </span>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element -- static educational illustration.
                        <img
                          src={media.src}
                          srcSet={
                            media.srcSet
                              ? [
                                  media.srcSet["480"]
                                    ? `${media.srcSet["480"]} 480w`
                                    : null,
                                  media.srcSet["768"]
                                    ? `${media.srcSet["768"]} 768w`
                                    : null,
                                ]
                                  .filter(Boolean)
                                  .join(", ")
                              : undefined
                          }
                          sizes="(max-width: 720px) 100vw, 280px"
                          width={media.width}
                          height={media.height}
                          alt=""
                          className="mente-maestra__option-image"
                          decoding="async"
                          loading="lazy"
                          onError={() =>
                            mediaKey && setFailedEvidenceKey(mediaKey)
                          }
                        />
                      )}
                    </span>
                  ) : null}
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
        {selectedLabel ? `${chrome.youChose} ${selectedLabel}.` : ""}
      </p>

      {showAutopsy ? (
        <section
          ref={autopsyRef}
          id={autopsyId}
          className="mente-maestra__autopsy"
          tabIndex={-1}
          aria-labelledby={autopsyTitleId}
        >
          <p className="mente-maestra__kicker">{chrome.educationalSimulation}</p>
          <h2 id={autopsyTitleId} className="mente-maestra__autopsy-title">
            {chrome.autopsyOfFakeNews}
          </h2>
          <p className="mente-maestra__disclaimer">
            {educationalDisclaimer ?? chrome.autopsyDisclaimerDefault}
          </p>
          <p className="mente-maestra__inoculation">{chrome.inoculationNote}</p>

          {assembledPost ? (
            <article
              className="mente-maestra__fake-post mente-maestra__fake-post--climax"
              aria-labelledby={postId}
            >
              <p className="mente-maestra__fake-kicker">{assembledPost.kicker}</p>
              <h3 id={postId} className="mente-maestra__fake-headline">
                {assembledPost.headline}
              </h3>
              <p className="mente-maestra__fake-meta">{assembledPost.metaLine}</p>
              {climaxMedia ? (
                <figure className="mente-maestra__climax-media">
                  {showClimaxFallback ? (
                    <p className="image-fallback" role="status">
                      {climaxMedia.fallbackText}
                    </p>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={climaxMedia.src}
                      width={climaxMedia.width}
                      height={climaxMedia.height}
                      alt={climaxMedia.alt}
                      className="mente-maestra__climax-image"
                      decoding="async"
                      onError={() =>
                        climaxMediaKey && setFailedEvidenceKey(climaxMediaKey)
                      }
                    />
                  )}
                </figure>
              ) : null}
              <p className="mente-maestra__fake-lede">{assembledPost.lede}</p>
            </article>
          ) : null}

          {reachValue !== null ? (
            <div className="mente-maestra__reach" aria-labelledby={reachId}>
              <div className="mente-maestra__reach-meta">
                <span id={reachId}>{chrome.simulatedReach}</span>
                <span className="mente-maestra__reach-value">
                  {chrome.reachOf(reachValue)}
                </span>
              </div>
              <div
                className="mente-maestra__reach-track"
                role="meter"
                aria-valuemin={65}
                aria-valuemax={95}
                aria-valuenow={reachValue}
                aria-label={chrome.reachMeter}
              >
                <span
                  className="mente-maestra__reach-fill"
                  style={{ width: `${reachPercent}%` }}
                />
              </div>
              <p className="mente-maestra__reach-note">{chrome.reachNote}</p>
            </div>
          ) : null}

          {fictionalComments.length > 0 ? (
            <AutopsyCommentsList
              key={`${item?.itemId ?? "autopsy"}-comments`}
              comments={fictionalComments}
              motionPaused={motionPaused}
              label={chrome.fictionalCommentsLabel}
            />
          ) : null}

          {autopsyEntries.length > 0 ? (
            <ol className="mente-maestra__autopsy-list">
              {autopsyEntries.map((entry) => {
                const sift = entry.siftStep ?? siftForStep(entry.step);
                return (
                  <li
                    key={`${entry.step}-${entry.title}`}
                    className="mente-maestra__autopsy-item"
                  >
                    <div className="mente-maestra__autopsy-meta">
                      <p className="mente-maestra__autopsy-step">
                        {stepLabels[entry.step]}
                      </p>
                      <p
                        className="mente-maestra__autopsy-sift"
                        data-sift-step={sift}
                      >
                        <span aria-hidden="true">
                          {sift === "investigate" ? "I" : "T"}
                        </span>{" "}
                        {siftTitles[sift]}
                      </p>
                    </div>
                    <h3 className="mente-maestra__autopsy-technique">
                      {entry.title}
                    </h3>
                    <p className="mente-maestra__autopsy-how">
                      {chrome.howToDetect}
                    </p>
                    <p className="mente-maestra__autopsy-tip">{entry.tip}</p>
                  </li>
                );
              })}
            </ol>
          ) : null}

          <p className="mente-maestra__no-publish" role="status">
            {chrome.nothingPublished}
          </p>
        </section>
      ) : null}
    </section>
  );
}
