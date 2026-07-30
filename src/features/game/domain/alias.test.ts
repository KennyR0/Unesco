import { describe, expect, it } from "vitest";

import { blockedAliasFixture, validateAlias } from "./alias";

function issueOf(result: ReturnType<typeof validateAlias>) {
  if (result.ok) throw new Error("expected alias validation to fail");
  return result.issue;
}

describe("alias MVP", () => {
  it("normaliza NFC, trim y aplica el rango visible", () => {
    expect(validateAlias("  Ana  ")).toEqual({ ok: true, alias: "Ana" });
    expect(issueOf(validateAlias("a"))).toBe("too_short");
    expect(issueOf(validateAlias("a".repeat(21)))).toBe("too_long");
    expect(validateAlias("Jose\u0301")).toEqual({ ok: true, alias: "José" });
    expect(issueOf(validateAlias("ana!"))).toBe("invalid_characters");
    expect(validateAlias("A-B_c").ok).toBe(true);
  });

  it("bloquea coincidencia completa sin bloquear coincidencias parciales", () => {
    expect(issueOf(validateAlias("admin"))).toBe("blocked");
    expect(issueOf(validateAlias("ADMIN"))).toBe("blocked");
    expect(issueOf(validateAlias(" admin "))).toBe("blocked");
    expect(issueOf(validateAlias("Antídoto"))).toBe("blocked");
    expect(validateAlias("administradorx").ok).toBe(true);
    expect(blockedAliasFixture.listVersion).toBe("2026-07-30.1");
  });
});
