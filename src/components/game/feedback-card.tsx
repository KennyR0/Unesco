"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import type { OperationResult } from "@antidoto/contracts";

import { advanceGameAction, finishGameAction } from "../../app/actions/game";
import { FeedbackPanel } from "./feedback-panel";

type Feedback = { outcome: "correct" | "incorrect"; pointsAwarded: number; feedback: { explanation: string; signals: string[]; recommendation: string }; nextAction: "advance" | "finish" };

export function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const router = useRouter();
  const action = feedback.nextAction === "finish" ? finishGameAction : advanceGameAction;
  const [result, formAction, pending] = useActionState<OperationResult<unknown> | null, FormData>(action, null);
  useEffect(() => {
    if (!result?.ok) return;
    if (feedback.nextAction === "finish") router.push("/results");
    else router.refresh();
  }, [feedback.nextAction, result, router]);
  const error = result?.ok === false ? result.error : null;
  return (
    <section className="game-card">
      <FeedbackPanel feedback={feedback} />
      {error ? <p role="alert" className="form-error">{error.message}</p> : null}
      <form action={formAction}><button className="primary-action" type="submit" disabled={pending}>{pending ? "Cargando…" : feedback.nextAction === "finish" ? "Ver resultados" : "Continuar"}</button></form>
    </section>
  );
}
