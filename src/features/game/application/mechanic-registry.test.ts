import { describe, expect, it } from "vitest";

import {
  GAME_CODES,
  GAME_CODE_TO_MECHANIC,
} from "@antidoto/contracts";

import {
  getMechanicDefinitionForGameCode,
  getMechanicForGameCode,
  hasRegisteredGameCode,
  MECHANIC_REGISTRY,
  resolveMechanicForGameCode,
} from "./mechanic-registry";

describe("registro de mecánicas del arcade", () => {
  it("registra exactamente los seis gameCode del contrato", () => {
    expect(Object.keys(MECHANIC_REGISTRY).sort()).toEqual(
      [...GAME_CODES].sort(),
    );

    for (const gameCode of GAME_CODES) {
      expect(MECHANIC_REGISTRY[gameCode]).toBe(
        GAME_CODE_TO_MECHANIC[gameCode],
      );
      expect(getMechanicForGameCode(gameCode)).toBe(
        GAME_CODE_TO_MECHANIC[gameCode],
      );
      expect(getMechanicDefinitionForGameCode(gameCode).gameCode).toBe(
        gameCode,
      );
    }
  });

  it("resuelve códigos externos sin aceptar juegos no registrados", () => {
    expect(hasRegisteredGameCode("feed-60")).toBe(true);
    expect(hasRegisteredGameCode("single_choice")).toBe(false);
    expect(resolveMechanicForGameCode("feed-60")).toBe("timed_feed");
    expect(resolveMechanicForGameCode("unknown-game")).toBeNull();
  });
});
