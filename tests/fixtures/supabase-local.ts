import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";

export const ARCADE_SCHEMA = "private_arcade" as const;

export const ARCADE_TABLES = [
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
] as const;

// T017 deliberately exposes no public RPC. Arcade operations remain server-only.
export const ARCADE_RPC_NAMES = [] as const;

const container =
  process.env.SUPABASE_DB_CONTAINER ?? "supabase_db_antidoto-trivia-mvp";

type JsonRecord = Record<string, unknown>;

function quote(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export function sql(statement: string): string {
  return execFileSync(
    "docker",
    [
      "exec",
      container,
      "psql",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-X",
      "-q",
      "-At",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      statement,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).trim();
}

export function jsonSql<T = JsonRecord>(statement: string): T {
  const output = sql(statement);
  return JSON.parse(output) as T;
}

export function resetArcadeData(): void {
  sql(`
    truncate table
      ${ARCADE_SCHEMA}.leaderboard_projection,
      ${ARCADE_SCHEMA}.game_results,
      ${ARCADE_SCHEMA}.player_answers,
      ${ARCADE_SCHEMA}.session_items,
      ${ARCADE_SCHEMA}.game_sessions
    restart identity cascade;
  `);
}

export function seededCatalog(): JsonRecord[] {
  return jsonSql<JsonRecord[]>(
    `select coalesce(json_agg(to_jsonb(c) order by c.game_code), '[]'::json)::text from ${ARCADE_SCHEMA}.game_catalog c;`,
  );
}

export function arcadeTableNames(): string[] {
  return jsonSql<string[]>(
    `select coalesce(json_agg(t.table_name order by t.table_name), '[]'::json)::text from information_schema.tables t where t.table_schema = ${quote(ARCADE_SCHEMA)};`,
  );
}

export function publicSchemaRelations(): string[] {
  return jsonSql<string[]>(
    "select coalesce(json_agg(c.relname order by c.relname), '[]'::json)::text from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind in ('r', 'v', 'm', 'f') and c.relname like 'game_%';",
  );
}

export function newTokenHash(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Transitional helpers for the pre-arcade integration suite.
 * New tests should use resetArcadeData, seededCatalog and sql directly.
 */
export function resetGameData(): void {
  resetArcadeData();
}

/** @deprecated The arcade migration intentionally has no public RPC yet. */
export function rpc(
  name: string,
  tokenHash: string,
  extraArgs = "",
): JsonRecord {
  const args = `decode(${quote(tokenHash)}, 'hex')${extraArgs}`;
  return jsonSql<JsonRecord>(`select api.${name}(${args})::text;`);
}

/** @deprecated Retained only while the legacy single_choice tests are retired. */
export function startGame(
  tokenHash = newTokenHash(),
  roundSize = 5,
  alias = "Integration Player",
): { tokenHash: string; data: JsonRecord } {
  const data = jsonSql<JsonRecord>(
    `select api.start_game(${quote(alias)}, decode(${quote(tokenHash)}, 'hex'), ${roundSize})::text;`,
  );
  return { tokenHash, data };
}

/** @deprecated Retained only while the legacy single_choice tests are retired. */
export function state(tokenHash: string): JsonRecord {
  return rpc("get_game_state", tokenHash);
}

/** @deprecated Retained only while the legacy single_choice tests are retired. */
export function stateData(tokenHash: string): JsonRecord {
  const result = state(tokenHash);
  if (result.ok !== true) {
    throw new Error(`expected recoverable state, received ${JSON.stringify(result)}`);
  }
  return result.data as JsonRecord;
}

/** @deprecated Retained only while the legacy single_choice tests are retired. */
export function submit(
  tokenHash: string,
  questionRef: string,
  optionRef: string,
): JsonRecord {
  return jsonSql<JsonRecord>(
    `select api.submit_answer(decode(${quote(tokenHash)}, 'hex'), ${quote(questionRef)}, ${quote(optionRef)})::text;`,
  );
}

/** @deprecated Retained only while the legacy single_choice tests are retired. */
export function advance(tokenHash: string): JsonRecord {
  return rpc("advance_game", tokenHash);
}

/** @deprecated Retained only while the legacy single_choice tests are retired. */
export function finish(tokenHash: string): JsonRecord {
  return rpc("finish_game", tokenHash);
}

/** @deprecated Retained only while the legacy single_choice tests are retired. */
export function completeRound(tokenHash: string): JsonRecord {
  for (let position = 1; position <= 5; position += 1) {
    const current = stateData(tokenHash);
    const question = current.question as {
      ref: string;
      options: Array<{ ref: string }>;
    };
    submit(tokenHash, question.ref, question.options[0].ref);
    if (position < 5) advance(tokenHash);
  }
  return finish(tokenHash);
}

/** @deprecated Retained only while the legacy single_choice tests are retired. */
export function sessionRow(
  tokenHash: string,
): Record<string, string | null> {
  const output = sql(
    `select row_to_json(s)::text from private.game_sessions s where s.session_token_hash = decode(${quote(tokenHash)}, 'hex');`,
  );
  return JSON.parse(output) as Record<string, string | null>;
}
