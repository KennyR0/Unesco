"use client";

import type { GameState } from "@antidoto/contracts";

import { ArcadePlaySession } from "./arcade-play-session";

export type GrupoPlaySessionProps = Readonly<{
  gameName: string;
  objective: string;
  initialState: GameState | null;
  bootstrapError?: string | null;
}>;

/** Atajo de El Grupo sobre el controlador genérico de sesión arcade. */
export function GrupoPlaySession(props: GrupoPlaySessionProps) {
  return (
    <ArcadePlaySession
      gameCode="grupo"
      gameName={props.gameName}
      objective={props.objective}
      introMechanic="Mecánica: group decision · 6 escenas · máximo 12 puntos"
      introSubmitLabel="Entrar al chat familiar"
      itemNoun="Escena"
      initialState={props.initialState}
      bootstrapError={props.bootstrapError}
    />
  );
}
