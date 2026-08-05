"use client";

import { useId, useState, type FormEvent } from "react";

import { useI18n } from "../../lib/i18n/provider";

export type AliasStartFormProps = Readonly<{
  /** Server Action de respaldo (sin JS / progressive enhancement). */
  action?: (formData: FormData) => void | Promise<void>;
  /** Arranque con alias cuando hay JS (evita redirect+releer cookie). */
  onSubmit?: (alias: string) => Promise<void> | void;
  /** Arranque invitado cuando hay JS. */
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
 *
 * Con JS: usa onSubmit/onGuestStart para aplicar el estado devuelto por la
 * acción sin depender de un redirect que relee la cookie.
 * Sin JS: usa la Server Action del form (intent=named|guest).
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
  const preferClientStart = Boolean(onSubmit || onGuestStart);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!preferClientStart) {
      return;
    }

    event.preventDefault();
    if (disabled || pending) return;

    const formData = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const intentAttr =
      submitter instanceof HTMLElement
        ? submitter.getAttribute("data-start-intent")
        : null;
    const intentFromButton =
      submitter instanceof HTMLButtonElement ? submitter.value : null;
    const intent = String(
      intentAttr ?? intentFromButton ?? formData.get("intent") ?? "named",
    );

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

    if (!onSubmit) {
      setLocalError(messages.form.startFailed);
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
      onSubmit={handleSubmit}
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
          data-start-intent="named"
          disabled={disabled || pending}
        >
          {pending ? messages.form.starting : submitLabel ?? messages.form.startMission}
        </button>
        <button
          className="secondary-action"
          type="submit"
          name="intent"
          value="guest"
          data-start-intent="guest"
          disabled={disabled || pending}
        >
          {messages.form.playAsGuest}
        </button>
      </div>
      <p className="alias-start-form__guest-note">{messages.form.guestRankingNote}</p>
    </form>
  );
}
