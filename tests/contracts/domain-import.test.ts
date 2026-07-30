import { describe, expect, it } from "vitest";

import * as contracts from "@antidoto/contracts";

describe("contrato canónico de dominio", () => {
  it("se importa mediante el alias aprobado y expone sus schemas", () => {
    expect(contracts.RoundSizeSchema.safeParse(5).success).toBe(true);
    expect(contracts.PublicQuestionSchema).toBeDefined();
    expect(contracts.GameErrorSchema).toBeDefined();
  });
});
