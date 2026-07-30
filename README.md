# ANTÍDOTO — Trivia educativa contra la desinformación

## Producto vigente

El MVP vigente es una aplicación Next.js con App Router en `src/app/`. La
trivia pública, sus sesiones anónimas, el resultado y el ranking se implementan
según [la especificación aprobada](specs/001-trivia-mvp-flow/spec.md).

El directorio `prototipo/` contiene el prototipo estático legado y queda fuera
del build Next.js.

Para el entorno reproducible se requiere Node.js 24.x y pnpm 11.8.0:

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

La guía contractual completa está en
`specs/001-trivia-mvp-flow/quickstart.md`.
