"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import type {
  AnswerResult,
  OperationResult,
  QuestionGameState,
} from "@antidoto/contracts";

import { submitAnswerAction } from "../../app/actions/game";
import { RoundProgress } from "./round-progress";
import { QuestionImage } from "./question-image";

export function QuestionCard({ state }: { state: QuestionGameState }) {
  const router = useRouter();
  const [result, action, pending] = useActionState<
    OperationResult<AnswerResult> | null,
    FormData
  >(submitAnswerAction, null);
  useEffect(() => { if (result?.ok) router.refresh(); }, [result, router]);
  const error = result?.ok === false ? result.error : null;
  return (
    <form action={action} className="game-card">
      <input type="hidden" name="questionRef" value={state.question.ref} />
      <p className="progress-label">Pregunta actual</p>
      <RoundProgress current={state.progress.currentQuestion} total={state.progress.totalQuestions} />
      <h1>{state.question.prompt}</h1>
      {state.question.image ? <QuestionImage {...state.question.image} /> : null}
      <fieldset aria-describedby={error ? "option-error" : undefined}>
        <legend>Selecciona una opción</legend>
        {state.question.options.map((option) => <label className="option-row" key={option.ref}><input type="radio" name="optionRef" value={option.ref} /> <span>{option.label}</span></label>)}
      </fieldset>
      {error ? <p id="option-error" role="alert" className="form-error">{error.message}</p> : null}
      <button type="submit" className="primary-action" disabled={pending}>{pending ? "Guardando…" : "Responder"}</button>
    </form>
  );
}
