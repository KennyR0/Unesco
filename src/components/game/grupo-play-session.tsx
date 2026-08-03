"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { GameState, PublicItem } from "@antidoto/contracts";

import {
  advanceArcadeGameAction,
  startGrupoGameFormAction,
  submitGameActionAction,
} from "../../app/actions/game";
import { GroupGame, type GroupActionValue } from "../games/group-game";
import { AliasStartForm } from "./alias-start-form";
import { GameShell } from "./game-shell";

export type GrupoPlaySessionProps = Readonly<{
  gameName: string;
  objective: string;
  initialState: GameState | null;
  bootstrapError?: string | null;
}>;

function isGrupoItem(item: PublicItem | null): item is Extract<
  PublicItem,
  { gameCode: "grupo" }
> {
  return item?.gameCode === "grupo";
}

function statusMessageFor(state: GameState | null): string {
  if (!state) return "Misión lista";
  switch (state.status) {
    case "active":
      return `Escena ${state.position + 1} de ${state.total}`;
    case "feedback":
      return "Revisa el feedback antes de continuar";
    case "finished":
      return "Partida terminada";
    case "expired":
      return "Partida expirada";
    default:
      return "Misión en curso";
  }
}

/**
 * Controlador jugable de El Grupo: alias → escenas → feedback → resultado.
 */
export function GrupoPlaySession({
  gameName,
  objective,
  initialState,
  bootstrapError = null,
}: GrupoPlaySessionProps) {
  const router = useRouter();
  const [state, setState] = useState<GameState | null>(initialState);
  const [error, setError] = useState<string | null>(bootstrapError);
  const [selectedAction, setSelectedAction] = useState<GroupActionValue | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  const rawItem = state?.item ?? null;
  const item = isGrupoItem(rawItem) ? rawItem : null;
  const feedback = state?.feedback ?? null;
  const progress =
    state && state.total > 0
      ? {
          current: Math.min(state.position + (feedback ? 1 : 0), state.total),
          total: state.total,
        }
      : null;

  function applyState(next: GameState) {
    setState(next);
    setError(null);
    if (next.status === "active") {
      setSelectedAction(null);
    }
    if (next.nextAction === "result") {
      router.push("/games/grupo/result");
    }
  }

  function handleAction(selection: { value: GroupActionValue }) {
    if (!state || !item || pending || feedback) return;
    setSelectedAction(selection.value);
    startTransition(async () => {
      const result = await submitGameActionAction({
        gameCode: "grupo",
        itemId: item.itemId,
        input: { kind: "group_action", value: selection.value },
      });
      if (!result.ok) {
        setSelectedAction(null);
        setError(result.error.message);
        return;
      }
      applyState(result.data);
    });
  }

  function handleAdvance() {
    if (!state || !item || pending) return;
    startTransition(async () => {
      const result = await advanceArcadeGameAction({
        gameCode: "grupo",
        itemId: item.itemId,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      applyState(result.data);
    });
  }

  const showIntro = !state || state.status === "intro";

  return (
    <GameShell
      title={gameName}
      gameCode="grupo"
      eyebrow="Antídoto / Arcade MIL"
      status={state?.status ?? "intro"}
      statusMessage={statusMessageFor(state)}
      progress={progress}
      error={error}
      feedback={feedback}
      nextAction={
        feedback ? (
          <button
            className="primary-action"
            type="button"
            onClick={handleAdvance}
            disabled={pending}
          >
            {pending ? "Avanzando…" : "Continuar"}
          </button>
        ) : null
      }
      className="game-route game-route--grupo"
    >
      {showIntro ? (
        <article className="game-route__intro">
          <p className="game-route__label">Misión grupo</p>
          <p className="game-route__objective">{objective}</p>
          <p className="game-route__mechanic">
            Mecánica: group decision · 6 escenas · máximo 12 puntos
          </p>
          <AliasStartForm
            action={startGrupoGameFormAction}
            disabled={pending}
            error={null}
            submitLabel="Entrar al chat familiar"
          />
          <nav
            className="game-route__navigation"
            aria-label="Navegación de la misión"
          >
            <Link className="secondary-action" href="/">
              Volver al arcade
            </Link>
          </nav>
        </article>
      ) : null}

      {!showIntro && item ? (
        <GroupGame
          item={item}
          onAction={handleAction}
          selectedAction={selectedAction}
          disabled={pending || Boolean(feedback)}
        />
      ) : null}

      {!showIntro && !item && state?.nextAction !== "result" ? (
        <p role="status">Preparando la siguiente escena…</p>
      ) : null}
    </GameShell>
  );
}
