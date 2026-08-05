"use client";

import type { GameState, SiftStep } from "@antidoto/contracts";

import { useI18n } from "../../lib/i18n/provider";
import { ArcadePlaySession } from "./arcade-play-session";

export type GrupoPlaySessionProps = Readonly<{
  gameName: string;
  objective: string;
  siftFocus?: readonly SiftStep[];
  initialState: GameState | null;
  bootstrapError?: string | null;
}>;

/** Atajo de El Grupo sobre el controlador genérico de sesión arcade. */
export function GrupoPlaySession(props: GrupoPlaySessionProps) {
  const { locale, messages } = useI18n();
  return (
    <ArcadePlaySession
      gameCode="grupo"
      gameName={props.gameName}
      objective={props.objective}
      introMechanic={`${messages.games.mechanic}: ${messages.games.groupMechanic}`}
      introSubmitLabel={messages.games.groupStart}
      itemNoun={locale === "en" ? "Scene" : "Escena"}
      siftFocus={props.siftFocus ?? ["stop", "investigate"]}
      initialState={props.initialState}
      bootstrapError={props.bootstrapError}
    />
  );
}
