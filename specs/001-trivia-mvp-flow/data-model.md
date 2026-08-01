# Modelo de datos — Antídoto Arcade MIL

**Estado**: modelo lógico revisado; no es todavía un esquema SQL ni autoriza
migraciones.

## Objetivo y límites

El modelo representa seis mecánicas sin forzarlas a single_choice, mantiene la
solución privada, permite una sesión independiente por juego y materializa
feedback educativo después de una acción aceptada.

Incluye la puntuación aprobada como parte del resultado y conserva el ranking
global de la línea base como una capacidad secundaria. El ranking no es una
dependencia para jugar o aprender.

## Mapa de entidades

    game_catalog
        |
        +-- game_items
        |       +-- item_media
        |       +-- item_feedback
        |       +-- item_solution_private
        |
        +-- game_sessions
                +-- session_items
                        +-- player_answers
                        +-- game_result
                                +-- leaderboard projection

## game_catalog

| Campo lógico | Regla |
|---|---|
| gameCode | único y uno de real-o-ia, grupo, clickbait-swipe, radar-de-fuentes, feed-60, mente-maestra |
| mechanic | discriminante estable del tipo de interacción |
| name | nombre visible en español |
| objective | habilidad educativa |
| route | ruta dinámica asociada |
| contentVersion | versión del catálogo compatible |
| available | solo juegos aprobados se pueden iniciar |

## game_items

| Campo lógico | Regla |
|---|---|
| itemId | identificador opaco y estable |
| gameCode | debe coincidir con el catálogo |
| sequence | orden dentro de la sesión |
| prompt | texto de la decisión |
| publicPayload | variante pública descrita por domain.ts |
| feedback | explicación, señales y recomendación |
| solutionPrivate | fuera de la proyección previa |
| contentVersion | cambia si cambia estímulo, solución o feedback |
| editorialStatus | solo approved puede publicarse |

El contenido se almacena estructurado. Los componentes no deben contener la
pregunta, solución ni explicación como texto normativo.

## Variantes de item

### image_verdict

Publica contexto, media y choices real/ai. La solución privada contiene el
veredicto y las pistas de evaluación. El feedback puede revelar la solución
después de aceptar.

### group_decision

Publica mensajes y acciones permitidas para la escena. La solución privada
asocia cada acción con su evaluación y consecuencia narrativa. El modelo no
presume que forward sea siempre incorrecto.

### headline_classification

Publica titular, fuente y las opciones journalism/clickbait. El origen swipe,
button o keyboard es telemetría de interacción, no autoridad de evaluación.

### source_classification

Publica nombre, URL visible, descripción y categorías. Una fuente solo puede
tener una aceptación por sesión.

### timed_feed

Publica post, fuente, acciones y remainingSeconds calculado por servidor. La
marca de expiración y el coste temporal de verificar son privados o
autoritativos.

### guided_autopsy

Publica un paso y opciones. La sesión conserva las opciones elegidas para
construir la autopsia; el alcance simulado se deriva en servidor y no se
publica externamente.

## game_sessions

| Campo lógico | Regla |
|---|---|
| sessionId | opaco, aleatorio y no predecible |
| gameCode | inmutable durante el ciclo de vida |
| alias | normalizado y con finalidad documentada |
| status | intro, active, processing, feedback, expired, finished o invalid |
| startedAt | instante autoritativo |
| expiresAt | aplica a sesión y a Feed 60” según contrato |
| lastActivityAt | usado solo para retención/expiración aprobada |
| finishedAt | solo en estado terminal |
| resultAccessUntil | terminal + 30 días; después no se expone el resultado propio |

Una sesión de un juego nunca se reutiliza para otro gameCode.

## session_items

| Campo lógico | Regla |
|---|---|
| sessionItemId | identificador interno |
| sessionId | relación con una sesión |
| itemId | debe pertenecer al juego y versión asignados |
| position | progreso autoritativo |
| status | pending, processing, answered, expired |
| answeredAt | se fija una sola vez |

El cliente no puede elegir position, itemId siguiente ni status.

## player_answers

| Campo lógico | Regla |
|---|---|
| answerId | identificador interno |
| sessionItemId | una aceptación por item |
| inputPayload | entrada validada y discriminada |
| acceptedAt | instante del servidor |
| evaluation | resultado interno no expuesto antes de responder |
| feedbackSnapshot | contenido devuelto después de aceptación |
| idempotencyKey | derivada de sesión, item y operación segura |

Una repetición idéntica devuelve el feedback existente. Una entrada diferente
después de aceptar produce ANSWER_ALREADY_ACCEPTED.

## game_result

| Campo lógico | Regla |
|---|---|
| resultId | uno por sesión |
| sessionId | único |
| gameCode | coincide con la sesión |
| status | finished o expired |
| answered | contador de respuestas aceptadas |
| total | total asignado |
| points | puntuación calculada por el servidor |
| maxPoints | máximo de la escala del juego |
| correct | aciertos, o null si la mecánica no tiene clasificación binaria |
| errors | errores evaluados |
| bonusPoints | bonos autorizados |
| penaltyPoints | penalizaciones autorizadas |
| timeLimitSeconds | límite aplicable, o null |
| timeUsedSeconds | tiempo usado, o null |
| completedAt | instante autoritativo de cierre del resultado |
| learningSummary | resumen educativo |
| rankingScore | porcentaje normalizado para la lectura global; no reemplaza points |
| leaderboardEligible | indica si el resultado puede aparecer en el ranking |

