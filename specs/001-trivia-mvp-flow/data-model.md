# Modelo de datos — Flujo MVP de Antídoto

**Versión del contrato**: 1.0
**Especificación de referencia**: `spec.md`
**Decisiones técnicas de referencia**: `research.md`

## 1. Objetivo y límites

Este modelo persiste únicamente el contenido educativo, la ronda asignada, las
respuestas aceptadas y el resultado mínimo necesario para el ranking. No modela
cuentas, perfiles, historial personal, administración de contenido, multijugador,
temporizadores ni mecánicas distintas de `single_choice`.

La separación física es:

```text
Navegador
  → Server Components / Server Actions de Next.js
  → cliente Supabase exclusivo de servidor
  → esquema expuesto api
  → esquema no expuesto private
```

- `private` contiene las seis tablas autoritativas y permanece fuera de los esquemas
  expuestos por Data API.
- `api` contiene únicamente las funciones transaccionales y de lectura aprobadas.
- El navegador no consulta Supabase directamente.
- El token de sesión sin hash solo existe en la cookie `httpOnly`; la base conserva
  su SHA-256 binario.
- No se crea una tabla de ranking: el resultado final de `game_sessions` es la única
  fuente de verdad.

## 2. Mapa de entidades

```text
private.mechanics 1 ───────< private.questions
                                  │ 1
                                  ├────────< private.question_options
                                  │                     ▲
                                  │                     │ opción correcta
                                  └─────────────────────┘

private.game_sessions 1 ───< private.session_questions >─── 1 private.questions
                                      │ 1
                                      │
                                      └──── 0..1 private.player_answers
                                                      │
                                                      └──── 1 question_options

private.game_sessions ──consulta segura──> api.get_leaderboard
```

Relaciones obligatorias:

- una mecánica puede clasificar muchas preguntas;
- una pregunta tiene entre dos y cuatro opciones al publicarse;
- una pregunta publicada identifica exactamente una de sus propias opciones como
  correcta;
- una sesión tiene una única ronda materializada mediante sus asignaciones;
- una sesión no repite posición ni pregunta;
- una asignación tiene cero o una respuesta;
- la opción seleccionada pertenece a la pregunta de la asignación.

## 3. Vocabularios y estados persistidos

Se prefieren restricciones `CHECK` para estos vocabularios pequeños, de modo que una
migración futura pueda ampliarlos sin acoplar el código a tipos enumerados físicos.
Los contratos TypeScript son la fuente pública de nombres.

### Tamaño de ronda

`RoundSize` es el único concepto compartido para representar la cantidad de
preguntas de una ronda. Es un entero entre 1 y 10, validado por el esquema Zod
compartido y repetido como restricción defensiva en la entrada SQL y en
`game_sessions.total_questions`. `GAME_ROUND_SIZE` es la única fuente de
configuración en tiempo de ejecución; Production la fija en `5`.

`api.start_game` recibe el `RoundSize` ya validado por el servidor, vuelve a
comprobar el rango y persiste ese mismo valor en la sesión. Desde ese momento,
`total_questions` es la instantánea histórica autoritativa para progreso, resultado
y puntuación máxima. Ninguna consulta de ranking aplica un máximo global fijo: el
máximo de cada partida se deriva como
`total_questions × points_per_correct`.

### Estado de contenido

| Valor persistido | Significado | Transición permitida |
|---|---|---|
| `draft` | Contenido todavía incompleto o no aprobado. | `published` |
| `published` | Contenido completo, inmutable y elegible para nuevas rondas. | `retired` |
| `retired` | Ya no se asigna a nuevas sesiones; sigue disponible para sesiones existentes. | Ninguna |

No se permite volver de `published` o `retired` a `draft`. Una corrección de contenido
publicado crea una nueva fila/version y retira la anterior.

### Estado de sesión

| Valor persistido | Estado funcional | Transición permitida |
|---|---|---|
| `started` | `Iniciada`: ronda completa asignada, ninguna respuesta aceptada. | `in_progress`, `invalidated` |
| `in_progress` | `En progreso`: existe al menos una respuesta y la ronda no finalizó. | `finished`, `invalidated` |
| `finished` | `Finalizada`: todas las respuestas existieron al finalizar y el resultado es definitivo; el detalle puede purgarse. | Ninguna |
| `invalidated` | `Invalidada`: expiró o se detectó una inconsistencia no recuperable. | Ninguna |

`finished` e `invalidated` son terminales. Las operaciones de juego comprueban
`expires_at` únicamente para `started` e `in_progress`; no dependen del proceso
periódico para impedir actividad después de 24 horas. Una finalizada nunca pasa a
invalidada por tiempo.

### Estado de pregunta asignada

| Valor persistido | Estado funcional | Transición permitida |
|---|---|---|
| `pending` | `Pendiente`: todavía puede aceptar su primera respuesta. | `answered` |
| `answered` | `Respondida`: tiene una respuesta aceptada e inmutable. | Ninguna |

`sending` no se persiste porque es un estado temporal de interfaz. No existe estado de
expiración de pregunta en esta versión.

## 4. Entidades

### 4.1 `private.mechanics`

Catálogo estructurado de tipos de interacción. La única fila activa de esta versión
es `single_choice`; la existencia del catálogo no habilita otras mecánicas.

