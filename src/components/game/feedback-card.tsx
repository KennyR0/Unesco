"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import type {
  FeedbackGameState,
  FinalResult,
  OperationResult,
  QuestionGameState,
} from "@antidoto/contracts";

import {
  advanceGameAction,
  finishGameAction,
} from "../../app/actions/game";
import { FeedbackPanel } from "./feedback-panel";

function AdvanceControl() {
  const router = useRouter();
  const [result, action, pending] = useActionState<
    OperationResult<QuestionGameState> | null,
    FormData
  >(advanceGameAction, null);

  useEffect(() => {
    if (result?.ok) router.refresh();
  }, [result, router]);

  const error = result?.ok === false ? result.error : null;
  return (
    <>
      {error ? <p role="alert" className="form-error">{error.message}</p> : null}
      <form action={action}>
        <button className="primary-action" type="submit" disabled={pending}>
          {pending ? "Cargando…" : "Continuar"}
        </button>
      </form>
    </>
  );
}

function FinishControl() {
  const router = useRouter();
  const [result, action, pending] = useActionState<
    OperationResult<FinalResult> | null,
    FormData
  >(finishGameAction, null);

  useEffect(() => {
    if (result?.ok) router.push("/results");
  }, [result, router]);

  const error = result?.ok === false ? result.error : null;
  return (
    <>
      {error ? <p role="alert" className="form-error">{error.message}</p> : null}
      <form action={action}>
        <button className="primary-action" type="submit" disabled={pending}>
          {pending ? "Cargando…" : "Ver resultados"}
        </button>
      </form>
    </>
  );
}

export function FeedbackCard({ state }: { state: FeedbackGameState }) {
  return (
    <section className="game-card">
      <FeedbackPanel feedback={state.answer} />
      {state.nextAction === "finish" ? <FinishControl /> : <AdvanceControl />}
    </section>
  );
}
