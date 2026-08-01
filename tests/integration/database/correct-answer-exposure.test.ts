import { describe, expect, it } from 'vitest';

import { sql } from '../../fixtures/supabase-local';

describe('exposicion de soluciones', () => {
  it('separa la solucion privada y bloquea claves sensibles del payload publico', () => {
    expect(sql(`select has_table_privilege('anon', 'private_arcade.item_solution_private', 'SELECT');`)).toBe('f');
    expect(sql(`select has_table_privilege('authenticated', 'private_arcade.item_solution_private', 'SELECT');`)).toBe('f');
    expect(sql(`select has_table_privilege('service_role', 'private_arcade.item_solution_private', 'SELECT');`)).toBe('t');
    expect(
      Number(
        sql(`select count(*) from pg_constraint where conname = 'game_items_public_payload_safe_check' and pg_get_constraintdef(oid) like '%solution%';`),
      ),
    ).toBe(1);
    expect(
      Number(
        sql(`select count(*) from information_schema.columns where table_schema = 'public' and column_name in ('solution', 'solution_private', 'solution_payload', 'evaluation_rule');`),
      ),
    ).toBe(0);
  });
});
