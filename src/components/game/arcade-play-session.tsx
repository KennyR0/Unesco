"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

import type { GameCode, GameState, PublicItem } from "@antidoto/contracts";

import {
  advanceArcadeGameAction,
  startArcadeGameFormAction,
  submitGameActionAction,
} from "../../app/actions/game";
import type { GameStateWithCompanion } from "../../features/game/infrastructure/session-companion";
import { useI18n } from "../../lib/i18n/provider";
import { localizeErrorMessage } from "../../lib/i18n/errors";
import {
  ClickbaitSwipeGame,
  type HeadlineClassificationValue,
} from "../games/clickbait-swipe-game";
import { FeedTimerGame, type FeedActionValue } from "../games/feed-60-game";
import { GroupGame, type GroupActionValue } from "../games/group-game";
import { MisinformationAutopsyGame } from "../games/misinformation-autopsy-game";
import { RealOrIaGame, type VerdictChoice } from "../games/real-o-ia-game";
import {
  SourceRadarGame,
  type SourceCategoryValue,
} from "../games/source-radar-game";
import { AliasStartForm } from "./alias-start-form";
import { GameShell } from "./game-shell";

export type ArcadePlaySessionProps = Readonly<{
  gameCode: GameCode;
  gameName: string;
  objective: string;
  /** Línea editorial del intro: mecánica, items y puntaje máximo. */
  introMechanic: string;
  introSubmitLabel: string;
  /** Sustantivo del item para el estado de sesión ("Escena", "Imagen"…). */
  itemNoun: string;
  initialState: GameState | null;
  bootstrapError?: string | null;
}>;

/**
 * Controlador cliente del ciclo de juego arcade:
 * intro alias → submit → feedback "Continuar" → advance → result.
 * Cada mecánica aporta su componente y su acción; el transporte y la
 * evaluación autoritativa viven en el servidor.
 */
