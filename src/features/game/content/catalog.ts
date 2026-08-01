import "server-only";

import type { GameCatalogEntry, GameCode } from "@antidoto/contracts";
import { GAME_CODE_TO_MECHANIC, GAME_CODES } from "@antidoto/contracts";

import {
  GameCatalogSchema,
  GameCodeSchema,
} from "../domain/schemas";
import catalogDocument from "./arcade-catalog.v1.json";

const catalogEntries = GameCatalogSchema.parse(catalogDocument.games);

const catalogByCode = new Map<GameCode, GameCatalogEntry>(
  catalogEntries.map((entry) => [entry.gameCode, entry]),
);

export const ARCADE_CATALOG_VERSION = catalogDocument.catalogVersion;

export function listArcadeCatalog(): readonly GameCatalogEntry[] {
  return catalogEntries;
}

export function listAvailableArcadeCatalog(): readonly GameCatalogEntry[] {
  return catalogEntries.filter((entry) => entry.available);
}

export function getArcadeCatalogEntry(
  gameCode: GameCode,
): GameCatalogEntry | null {
  return catalogByCode.get(gameCode) ?? null;
}

export function resolveArcadeGameCode(
  value: string,
): GameCode | null {
  const parsed = GameCodeSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function requireArcadeCatalogEntry(
  value: string,
): GameCatalogEntry {
  const gameCode = resolveArcadeGameCode(value);
  if (!gameCode) {
    throw new Error(`INVALID_GAME: código de juego desconocido (${value}).`);
  }

  const entry = getArcadeCatalogEntry(gameCode);
  if (!entry) {
    throw new Error(`INVALID_GAME: el catálogo no incluye ${gameCode}.`);
  }

  if (!entry.available) {
    throw new Error(`INVALID_GAME: el juego ${gameCode} no está disponible.`);
  }

  if (GAME_CODE_TO_MECHANIC[entry.gameCode] !== entry.mechanic) {
    throw new Error(
      `INVALID_GAME: el mapeo mecánico de ${gameCode} es inconsistente.`,
    );
  }

  return entry;
}

export function assertArcadeCatalogIntegrity(): void {
  if (catalogEntries.length !== GAME_CODES.length) {
    throw new Error("El catálogo arcade no contiene exactamente seis juegos.");
  }

  for (const gameCode of GAME_CODES) {
    if (!catalogByCode.has(gameCode)) {
      throw new Error(`El catálogo arcade no incluye ${gameCode}.`);
    }
  }
}
