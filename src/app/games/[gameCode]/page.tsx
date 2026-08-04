import { notFound } from "next/navigation";

import type { GameCode } from "@antidoto/contracts";

import { ArcadePlaySession } from "../../../components/game/arcade-play-session";
import { SecureStateView } from "../../../components/game/secure-state-view";
import { getArcadeGameStateServer } from "../../../features/game/application/server-operations";
import { listAvailableArcadeCatalog, requireArcadeCatalogEntry } from "../../../features/game/content/catalog";
import { getLocalizedCatalog, translateMechanic } from "../../../lib/i18n/content";
import { getMessages } from "../../../lib/i18n/i18n";
import { localizeErrorMessage } from "../../../lib/i18n/errors";
import { getServerLocale } from "../../../lib/i18n/server";
import { GAME_SCORE_RULES } from "../../../features/game/domain/scoring";

type GamePageProps = Readonly<{
  params: Promise<{ gameCode: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

export function generateStaticParams(): Array<{ gameCode: GameCode }> {
  return listAvailableArcadeCatalog().map(({ gameCode }) => ({ gameCode }));
}

function firstSearchParam(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return value[0];
  return null;
}

export default async function GamePage({ params, searchParams }: GamePageProps) {
  const locale = await getServerLocale();
  const messages = getMessages(locale);
  const { gameCode } = await params;
  const query = searchParams ? await searchParams : {};
  let game;
  try {
    game = requireArcadeCatalogEntry(gameCode);
  } catch {
    notFound();
  }

  const localizedGame = getLocalizedCatalog(locale).find((entry) => entry.gameCode === game.gameCode) ?? game;
  const stateResult = await getArcadeGameStateServer({ gameCode: game.gameCode });

  if (!stateResult.ok && (stateResult.error.code === "SESSION_INVALID" || stateResult.error.code === "GAME_MISMATCH")) {
    return <SecureStateView gameCode={game.gameCode} reason="invalid" canClear />;
  }

  const rules = GAME_SCORE_RULES[game.gameCode];
  const itemNouns: Record<GameCode, readonly [string, string]> = {
    "real-o-ia": [locale === "en" ? "Image" : "Imagen", locale === "en" ? "images" : "imágenes"],
    grupo: [locale === "en" ? "Scene" : "Escena", locale === "en" ? "scenes" : "escenas"],
    "clickbait-swipe": [locale === "en" ? "Headline" : "Titular", locale === "en" ? "headlines" : "titulares"],
    "radar-de-fuentes": [locale === "en" ? "Source" : "Fuente", locale === "en" ? "sources" : "fuentes"],
    "feed-60": [locale === "en" ? "Post" : "Publicación", locale === "en" ? "posts" : "publicaciones"],
    "mente-maestra": [locale === "en" ? "Step" : "Paso", locale === "en" ? "steps" : "pasos"],
  };
  const [itemNoun, itemNounPlural] = itemNouns[game.gameCode];
  const startError = firstSearchParam(query.startError ?? query.startErrorCode);

  return (
    <ArcadePlaySession
      gameCode={game.gameCode}
      gameName={localizedGame.name}
      objective={localizedGame.objective}
      introMechanic={`${messages.games.mechanic}: ${translateMechanic(game.mechanic, locale)} · ${rules.itemCount} ${itemNounPlural} · ${locale === "en" ? "maximum" : "máximo"} ${rules.maxPoints} ${messages.result.points.toLowerCase()}`}
      introSubmitLabel={game.gameCode === "grupo" ? messages.games.groupStart : messages.form.startMission}
      itemNoun={itemNoun}
      initialState={stateResult.ok ? stateResult.data : null}
      bootstrapError={startError
        ? localizeErrorMessage(startError, messages.form.startFailed, locale)
        : !stateResult.ok && stateResult.error.code !== "SESSION_NOT_FOUND"
          ? localizeErrorMessage(stateResult.error.code, stateResult.error.message, locale)
          : null}
    />
  );
}
