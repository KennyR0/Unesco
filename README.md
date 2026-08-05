# ANTÍDOTO — Arcade educativo MIL

Antídoto es un arcade de alfabetización mediática: seis misiones breves para
practicar cómo detectar imágenes, mensajes, titulares y fuentes engañosas. La
interfaz usa una identidad ciber-brutalista con implementación responsive y
accesible en Next.js. La fuente normativa del sistema visual está en
`specs/001-trivia-mvp-flow/contracts/visual-system.md`.

## Estado actual

Seis misiones jugables (¿Real o IA?, El Grupo, Clickbait Swipe, Radar de Fuentes,
Feed 60, Mente Maestra) con shell compartido, feedback educativo y E2E.

Persistencia: gateway en memoria por defecto (`ARCADE_GATEWAY=memory`). Supabase
opcional (`ARCADE_GATEWAY=supabase`) con schema `private_arcade`, seed de
contenido y `SupabaseArcadeGateway`.

CI: `.github/workflows/ci.yml`. Deploy: Vercel (Next.js).

## Desarrollo

Requiere Node.js 24.x y pnpm 11.8.0:

    corepack pnpm install --frozen-lockfile
    corepack pnpm dev

Verificación:

    corepack pnpm typecheck
    corepack pnpm lint
    corepack pnpm test
    corepack pnpm test:components
    corepack pnpm test:e2e
    corepack pnpm build

Supabase local (opcional): ver `specs/001-trivia-mvp-flow/quickstart.md`.
