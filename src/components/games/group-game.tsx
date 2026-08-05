"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { PublicItem } from "@antidoto/contracts";

import { useI18n } from "../../lib/i18n/provider";

export type GroupItem = Extract<PublicItem, { gameCode: "grupo" }>;
export type GroupActionValue = GroupItem["actions"][number];

export type GroupActionSelection = Readonly<{
  value: GroupActionValue;
}>;

export type GroupGameProps = Readonly<{
  item: GroupItem;
  onAction: (selection: GroupActionSelection) => void;
  selectedAction?: GroupActionValue | null;
  disabled?: boolean;
}>;

const SENDER_COLORS = [
  "group-chat__avatar--magenta",
  "group-chat__avatar--cyan",
  "group-chat__avatar--amber",
  "group-chat__avatar--violet",
  "group-chat__avatar--green",
] as const;

const MOBILE_FIRST_SIZES = "(max-width: 480px) 100vw, (max-width: 768px) 100vw, 420px";

function initials(sender: string): string {
  return sender
    .trim()
    .split(/\s+/)
    .map((word) => word.at(0) ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarClass(index: number): string {
  return SENDER_COLORS[index % SENDER_COLORS.length];
}

function buildSrcSet(
  srcSet: NonNullable<GroupItem["messages"][number]["media"]>["srcSet"] | undefined,
): string | undefined {
  if (!srcSet) return undefined;
  const parts: string[] = [];
  if (srcSet["480"]) parts.push(`${srcSet["480"]} 480w`);
  if (srcSet["768"]) parts.push(`${srcSet["768"]} 768w`);
  if (srcSet["1280"]) parts.push(`${srcSet["1280"]} 1280w`);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

/**
 * El Grupo: chat narrativo de lectura accesible con adjuntos opcionales.
 * Cada escena se presenta como un hilo con remitente, hora y tres acciones de
 * cuidado; el foco vuelve al primer mensaje tras resolver.
 */
export function GroupGame({
  item,
  onAction,
  selectedAction = null,
  disabled = false,
}: GroupGameProps) {
  const { messages } = useI18n();
  const actionLabels = messages.games.groupActions;
  const actionDescriptions = messages.games.groupActionDescriptions;
  const chrome = messages.chrome;
  const [failedMediaKeys, setFailedMediaKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const threadRef = useRef<HTMLOListElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const promptId = `group-${item.itemId}-prompt`;
  const threadLabelId = `group-${item.itemId}-thread-label`;
  const selectionStatusId = `group-${item.itemId}-selection`;

  const resolved = selectedAction !== null;
  const controlsDisabled = disabled || resolved;

  useEffect(() => {
    if (resolved) {
      threadRef.current?.focus();
    }
  }, [resolved, item.itemId]);

  function commitAction(value: GroupActionValue) {
    if (controlsDisabled) {
      return;
    }
    onAction({ value });
  }

  function focusSibling(currentIndex: number, direction: 1 | -1) {
    const total = item.actions.length;
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
      className="group-chat"
      aria-labelledby={promptId}
      aria-describedby={selectionStatusId}
    >
      <h2 id={promptId} className="group-chat__prompt">
        {item.prompt}
      </h2>

      <p id={threadLabelId} className="group-chat__thread-label">
        {chrome.messagesInOrder}
      </p>

      <ol
        ref={threadRef}
        tabIndex={-1}
        className="group-chat__thread"
        aria-labelledby={threadLabelId}
      >
        {item.messages.map((message, index) => {
          const media = message.media;
          const mediaKey = `${item.itemId}:${index}:${media?.src ?? "none"}`;
          const showFallback =
            Boolean(media) &&
            (failedMediaKeys.has(mediaKey) ||
              media?.kind === "none" ||
              media?.src === null);
          const responsiveSrcSet = buildSrcSet(media?.srcSet);
          const isVideoClip = message.attachmentPresentation === "video_clip";

          return (
            <li
              key={`${message.sender}-${index}`}
              className="group-chat__message"
            >
              <span
                className={["group-chat__avatar", avatarClass(index)].join(" ")}
                aria-hidden="true"
              >
                {initials(message.sender)}
              </span>

              <div className="group-chat__bubble">
                <header className="group-chat__meta">
                  <span className="group-chat__sender">{message.sender}</span>
                  {message.timeLabel ? (
                    <time className="group-chat__time">{message.timeLabel}</time>
                  ) : null}
                </header>
                <p className="group-chat__text">{message.text}</p>

                {media ? (
                  <figure
                    className={[
                      "group-chat__attachment",
                      isVideoClip ? "group-chat__attachment--clip" : null,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <p className="group-chat__attachment-label">
                      {isVideoClip
                        ? chrome.videoClipLabel
                        : chrome.attachedPhotoLabel}
                    </p>
                    {showFallback ? (
                      <p className="image-fallback" role="status">
                        {media.fallbackText ?? chrome.imageUnavailable}
                      </p>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- static responsive srcSet is part of the media contract.
                      <img
                        src={media.src as string}
                        srcSet={responsiveSrcSet}
                        sizes={MOBILE_FIRST_SIZES}
                        width={media.width ?? 768}
                        height={media.height ?? 432}
                        alt={media.decorative ? "" : (media.alt ?? "")}
                        className="group-chat__attachment-image"
                        decoding="async"
                        loading="lazy"
                        onError={() =>
                          setFailedMediaKeys((current) => new Set(current).add(mediaKey))
                        }
                      />
                    )}
                    {isVideoClip && !showFallback ? (
                      <span className="group-chat__play" aria-hidden="true">
                        ▶
                      </span>
                    ) : null}
                  </figure>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div
        className="group-chat__controls"
        role="group"
        aria-label={chrome.careActions}
      >
        {item.actions.map((action, index) => {
          const chosen = selectedAction === action;
          const className = [
            "group-chat__button",
            `group-chat__button--${action}`,
            chosen ? "group-chat__button--chosen" : null,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={action}
              ref={(element) => {
                buttonRefs.current[index] = element;
              }}
              type="button"
              className={className}
              disabled={controlsDisabled}
              aria-pressed={chosen}
              onClick={() => commitAction(action)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className="group-chat__button-label">
                {actionLabels[action]}
              </span>
              <span className="group-chat__button-description">
                {actionDescriptions[action]}
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
        {selectedAction === null
          ? ""
          : `${chrome.youChose} ${actionLabels[selectedAction]}.`}
      </p>
    </section>
  );
}
