-- Antídoto Arcade MIL: esquema físico privado.
-- T017 prepara la persistencia sin publicar, aplicar ni poblar datos.

begin;

create schema if not exists private_arcade;

comment on schema private_arcade is
  'Persistencia privada del arcade; no se expone mediante el Data API.';

create table private_arcade.game_catalog (
  game_code text primary key,
  mechanic text not null,
  name text not null,
  objective text not null,
  route text not null,
  content_version text not null,
  available boolean not null default false,
  created_at timestamptz not null default now(),
  constraint game_catalog_code_check check (
    game_code in (
      'real-o-ia',
      'grupo',
      'clickbait-swipe',
      'radar-de-fuentes',
      'feed-60',
      'mente-maestra'
    )
  ),
  constraint game_catalog_mechanic_check check (
    (game_code, mechanic) in (
      ('real-o-ia', 'image_verdict'),
      ('grupo', 'group_decision'),
      ('clickbait-swipe', 'headline_classification'),
      ('radar-de-fuentes', 'source_classification'),
      ('feed-60', 'timed_feed'),
      ('mente-maestra', 'guided_autopsy')
    )
  ),
  constraint game_catalog_route_check check (route = '/games/' || game_code)
);

create table private_arcade.game_items (
  item_id uuid primary key default gen_random_uuid(),
  game_code text not null,
  mechanic text not null,
  sequence integer not null,
  prompt text not null,
  public_payload jsonb not null,
  content_version text not null,
  editorial_status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_items_catalog_fk
    foreign key (game_code) references private_arcade.game_catalog (game_code),
  constraint game_items_identity_unique unique (item_id, game_code),
  constraint game_items_order_unique unique (game_code, content_version, sequence),
  constraint game_items_sequence_check check (sequence > 0),
  constraint game_items_mechanic_check check (
    (game_code, mechanic) in (
      ('real-o-ia', 'image_verdict'),
      ('grupo', 'group_decision'),
      ('clickbait-swipe', 'headline_classification'),
      ('radar-de-fuentes', 'source_classification'),
      ('feed-60', 'timed_feed'),
      ('mente-maestra', 'guided_autopsy')
    )
  ),
  constraint game_items_editorial_status_check check (
    editorial_status in ('draft', 'approved', 'archived')
  ),
  constraint game_items_public_payload_object_check check (
    jsonb_typeof(public_payload) = 'object'
  ),
  constraint game_items_public_payload_safe_check check (
    not (
      public_payload ?| array[
        'solution',
        'solutionPrivate',
        'evaluation',
        'score',
        'points',
        'bonusPoints',
        'penaltyPoints',
        'rankingScore'
      ]
    )
  )
);

create table private_arcade.item_media (
  item_id uuid primary key,
  kind text not null,
  src text,
  alt text,
  decorative boolean not null default false,
  width integer,
  height integer,
  fallback_text text,
  constraint item_media_item_fk
    foreign key (item_id) references private_arcade.game_items (item_id)
    on delete cascade,
  constraint item_media_kind_check check (
    kind in ('image', 'illustration', 'audio', 'none')
  ),
  constraint item_media_dimensions_check check (
    (width is null or width > 0) and (height is null or height > 0)
  ),
  constraint item_media_accessibility_check check (
    decorative or alt is not null or fallback_text is not null
  ),
  constraint item_media_fallback_check check (
    kind = 'none' or src is not null or fallback_text is not null
  )
);

create table private_arcade.item_feedback (
  item_id uuid primary key,
  status text not null,
  explanation text not null,
  signals jsonb not null,
  recommendation text not null,
  revealed_answer text,
  constraint item_feedback_item_fk
    foreign key (item_id) references private_arcade.game_items (item_id)
    on delete cascade,
  constraint item_feedback_status_check check (
    status in ('correct', 'incorrect', 'instructive', 'expired')
  ),
  constraint item_feedback_signals_check check (
    jsonb_typeof(signals) = 'array'
  )
);

create table private_arcade.item_solution_private (
  item_id uuid primary key,
  solution_payload jsonb not null,
  evaluation_rule jsonb not null,
  constraint item_solution_item_fk
    foreign key (item_id) references private_arcade.game_items (item_id)
    on delete cascade,
  constraint item_solution_payload_object_check check (
    jsonb_typeof(solution_payload) = 'object'
  ),
  constraint item_solution_rule_object_check check (
    jsonb_typeof(evaluation_rule) = 'object'
  )
);

create table private_arcade.game_sessions (
  session_id uuid primary key default gen_random_uuid(),
  game_code text not null,
  alias text not null,
  alias_normalized text not null,
  status text not null default 'intro',
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  last_activity_at timestamptz not null default now(),
  closed_at timestamptz,
  purge_after timestamptz,
  result_access_until timestamptz,
  constraint game_sessions_catalog_fk
    foreign key (game_code) references private_arcade.game_catalog (game_code),
  constraint game_sessions_identity_unique unique (session_id, game_code),
  constraint game_sessions_status_check check (
    status in ('intro', 'active', 'processing', 'feedback', 'expired', 'finished', 'invalid')
  ),
  constraint game_sessions_alias_check check (
    char_length(alias) between 1 and 40
    and char_length(alias_normalized) between 1 and 40
  ),
  constraint game_sessions_expiry_check check (
    expires_at is null or expires_at >= started_at
  ),
  constraint game_sessions_closed_state_check check (
    (status in ('finished', 'expired') and closed_at is not null)
    or (status not in ('finished', 'expired') and closed_at is null)
  )
);

