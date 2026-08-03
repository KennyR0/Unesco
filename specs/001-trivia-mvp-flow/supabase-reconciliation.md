# Puerta de reconciliación de Supabase

**Estado**: autorización renovada (3 ago 2026) para persistencia **local**
arcade: reset/seed local, adapter `ArcadeGameGateway`, selector
`ARCADE_GATEWAY`, y suite `RUN_SUPABASE_TESTS`.
**Alcance**: trabajo local. **Sin `db push` / publicación remota** en este corte.

## Autorización renovada (2026-08-03)

Queda autorizado explícitamente:

1. Aplicar migraciones y `supabase db reset` / seed en el stack local.
2. Ejecutar `RUN_SUPABASE_TESTS=true` contra PostgreSQL local.
3. Implementar y cablear `SupabaseArcadeGateway` que cumple
   `ArcadeGameGateway` (start / state / submit / advance / result /
   leaderboard).
4. Persistir `session_token_hash` (cookie → hash → lookup) y
   `runtime_snapshot` / companion de sesión en `private_arcade`.
5. Materializar el catálogo editorial JSON como proyección versionada en DB;
   la fuente editorial normativa sigue en `src/features/game/content/`.
6. Selector runtime `ARCADE_GATEWAY=memory|supabase` (default `memory`).

Queda **fuera** de esta autorización:

- `supabase db push` / link / publicación a proyecto remoto.
- Exponer `private_arcade` a `anon` / `authenticated` o al cliente browser.
- Cambiar el default de producción a Supabase sin suite local en verde.

## Contrato operativo congelado

| Superficie | Decisión |
|---|---|
| Puerto | `ArcadeGameGateway` en `src/features/game/infrastructure/game-gateway.ts` |
| Auth de sesión | Cookie HTTP-only opaca → SHA-256 → `game_sessions.session_token_hash` |
| Evaluación | TypeScript domain/mechanics + content repository JSON |
| Durabilidad | Filas `private_arcade` + `runtime_snapshot` jsonb |
| Acceso DB | `service_role` server-only; RLS defensa en profundidad |
| Contenido | JSON editorial → seed/proyección DB con `content_version` |
| Legacy `api.*` RPCs | Fuera del path arcade; no reactivar como backend de juego |

## Observación del checkout (histórico)

Verificado el 31 de julio de 2026 (auditoría previa a T017 arcade):

| Evidencia | Resultado |
|---|---|
| Archivos locales supabase/migrations/*.sql | 22 archivos single_choice no versionados |
| Migración arcade versionada | `20260801051613_arcade_schema.sql` (+ follow-up token/runtime) |
| Historial remoto Supabase | No se opera en remoto durante esta línea |

## Qué se conserva

- Sesiones anónimas, RLS, grants `service_role`, retención 24 h / 30 días.
- Separación contenido público / soluciones privadas / autoridad servidor.
- Ranking global secundario (máx. 10), fuera del landing.
- Default runtime `memory` hasta verificación local completa.

## Decisión de preparación local (1 ago 2026)

- Esquema privado `private_arcade`; sin Data API pública de soluciones.
- T017 generó `supabase/migrations/20260801051613_arcade_schema.sql`.

## Seguimiento

Tras esta autorización: migración follow-up (token hash + snapshot), seed de
contenido, `SupabaseArcadeGateway`, cableado `resolveGateway`, CI base y E2E
Feed/Mente. Push remoto sigue gated a una autorización futura distinta.
