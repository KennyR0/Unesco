import { describe, expect, it } from "vitest";

import {
  blockedAliasFixture,
  getAliasIssueMessage,
  getBlockedAliasListVersion,
  isAliasAllowed,
  isBlockedAlias,
  normalizeAliasCandidate,
  validateAlias,
} from "./alias";

function issueOf(result: ReturnType<typeof validateAlias>) {
  if (result.ok) throw new Error("expected alias validation to fail");
  return result.issue;
}

describe("alias temporal arcade (T026)", () => {
  it("normaliza NFC/trim y acepta aliases permitidos dentro del rango", () => {
    expect(normalizeAliasCandidate("  Ana  ")).toBe("Ana");
    expect(validateAlias("  Ana  ")).toEqual({ ok: true, alias: "Ana" });
    expect(validateAlias("Jose\u0301")).toEqual({ ok: true, alias: "José" });
    expect(validateAlias("A-B_c").ok).toBe(true);
    expect(validateAlias("María Pérez").ok).toBe(true);
    expect(isAliasAllowed("jugador-01")).toBe(true);
  });

  it("rechaza vacíos, longitud inválida y caracteres no contractuales", () => {
    expect(issueOf(validateAlias(""))).toBe("required");
    expect(issueOf(validateAlias("   "))).toBe("required");
    expect(issueOf(validateAlias("a"))).toBe("too_short");
    expect(issueOf(validateAlias("ab"))).toBe("too_short");
    expect(issueOf(validateAlias("a".repeat(21)))).toBe("too_long");
    expect(issueOf(validateAlias("ana!"))).toBe("invalid_characters");
    expect(issueOf(validateAlias("ana@unesco"))).toBe("invalid_characters");
    expect(issueOf(validateAlias("ana#1"))).toBe("invalid_characters");
    expect(getAliasIssueMessage("too_short")).toMatch(/al menos 3/);
  });

  it("modera por coincidencia exacta del alias completo, sin parciales", () => {
    expect(isBlockedAlias("admin")).toBe(true);
    expect(isBlockedAlias("ADMIN")).toBe(true);
    expect(isBlockedAlias(" admin ")).toBe(true);
    expect(isBlockedAlias("Antídoto")).toBe(true);
    expect(isBlockedAlias("UNESCO")).toBe(true);
    expect(isBlockedAlias("staff")).toBe(true);
    expect(isBlockedAlias("anónimo")).toBe(true);

    expect(issueOf(validateAlias("admin"))).toBe("blocked");
    expect(issueOf(validateAlias("Moderator"))).toBe("blocked");
    expect(issueOf(validateAlias("null"))).toBe("blocked");
    expect(getAliasIssueMessage("blocked")).toMatch(/no está permitido/);

    // Parciales permitidos: no colapsa ni busca substrings.
    expect(isBlockedAlias("administradorx")).toBe(false);
    expect(isAliasAllowed("administradorx")).toBe(true);
    expect(isAliasAllowed("unescofan")).toBe(true);
    expect(isAliasAllowed("rootbeer")).toBe(true);
    expect(isBlockedAlias("ad min")).toBe(false);
  });

  it("expone la lista versionada de moderación", () => {
    expect(getBlockedAliasListVersion()).toBe("2026-08-01.1");
    expect(blockedAliasFixture.normalization).toBe(
      "trim+nfc+es-lowercase+exact-full-alias",
    );
    expect(blockedAliasFixture.policy.partialMatches).toBe(false);
    expect(blockedAliasFixture.aliases).toContain("unesco");
    expect(blockedAliasFixture.aliases).toContain("staff");
  });
});