Los valores de score se calculan con scoring-proposal.md y se incluyen en el
resultado final. rankingScore se calcula después, solo en servidor, como
`clamp(round(points / maxPoints * 100), 0, 100)` para la lectura global. Si
`maxPoints <= 0`, el resultado no es elegible y no recibe rankingScore público.
El cliente solo puede presentar la proyección recibida.

## Ranking global secundario

El ranking conserva el alcance global previsto en la línea base y se obtiene
desde resultados finales, no desde respuestas parciales:

- un resultado por sesión;
- solo resultados con `status = finished`, `answered = total` y `total > 0`;
- se excluyen estados expired/invalid, sesiones incompletas, alias no permitido,
  marcas de abuso o invalidez y resultados con `maxPoints <= 0`;
- `points` debe ser finito y respetar `0 <= points <= maxPoints`;
- orden rankingScore descendente;
- desempate estable por `completedAt` ascendente y `resultId` ascendente;
- máximo de diez entradas;
- alias, gameCode, points, maxPoints, rankingScore y fecha de finalización
  autorizada;
- sin sessionId, respuestas ni solución privada.

La posición debe persistirse o materializarse en una proyección compatible con la
constitución, pero la tabla, snapshot o función concreta se decidirá al aprobar
el esquema físico. La interfaz lo presenta después del resultado o desde
navegación secundaria, nunca como bloque principal del landing. No cambia el
feedback ni el resultado propio.

## Estados y transiciones

    intro -> active
    active -> processing
    processing -> feedback
    feedback -> active
    feedback -> finished
    active -> expired
    expired -> result
    finished -> result

No hay transición de finished o expired a active. Un fallo de lectura no cambia
el estado persistido.

## Proyección pública

La proyección previa contiene:

- gameCode y mechanic;
- itemId opaco;
- prompt y contenido público;
- media segura;
- opciones permitidas;
- posición y total;
- remainingSeconds aproximado, solo para Feed 60”.

Excluye solución, regla, score, bonus, penalty, rank, secreto, fila privada y
item no asignado.

La proyección posterior añade:

- feedback;
- solución revelada del item ya aceptado;
- siguiente acción autorizada;
- progreso confirmado;
- score provisional solo cuando el servidor lo autorice.

El resultado final añade GameScore. El leaderboard expone únicamente su
proyección pública limitada y derivada.

## Seguridad y retención

- Todo identificador de sesión debe ser aleatorio y no predecible.
- Alias y respuestas se conservan solo con finalidad documentada y durante los
  plazos definidos abajo.
- Las soluciones y evaluaciones no se exponen por Data API pública.
- RLS, grants, índices y pruebas de acceso se definen en una migración futura.
- Estos plazos aplican al modelo arcade nuevo y no se heredan de single_choice.
- La lectura del ranking no permite enumerar sesiones ni alterar resultados.
- Un fallo del ranking no modifica la sesión ni bloquea feedback o resultado.

### Política de retención del MVP

| Entidad o campos | Finalidad | Retención | Acción posterior |
|---|---|---|---|
| game_sessions, session_items y player_answers | ejecutar la partida, recuperar estado e idempotencia | hasta 24 h después de `finished` o `expired` | eliminación en cascada; no conservar payloads de respuesta |
| game_result y alias normalizado | mostrar el resultado propio y derivar el ranking secundario | 30 días desde el cierre | eliminar resultado y alias; retirar antes cualquier entrada pública |
| leaderboard projection | lectura global secundaria de resultados elegibles | 30 días desde `completedAt` | purgar la proyección; nunca conservar `sessionId` ni respuestas |
| game_catalog, game_items, feedback y media aprobada | reproducibilidad editorial y aprendizaje | mientras la versión esté publicada o referenciada | archivar la versión sin datos de jugador |

La tarea de migración debe materializar estos plazos mediante columnas de cierre,
índices de purga y una política de eliminación documentada. Esa tarea continúa
separada de la implementación de las mecánicas y conserva la aprobación previa
de Supabase.

## Supabase local y migraciones

El checkout contiene 22 migraciones locales no versionadas y un seed no
versionado. Se mantienen sin editar como evidencia histórica. Antes de una
migración nueva se debe comparar cada objeto con este modelo, decidir si se
reemplaza o conserva y registrar la decisión en
supabase-reconciliation.md.

## Trazabilidad

| Requisito | Entidad o sección |
|---|---|
| FR-001 y FR-002 | game_catalog |
| FR-003 y FR-005 | game_sessions, session_items |
| FR-004 y FR-006 | variantes y proyección pública |
| FR-007 y FR-008 | player_answers, feedbackSnapshot |
| FR-009 y FR-010 | game_result y ranking derivado |
| FR-011 | timed_feed, expiresAt y estados |
| FR-012 | guided_autopsy |
| FR-013 y FR-014 | game_items, media y versiones |
| FR-017 y FR-018 | seguridad y retención |
| FR-019 | scoring-proposal.md y puerta de reconciliación |
