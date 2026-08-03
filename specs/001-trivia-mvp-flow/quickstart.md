# Quickstart de Antídoto Arcade

**Estado**: arcade jugable (seis misiones), CI en GitHub Actions, persistencia
Supabase **local** opcional vía `ARCADE_GATEWAY`. Sin `db push` remoto.

## 1. Verificar Spec Kit y el alcance

Desde la raíz del checkout:

    powershell.exe -NoProfile -ExecutionPolicy Bypass -File .specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks

La salida debe resolver `FEATURE_DIR` en `specs/001-trivia-mvp-flow`.

## 2. Instalar y ejecutar (memory, default)

Requiere Node.js 24.x y pnpm 11.8.0:

    corepack pnpm install --frozen-lockfile
    corepack pnpm dev

Abrir `http://localhost:3000`. El prototipo en `prototipo/` es referencia
visual; no forma parte del build.

Copia `.env.example` a `.env.local` si vas a usar Supabase. Con
`ARCADE_GATEWAY` vacío o `memory` no hace falta una DB para jugar.

## 3. Persistencia Supabase local (opcional)

Autorización: `supabase-reconciliation.md` (2026-08-03). Solo local.

1. Tener Docker + Supabase CLI.
2. Completar `.env.local` con `SUPABASE_URL` y una clave service_role/secret
   del stack local (`supabase status`).
3. Aplicar schema y seed:

       supabase db reset --yes
       # regenerar seed de packs si cambió el JSON editorial:
       pnpm seed:content

4. Arrancar Next con gateway durable:

       # en .env.local
       ARCADE_GATEWAY=supabase

5. Suite física (opcional):

       # PowerShell
       $env:RUN_SUPABASE_TESTS="true"; corepack pnpm test:integration

## 4. Variables (Vercel / local)

| Variable | Notas |
|---|---|
| `SUPABASE_URL` | Server-only |
| `SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY` | Exactamente una |
| `ARCADE_GATEWAY` | `memory` (default) o `supabase` |
| `GAME_ROUND_SIZE` | Opcional; default 5 |

Prohibido: `NEXT_PUBLIC_SUPABASE_SECRET_KEY` / `SERVICE_ROLE*`.

## 5. Verificación automática

    corepack pnpm typecheck
    corepack pnpm lint
    corepack pnpm test
    corepack pnpm test:components
    corepack pnpm test:e2e
    corepack pnpm build

CI: `.github/workflows/ci.yml` (quality + E2E). Job Supabase solo por
`workflow_dispatch`.

## 6. Contratos

- `spec.md`, `contracts/*`, `data-model.md`, `supabase-reconciliation.md`
- Ranking secundario; no CTA del landing.
