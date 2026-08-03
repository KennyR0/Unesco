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

describe('reconciliación física de migraciones Supabase', () => {
  it('mantiene el esquema privado, la elegibilidad y la división sin vistas públicas', async () => {
    const migration = await readFile(MIGRATION_PATH, 'utf8');

    expect(migration).toContain('create schema if not exists private_arcade;');
    expect(
      [...migration.matchAll(/create table private_arcade\.([a-z_]+)\s*\(/g)].map(
        ([, table]) => table,
      ),
    ).toEqual([...ARCADE_TABLES]);
    expect(migration).toContain(
      'revoke all on schema private_arcade from anon, authenticated;',
    );
    expect(migration).toContain(
      'grant usage on schema private_arcade to service_role;',
    );
    expect(migration).not.toMatch(/security\s+definer/i);
    expect(migration).not.toMatch(/create\s+(or\s+replace\s+)?view\s/i);
    expect(migration).toContain('leaderboard_eligible boolean not null default false');
    expect(migration).toMatch(
      /leaderboard_eligible\s+and\s+ranking_score\s+is\s+not\s+null/,
    );
    expect(migration).toContain("status = 'finished'");
    expect(migration).toContain('answered = total');
    expect(migration).toContain('max_points > 0');
  });
});

describe.skipIf(!SUPABASE_PHYSICAL_GATE_OPEN)('migraciones Supabase locales autorizadas', () => {
  it('crea las tablas arcade, habilita RLS y conserva el seed del catalogo', () => {
    expect(
      Number(
        sql(`select count(*) from information_schema.tables where table_schema = 'private_arcade' and table_name = any(array['game_catalog', 'game_items', 'item_media', 'item_feedback', 'item_solution_private', 'game_sessions', 'session_items', 'player_answers', 'game_results', 'leaderboard_projection']);`),
      ),
    ).toBe(10);
    expect(
      Number(
        sql(`select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'private_arcade' and c.relkind = 'r' and c.relrowsecurity;`),
      ),
    ).toBe(10);
    expect(Number(sql('select count(*) from private_arcade.game_catalog;'))).toBe(6);
    expect(Number(sql('select count(*) from private_arcade.game_catalog where available;'))).toBe(6);
    expect(
      Number(
        sql(`select count(*) from pg_trigger where not tgisinternal and tgname in ('game_sessions_retention_trigger', 'game_results_retention_trigger', 'leaderboard_projection_retention_trigger');`),
      ),
    ).toBe(3);
    expect(
      sql(`select pg_get_constraintdef(oid) from pg_constraint where conname = 'game_results_ranking_check';`),
    ).toMatch(/leaderboard_eligible.*ranking_score/i);
  });
});
