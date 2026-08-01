import { describe, expect, it } from 'vitest';

import { sql } from '../../fixtures/supabase-local';

describe('seguridad de acceso Supabase', () => {
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
  });
});