create table private_arcade.session_items (
  session_item_id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  game_code text not null,
  item_id uuid not null,
  position integer not null,
  status text not null default 'pending',
  assigned_at timestamptz not null default now(),
  answered_at timestamptz,
  constraint session_items_session_fk
    foreign key (session_id, game_code)
    references private_arcade.game_sessions (session_id, game_code)
    on delete cascade,
  constraint session_items_item_fk
    foreign key (item_id, game_code)
    references private_arcade.game_items (item_id, game_code),
  constraint session_items_position_unique unique (session_id, position),
  constraint session_items_item_unique unique (session_id, item_id),
  constraint session_items_position_check check (position >= 0),
  constraint session_items_status_check check (
    status in ('pending', 'processing', 'answered', 'expired')
  ),
  constraint session_items_answered_at_check check (
    (status = 'answered' and answered_at is not null)
    or (status <> 'answered' and answered_at is null)
  )
);

create table private_arcade.player_answers (
  answer_id uuid primary key default gen_random_uuid(),
  session_item_id uuid not null,
  input_payload jsonb not null,
  accepted_at timestamptz not null default now(),
  evaluation jsonb not null,
  feedback_snapshot jsonb not null,
  idempotency_key text not null,
  constraint player_answers_session_item_fk
    foreign key (session_item_id) references private_arcade.session_items (session_item_id)
    on delete cascade,
  constraint player_answers_one_acceptance_unique unique (session_item_id),
  constraint player_answers_idempotency_unique unique (session_item_id, idempotency_key),
  constraint player_answers_input_object_check check (
    jsonb_typeof(input_payload) = 'object'
  ),
  constraint player_answers_input_authority_check check (
    not (
      input_payload ?| array[
        'score',
        'points',
        'maxPoints',
        'bonusPoints',
        'penaltyPoints',
        'rankingScore',
        'correct',
        'errors',
        'solution',
        'nextItem',
        'completed',
        'status',
        'remainingSeconds',
        'leaderboardEligible'
      ]
    )
  ),
  constraint player_answers_evaluation_object_check check (
    jsonb_typeof(evaluation) = 'object'
  ),
  constraint player_answers_feedback_object_check check (
    jsonb_typeof(feedback_snapshot) = 'object'
  )
);

create table private_arcade.game_results (
  result_id uuid primary key default gen_random_uuid(),
  session_id uuid unique,
  game_code text not null,
  alias text not null,
  alias_normalized text not null,
  status text not null,
  answered integer not null,
  total integer not null,
  points integer not null,
  max_points integer not null,
  correct integer,
  errors integer not null default 0,
  bonus_points integer not null default 0,
  penalty_points integer not null default 0,
  time_limit_seconds integer,
  time_used_seconds integer,
  learning_summary text not null,
  simulated_reach integer,
  ranking_score smallint,
  leaderboard_eligible boolean not null default false,
  alias_allowed boolean not null default false,
  abuse_flagged boolean not null default false,
  invalidated boolean not null default false,
  completed_at timestamptz not null default now(),
  purge_after timestamptz,
  constraint game_results_session_fk
    foreign key (session_id) references private_arcade.game_sessions (session_id)
    on delete set null,
  constraint game_results_catalog_fk
    foreign key (game_code) references private_arcade.game_catalog (game_code),
  constraint game_results_status_check check (status in ('finished', 'expired')),
  constraint game_results_progress_check check (
    answered between 0 and total and total >= 0
  ),
  constraint game_results_score_bounds_check check (
    max_points >= 0 and points between 0 and max_points
  ),
  constraint game_results_counters_check check (
    (correct is null or correct >= 0)
    and errors >= 0
    and bonus_points >= 0
    and penalty_points >= 0
  ),
  constraint game_results_time_check check (
    (time_limit_seconds is null or time_limit_seconds > 0)
    and (time_used_seconds is null or time_used_seconds >= 0)
  ),
  constraint game_results_alias_check check (
    char_length(alias) between 1 and 40
    and char_length(alias_normalized) between 1 and 40
  ),
  constraint game_results_reach_check check (
    (game_code = 'mente-maestra' and simulated_reach between 65 and 95)
    or (game_code <> 'mente-maestra' and simulated_reach is null)
  ),
  constraint game_results_ranking_check check (
    (ranking_score is null or ranking_score between 0 and 100)
    and (
      (not leaderboard_eligible and ranking_score is null)
      or (
        leaderboard_eligible
        and ranking_score is not null
        and status = 'finished'
        and answered = total
        and total > 0
        and max_points > 0
        and alias_allowed
        and not abuse_flagged
        and not invalidated
      )
    )
  )
);

