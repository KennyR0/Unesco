import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

import {
  GAME_CODE_TO_MECHANIC,
  GAME_CODES,
  MECHANICS,
  PublicQuestionSchema,
  RoundSizeSchema,
} from "@antidoto/contracts";

describe("contrato canónico de dominio", () => {
  it("se importa mediante el alias aprobado y expone sus schemas", () => {
    expect(RoundSizeSchema.safeParse(5).success).toBe(true);
    expect(PublicQuestionSchema).toBeDefined();
    expect(GAME_CODES).toHaveLength(6);
    expect(MECHANICS).toHaveLength(6);
    expect(Object.keys(GAME_CODE_TO_MECHANIC)).toEqual([...GAME_CODES]);
  });

  it("evita que la nueva superficie arcade importe el dominio legacy directamente", async () => {
    const files = [
      "src/features/game/domain/schemas.ts",
      "src/features/game/application/game-operations.ts",
      "src/features/game/application/server-operations.ts",
      "src/features/game/infrastructure/memory-arcade-gateway.ts",
      "src/features/game/infrastructure/supabase-game-gateway.ts",
    ];

    for (const file of files) {
      const source = await readFile(file, "utf8");
      expect(source).not.toMatch(/legacy-domain|single_choice/);
      expect(source).not.toMatch(/specs\/001-trivia-mvp-flow\/contracts\/domain/);
    }
  });
});
