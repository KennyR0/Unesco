# ANTIDOTO - Arcade educativo MIL

## Producto en redefinición

La feature specs/001-trivia-mvp-flow/ está siendo redefinida como un arcade
educativo de seis juegos basado en prototipo/. La propuesta usa Next.js como
tecnología del build, mantiene sesiones independientes y feedback inline, y
usa la puntuación aprobada por juego. El ranking global se conserva como
resultado secundario, fuera del landing principal y sin ser el objetivo
competitivo del producto.

El directorio prototipo/ es referencia de experiencia y queda fuera del build
Next.js. Esta fase es documental: no continúa la implementación ni publica las
migraciones locales de Supabase.

La especificación, los contratos, el modelo, la propuesta de puntuación y la
puerta de reconciliación están en specs/001-trivia-mvp-flow/.

## Entorno heredado

La base Next.js existente requiere Node.js 24.x y pnpm 11.8.0:

    corepack pnpm install --frozen-lockfile
    corepack pnpm dev

Estos comandos pertenecen a la línea base anterior; no prueban todavía el
arcade redefinido.
