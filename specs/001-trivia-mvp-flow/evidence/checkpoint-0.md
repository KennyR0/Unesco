# Evidencia de Checkpoint 0 — Línea base documental

checkpoint: 0
decision: approved
approvedAt: 2026-07-30
branch: main
baselineCommit: 94ad7b4880079c52f77a18308f27c9c6ecbc6dad
baselineCommitMessage: docs(spec): establish approved trivia MVP baseline

## Alcance versionado

El commit de línea base contiene únicamente:

- `.gitignore`;
- `.specify/` completo, incluida la Constitución y sus artefactos normativos;
- `specs/001-trivia-mvp-flow/` completo, incluidos `spec.md`, `plan.md`,
  `tasks.md`, `research.md`, `data-model.md`, `quickstart.md`, contratos,
  checklists y la evidencia educativa vigente.

`.agents/` quedó fuera de la línea base como tooling local. No se mezclaron archivos
de implementación, configuración local, dependencias, salidas generadas ni el
`README.md` modificado previamente.

## Comprobaciones ejecutadas

| Comprobación | Resultado |
|---|---|
| Rama activa | `main` |
| Archivos staged | 36 |
| `git check-ignore` sobre Constitución, `spec.md`, `plan.md` y `tasks.md` | Sin coincidencias |
| Escaneo de secretos en `.specify/` y `specs/` | Sin coincidencias |
| Escaneo de temporales o salidas generadas en `.specify/` y `specs/` | Sin coincidencias |
| `git diff --cached --check` | Salida 0 |
| `.agents/` en el commit | No |
| Revisión de nombres y contenido staged | Aprobada; solo entraron las rutas autorizadas |

## Archivos restantes fuera de la línea base

El estado posterior al commit conserva trabajo ajeno al Checkpoint 0: `README.md`
modificado, `.env.example`, configuración raíz, `public/`, `src/`, `supabase/`,
`tests/`, `package.json`, locks y archivos de TypeScript. Esos archivos no son
artefactos normativos de `specs/001-trivia-mvp-flow/` y no fueron agregados.
`.agents/` permanece fuera por ser tooling local.

## Estado y límites

Checkpoint 0 queda aprobado. Esta evidencia no aprueba la implementación, seed,
migraciones, despliegue, Cron, pruebas de reloj/concurrencia ni ninguna tarea T001–T150.
Todas las tareas conservan estado pendiente hasta registrar sus verificaciones
individuales y las puertas posteriores.
