import {
  ALIAS_VALIDATION_MESSAGES,
  BLOCKED_ALIAS_MESSAGE,
  createAliasSubmissionSchema,
  type ValidatedAlias,
} from "@antidoto/contracts";

import blocklist from "../content/blocked-aliases.v1.json";

/** Etiqueta de display para partidas sin alias (no elegibles al ranking). */
export const GUEST_DISPLAY_ALIAS = "Invitado";

export type AliasValidationIssue =
  | "required"
  | "too_short"
  | "too_long"
  | "invalid_characters"
  | "blocked";

export type AliasValidationResult =
  | { ok: true; alias: ValidatedAlias }
  | { ok: false; issue: AliasValidationIssue };

const blockedAliases = new Set(blocklist.aliases);
const aliasSchema = createAliasSubmissionSchema(blockedAliases);

const normalizedBlocklist = new Set(
  Array.from(blockedAliases, (alias) =>
    alias.trim().normalize("NFC").toLocaleLowerCase("es"),
  ),
);

/** Normalización contractual del alias temporal (trim + NFC). */
export function normalizeAliasCandidate(value: string): string {
  return value.trim().normalize("NFC");
}

/** Comparación exacta del alias completo tras locale español. */
export function isBlockedAlias(value: string): boolean {
  const normalized = normalizeAliasCandidate(value).toLocaleLowerCase("es");
  if (!normalized) return false;
  return normalizedBlocklist.has(normalized);
}

export function getAliasIssueMessage(issue: AliasValidationIssue): string {
  if (issue === "blocked") return BLOCKED_ALIAS_MESSAGE;
  return ALIAS_VALIDATION_MESSAGES[issue];
}

export function validateAlias(value: string): AliasValidationResult {
  const result = aliasSchema.safeParse({ alias: value });
  if (result.success) return { ok: true, alias: result.data.alias };

  const first = result.error.issues[0];
  const metadata =
    first && "params" in first && first.params && typeof first.params === "object"
      ? (first.params as Record<string, unknown>)
      : {};

  if (metadata.contractCode === "BLOCKED_ALIAS") {
    return { ok: false, issue: "blocked" };
  }

  // Defensa en profundidad: la blocklist también se consulta fuera de Zod.
  if (isBlockedAlias(value)) {
    return { ok: false, issue: "blocked" };
  }

  const issue = metadata.aliasIssue;
  if (
    issue === "required" ||
    issue === "too_short" ||
    issue === "too_long" ||
    issue === "invalid_characters"
  ) {
    return { ok: false, issue };
  }

  return { ok: false, issue: "invalid_characters" };
}

/** Alias válido y no bloqueado, listo para sesión o ranking. */
export function isAliasAllowed(value: string): boolean {
  return validateAlias(value).ok;
}

export function getBlockedAliasListVersion(): string {
  return blocklist.listVersion;
}

export const blockedAliasFixture = blocklist;
