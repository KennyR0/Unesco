import { describe, expect, it } from "vitest";

import {
  GAME_CODES,
  GAME_CODE_TO_MECHANIC,
  MECHANICS,
} from "@antidoto/contracts";

import {
  definitionForGameCode,
  definitionForMechanic,
  isMechanic,
  mechanicForGameCode,
  MECHANIC_DEFINITIONS,
} from "./mechanic";

describe("dominio de mecánicas", () => {
  it("declara una definición completa para cada mecánica contractual", () => {
    expect(Object.keys(MECHANIC_DEFINITIONS).sort()).toEqual(
      [...MECHANICS].sort(),
    );

    for (const mechanic of MECHANICS) {
      const definition = definitionForMechanic(mechanic);

      expect(definition.mechanic).toBe(mechanic);
      expect(mechanicForGameCode(definition.gameCode)).toBe(mechanic);
      expect(definitionForGameCode(definition.gameCode)).toEqual(definition);
    }
  });

  it("mantiene el mapeo contractual gameCode → mechanic", () => {
    for (const gameCode of GAME_CODES) {
      expect(mechanicForGameCode(gameCode)).toBe(
        GAME_CODE_TO_MECHANIC[gameCode],
      );
    }

    expect(isMechanic("timed_feed")).toBe(true);
    expect(isMechanic("single_choice")).toBe(false);
  });
});
