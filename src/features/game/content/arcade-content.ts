import "server-only";

import type { GameCode } from "@antidoto/contracts";

import {
  createContentRepository,
  type ContentRepository,
} from "./content-repository";
import clickbaitSwipePack from "./game-items/clickbait-swipe.v1.json";
import feed60Pack from "./game-items/feed-60.v1.json";
import grupoPack from "./game-items/grupo.v1.json";
import menteMaestraPack from "./game-items/mente-maestra.v1.json";
import radarDeFuentesPack from "./game-items/radar-de-fuentes.v1.json";
import realOIaPack from "./game-items/real-o-ia.v1.json";

const ARCADE_CONTENT_VERSION = "2026-07-30.1";

/**
 * Repositorio editorial activo para el runtime en memoria.
 * Publica los seis packs del arcade bajo la misma versión activa.
 */
let sharedRepository: ContentRepository | null = null;

export function getArcadeContentRepository(): ContentRepository {
  sharedRepository ??= createContentRepository(
    [
      ...grupoPack,
      ...realOIaPack,
      ...clickbaitSwipePack,
      ...radarDeFuentesPack,
      ...feed60Pack,
      ...menteMaestraPack,
    ],
    { activeVersion: ARCADE_CONTENT_VERSION },
  );
  return sharedRepository;
}

export function listPublishedItemIds(gameCode: GameCode): readonly string[] {
  return getArcadeContentRepository()
    .listPublishedItems(gameCode)
    .map((item) => item.itemId);
}
