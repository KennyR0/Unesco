import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { sql } from '../../fixtures/supabase-local';

const MIGRATION_PATH = 'supabase/migrations/20260801051613_arcade_schema.sql';
const ARCADE_TABLES = [
  'game_catalog',
  'game_items',
  'item_media',
  'item_feedback',
  'item_solution_private',
  'game_sessions',
  'session_items',
  'player_answers',
  'game_results',
  'leaderboard_projection',
] as const;
const SUPABASE_PHYSICAL_GATE_OPEN = process.env.RUN_SUPABASE_TESTS === 'true';

describe('seguridad declarada de la migración Supabase', () => {
  it('habilita RLS y conserva mínimos privilegios en todas las tablas privadas', async () => {
    const migration = await readFile(MIGRATION_PATH, 'utf8');
    const config = await readFile('supabase/config.toml', 'utf8');

    for (const table of ARCADE_TABLES) {
      expect(migration).toContain(
        `alter table private_arcade.${table} enable row level security;`,
      );
    }
    expect(migration).toContain(
      'revoke all on all tables in schema private_arcade from anon, authenticated;',
    );
    expect(migration).toContain(
      'grant select, insert, update, delete on all tables in schema private_arcade to service_role;',
    );
    expect(migration).not.toMatch(/security\s+definer/i);
    expect(migration).not.toMatch(/create\s+(or\s+replace\s+)?view\s/i);
    expect(config).toContain('schemas = ["public"]');
    expect(config).not.toContain('private_arcade');
  });
});

describe.skipIf(!SUPABASE_PHYSICAL_GATE_OPEN)('seguridad de acceso Supabase autorizada', () => {
  it('mantiene el esquema privado fuera de anon y authenticated', () => {
    expect(sql(`select has_schema_privilege('anon', 'private_arcade', 'USAGE');`)).toBe('f');
    expect(sql(`select has_schema_privilege('authenticated', 'private_arcade', 'USAGE');`)).toBe('f');
    expect(sql(`select has_schema_privilege('service_role', 'private_arcade', 'USAGE');`)).toBe('t');
    expect(sql(`select has_table_privilege('anon', 'private_arcade.game_catalog', 'SELECT');`)).toBe('f');
    expect(sql(`select has_table_privilege('authenticated', 'private_arcade.game_catalog', 'SELECT');`)).toBe('f');
    expect(sql(`select has_table_privilege('service_role', 'private_arcade.game_catalog', 'SELECT');`)).toBe('t');
    expect(
      Number(
        sql(`select count(*) from pg_policies where schemaname = 'private_arcade' and (roles::text like '%anon%' or roles::text like '%authenticated%');`),
      ),
    ).toBe(0);
    expect(
      Number(
        sql(`select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind in ('r', 'v', 'm', 'f') and c.relname like 'game_%';`),
      ),
    ).toBe(0);
    expect(
      Number(
        sql(`select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'private_arcade' and p.prosecdef;`),
      ),
    ).toBe(0);
  });
});
