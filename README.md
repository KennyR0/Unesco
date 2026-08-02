# ANTÍDOTO — Arcade educativo MIL

Antídoto es un arcade de alfabetización mediática: seis misiones breves para
practicar cómo detectar imágenes, mensajes, titulares y fuentes engañosas. La
interfaz recupera la identidad ciber-brutalista del prototipo con una
implementación responsive y accesible en Next.js.

El prototipo en `prototipo/` es referencia de intención, experiencia y sistema
visual, no una plantilla HTML ni una dependencia del build. La fuente normativa
está en `specs/001-trivia-mvp-flow/contracts/visual-system.md`.

## Estado actual

La convergencia visual cubre la portada, las rutas introductorias, el shell,
feedback, estados comunes y los componentes ya implementados de ¿Real o IA?, El
Grupo, Clickbait Swipe y Radar de Fuentes. Feed 60 y Mente Maestra conservan su
tema documentado, pero no reciben lógica o componentes nuevos en este corte.

No se modifican APIs, payloads, puntuación, sesiones, base de datos, migraciones,
seed ni Supabase.

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

El quickstart y la evidencia de implementación viven en
`specs/001-trivia-mvp-flow/`.