| Campo | Tipo conceptual | Obligatorio | Regla |
|---|---|---:|---|
| `code` | texto corto | Sí | Clave primaria estable; para el MVP: `single_choice`. |
| `display_name` | texto | Sí | Nombre revisable del tipo de mecánica. |
| `interaction_type` | texto corto | Sí | Para esta versión: selección de un radio dentro de un grupo. |
| `response_type` | texto corto | Sí | Para esta versión: identificador de una opción. |
| `allowed_media` | lista de texto | Sí | Subconjunto controlado; para esta versión: `text` e `image`. |
| `evaluation_rule` | texto corto | Sí | Regla identificable; compara la opción elegida con la solución protegida. |
| `time_limit_seconds` | entero positivo o nulo | Sí | Debe ser nulo para `single_choice` en este MVP. |
| `requires_explanation` | booleano | Sí | Verdadero en esta versión. |
| `requires_signals` | booleano | Sí | Verdadero en esta versión. |
| `requires_recommendation` | booleano | Sí | Verdadero en esta versión. |
| `accessibility_notes` | texto | Sí | Define semántica de grupo, teclado y anuncio de resultado. |
| `is_active` | booleano | Sí | Solo una mecánica activa es elegible. |
| `created_at` | instante UTC | Sí | Auditoría técnica mínima del seed/migración. |

Restricciones:

- el código es único y no cambia;
- `single_choice` no admite temporizador;
- los tres requisitos educativos permanecen verdaderos;
- no existe operación pública de alta, edición o eliminación.

Índice:

- la clave primaria por `code` cubre la unión desde preguntas; no se justifica otro
  índice para una tabla de catálogo mínima.

### 4.2 `private.questions`

Contenido educativo versionado de una pregunta. La solución permanece en este
esquema y nunca forma parte de la proyección previa a la respuesta.

| Campo | Tipo conceptual | Obligatorio | Regla |
|---|---|---:|---|
| `id` | UUID aleatorio | Sí | Clave primaria interna. |
| `public_ref` | Base64URL opaco | Sí | Referencia pública aleatoria de 22 caracteres; única, inmutable y sin autoridad propia. |
| `mechanic_code` | texto corto | Sí | FK a `mechanics.code`; en el MVP, `single_choice`. |
| `prompt` | texto | Sí | Enunciado no vacío. |
| `image_path` | texto o nulo | No | Ruta local bajo `/images/questions/`; no URL remota. |
| `image_alt` | texto o nulo | Condicional | Obligatorio y no vacío si existe imagen informativa. |
| `image_width` | entero positivo o nulo | Condicional | Obligatorio con imagen. |
| `image_height` | entero positivo o nulo | Condicional | Obligatorio con imagen. |
| `image_format` | texto corto o nulo | Condicional | `avif`, `webp`, `jpeg` o `png`. |
| `image_bytes` | entero positivo o nulo | Condicional | Recomendado hasta 300000 bytes; máximo absoluto 1000000 bytes. |
| `explanation` | texto | Sí | Explicación educativa no vacía. |
| `signals` | lista de texto | Sí | Al menos una señal no vacía. |
| `recommendation` | texto | Sí | Recomendación aplicable no vacía. |
| `correct_option_id` | UUID o nulo | Condicional | Nulo mientras sea borrador; obligatorio al publicar. |
| `status` | texto corto | Sí | `draft`, `published` o `retired`. |
| `content_version` | entero positivo | Sí | Empieza en 1; no se modifica en la fila publicada. |
| `supersedes_question_id` | UUID o nulo | No | FK a la versión anterior cuando una corrección la reemplaza. |
| `created_at` | instante UTC | Sí | Fecha de creación. |
| `published_at` | instante UTC o nulo | Condicional | Obligatorio desde `published`. |
| `retired_at` | instante UTC o nulo | Condicional | Obligatorio en `retired`. |

El estado persistido anterior pertenece exclusivamente a la ejecución. El flujo
editorial documental usa `draft`, `in_review`, `changes_requested`, `approved`,
`rejected` y `retired` conforme a la puerta de `spec.md`; no añade columnas ni cambia
el contrato de base de datos. Solo una versión editorial `approved`, con evidencia
vigente, puede proyectarse a `questions.status = 'published'`. Los demás estados
editoriales impiden la publicación, y un cambio de contenido, fuente o recurso
invalida esa proyección hasta una nueva aprobación.

Restricciones:

1. Los seis campos de imagen son todos nulos o forman un conjunto completo y válido.
2. `image_path` solo puede señalar un recurso local aprobado; `image_bytes` tiene un
   objetivo recomendado de `300000` bytes y nunca supera el máximo absoluto de
   `1000000` bytes definido en el contrato de medios.
3. `public_ref` se genera en servidor o seed desde 16 bytes aleatorios, es único y
   no codifica la solución ni el estado de publicación.
4. `content_version` es positivo y una fila no puede reemplazarse a sí misma.
5. La solución se protege mediante una FK compuesta y diferible:
   `(questions.id, questions.correct_option_id)` referencia
   `(question_options.question_id, question_options.id)`. La restricción se añade
   después de crear ambas tablas y es `DEFERRABLE INITIALLY DEFERRED`, por el ciclo
   legítimo de creación borrador → opciones → solución.
