import { describe, expect, it } from "vitest";

import {
  CLIENT_FORBIDDEN_AUTHORITY_FIELDS,
  GAME_CODE_TO_MECHANIC,
  GAME_CODES,
  MECHANICS,
} from "@antidoto/contracts";

import {
  arcadeContractSamples,
  discriminatedActions,
} from "../fixtures/contract-samples";
import {
  ARCADE_RPC_NAMES,
  ARCADE_SCHEMA,
  ARCADE_TABLES,
} from "../fixtures/supabase-local";
import {
  GameActionSchema,
  GameResultSchema,
  GameStateSchema,
  LeaderboardSchema,
  PublicItemSchema,
} from "../../src/features/game/domain/schemas";

describe("consistencia del contrato arcade", () => {
  it("mantiene seis juegos, mecánicas y tablas privadas alineadas", () => {
    expect(GAME_CODES).toHaveLength(6);
    expect(MECHANICS).toHaveLength(6);
    expect(Object.keys(GAME_CODE_TO_MECHANIC)).toEqual([...GAME_CODES]);
    expect(ARCADE_SCHEMA).toBe("private_arcade");
    expect(ARCADE_TABLES).toEqual(
      expect.arrayContaining([
        "game_catalog",
        "game_items",
        "item_media",
        "item_feedback",
        "item_solution_private",
        "game_sessions",
        "session_items",
        "player_answers",
        "game_results",
        "leaderboard_projection",
      ]),
    );
    expect(ARCADE_RPC_NAMES).toEqual([]);
  });

  it("valida las seis acciones y respuestas discriminadas sin autoridad del cliente", () => {
    expect(discriminatedActions).toHaveLength(6);
    expect(
      discriminatedActions.every(
        (action) => GameActionSchema.safeParse(action).success,
      ),
    ).toBe(true);
    expect(GameStateSchema.safeParse(arcadeContractSamples.state).success).toBe(
      true,
    );
    expect(GameResultSchema.safeParse(arcadeContractSamples.result).success).toBe(
      true,
    );
    expect(
      LeaderboardSchema.safeParse(arcadeContractSamples.leaderboard).success,
    ).toBe(true);
    expect(
      PublicItemSchema.safeParse(arcadeContractSamples.publicItems[0]).success,
    ).toBe(true);
    expect(CLIENT_FORBIDDEN_AUTHORITY_FIELDS).toContain("solution");
    expect(CLIENT_FORBIDDEN_AUTHORITY_FIELDS).toContain("rankingScore");
  });
});
