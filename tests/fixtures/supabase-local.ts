import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";

const container = process.env.SUPABASE_DB_CONTAINER ?? "supabase_db_antidoto-trivia-mvp";

function quote(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export function sql(statement: string): string {
  return execFileSync(
    "docker",
    ["exec", container, "psql", "-U", "postgres", "-d", "postgres", "-X", "-q", "-At", "-v", "ON_ERROR_STOP=1", "-c", statement],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ).trim();
}

export function jsonSql(statement: string): Record<string, unknown> {
  const output = sql(statement);
  return JSON.parse(output) as Record<string, unknown>;
}

export function newTokenHash(): string {
  return randomBytes(32).toString("hex");
}

export function resetGameData(): void {
  sql("delete from private.game_sessions;");
}

export function rpc(name: string, tokenHash: string, extraArgs = ""): Record<string, unknown> {
  const args = `decode(${quote(tokenHash)}, 'hex')${extraArgs}`;
  return jsonSql(`select api.${name}(${args})::text;`);
}

export function startGame(tokenHash = newTokenHash(), roundSize = 5, alias = "Integration Player"): { tokenHash: string; data: Record<string, unknown> } {
  const data = jsonSql(`select api.start_game(${quote(alias)}, decode(${quote(tokenHash)}, 'hex'), ${roundSize})::text;`);
  return { tokenHash, data };
}

export function state(tokenHash: string): Record<string, unknown> {
  return rpc("get_game_state", tokenHash);
}

export function stateData(tokenHash: string): Record<string, unknown> {
  const result = state(tokenHash);
  if (result.ok !== true) throw new Error(`expected recoverable state, received ${JSON.stringify(result)}`);
  return result.data as Record<string, unknown>;
}

export function submit(tokenHash: string, questionRef: string, optionRef: string): Record<string, unknown> {
  return jsonSql(`select api.submit_answer(decode(${quote(tokenHash)}, 'hex'), ${quote(questionRef)}, ${quote(optionRef)})::text;`);
}

export function advance(tokenHash: string): Record<string, unknown> {
  return rpc("advance_game", tokenHash);
}

export function finish(tokenHash: string): Record<string, unknown> {
  return rpc("finish_game", tokenHash);
}

export function completeRound(tokenHash: string): Record<string, unknown> {
  for (let position = 1; position <= 5; position += 1) {
    const current = stateData(tokenHash);
    const question = current.question as { ref: string; options: Array<{ ref: string }> };
    submit(tokenHash, question.ref, question.options[0].ref);
    if (position < 5) advance(tokenHash);
  }
  return finish(tokenHash);
}

export function sessionRow(tokenHash: string): Record<string, string | null> {
  const output = sql(`select row_to_json(s)::text from private.game_sessions s where s.session_token_hash = decode(${quote(tokenHash)}, 'hex');`);
  return JSON.parse(output) as Record<string, string | null>;
}
