import { notFound } from "next/navigation";

import type { GameCode } from "@antidoto/contracts";

import { ArcadePlaySession } from "../../../components/game/arcade-play-session";
import { SecureStateView } from "../../../components/game/secure-state-view";
import { getArcadeGameStateServer } from "../../../features/game/application/server-operations";
import {
  listAvailableArcadeCatalog,
  requireArcadeCatalogEntry,
} from "../../../features/game/content/catalog";
import { GAME_SCORE_RULES } from "../../../features/game/domain/scoring";

type GamePageProps = Readonly<{
  params: Promise<{ gameCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export function generateStaticParams(): Array<{ gameCode: GameCode }> {
  return listAvailableArcadeCatalog().map(({ gameCode }) => ({ gameCode }));
}

const INTRO_COPY: Record<
  GameCode,
  Readonly<{ submitLabel: string; itemNoun: string; itemNounPlural: string }>
> = {
  "real-o-ia": {
    submitLabel: "Empezar a analizar imágenes",
    itemNoun: "Imagen",
    itemNounPlural: "imágenes",
  },
  grupo: {
    submitLabel: "Entrar al chat familiar",
    itemNoun: "Escena",
    itemNounPlural: "escenas",
  },
  "clickbait-swipe": {
    submitLabel: "Empezar a clasificar titulares",
    itemNoun: "Titular",
    itemNounPlural: "titulares",
  },
  "radar-de-fuentes": {
    submitLabel: "Encender el radar",
    itemNoun: "Fuente",
    itemNounPlural: "fuentes",
  },
  "feed-60": {
    submitLabel: "Abrir el feed de 60 segundos",
    itemNoun: "Publicación",
    itemNounPlural: "publicaciones",
  },
  "mente-maestra": {
    submitLabel: "Entrar al laboratorio de desinformación",
    itemNoun: "Paso",
    itemNounPlural: "pasos",
  },
};

function firstSearchParam(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
}

export default async function GamePage({ params, searchParams }: GamePageProps) {
  const { gameCode } = await params;
  const query = await searchParams;  let game;
  try {
    game = requireArcadeCatalogEntry(gameCode);
  } catch {
    notFound();
  }

  const stateResult = await getArcadeGameStateServer({
    gameCode: game.gameCode,
  });

  if (
    !stateResult.ok &&
    (stateResult.error.code === "SESSION_INVALID" ||
      stateResult.error.code === "GAME_MISMATCH")
  ) {
    return <SecureStateView gameCode={game.gameCode} reason="invalid" canClear />;
  }

  const copy = INTRO_COPY[game.gameCode];
  const rules = GAME_SCORE_RULES[game.gameCode];
  const startError = firstSearchParam(query.startError);

  return (
    <ArcadePlaySession
      gameCode={game.gameCode}
      gameName={game.name}
      objective={game.objective}
      introMechanic={`Mecánica: ${game.mechanic.replaceAll("_", " ")} · ${rules.itemCount} ${copy.itemNounPlural} · máximo ${rules.maxPoints} puntos`}
      introSubmitLabel={copy.submitLabel}
      itemNoun={copy.itemNoun}
      initialState={stateResult.ok ? stateResult.data : null}
      bootstrapError={
        startError ??
        (!stateResult.ok && stateResult.error.code !== "SESSION_NOT_FOUND"
          ? stateResult.error.message
          : null)
      }
    />
  );
}