create table private_arcade.leaderboard_projection (
  projection_id uuid primary key default gen_random_uuid(),
  result_id uuid not null unique,
  game_code text not null,
  alias text not null,
  points integer not null,
  max_points integer not null,
  ranking_score smallint not null,
  completed_at timestamptz not null,
  purge_after timestamptz,
  constraint leaderboard_projection_result_fk
    foreign key (result_id) references private_arcade.game_results (result_id)
    on delete cascade,
  constraint leaderboard_projection_catalog_fk
    foreign key (game_code) references private_arcade.game_catalog (game_code),
  constraint leaderboard_projection_alias_check check (
    char_length(alias) between 1 and 40
  ),
  constraint leaderboard_projection_score_check check (
    max_points > 0
    and points between 0 and max_points
    and ranking_score between 0 and 100
  )
);

create function private_arcade.set_game_session_retention()
returns trigger
language plpgsql
set search_path = pg_catalog, private_arcade
as $$
begin
  new.purge_after := case
    when new.closed_at is null then null::timestamptz
    else new.closed_at + interval '24 hours'
  end;
  new.result_access_until := case
    when new.closed_at is null then null::timestamptz
    else new.closed_at + interval '30 days'
  end;
  return new;
end;
$$;

create trigger game_sessions_retention_trigger
before insert or update of closed_at on private_arcade.game_sessions
for each row
execute function private_arcade.set_game_session_retention();

create function private_arcade.set_game_results_retention()
returns trigger
language plpgsql
set search_path = pg_catalog, private_arcade
as $$
begin
  new.purge_after := new.completed_at + interval '30 days';
  return new;
end;
$$;

create trigger game_results_retention_trigger
before insert or update of completed_at on private_arcade.game_results
for each row
execute function private_arcade.set_game_results_retention();

create function private_arcade.set_leaderboard_retention()
returns trigger
language plpgsql
set search_path = pg_catalog, private_arcade
as $$
begin
  new.purge_after := new.completed_at + interval '30 days';
  return new;
end;
$$;

create trigger leaderboard_projection_retention_trigger
before insert or update of completed_at on private_arcade.leaderboard_projection
for each row
execute function private_arcade.set_leaderboard_retention();

create index game_items_available_lookup_idx
  on private_arcade.game_items (game_code, editorial_status, content_version, sequence);

create index game_sessions_active_lookup_idx
  on private_arcade.game_sessions (session_id, game_code, status)
  where status not in ('finished', 'expired', 'invalid');

create index game_sessions_purge_idx
  on private_arcade.game_sessions (purge_after)
  where purge_after is not null;

create index session_items_session_position_idx
  on private_arcade.session_items (session_id, position);

create index player_answers_session_item_idx
  on private_arcade.player_answers (session_item_id, accepted_at);

create index game_results_purge_idx
  on private_arcade.game_results (purge_after);

create index game_results_leaderboard_order_idx
  on private_arcade.game_results (
    ranking_score desc,
    completed_at asc,
    result_id asc
  )
  where leaderboard_eligible;

create index leaderboard_projection_purge_idx
  on private_arcade.leaderboard_projection (purge_after);

create index leaderboard_projection_order_idx
  on private_arcade.leaderboard_projection (
    ranking_score desc,
    completed_at asc,
    result_id asc
  );

-- Todas las tablas son privadas y conservan RLS como defensa en profundidad.
alter table private_arcade.game_catalog enable row level security;
alter table private_arcade.game_items enable row level security;
alter table private_arcade.item_media enable row level security;
alter table private_arcade.item_feedback enable row level security;
alter table private_arcade.item_solution_private enable row level security;
alter table private_arcade.game_sessions enable row level security;
alter table private_arcade.session_items enable row level security;
alter table private_arcade.player_answers enable row level security;
alter table private_arcade.game_results enable row level security;
alter table private_arcade.leaderboard_projection enable row level security;

revoke all on schema private_arcade from public;
revoke all on schema private_arcade from anon, authenticated;
grant usage on schema private_arcade to service_role;

revoke all on all tables in schema private_arcade from public;
revoke all on all tables in schema private_arcade from anon, authenticated;
grant select, insert, update, delete on all tables in schema private_arcade to service_role;

alter default privileges in schema private_arcade
  revoke all on tables from public, anon, authenticated;
alter default privileges in schema private_arcade
  grant select, insert, update, delete on tables to service_role;

comment on table private_arcade.game_sessions is
  'Sesiones anónimas; purge_after elimina a las 24 h del cierre.';
comment on table private_arcade.player_answers is
  'Una aceptación idempotente por item; no contiene autoridad del cliente.';
comment on table private_arcade.game_results is
  'Resultado educativo retenido 30 días desde completed_at.';
comment on table private_arcade.leaderboard_projection is
  'Proyección privada sin session_id ni respuestas; retenida 30 días.';

commit;
