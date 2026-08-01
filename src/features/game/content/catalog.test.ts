import { describe, expect, it } from "vitest";

import {
  GAME_CODE_TO_MECHANIC,
  GAME_CODES,
} from "@antidoto/contracts";

import catalogDocument from "./arcade-catalog.v1.json";
import {
  ARCADE_CATALOG_VERSION,
  assertArcadeCatalogIntegrity,
  getArcadeCatalogEntry,
  listArcadeCatalog,
  listAvailableArcadeCatalog,
  requireArcadeCatalogEntry,
  resolveArcadeGameCode,
} from "./catalog";
import { GameCatalogSchema } from "../domain/schemas";

describe("catálogo arcade versionado", () => {
  it("valida los seis juegos contra el schema contractual", () => {
    const parsed = GameCatalogSchema.safeParse(catalogDocument.games);
    expect(parsed.success).toBe(true);
    expect(catalogDocument.schemaVersion).toBe(1);
    expect(ARCADE_CATALOG_VERSION).toBe(catalogDocument.catalogVersion);
    expect(listArcadeCatalog()).toHaveLength(GAME_CODES.length);
    expect(listAvailableArcadeCatalog()).toHaveLength(GAME_CODES.length);
    expect(() => assertArcadeCatalogIntegrity()).not.toThrow();
  });

  it("resuelve rutas, mecánicas y códigos desconocidos de forma segura", () => {
    for (const gameCode of GAME_CODES) {
      const entry = getArcadeCatalogEntry(gameCode);
      expect(entry).not.toBeNull();
      expect(entry?.mechanic).toBe(GAME_CODE_TO_MECHANIC[gameCode]);
      expect(entry?.route).toBe(`/games/${gameCode}`);
      expect(entry?.available).toBe(true);
      expect(requireArcadeCatalogEntry(gameCode).gameCode).toBe(gameCode);
    }

    expect(resolveArcadeGameCode("feed-60")).toBe("feed-60");
    expect(resolveArcadeGameCode("unknown-game")).toBeNull();
    expect(() => requireArcadeCatalogEntry("single_choice")).toThrow(
      /INVALID_GAME/,
    );
  });
});