6. La familia `question_publication_complete`, con un
   `CONSTRAINT TRIGGER DEFERRABLE INITIALLY DEFERRED` en `questions` y otro en
   `question_options`, impide confirmar `published` si:
   - la mecánica no está activa o no es `single_choice`;
   - no existen entre dos y cuatro opciones;
   - falta una solución perteneciente a la pregunta;
   - faltan explicación, señales o recomendación;
   - los metadatos de imagen son incompletos.
7. Enunciado, opciones, solución y retroalimentación de una pregunta publicada son
   inmutables. Solo puede retirarse; una corrección crea otra versión.
8. Una pregunta retirada no es elegible para nuevas sesiones, pero no se elimina si
   una asignación histórica todavía la referencia.

Índices:

- índice parcial de elegibilidad por `(mechanic_code, id)` donde
  `status = 'published'`;
- índice único sobre `public_ref`;
- índice sobre `supersedes_question_id` para validar la cadena de versiones;
- la clave primaria cubre las lecturas por pregunta asignada.

### 4.3 `private.question_options`

Opciones ordenadas que pertenecen a una pregunta. No incluyen un booleano público de
corrección.

| Campo | Tipo conceptual | Obligatorio | Regla |
|---|---|---:|---|
| `id` | UUID aleatorio | Sí | Clave primaria interna. |
| `public_ref` | Base64URL opaco | Sí | Referencia pública aleatoria de 22 caracteres; única, inmutable y no indica corrección. |
| `question_id` | UUID | Sí | FK a `questions.id`, con eliminación restringida. |
| `position` | entero pequeño | Sí | Entre 1 y 4. |
| `label` | texto | Sí | Contenido visible no vacío. |
| `created_at` | instante UTC | Sí | Auditoría mínima de contenido. |

Restricciones:

- `UNIQUE (question_id, position)` conserva un orden inequívoco;
- `UNIQUE (question_id, id)` habilita las FKs compuestas de pertenencia;
- `UNIQUE (public_ref)` desacopla el contrato público de la clave primaria;
- una pregunta no puede tener más de cuatro opciones; el mínimo de dos se verifica al
  publicar;
- una opción de una pregunta publicada o retirada es inmutable;
- no se admite eliminación si la opción es solución o aparece en una respuesta
  todavía retenida.

Índices:

- la unicidad `(question_id, position)` sirve también para obtener las opciones en
  orden;
- la unicidad de `public_ref` resuelve la opción pública dentro de la RPC;
- no se crea un índice de “opción correcta”: la solución solo reside en la referencia
  privada de `questions`.

### 4.4 `private.game_sessions`

Participación anónima e independiente. Conserva el cursor que distingue una pregunta
pendiente de una retroalimentación confirmada después de recargar.

| Campo | Tipo conceptual | Obligatorio | Regla |
|---|---|---:|---|
| `id` | UUID aleatorio | Sí | Clave primaria interna y desempate estable oculto. |
| `session_token_hash` | 32 bytes o nulo | Condicional | SHA-256 binario, único mientras exista; nunca el token sin hash. |
| `alias` | texto Unicode canónico | Sí | Valor ya normalizado, validado y moderado; no es único. |
| `status` | texto corto | Sí | `started`, `in_progress`, `finished` o `invalidated`. |
| `total_questions` | `RoundSize` persistido | Sí | Entero entre 1 y 10, igual a la cantidad configurada y materializada; Production usa cinco. |
| `current_position` | entero pequeño positivo o nulo | Condicional | Posición visible antes de purgar detalle; entre 1 y `total_questions`. Se anula tras la purga. |
| `scoring_rule_code` | texto corto | Sí | Para esta versión: `single-choice-100-v1`. |
| `points_per_correct` | entero no negativo | Sí | 100 en `single-choice-100-v1`. |
| `points_per_incorrect` | entero no negativo | Sí | 0 en `single-choice-100-v1`. |
| `correct_answers` | entero no negativo o nulo | Condicional | Solo existe al finalizar. |
| `final_score` | entero no negativo o nulo | Condicional | Solo existe al finalizar y es definitivo. |
| `started_at` | instante UTC o nulo | Condicional | Creación confirmada mientras existe detalle; se anula tras la purga. |
| `last_activity_at` | instante UTC o nulo | Condicional | Solo cambia al crear o aceptar una respuesta; se anula tras la purga. |
| `expires_at` | instante UTC o nulo | Condicional | En `started`/`in_progress`, equivale a `last_activity_at + 24 horas`; es nulo en estados terminales. |
| `finished_at` | instante UTC o nulo | Condicional | Obligatorio en `finished`. |
| `result_access_until` | instante UTC o nulo | Condicional | En `finished`, equivale exactamente a `finished_at + 7 días`; limita la recuperación individual sin invalidar la sesión. |
| `invalidated_at` | instante UTC o nulo | Condicional | Obligatorio en `invalidated`; si la causa es vencimiento, coincide con el valor previo de `expires_at`. |
| `details_purge_after` | instante UTC o nulo | Condicional | Primer ciclo de seis horas al cumplirse seis días desde `finished_at` o `invalidated_at`, siempre anterior al límite de siete días. |
| `details_purged_at` | instante UTC o nulo | No | Evidencia de eliminación del detalle de una sesión finalizada. |
| `ranking_retention_until` | instante UTC o nulo | No | Nulo mientras el MVP siga público; se fija al retirarlo. |

