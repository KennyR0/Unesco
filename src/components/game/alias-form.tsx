"use client";

import { useActionState, useEffect, useRef } from "react";

import type { OperationResult, StartGameResult } from "@antidoto/contracts";

import { startGameAction } from "../../app/actions/game";

const initialState: OperationResult<StartGameResult> | null = null;

export function AliasForm() {
  const [state, action, pending] = useActionState(startGameAction, initialState);
  const inputRef = useRef<HTMLInputElement>(null);
  const error = state?.ok === false ? state.error : null;
  useEffect(() => {
    if (error && "field" in error && error.field === "alias") inputRef.current?.focus();
  }, [error]);
  return (
    <form action={action} className="start-form" noValidate aria-busy={pending}>
      <label htmlFor="alias">Elige un alias</label>
      <input ref={inputRef} id="alias" name="alias" autoComplete="nickname" minLength={3} maxLength={20} aria-invalid={Boolean(error && "field" in error && error.field === "alias")} aria-describedby={error ? "alias-error" : "alias-hint"} />
      <p id="alias-hint" className="field-hint">3 a 20 caracteres. Tu alias y puntuación pueden aparecer en el ranking.</p>
      {error ? <p id="alias-error" role="alert" className="form-error">{error.message}</p> : null}
      <button className="primary-action" type="submit" disabled={pending}>{pending ? "Preparando…" : "Comenzar"}</button>
    </form>
  );
}
