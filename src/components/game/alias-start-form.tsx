"use client";

import { useId, useState, type FormEvent } from "react";

import { useI18n } from "../../lib/i18n/provider";

export type AliasStartFormProps = Readonly<{
  /** Server Action preferida: funciona sin hidratación cliente. */
  action?: (formData: FormData) => void | Promise<void>;
  /** Fallback cliente cuando no hay action de servidor. */
  onSubmit?: (alias: string) => Promise<void> | void;
  /** Arranque invitado (sin ranking) cuando no hay action de servidor. */
  onGuestStart?: () => Promise<void> | void;
  /** Juego a iniciar; viaja oculto para la Server Action. */
  gameCode?: string;
  disabled?: boolean;
  error?: string | null;
  submitLabel?: string;
}>;

/**
 * Formulario mínimo de alias temporal para iniciar una misión arcade.
 * También permite jugar sin alias (partida no elegible al ranking).
 */
export function AliasStartForm({
  action,
  onSubmit,
  onGuestStart,
  gameCode,
  disabled = false,
  error = null,
  submitLabel = "Empezar misión",
}: AliasStartFormProps) {
  const { messages } = useI18n();
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const shownError = error ?? localError;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (action) {
      // Deja que el Server Action del form maneje el envío.
      return;
    }

    event.preventDefault();
    if (disabled || pending || !onSubmit) return;

    const formData = new FormData(event.currentTarget);
    const intent = String(formData.get("intent") ?? "named");
    if (intent === "guest") {
      if (!onGuestStart) {
        setLocalError(messages.form.startFailed);
        return;
      }
      setLocalError(null);
      setPending(true);
      try {
        await onGuestStart();
      } catch {
        setLocalError(messages.form.startFailed);
      } finally {
        setPending(false);
      }
      return;
    }

    const nextAlias = String(formData.get("alias") ?? "").trim();
    if (!nextAlias) {
      setLocalError(messages.form.aliasRequired);
      return;
    }

    setLocalError(null);
    setPending(true);
    try {
      await onSubmit(nextAlias);
    } catch {
      setLocalError(messages.form.startFailed);
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="alias-start-form"
      action={action}
      onSubmit={action ? undefined : handleSubmit}
      noValidate
    >
      {gameCode ? (
        <input type="hidden" name="gameCode" value={gameCode} />
      ) : null}
      <label className="alias-start-form__label" htmlFor={fieldId}>
        {messages.form.aliasLabel}
      </label>
      <p className="alias-start-form__hint" id={`${fieldId}-hint`}>
        {messages.form.aliasHint}
      </p>
      <input
        id={fieldId}
        className="alias-start-form__input"
        name="alias"
        type="text"
        autoComplete="nickname"
        maxLength={40}
        defaultValue=""
        minLength={3}
        disabled={disabled || pending}
        aria-describedby={
          shownError ? `${fieldId}-hint ${errorId}` : `${fieldId}-hint`
        }
        aria-invalid={shownError ? true : undefined}
      />
      {shownError ? (
        <p className="form-error" id={errorId} role="alert">
          {shownError}
        </p>
      ) : null}
      <div className="alias-start-form__actions">
        <button
          className="primary-action"
          type="submit"
          name="intent"
          value="named"
          disabled={disabled || pending}
        >
          {pending ? messages.form.starting : submitLabel ?? messages.form.startMission}
        </button>
        <button
          className="secondary-action"
          type="submit"
          name="intent"
          value="guest"
          disabled={disabled || pending}
        >
          {messages.form.playAsGuest}
        </button>
      </div>
      <p className="alias-start-form__guest-note">{messages.form.guestRankingNote}</p>
    </form>
  );
}