Restricciones:

1. `session_token_hash`, cuando existe, tiene exactamente 32 bytes y usa unicidad
   parcial. El token sin hash no es columna ni dato de log.
2. `alias` contiene el valor canónico sin espacios externos. La aplicación valida
   grafemas visibles, caracteres Unicode y lista bloqueada; la base añade defensas de
   longitud y ausencia de valor vacío, pero no reemplaza esa validación.
3. Antes de la purga, `current_position` permanece entre 1 y `total_questions`,
   `started_at` y `last_activity_at` existen. Después de purgar el detalle, los tres
   son nulos junto con `expires_at` y `details_purge_after`; el hash puede permanecer
   únicamente hasta `result_access_until` y después debe anularse.
4. Mientras `details_purged_at` sea nulo, `total_questions` coincide exactamente con
   el número de asignaciones de la sesión. `api.start_game` y la familia
   `game_session_round_complete`, instalada como un
   `CONSTRAINT TRIGGER DEFERRABLE INITIALLY DEFERRED` en `game_sessions` y otro en
   `session_questions`, impiden confirmar una ronda parcial. Después de la purga, no quedan
   asignaciones ni respuestas y `total_questions` conserva únicamente el resumen
   histórico.
5. En `started`, no existen respuestas ni resultado. La primera respuesta aceptada
   cambia el estado a `in_progress`.
6. La transición a `finished` exige que todas las asignaciones estén respondidas.
   Mientras el detalle permanezca, esa cardinalidad sigue siendo comprobable; tras
   `details_purged_at`, las asignaciones y respuestas son cero y el resultado
   congelado es la evidencia retenida. En ambos casos `correct_answers`,
   `final_score`, `finished_at` y `result_access_until` existen,
   `result_access_until = finished_at + 7 días`, `invalidated_at` es nulo y
   `expires_at` es nulo.
7. En `invalidated`, `invalidated_at` existe, `expires_at` es nulo y no se crea
   resultado elegible.
8. `correct_answers <= total_questions`.
9. `0 <= final_score <= total_questions × points_per_correct`; en `single-choice-100-v1`,
   `final_score = correct_answers × 100`.
10. La regla y sus valores se fijan al crear la sesión y no cambian después; el
    resultado histórico no se recalcula desde contenido futuro.
11. Una sesión terminal no admite actualizaciones de juego. Solo la función privada
    de retención puede retirar token/detalle o eliminar el resultado al vencer su
    plazo.
12. `details_purged_at` solo puede existir en `finished`; su presencia exige la forma
    mínima descrita en 3, 4 y 6, salvo el hash todavía autorizado hasta
    `result_access_until`.
13. `total_questions` permanece entre 1 y 10. No existe otra constante de tamaño de
    ronda o puntuación máxima en persistencia.

La guarda inmediata `game_session_transition_guard`, instalada como trigger
`BEFORE INSERT OR UPDATE OR DELETE`, protege estas reglas aun cuando el DML se
ejecute con la credencial servidor que omite RLS:

- una fila cuyo estado anterior es `finished` o `invalidated` no puede volver a un
  estado anterior ni modificar resultado, regla, fechas terminales o datos de juego;
- `scoring_rule_code`, `points_per_correct`, `points_per_incorrect` y
  `total_questions` quedan congelados después de insertar la sesión;
- una transición ordinaria a `finished` solo puede confirmar un resultado coherente
  con el detalle; una transición a `invalidated` no puede crear puntuación;
- no se puede insertar una sesión ya puntuada ni actualizar manualmente
  `correct_answers` o `final_score` fuera de la transición válida a `finished`.

La única excepción es la función privada de retención ejecutada por su rol
propietario/Cron. La guarda identifica ese rol propietario —no una bandera de sesión
configurable por `service_role`— y permite únicamente los campos de purga enumerados
o la eliminación prevista. La excepción no autoriza reabrir estados, recalcular
resultados ni cambiar la regla de puntuación.

Además, la familia diferible `game_session_result_consistent`, instalada en
`game_sessions` y `player_answers`, vuelve a calcular al confirmar una transición a
`finished` el conteo de aciertos y la suma de puntos. Mientras exista detalle, exige
que coincidan exactamente con `correct_answers` y `final_score`; después de la purga,
la guarda inmediata mantiene congelado el resumen ya verificado.

Índices:

- índice único parcial sobre `session_token_hash` donde no sea nulo;
- índice parcial de expiración por `(expires_at, id)` para estados `started` e
  `in_progress`;
- índice parcial de ranking por
  `(final_score DESC, finished_at ASC, id ASC)` donde `status = 'finished'`;
- índice parcial de limpieza por `details_purge_after`;
- índice parcial por `ranking_retention_until` donde no sea nulo.

No se persisten correo, nombre real, IP, agente de usuario, fingerprint, identidad de
Supabase Auth ni otros datos personales.

### 4.5 `private.session_questions`

Materializa una única ronda y su orden estable. Una recarga lee estas filas; nunca
vuelve a seleccionar preguntas.

