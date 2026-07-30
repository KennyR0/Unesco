# Revisión de alias bloqueados

- fixture: `src/features/game/content/blocked-aliases.v1.json`
- schemaVersion: 1
- listVersion: `2026-07-30.1`
- normalization: `trim+nfc+es-lowercase+exact-full-alias`
- contentReviewer: Líder técnico / Responsable de Contenido y Moderación
- technicalReviewer: Líder backend
- reviewedAt: 2026-07-30
- decision: approved

La lista es local, pequeña y versionada. Solo elimina espacios exteriores,
normaliza NFC, aplica minúsculas de locale español y compara el alias completo.
No consulta servicios externos, no colapsa espacios internos y no realiza
coincidencias parciales.
