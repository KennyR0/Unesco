# Contrato de persistencia del arcade

**Estado**: modelo físico `private_arcade` versionado; runtime cableable vía
`ARCADE_GATEWAY=supabase` (local). Push remoto sigue gated.

## Frontera de confianza

El navegador nunca accede directamente a datos privados. El servidor valida
cookies o credenciales opacas, crea el cliente server-only y expone solo
proyecciones contractuales.

La autoridad de evaluación, expiración, idempotencia, resultado, puntuación y
elegibilidad del ranking vive en el servidor (TypeScript domain + gateway).

## Objetos físicos (`private_arcade`)

| Objeto | Finalidad | Exposición |
|---|---|---|
| game_catalog | seis gameCode, mecánica, versión y disponibilidad | solo service_role |
| game_items | prompt, public_payload, editorial_item_id, versión | solo service_role |
| item_media / item_feedback / item_solution_private | media, feedback, solución | solo service_role |
| game_sessions | alias, estado, `session_token_hash`, `runtime_snapshot` | solo service_role |
| session_items / player_answers | asignación e idempotencia normalizada | solo service_role |
| game_results / leaderboard_projection | resultado y ranking (máx. 10) | solo service_role |

Migraciones versionadas:

1. `supabase/migrations/20260801051613_arcade_schema.sql`
2. `supabase/migrations/20260803164000_arcade_session_token_runtime.sql`

Seed: `supabase/seed.sql` (catálogo) + `supabase/seed-content.sql`
(regenerado con `pnpm seed:content` desde JSON editorial).

## Contrato operativo

- Puerto: `ArcadeGameGateway`.
- Cookie HTTP-only → SHA-256 → `game_sessions.session_token_hash`.
- Evaluación: mechanics + content repository JSON; DB dura el snapshot/resultado.
- Cliente: `createServerSupabaseClient()` usa schema `private_arcade`.
- Selector: `ARCADE_GATEWAY=memory|supabase` (default `memory`).

## Invariantes

- gameCode solo puede pertenecer al catálogo aprobado;
- una sesión pertenece a un solo juego;
- un item tiene como máximo una respuesta aceptada por sesión;
- finished y expired son terminales para nuevas respuestas;
- la puntuación no se acepta desde el cliente;
- el ranking solo incluye resultados finished elegibles (tope 10);
- retención: 24 h sesiones cerradas, 30 días resultados/ranking.

## Ranking global secundario

Proyección `leaderboard_projection` sin `session_id` ni respuestas. Lectura
server-only; fallo independiente no bloquea jugar ni ver resultado propio.

## Checklist Vercel (operativa, sin secretos en repo)

Variables server-only en el proyecto Vercel:

- `SUPABASE_URL`
- exactamente una de `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `GAME_ROUND_SIZE` (opcional; default 5)
- `ARCADE_GATEWAY` (`memory` hasta validar Supabase en preview)

No definir `NEXT_PUBLIC_SUPABASE_*` con claves privadas. Conectar el proyecto
Vercel y rotar claves queda fuera del código.