| Campo | Tipo conceptual | Obligatorio | Regla |
|---|---|---:|---|
| `id` | UUID aleatorio | Sí | Identificador interno de la asignación. |
| `session_id` | UUID | Sí | FK a `game_sessions.id`, eliminación en cascada por retención. |
| `question_id` | UUID | Sí | FK a una pregunta publicada e inmutable. |
| `position` | entero pequeño positivo | Sí | Entre 1 y el total de la sesión. |
| `status` | texto corto | Sí | `pending` o `answered`. |
| `assigned_at` | instante UTC | Sí | Momento de materialización de la ronda. |
| `answered_at` | instante UTC o nulo | Condicional | Coincide con la respuesta aceptada. |

Restricciones:

- `UNIQUE (session_id, position)` impide posiciones repetidas;
- `UNIQUE (session_id, question_id)` impide repetir preguntas en una ronda;
- `UNIQUE (id, session_id, question_id)` permite comprobar el contexto completo de
  una respuesta;
- las posiciones forman el conjunto continuo `1..total_questions`, comprobado al
  confirmar `start_game` mediante la familia diferible
  `game_session_round_complete`;
- una asignación pertenece a una sola sesión y una sola versión de pregunta;
- solo la asignación de `current_position`, en estado `pending`, puede aceptar una
  respuesta;
- la familia diferible `session_answer_consistent`, instalada en
  `session_questions` y `player_answers`, exige que `answered` tenga exactamente una
  respuesta y `answered_at`, y que `pending` no pueda tenerlos;
- la transición a `answered` y la creación de la respuesta ocurren en la misma
  transacción.

Índices:

- las dos restricciones únicas cubren recuperación por posición y comprobación de
  pregunta asignada;
- índice por `question_id` protege el mantenimiento de la FK cuando se intenta
  retirar físicamente una versión de contenido;
- no se añade un índice global por estado porque cada ronda contiene como máximo diez
  filas.

### 4.6 `private.player_answers`

Registro inmutable de la primera selección aceptada. Corrección y puntos son valores
derivados dentro de `api.submit_answer`, nunca entrada del cliente.

| Campo | Tipo conceptual | Obligatorio | Regla |
|---|---|---:|---|
| `id` | UUID aleatorio | Sí | Clave primaria interna. |
| `session_question_id` | UUID | Sí | Asignación respondida; única. |
| `session_id` | UUID | Sí | Parte de la FK compuesta de pertenencia. |
| `question_id` | UUID | Sí | Parte de las FKs compuestas de pertenencia. |
| `selected_option_id` | UUID | Sí | Opción enviada por el jugador. |
| `is_correct` | booleano | Sí | Calculado comparando con la solución privada. |
| `points_awarded` | entero no negativo | Sí | Derivado de la regla fijada en la sesión. |
| `answered_at` | instante UTC | Sí | Momento de aceptación autoritativa. |

Restricciones:

1. `UNIQUE (session_question_id)` es la defensa definitiva contra respuestas
   concurrentes o duplicadas.
2. `(session_question_id, session_id, question_id)` referencia la misma terna en
   `session_questions`.
3. `(question_id, selected_option_id)` referencia
   `(question_options.question_id, question_options.id)`, por lo que una opción ajena
   no puede insertarse.
4. `is_correct` coincide con
   `selected_option_id = questions.correct_option_id`.
5. `points_awarded` coincide con la regla inmutable de la sesión: 100/0 en
   `single-choice-100-v1`.
6. Solo se inserta para una sesión activa, una asignación pendiente, asignada y
   ubicada en `current_position`.
7. No se permiten actualizaciones. La eliminación solo corresponde al proceso
   privilegiado de retención.

La guarda inmediata `player_answer_integrity_guard`, instalada como trigger
`BEFORE INSERT OR UPDATE OR DELETE`, hace exigibles 4–7 incluso con DML directo del
rol servidor. En cada inserción obtiene la solución y la regla desde las filas
privadas ya relacionadas, rechaza sesiones terminales o funcionalmente vencidas y
exige:

```text
NEW.is_correct = (NEW.selected_option_id = questions.correct_option_id)
NEW.points_awarded =
  CASE WHEN NEW.is_correct
       THEN game_sessions.points_per_correct
       ELSE game_sessions.points_per_incorrect
  END
```

Cualquier `UPDATE` se rechaza. Un `DELETE` solo se admite cuando lo ejecuta la
función privada de retención mediante su rol propietario/Cron; `service_role` no
puede activar esa excepción directamente.

Índices:

- la unicidad de `session_question_id` cubre la comprobación de duplicados;
- índice por `(session_id, answered_at)` para calcular y auditar un resultado;
- índice por `(question_id, selected_option_id)` cubre la FK de pertenencia al
  comprobar opciones retenidas;
- las FKs compuestas usan los índices únicos ya descritos.

## 5. Asignación y progreso

### Inicio atómico

`api.start_game` ejecuta en una sola transacción:

1. recibe el alias canónico y un hash de token generado por Next.js;
2. comprueba que el tamaño pedido es el `RoundSize` configurado por servidor
   (entero 1–10; cinco en Production);
3. obtiene exactamente ese número de preguntas elegibles `published` y
   `single_choice`;
4. crea la sesión con `current_position = 1`;
5. persiste `RoundSize` asignaciones, una por posición, sin repetición;
6. confirma que la ronda es completa antes de devolver éxito.

