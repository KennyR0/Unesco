import { describe, expect, it } from 'vitest';

import { sql } from '../../fixtures/supabase-local';

describe('migraciones Supabase locales', () => {
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
  });
});
