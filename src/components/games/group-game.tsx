"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { PublicItem } from "@antidoto/contracts";

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

const ACTION_LABELS: Record<GroupActionValue, string> = {
  forward: "Reenviar",
  verify: "Verificar",
  pause: "Frenar",
};

const ACTION_DESCRIPTIONS: Record<GroupActionValue, string> = {
  forward: "Amplifica sin comprobar",
  verify: "Contrasta y corrige",
  pause: "Detiene la cadena",
};

const SENDER_COLORS = [
  "group-chat__avatar--magenta",
  "group-chat__avatar--cyan",
  "group-chat__avatar--amber",
  "group-chat__avatar--violet",
  "group-chat__avatar--green",
] as const;

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

/**
 * El Grupo: chat narrativo de lectura accesible.
 * Cada escena se presenta como un hilo con remitente, hora y tres acciones de
 * cuidado; el foco vuelve al primer mensaje tras resolver.
 */
export function GroupGame({
  item,
  onAction,
  selectedAction = null,
  disabled = false,
}: GroupGameProps) {
  const [pendingAction, setPendingAction] = useState<GroupActionValue | null>(null);
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
    setPendingAction(value);
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
        Mensajes en orden
      </p>

      <ol
        ref={threadRef}
        tabIndex={-1}
        className="group-chat__thread"
        aria-labelledby={threadLabelId}
      >
        {item.messages.map((message, index) => (
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
            </div>
          </li>
        ))}
      </ol>

      <div
        className="group-chat__controls"
        role="group"
        aria-label="Acciones de cuidado"
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
                {ACTION_LABELS[action]}
              </span>
              <span className="group-chat__button-description">
                {ACTION_DESCRIPTIONS[action]}
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
          : `Elegiste ${ACTION_LABELS[selectedAction]}.`}
      </p>
    </section>
  );
}