La selección pseudoaleatoria se deriva del UUID de la sesión y queda materializada.
Una recarga nunca reasigna ni reordena.

### Cursor de retroalimentación

Responder no incrementa `current_position`.

- Si la asignación actual está `pending`, `get_game_state` devuelve su pregunta
  pública.
- Si está `answered`, devuelve la retroalimentación confirmada de esa respuesta.
- `advance_game` incrementa el cursor solo cuando la persona activa “Continuar”.
- En la posición final, “Ver resultados” llama a `finish_game`; el cursor permanece
  en la última posición.

De este modo, una recarga posterior a un envío aceptado restaura la retroalimentación
en vez de saltarla.

## 6. Puntuación y finalización

La regla `single-choice-100-v1` se fija en cada sesión:

```text
puntos de respuesta = 100 si es correcta; 0 si es incorrecta
aciertos definitivos = conteo de player_answers.is_correct
puntuación definitiva = suma de player_answers.points_awarded
máximo = total_questions × 100
```

`api.finish_game` bloquea la sesión, verifica que cada asignación tenga una respuesta,
calcula desde `player_answers` y persiste una sola vez. Si la sesión ya está
`finished`, devuelve el mismo resultado sin escribir de nuevo. Nunca recibe puntuación
ni número de aciertos del cliente.

## 7. Ranking derivado

No existe tabla ni vista de ranking, materializada o no. `api.get_leaderboard` es una
función de lectura `SECURITY INVOKER` que consulta directamente
`private.game_sessions` y retorna exactamente:

- `entries`: hasta diez objetos con `position`, `alias`, `score` e
  `isCurrentPlayer`;
- `currentPlayerEntry`: el mismo objeto solo para la sesión actual fuera del top, o
  nulo.

`finished_at` y el UUID se usan internamente para ordenar e identificar, pero nunca
forman parte de esa salida. `score` es múltiplo de 100 y, para cada entrada, queda
entre 0 y `total_questions × points_per_correct`. Production configura cinco
preguntas y por ello su máximo actual es 500, sin codificar ese valor como límite
global del ranking.

La selección incluye únicamente `game_sessions.status = 'finished'` con resultado
definitivo. El orden total es:

1. `final_score DESC`;
2. `finished_at ASC`;
3. `game_sessions.id ASC`.

El UUID solo participa en el cálculo y la identidad interna; no se retorna. Una
sola sentencia SQL produce el top diez y la posición de la sesión asociada a la cookie.
La fila se marca por UUID antes de retirarlo; si queda fuera, se devuelve separada sin
alterar el top. Así una finalización concurrente no mezcla posiciones de dos
instantáneas.

La función no es ejecutable por `anon` ni `authenticated`. “Ranking público” describe
la página pública de Antídoto; la consulta física la realiza el servidor.

## 8. Expiración y retención

### Validez funcional

- La creación y cada respuesta aceptada de una sesión activa fijan
  `last_activity_at` y `expires_at = last_activity_at + 24 horas`.
- `start_game` y `submit_answer` devuelven internamente el `session_expires_at`
  persistido. La primera aceptación emite la cookie actualizada a ese nuevo instante.
  Un reintento de respuesta devuelve el mismo instante sin cambiarlo; la Server Action
  `submitAnswer` puede **reemitir** la cookie únicamente durante ese reintento
  idempotente, hasta la misma fecha, para recuperar un `Set-Cookie` perdido sin crear
  otra ventana de 24 horas.
- `api.get_game_state` y `api.get_game_result` son lecturas estrictamente puras. No
  cambian `status`, `invalidated_at`, `last_activity_at`, `expires_at` ni ninguna otra
  fila. Si observan una sesión activa con `expires_at <= now()`, proyectan
  `SESSION_INVALID` sin ejecutar `UPDATE`.
- Las demás lecturas, errores y visualizaciones tampoco renuevan la vigencia.
- Toda operación de escritura ligada a sesión bloquea primero la sesión y compara el
  reloj de base de datos con `expires_at` cuando el estado es `started` o
  `in_progress`. Si venció, materializa en la misma transacción `invalidated`,
  `invalidated_at = expires_at`, anula `expires_at`, fija la purga desde ese instante
  funcional y devuelve una salida interna discriminada `SESSION_INVALID`. Esa salida
  es un resultado normal de la función, no una excepción SQL que pudiera revertir la
  transición; el adaptador la convierte en el error contractual únicamente después
  de que la transacción confirme.
- `finished` nunca expira a `invalidated`: conserva su resultado terminal y el
  ranking hasta la política de retención. `get_game_result` devuelve ese resultado
  mientras `now() < result_access_until`. Una sesión válida que continúa en
  `started` o `in_progress` devuelve `RESULT_NOT_AVAILABLE`; una sesión `finished`
  con `now() >= result_access_until` devuelve `RESULT_ACCESS_EXPIRED`, sin cambiarla
  a `invalidated` ni modificar fechas, credencial, detalle o ranking.
- `finish_game` devuelve internamente `result_access_until`. La Server Action alinea
  la cookie a ese instante con máximo 604800 segundos; un reintento idempotente
  devuelve el mismo corte y nunca lo prolonga.
- La limpieza programada no es necesaria para rechazar una sesión vencida, pero sí
  materializa y elimina sesiones abandonadas que no vuelvan a ejecutar una mutación.

