# Quickstart documental de Antídoto Arcade

**Estado**: puerta previa a implementación. Este documento no inicia Next.js,
no modifica Supabase y no valida todavía un flujo ejecutable del arcade.

## 1. Documentos que deben existir

Desde la raíz del checkout:

    powershell.exe -NoProfile -ExecutionPolicy Bypass -File .specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks

La salida debe resolver FEATURE_DIR en specs/001-trivia-mvp-flow y encontrar:

- spec.md
- plan.md
- research.md
- data-model.md
- contracts/
- tasks.md
- scoring-proposal.md
- prototype-comparison.md
- supabase-reconciliation.md

## 2. Verificar la línea base local

Comandos de solo lectura:

    git status --short --branch
    Get-ChildItem supabase/migrations -File -Filter *.sql
    git ls-files supabase/migrations/*
    git log --all --oneline -- supabase/migrations supabase/seed.sql

Resultado esperado:

- 22 migraciones locales;
- migraciones y seed sin seguimiento Git;
- sin historial Git local de esos archivos;
- ningún comando de esta puerta aplica, resetea, seed-ea, lint-a o publica
  Supabase.

## 3. Verificar el prototipo como referencia

Revisar los seis scripts:

- prototipo/js/games/real-o-ia.js
- prototipo/js/games/grupo.js
- prototipo/js/games/titulares.js
- prototipo/js/games/radar.js
- prototipo/js/games/feed.js
- prototipo/js/games/mente-maestra.js

Registrar en scoring-proposal.md cualquier cambio de fórmula observado. El
prototipo no es una dependencia del build.

## 4. Verificar consistencia documental

Comprobar que:

- la feature sigue siendo 001-trivia-mvp-flow;
- aparecen exactamente seis gameCode en spec.md, plan.md, data-model.md y
  domain.ts;
- mechanics.md tiene seis secciones, y cada gameCode tiene entrada, salida y
  feedback;
- el ranking global aparece solo como resultado secundario, nunca como bloque
  principal del landing ni como objetivo competitivo;
- no se presenta single_choice como contrato vigente;
- feedback, accesibilidad, servidor autoritativo y sesiones independientes
  aparecen en spec, plan, contratos, modelo y tareas;
- scoring-proposal.md está marcado como aprobado provisionalmente y coincide con
  los campos de contracts/ y data-model.md;
- la política de retención arcade está fijada en 24 horas para sesiones,
  items y respuestas, y 30 días para resultados y ranking;
- tasks.md tiene dependencia, responsable y verificación mínima para cada tarea;
- el presupuesto de MVP fija 180/200 KB de JS, 350 KB de transferencia inicial,
  16 KB por acción, 50 KB de dependencias nuevas y 1.5 MB de media visible;
- supabase-reconciliation.md continúa marcado como auditoría local.

La búsqueda debe distinguir material histórico de referencias normativas nuevas.

## 5. Decisión de ranking

La constitución 1.0.0 y la decisión de producto se consideran compatibles:
el ranking global se conserva con máximo diez resultados, después del resultado
o desde navegación secundaria. No aparece en el landing principal, no es
necesario para jugar y usa una métrica normalizada solo para ordenar la lectura,
sin cambiar la puntuación educativa de cada juego.

La verificación del ranking debe confirmar además que solo aparecen resultados
`finished` completos (`answered = total`, `total > 0`), con alias permitido,
score acotado y `maxPoints > 0`. Los estados expired, invalid o incompletos,
las marcas de abuso/invalidez y cualquier denominador cero quedan fuera; el
servidor calcula `rankingScore` con clamp a 0–100 y resuelve empates por
`completedAt` y `resultId`.

## 6. Puerta para continuar Spec Kit

No ejecutar speckit-implement de forma total todavía. Antes de implementar el
shell, contratos y mecánicas deben quedar cerrados:

- contratos de mecánicas y payloads;
- modelo lógico con score y ranking global persistible;
- backlog de implementación regenerado desde los documentos aprobados.

La reconciliación documental de las 22 migraciones continúa siendo obligatoria
solo para T017–T019 y T070, sin aplicar cambios físicos. El shell, el dominio,
los componentes y las pruebas con fixtures server-only pueden avanzar antes de
esa aprobación.

Con esas puertas documentales cerradas, ejecutar el análisis de consistencia de
Spec Kit y aplicar sus remediaciones. Solo se regenera tasks.md si una
remediación cambia el alcance o la descomposición; la implementación debe
comenzar con el shell y la primera historia aprobada, no con migraciones
heredadas.
