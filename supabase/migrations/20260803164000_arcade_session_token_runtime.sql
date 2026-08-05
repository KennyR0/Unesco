-- Antídoto Arcade MIL: token hash + runtime durable para ArcadeGameGateway.
-- Autorización local 2026-08-03 (supabase-reconciliation.md). Sin push remoto.

begin;

alter table private_arcade.game_sessions
  add column if not exists session_token_hash bytea,
  add column if not exists runtime_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists position integer not null default 0,
  add column if not exists total integer not null default 0,
  add column if not exists mechanic text;

alter table private_arcade.game_items
  add column if not exists editorial_item_id text;

comment on column private_arcade.game_sessions.session_token_hash is
  'SHA-256 del token opaco de cookie; único lookup server-only.';
comment on column private_arcade.game_sessions.runtime_snapshot is
  'Snapshot durable de la sesión (answers, feed60, state proyectado).';
comment on column private_arcade.game_items.editorial_item_id is
  'Identificador editorial del pack JSON (p. ej. real-o-ia-001).';

create unique index if not exists game_sessions_token_hash_uidx
  on private_arcade.game_sessions (session_token_hash)
  where session_token_hash is not null;

create unique index if not exists game_items_editorial_id_uidx
  on private_arcade.game_items (game_code, editorial_item_id)
  where editorial_item_id is not null;

-- PostgREST/service_role: el schema privado se lista en config.toml para
-- acceso server-only; anon/authenticated siguen sin grants de tabla.

commit;
