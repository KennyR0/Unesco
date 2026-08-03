import "server-only";

import type { GameCode } from "@antidoto/contracts";

import {
  createContentRepository,
  type ContentRepository,
} from "./content-repository";
import grupoPack from "./game-items/grupo.v1.json";

/**
 * Repositorio editorial activo para el runtime en memoria.
 * Por ahora solo publica El Grupo; el resto de juegos se engancha después.
 */
let sharedRepository: ContentRepository | null = null;

export function getArcadeContentRepository(): ContentRepository {
  sharedRepository ??= createContentRepository(grupoPack, {
    activeVersion: "2026-07-30.1",
  });
  return sharedRepository;
}

export function listPublishedItemIds(gameCode: GameCode): readonly string[] {
  return getArcadeContentRepository()
    .listPublishedItems(gameCode)
    .map((item) => item.itemId);
}
