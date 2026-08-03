"use client";

import { useId, useState, type FormEvent } from "react";

export type AliasStartFormProps = Readonly<{
  /** Server Action preferida: funciona sin hidratación cliente. */
  action?: (formData: FormData) => void | Promise<void>;
  /** Fallback cliente cuando no hay action de servidor. */
  onSubmit?: (alias: string) => Promise<void> | void;
  disabled?: boolean;
  error?: string | null;
  submitLabel?: string;
}>;

/**
 * Formulario mínimo de alias temporal para iniciar una misión arcade.
 */
export function AliasStartForm({
  action,
  onSubmit,
  disabled = false,
  error = null,
  submitLabel = "Empezar misión",
}: AliasStartFormProps) {
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
    const nextAlias = String(formData.get("alias") ?? "").trim();
    if (!nextAlias) {
      setLocalError("Escribe un alias para empezar.");
      return;
    }

    setLocalError(null);
    setPending(true);
    try {
      await onSubmit(nextAlias);
    } catch {
      setLocalError("No se pudo iniciar la misión. Intenta de nuevo.");
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
      <label className="alias-start-form__label" htmlFor={fieldId}>
        Elige un alias temporal
      </label>
      <p className="alias-start-form__hint" id={`${fieldId}-hint`}>
        Entre 3 y 40 caracteres. No uses datos personales reales.
      </p>
      <input
        id={fieldId}
        className="alias-start-form__input"
        name="alias"
        type="text"
        autoComplete="nickname"
        maxLength={40}
        defaultValue=""
        required
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
      <button
        className="primary-action"
        type="submit"
        disabled={disabled || pending}
      >
        {pending ? "Iniciando…" : submitLabel}
      </button>
    </form>
  );
}