### Limpieza mediante Supabase Cron

Una función privada idempotente, no expuesta por Data API, se ejecuta cada seis horas
mediante Supabase Cron. Para respetar “dentro de siete días”,
`details_purge_after` se fija en el primer ciclo posterior a seis días y, con el
programador saludable, no más tarde de seis días y seis horas desde la invalidación o
finalización.

En cada ejecución:

1. invalida sesiones activas cuyo `expires_at` venció, fijando
   `invalidated_at` al valor previo exacto de `expires_at`, no al instante tardío del
   ciclo Cron; `details_purge_after` se deriva de ese mismo instante. Si al ejecutar
   Cron la fecha de purga ya venció, la eliminación puede ocurrir en la misma
   transacción;
2. elimina por completo una sesión `invalidated` y sus asignaciones/respuestas cuando
   alcanza `details_purge_after`;
3. para una sesión `finished`, elimina `player_answers` y `session_questions`, pone
   `current_position`, `started_at`, `last_activity_at` y `expires_at` en nulo, y
   registra `details_purged_at`, sin borrar el hash antes de
   `result_access_until`;
4. cuando `result_access_until <= now()`, elimina `session_token_hash`; la lectura ya
   rechaza el acceso desde el instante exacto aunque Cron todavía no se haya ejecutado;
5. conserva únicamente UUID, alias, estado, versión/regla de puntuación, totales,
   puntuación y finalización mientras el ranking siga operativo;
6. elimina el resultado mínimo cuando `ranking_retention_until` vence.

Mientras el MVP esté público, `ranking_retention_until` es nulo. Al retirarlo, una
migración SQL versionada y revisada, ejecutada por el propietario, fija para todos
los resultados una fecha de eliminación dentro de seis días, de modo que el siguiente
ciclo siga dentro del límite de siete. No existe RPC ni panel administrativo para
esta operación.

La migración que instala el Cron define también la función y sus privilegios. Las
pruebas locales invocan la función con datos y tiempos controlados; no esperan al
programador real. La función selecciona todo dato vencido, por lo que una ejecución
tardía recupera pendientes.

El runbook consulta `cron.job_run_details` antes de la demostración y, mientras el MVP
esté público, con un intervalo máximo de seis horas. Exige una ejecución satisfactoria
en las seis horas anteriores. Si alcanza seis horas sin éxito o el trabajo está
deshabilitado, se ejecuta de inmediato la misma función con el rol propietario, se
corrige la programación y se vuelve a comprobar. Este mecanismo operativo no amplía
el plazo contractual.

## 9. Seguridad, exposición y mutabilidad

- RLS se habilita en las seis tablas de `private` como defensa en profundidad.
- No existen políticas permisivas para `anon` ni `authenticated`.
- Se revoca `USAGE` de los esquemas `private` y `api`, además de los privilegios
  sobre tablas, secuencias y funciones, a `PUBLIC`, `anon` y `authenticated`.
- Los privilegios predeterminados también se revocan para impedir que una migración
  futura exponga un objeto por accidente.
- Las funciones de `api` son `SECURITY INVOKER`, tienen `search_path` vacío,
  referencias calificadas y `EXECUTE` solo para `service_role`.
- `service_role` recibe `USAGE` explícito en ambos esquemas y solo los privilegios
  subyacentes requeridos; los privilegios predeterminados se fijan por rol
  propietario y esquema.
- `api.get_leaderboard` es `SECURITY INVOKER` y concede `EXECUTE` solo al rol de
  servidor.
- La clave de servidor puede omitir RLS; por ello cada RPC vuelve a exigir el hash de
  la cookie y valida pertenencia, estado y transición. RLS no sustituye esa
  autorización.
- Ningún rol público puede insertar respuestas, puntuaciones, preguntas, sesiones o
  resultados; tampoco actualizar ni eliminar datos.
- Las soluciones no aparecen en proyecciones ni salidas previas a una respuesta
  aceptada.
- Las guardas inmediatas `game_session_transition_guard` y
  `player_answer_integrity_guard`, junto con la familia diferible
  `game_session_result_consistent`, se ejecutan también para DML directo de
  `service_role`. RLS y la disciplina de usar la fachada no son la única defensa de
  terminalidad, inmutabilidad, corrección y puntuación.

## 10. Invariantes consolidadas

