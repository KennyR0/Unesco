# Puerta de reconciliación de Supabase

**Estado**: modelo físico arcade aprobado para preparación local; migración
generada y pendiente de aplicación/verificación.
**Alcance**: auditoría local; no aplica ni publica Supabase remoto.

## Observación del checkout

Verificado el 31 de julio de 2026:

| Evidencia | Resultado |
|---|---|
| Archivos locales supabase/migrations/*.sql | 22 archivos, con nombres consecutivos de la línea base single_choice |
| git ls-files supabase/migrations/* | Sin resultados: las migraciones no están versionadas |
| git log --all -- supabase/migrations supabase/seed.sql | Sin resultados: no hay historial Git local de esos archivos |
| git status --short | supabase/migrations/ y supabase/seed.sql aparecen como no versionados |
| Historial remoto Supabase | Se conserva como supuesto de trabajo: vacío; no se ejecuta una operación remota durante esta revisión |

## Qué se conserva

- La intención de sesiones anónimas, seguridad mínima, RLS, grants explícitos,
  auditoría y validación en servidor.
- Los archivos locales como material de auditoría y referencia histórica.
- La separación entre contenido público, reglas privadas y operaciones
  autoritativas del servidor.
- La necesidad de conservar score y elegibilidad en el resultado final, según
  la fórmula aprobada por juego.
- La capacidad de conservar un ranking global secundario, limitado a diez
  resultados y fuera del landing.

## Qué no se considera definitivo

- El catálogo single_choice.
- Las tablas, RPC y restricciones diseñadas exclusivamente para una pregunta de
  selección única.
- La forma física heredada y cualquier plazo distinto de la política arcade de
  24 horas para sesiones/respuestas y 30 días para resultados/ranking.
- La forma física del score, rankingScore, consulta de leaderboard y sus índices
  hasta comparar el modelo aprobado con las migraciones.
- La aplicación o publicación de las 22 migraciones locales.

## Puerta antes de una migración nueva

La preparación de la migración queda autorizada después de:

1. se aprueben los seis contratos de mecánica y el payload discriminado;
2. se incorpore al esquema físico la puntuación aprobada por juego;
3. se compare el modelo aprobado con las 22 migraciones locales;
4. se decida explícitamente qué objetos y restricciones se conservan,
   corrigen, reemplazan o archivan;
5. se diseñe el ranking global persistible, con rankingScore, RLS/grants y
   límite de diez, sin convertirlo en CTA principal; y
6. se incorporen timestamps de cierre, índices de purga y eliminación en
   cascada según la política de retención del modelo; y
7. una tarea posterior cree migraciones versionadas solo después de esa
   decisión.

## Decisión de preparación local

El 1 de agosto de 2026 se autorizó preparar T017, sin cerrar sus
dependencias de implementación ni ejecutar la base local/remota:

- el modelo usa el esquema privado no expuesto `private_arcade`;
- las tablas nuevas no reutilizan objetos single_choice;
- las soluciones, sesiones, respuestas y resultados quedan fuera del Data API;
- el ranking se almacena como proyección privada sin `session_id` ni respuestas;
- RLS queda habilitado como defensa en profundidad y los grants se limitan a
  `service_role`;
- la CLI generó `supabase/migrations/20260801051613_arcade_schema.sql`;
- T017 permanece `[ ]` hasta verificar T005–T016 y T019.

La decisión de producto del 31 de julio de 2026 conserva el ranking global como
resultado secundario: no aparece en el landing principal, no es requisito para
jugar y no requiere enmienda de la constitución 1.0.0.

No se ejecutó `supabase db push`, `reset`, `seed` ni `lint`. La migración solo
fue generada y editada localmente; su aplicación y validación contra PostgreSQL
quedan para T019/T070 con autorización renovada.
