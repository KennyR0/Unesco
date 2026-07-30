import { createAliasSubmissionSchema, type ValidatedAlias } from "@antidoto/contracts";

import blocklist from "../content/blocked-aliases.v1.json";

const blockedAliases = new Set(blocklist.aliases);
const aliasSchema = createAliasSubmissionSchema(blockedAliases);

export type AliasValidationResult =
  | { ok: true; alias: ValidatedAlias }
  | { ok: false; issue: "required" | "too_short" | "too_long" | "invalid_characters" | "blocked" };

export function validateAlias(value: string): AliasValidationResult {
  const result = aliasSchema.safeParse({ alias: value });
  if (result.success) return { ok: true, alias: result.data.alias };
  const first = result.error.issues[0];
  const metadata = first && "params" in first && first.params && typeof first.params === "object"
    ? first.params as Record<string, unknown>
    : {};
  if (metadata.contractCode === "BLOCKED_ALIAS") return { ok: false, issue: "blocked" };
  const issue = metadata.aliasIssue;
  return { ok: false, issue: issue === "required" || issue === "too_short" || issue === "too_long" ? issue : "invalid_characters" };
}

export const blockedAliasFixture = blocklist;