| ID | Invariante | Mecanismo principal |
|---|---|---|
| INV-001 | Una sesión tiene un alias canónico válido y moderado. | Zod en servidor + defensas `CHECK` + validación de `start_game`. |
| INV-002 | Toda sesión con detalle posee exactamente una ronda completa; una finalizada purgada conserva cero filas de detalle y su resumen definitivo. | Transacción de inicio + familia diferible `game_session_round_complete` en ambas tablas origen + forma condicionada por `details_purged_at`. |
| INV-003 | Una posición no se repite dentro de una sesión. | `UNIQUE (session_id, position)`. |
| INV-004 | Una pregunta no se repite dentro de la ronda. | `UNIQUE (session_id, question_id)`. |
| INV-005 | Una pregunta solo se responde una vez por sesión. | `UNIQUE (session_question_id)` + transacción. |
| INV-006 | La opción seleccionada pertenece a la pregunta. | FK compuesta `(question_id, selected_option_id)`. |
| INV-007 | No se responde una pregunta inexistente o no asignada. | FK de asignación + validación de sesión/cursor en RPC. |
| INV-008 | La opción correcta pertenece a la pregunta. | FK compuesta diferible desde `questions`. |
| INV-009 | Una pregunta publicada tiene 2–4 opciones y retroalimentación completa. | Familia diferible `question_publication_complete` en ambas tablas origen. |
| INV-010 | Una sesión terminal no vuelve a un estado anterior. | `game_session_transition_guard`, incluso ante DML con rol servidor; excepción de purga limitada al propietario/Cron. |
| INV-011 | Puntuación y aciertos se derivan de respuestas guardadas al finalizar y quedan congelados tras purgarlas. | `finish_game` transaccional + familia diferible `game_session_result_consistent` + guarda terminal. |
| INV-012 | La corrección y los puntos de cada respuesta coinciden con la solución y regla almacenadas; la puntuación nunca es negativa ni supera el máximo derivado de `RoundSize`. | `player_answer_integrity_guard`, familia de resultado y restricciones de sesión. |
| INV-013 | Solo sesiones finalizadas aparecen en ranking y una sesión aparece una vez. | Consulta sobre PK de `game_sessions` con filtro terminal e instantánea única. |
| INV-014 | La solución no se expone antes de responder. | Esquema privado + proyecciones explícitas + grants cerrados. |
| INV-015 | Un reintento no duplica respuesta ni resultado. | Restricciones únicas + respuestas/finalización idempotentes. |
| INV-016 | Una recarga conserva pregunta o retroalimentación confirmada. | Asignación persistida + `current_position`. |
| INV-017 | Solo crear sesión o aceptar respuesta renueva 24 horas mientras está activa; finalizar fija una única ventana de acceso al resultado de siete días; las lecturas son puras y una terminal no expira a otro estado. | Actualización limitada en las RPC correspondientes + `result_access_until = finished_at + 7 días` + proyección de vencimiento sin escritura. |
| INV-018 | El detalle, la credencial de resultado y el ranking cumplen sus ventanas; una sesión abandonada se invalida desde su vencimiento funcional, no desde la observación tardía de Cron. | Fechas ancladas en `expires_at`, `finished_at` y `result_access_until` + función privada idempotente + Cron cada seis horas + runbook de salud. |

## 11. Orden de migración previsto

Cada cambio se implementa en SQL versionado. El orden lógico, sin fijar todavía el
número final de archivo, es:

1. esquemas, extensiones necesarias, revocaciones y privilegios predeterminados;
2. catálogo de mecánicas, preguntas y opciones;
3. FK compuesta diferible, familia de publicación con sus dos triggers e
   inmutabilidad de contenido;
4. sesiones, asignaciones, respuestas, familias de ronda/respuesta/resultado,
   guardas inmediatas de terminalidad e integridad, restricciones e índices;
5. funciones transaccionales de la fachada `api`;
6. lectura `api.get_leaderboard`, retención y tarea de Supabase Cron;
7. migración de datos educativos aprobados, creada primero mediante
   `supabase migration new <nombre>`, con `single_choice` y al menos diez preguntas
   publicadas;
8. `supabase/seed.sql` exclusivo de local y Preview, sincronizado con esa migración
   mediante las mismas claves lógicas estables y una verificación de checksum.

La migración de datos es la vía de Production y debe ser idempotente: una clave
lógica existente con contenido idéntico no crea otra fila; una divergencia hace
fallar la transacción en vez de sobrescribir contenido publicado. El seed reproduce
el mismo conjunto aprobado para local/Preview y nunca se ejecuta en Production.

Una migración no se aprueba si deja objetos nuevos accesibles a roles públicos, si
permite publicar contenido incompleto o si sus pruebas permitidas/rechazadas fallan.

## 12. Trazabilidad con la especificación

| Requisitos | Cobertura del modelo |
|---|---|
| FR-001–FR-003 | No requieren persistencia; no se añade contenido de presentación al modelo. |
| FR-004–FR-012 | Alias canónico, token hash, sesión independiente e inicio atómico. |
| FR-013–FR-025 | Ronda materializada, 2–4 opciones, pregunta actual, respuesta única y sin temporizador. |
| FR-026–FR-031 | Explicación, señales, recomendación, solución protegida y guarda de publicación. |
| FR-032–FR-036 | Cursor, estados de asignación, recuperación y terminalidad. |
| FR-037–FR-043 | Finalización idempotente, regla 100/0 y resultado histórico. |
| FR-044–FR-050 | Consulta de ranking en instantánea única, top diez, orden total y posición propia separada. |
| FR-051–FR-059 | El modelo aporta proyecciones mínimas y metadatos visuales; interacción, accesibilidad y presupuesto se verifican en sus contratos específicos. |
| FR-060–FR-063 | Minimización, autorización por token hash, servidor autoritativo y ranking válido. |
| FR-064 | No se incorporan entidades ni capacidades fuera del MVP. |
| FR-065–FR-066 | Expiración activa de 24 horas, acceso individual al resultado durante siete días, purga de detalle y retiro del resultado mínimo. |

No se detecta contradicción entre este modelo, los 66 requisitos funcionales, la
constitución 1.0.0 y las decisiones cerradas en `research.md`.