export function ArcadePlaySession({
  gameCode,
  gameName,
  objective,
  introMechanic,
  introSubmitLabel,
  itemNoun,
  initialState,
  bootstrapError = null,
}: ArcadePlaySessionProps) {
  const { locale, messages } = useI18n();
  const [state, setState] = useState<GameStateWithCompanion | null>(
    initialState,
  );
  const [error, setError] = useState<string | null>(bootstrapError);
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const isIntro = state === null || state.status === "intro";
  // El servidor ya localiza estado inicial y respuestas de acciones.
  const feedback = !isIntro ? state.feedback ?? null : null;
  const provisionalScore = !isIntro ? state.provisionalScore : null;
  const isFinished = !isIntro && state.nextAction === "result";
  const feedCompanion =
    state?.companion?.kind === "feed-60" ? state.companion : null;
  const autopsyCompanion =
    state?.companion?.kind === "mente-maestra" ? state.companion : null;

  function statusMessageFor(current: GameState | null): string {
    if (!current) return messages.games.missionReady;
    switch (current.status) {
      case "intro":
        return messages.games.missionReady;
      case "active":
        return messages.games.scene(current.position + 1, current.total).replace(/^Scene /, `${itemNoun} `).replace(/^Escena /, `${itemNoun} `);
      case "processing":
        return messages.chrome.processingAnswer;
      case "feedback":
        return messages.feedback.accepted;
      case "expired":
        return messages.games.gameExpired;
      case "finished":
        return messages.games.gameFinished;
      case "invalid":
        return messages.state.resultUnavailable;
    }
  }

  function applyState(next: GameState) {
    setState(next);
    setError(null);
    if (next.status === "active") {
      setSelected(null);
    }
    if (next.nextAction === "result" && gameCode !== "mente-maestra") {
      router.push(`/games/${gameCode}/result`);
    }
  }

  function handleActionError(actionError: {
    code: string;
    message: string;
  }) {
    if (actionError.code === "SESSION_EXPIRED") {
      router.push(`/games/${gameCode}/result`);
      return;
    }
    setError(localizeErrorMessage(actionError.code, actionError.message, locale));
  }

  function submitSelection(input: unknown, selectedValue: string | null) {
    if (!state || !state.item || pending || state.feedback) return;
    if (selectedValue !== null) {
      setSelected(selectedValue);
    }

    const itemId = state.item.itemId;
    startTransition(async () => {
      const result = await submitGameActionAction({
        gameCode,
        itemId,
        input,
      });
      if (!result.ok) {
        setSelected(null);
        handleActionError(result.error);
        return;
      }
      applyState(result.data);
    });
  }

  function handleAdvance() {
    if (!state?.item || pending) return;
    const itemId = state.item.itemId;

    startTransition(async () => {
      const result = await advanceArcadeGameAction({ gameCode, itemId });
      if (!result.ok) {
        handleActionError(result.error);
        return;
      }
      applyState(result.data);
    });
  }

  function renderGame(item: PublicItem): ReactNode {
    switch (item.gameCode) {
      case "grupo":
        return (
          <GroupGame
            item={item}
            onAction={(selection) =>
              submitSelection(
                { kind: "group_action", value: selection.value },
                selection.value,
              )
            }
            selectedAction={selected as GroupActionValue | null}
            disabled={pending}
          />
        );
      case "real-o-ia":
        return (
          <RealOrIaGame
            item={item}
            onVerdict={(verdict) =>
              submitSelection({ kind: "verdict", value: verdict }, verdict)
            }
            selectedVerdict={selected as VerdictChoice | null}
            disabled={pending}
            priority={(state?.position ?? 0) === 0}
          />
        );
      case "clickbait-swipe":
        return (
          <ClickbaitSwipeGame
            item={item}
            onClassify={(selection) =>
              submitSelection(
                {
                  kind: "headline_classification",
                  value: selection.value,
                  source: selection.source,
                },
                selection.value,
              )
            }
            selectedClassification={
              selected as HeadlineClassificationValue | null
            }
            disabled={pending}
          />
        );
      case "radar-de-fuentes":
        return (
          <SourceRadarGame
            item={item}
            onClassify={(selection) =>
              submitSelection(
                { kind: "source_classification", value: selection.value },
                selection.value,
              )
            }
            selectedCategory={selected as SourceCategoryValue | null}
            disabled={pending}
          />
        );
      case "feed-60":
        return (
          <FeedTimerGame
            item={item}
            remainingSeconds={
              feedCompanion?.remainingSeconds ?? item.remainingSeconds
            }
            onAction={(selection) =>
              submitSelection(
                { kind: "feed_action", value: selection.value },
                selection.value === "verify" ? null : selection.value,
              )
            }
            selectedAction={selected as FeedActionValue | null}
            verificationHints={feedCompanion?.verificationHints ?? []}
            verified={feedCompanion?.verified ?? false}
            expired={state?.status === "expired"}
            disabled={pending}
          />
        );
      case "mente-maestra":
        return (
          <MisinformationAutopsyGame
            item={item}
            stepNumber={state ? state.position + 1 : undefined}
            totalSteps={state?.total}
            sessionSelections={autopsyCompanion?.selections ?? []}
            selectedOptionId={selected ?? autopsyCompanion?.selectedOptionId ?? null}
            onChoose={(selection) =>
              submitSelection(
                {
                  kind: "autopsy_choice",
                  step: item.step,
                  optionId: selection.optionId,
                },
                selection.optionId,
              )
            }
            disabled={pending}
            simulatedReach={autopsyCompanion?.simulatedReach ?? null}
            autopsyEntries={autopsyCompanion?.autopsyEntries ?? []}
            fictionalComments={autopsyCompanion?.fictionalComments ?? []}
            educationalDisclaimer={
              autopsyCompanion?.educationalDisclaimer ?? null
            }
          />
        );
    }
  }

  if (isIntro) {
    return (
      <GameShell
        title={gameName}
        gameCode={gameCode}
        eyebrow={messages.chrome.brandEyebrow}
        status={state?.status ?? "intro"}
        statusMessage={statusMessageFor(state)}
        error={error}
        progress={null}
        className="game-route"
      >
        <article
          className="game-route__intro"
          aria-label={`${messages.games.mission} ${gameName}`}
        >
          <p className="game-route__label">{messages.games.mission} {gameCode}</p>
          <p className="game-route__objective">{objective}</p>
          <p className="game-route__mechanic">{introMechanic}</p>
          <AliasStartForm
            action={startArcadeGameFormAction}
            gameCode={gameCode}
            submitLabel={introSubmitLabel}
            disabled={pending}
            error={error}
          />
          <nav
            className="game-route__navigation"
            aria-label={messages.games.navigation}
          >
            <Link className="secondary-action" href="/">
              {messages.games.backToArcade}
            </Link>
          </nav>
        </article>
      </GameShell>
    );
  }

  return (
    <GameShell
      title={gameName}
      gameCode={gameCode}
      eyebrow={messages.chrome.brandEyebrow}
      status={state.status}
      statusMessage={statusMessageFor(state)}
      progress={{
        current: Math.min(state.position + 1, state.total),
        total: state.total,
      }}
      error={error}
      feedback={feedback}
      nextAction={
        feedback && state.nextAction === "advance" ? (
          <button
            className="primary-action"
            type="button"
            onClick={handleAdvance}
            disabled={pending}
          >
            {pending ? messages.games.advancing : messages.games.continue}
          </button>
        ) : null
      }
      className="game-route"
    >
      {provisionalScore ? (
        <p>
          {messages.result.points}: {provisionalScore.points} {messages.chrome.ofWord}{" "}
          {provisionalScore.maxPoints}
        </p>
      ) : null}

      {isFinished ? (
        <section className="game-finished" aria-label={`${messages.result.result}: ${gameName}`}>
          {gameCode === "mente-maestra" ? (
            <MisinformationAutopsyGame
              item={null}
              totalSteps={state.total}
              sessionSelections={autopsyCompanion?.selections ?? []}
              simulatedReach={autopsyCompanion?.simulatedReach ?? null}
              autopsyEntries={autopsyCompanion?.autopsyEntries ?? []}
              fictionalComments={autopsyCompanion?.fictionalComments ?? []}
              educationalDisclaimer={
                autopsyCompanion?.educationalDisclaimer ?? null
              }
            />
          ) : (
            <p>{messages.games.gameFinished}.</p>
          )}
          <p>
            <Link className="primary-action" href={`/games/${gameCode}/result`}>
              {messages.result.result}
            </Link>
          </p>
        </section>
      ) : state.item ? (
        renderGame(state.item)
      ) : null}
    </GameShell>
  );
}
