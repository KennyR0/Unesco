# Contrato de base de datos — Antídoto MVP

**Versión**: 1.0
**Estado**: obligatorio antes de implementar migraciones
**Autoridad funcional**: `spec.md`
**Detalle de entidades**: `../data-model.md`

## 1. Propósito

Este contrato define la frontera entre la aplicación Next.js y Supabase PostgreSQL.
Establece objetos permitidos, entradas, salidas, atomicidad, privilegios y pruebas de
acceso. No es una API pública para navegadores y no autoriza CRUD genérico.

Las palabras **DEBE**, **NO DEBE** y **PUEDE** tienen sentido normativo. Cualquier
cambio de tablas, estados, funciones, proyecciones o privilegios DEBE actualizar
primero este contrato, el modelo de datos y los contratos públicos afectados.

## 2. Frontera de confianza

```text
Cliente no confiable
  └─ formularios / navegación
      └─ Server Component o Server Action de Next.js
          ├─ valida datos externos con Zod
          ├─ resuelve cookie httpOnly
          ├─ calcula SHA-256 del token
          └─ cliente Supabase server-only
              └─ esquema api
                  └─ tablas private
```

Reglas:

1. El navegador NO DEBE recibir ni usar una clave de Supabase.
2. El navegador NO DEBE enviar un UUID de sesión como autoridad.
3. Next.js usa `SUPABASE_URL` y exactamente una clave privada:
   `SUPABASE_SECRET_KEY` o el fallback heredado
   `SUPABASE_SERVICE_ROLE_KEY`.
4. La clave privada solo se importa desde módulos marcados `server-only`.
5. La aplicación calcula SHA-256 del token y envía a la RPC su representación
   canónica como 64 caracteres hexadecimales minúsculos. La función valida la forma y
   la decodifica a los 32 bytes que compara/persiste; el token sin hash nunca se
   persiste, registra ni envía a Supabase.
6. Cada función ligada a sesión vuelve a verificar hash, estado, expiración y
   pertenencia. La posesión de una referencia pública de pregunta u opción no autoriza
   una operación.
7. Las salidas de PostgreSQL se validan antes de mapearse a los contratos públicos de
   `domain.ts`.
8. Los errores SQL, nombres físicos y detalles de restricciones nunca se envían a la
   interfaz.

## 3. Esquemas y objetos autorizados

### Esquema `private`

`private` NO se añade a los esquemas expuestos por Data API. Contiene:

| Objeto | Propósito | Escritura ordinaria |
|---|---|---|
| `private.mechanics` | Catálogo de mecánicas; solo `single_choice` activa. | Migración de datos aprobados; seed solo en local/Preview. |
| `private.questions` | Contenido, retroalimentación y solución protegida. | Migración de datos aprobados; seed solo en local/Preview. |
| `private.question_options` | Opciones ordenadas de cada pregunta. | Migración de datos aprobados; seed solo en local/Preview. |
| `private.game_sessions` | Estado, credencial hasheada, regla y resultado. | RPC aprobadas. |
| `private.session_questions` | Ronda y orden persistidos. | `start_game`, `submit_answer`, retención. |
| `private.player_answers` | Primera respuesta aceptada, corrección y puntos. | `submit_answer`, retención. |
| función privada de limpieza | Invalida y elimina según plazos. | Supabase Cron/rol propietario. |

No se permite incorporar otra tabla de resultados o ranking.

### Esquema `api`

`api` es el único esquema propio expuesto por Data API. La exposición no implica
acceso público: los grants se cierran explícitamente.

| Objeto | Clase | Consumidor permitido |
|---|---|---|
| `api.start_game` | función transaccional | Next.js con rol servidor |
| `api.get_game_state` | función de lectura segura | Next.js con rol servidor |
| `api.submit_answer` | función transaccional | Next.js con rol servidor |
| `api.advance_game` | función transaccional | Next.js con rol servidor |
| `api.finish_game` | función transaccional e idempotente | Next.js con rol servidor |
| `api.get_game_result` | función de lectura segura | Next.js con rol servidor |
| `api.get_leaderboard` | función de lectura segura y consistente | Next.js con rol servidor |

No se crean endpoints REST propios, funciones de administración ni operaciones CRUD
por entidad. Estos objetos son la fachada de infraestructura que consumen los casos
de uso internos.

## 4. Contrato físico mínimo

### Claves y relaciones

| Tabla | Clave primaria | Relaciones y unicidad obligatorias |
|---|---|---|
| `mechanics` | `code` | Código estable y único. |
| `questions` | `id` UUID | Referencia pública única; FK a mecánica; FK opcional a versión anterior; solución propia mediante FK compuesta diferible. |
| `question_options` | `id` UUID | Referencia pública única; FK a pregunta; `UNIQUE(question_id, position)`; `UNIQUE(question_id, id)`. |
| `game_sessions` | `id` UUID | hash de token único cuando no sea nulo; alias no único. |
| `session_questions` | `id` UUID | FK a sesión y pregunta; `UNIQUE(session_id, position)`; `UNIQUE(session_id, question_id)`; terna única para FK. |
| `player_answers` | `id` UUID | `UNIQUE(session_question_id)`; FK compuesta a asignación; FK compuesta de opción a pregunta. |

La solución se representa con:

```text
(questions.id, questions.correct_option_id)
  → (question_options.question_id, question_options.id)
```

Esta FK es diferible e inicialmente diferida. Permite construir un borrador y sus
opciones dentro de una transacción, pero hace imposible confirmar una solución que
pertenezca a otra pregunta.

### Restricciones obligatorias

- pregunta publicada: mecánica activa `single_choice`, 2–4 opciones, una solución
  propia, explicación, al menos una señal y recomendación;
- pregunta y opción: `public_ref` Base64URL único de exactamente 22 caracteres,
  generado desde 16 bytes aleatorios, inmutable y sin autoridad de sesión;
- metadatos de imagen completos o todos nulos; ruta local, formato permitido,
  dimensiones positivas, objetivo recomendado de 300000 bytes y máximo absoluto de
  1000000 bytes por archivo;
- tamaño de ronda: `RoundSize` es un entero entre 1 y 10. La única configuración en
  ejecución es `GAME_ROUND_SIZE`, validada por el contrato TypeScript/Zod; Production
  la fija en 5. La entrada RPC y `game_sessions.total_questions` repiten ese rango como
  defensa y la sesión persistida es la fuente histórica para progreso, resultado y
  puntuación máxima;
- ronda: antes de purgar detalle, cantidad exacta del `RoundSize` persistido, posiciones continuas
  y preguntas no repetidas; después de `details_purged_at`, cero asignaciones y cero
  respuestas;
- respuesta: asignación única, opción perteneciente a la pregunta, corrección y
  puntos derivados en servidor;
- sesión con detalle: estados y fechas coherentes y cursor dentro de rango; si está
  activa, expiración a 24 horas desde la última actividad confirmada;
- resultado: solo para sesión finalizada, no negativo, no mayor al máximo y coherente
  con respuestas al finalizar; después de purgar detalle permanece congelado y
  coherente con sus totales/versiones retenidos;
- filas publicadas, respuestas y resultados definitivos: inmutables salvo limpieza
  de privacidad.

Las reglas entre varias filas se verifican en las funciones transaccionales y mediante
`CONSTRAINT TRIGGER DEFERRABLE INITIALLY DEFERRED` sobre las tablas que pueden
alterarlas. Los `CHECK` se reservan para una sola fila; no se pretende hacerlos
diferibles. La pertenencia de solución usa además la FK compuesta diferible nativa.
No se confía solamente en la validación de TypeScript o del seed.

Familias contractuales de constraint triggers. PostgreSQL instala cada trigger sobre
una sola tabla; por ello cada familia comparte una función de validación, pero crea
un trigger diferible por tabla origen:

| Familia | Triggers instalados | Garantía al confirmar |
|---|---|---|
| `question_publication_complete` | uno en `questions` y otro en `question_options` | Una publicada tiene 2–4 opciones, solución propia y contenido completo. |
| `game_session_round_complete` | uno en `game_sessions` y otro en `session_questions` | Una sesión con detalle tiene cantidad y posiciones exactas; una purgada tiene cero asignaciones. |
| `session_answer_consistent` | uno en `session_questions` y otro en `player_answers` | `pending` tiene cero respuestas y `answered` exactamente una, con fechas coherentes. |
| `game_session_result_consistent` | uno en `game_sessions` y otro en `player_answers` | Al confirmar `finished`, aciertos y puntuación coinciden exactamente con el conteo de respuestas correctas y la suma de puntos; tras la purga, el resumen ya validado permanece congelado. |

También existen dos guardas inmediatas, no diferibles:

| Guarda | Momento | Garantía |
|---|---|---|
| `game_session_transition_guard` | `BEFORE INSERT OR UPDATE OR DELETE` en `game_sessions` | Impide reabrir estados terminales, cambiar regla/tamaño después de crear, crear puntuaciones manuales o modificar un resultado; solo permite la transición válida a `finished`/`invalidated`. |
| `player_answer_integrity_guard` | `BEFORE INSERT OR UPDATE OR DELETE` en `player_answers` | En inserción deriva y compara `is_correct` y `points_awarded` con solución/regla privadas; rechaza sesiones terminales o vencidas; prohíbe toda actualización. |

Estas guardas se ejecutan aunque el actor sea `service_role`. La única excepción
corresponde a eliminaciones y anulaciones de campos de privacidad enumeradas en la
función privada de retención. Se reconoce por el rol propietario/Cron de esa función,
no por un parámetro, claim o bandera de sesión que `service_role` pudiera simular. La
excepción nunca permite cambiar `status` a un estado anterior, recalcular un resultado
ni alterar la regla de puntuación.

### Índices obligatorios

- preguntas elegibles por estado y mecánica;
- referencias públicas únicas de preguntas y opciones;
- opciones por pregunta y posición mediante su restricción única;
- hash de sesión único parcial;
- sesiones activas por expiración;
- sesiones finalizadas por
  `(final_score DESC, finished_at ASC, id ASC)`;
- sesiones por fechas de purga y retiro;
- asignaciones por sesión/posición y sesión/pregunta mediante restricciones únicas;
- asignaciones por `question_id` para mantenimiento de su FK;
- respuestas por asignación única, por sesión/fecha de respuesta y por
  `(question_id, selected_option_id)` para la FK de opción.

No se añaden índices para consultas no enumeradas en este MVP.

## 5. Contrato de credencial anónima

### Creación

Next.js DEBE:

1. generar 32 bytes criptográficamente aleatorios;
2. codificarlos Base64URL sin padding para una cookie de exactamente 43 caracteres
   `[A-Za-z0-9_-]`, cuya forma se valida antes de calcular el hash;
3. calcular SHA-256 y codificar el resultado como 64 caracteres hexadecimales
   minúsculos;
4. enviar únicamente ese texto canónico a `api.start_game`, que lo decodifica a
   `bytea`;
5. escribir la cookie `antidoto_session` solo después de que la transacción confirme
   la ronda completa, usando el `session_expires_at` devuelto por la base como
   expiración autoritativa.

La cookie usa `httpOnly`, `sameSite=lax`, `path=/` y `secure` fuera de HTTP local.
Su `expires` coincide con `session_expires_at`; el `maxAge` se calcula como los
segundos restantes, acotado entre cero y 86400, para no extender en Next.js una
vigencia que PostgreSQL no haya renovado.

### Resolución

- Las funciones reciben `session_token_hash_hex`, validan exactamente
  `[0-9a-f]{64}` y lo decodifican; nunca reciben `session_id` procedente del cliente.
- Una referencia pública opaca de asignación lógica, pregunta u opción solo identifica
  el recurso esperado dentro de la sesión; nunca se acepta una PK o UUID de tabla como
  entrada externa.
- Un hash inexistente produce `SESSION_NOT_FOUND`.
- Una lectura con hash de sesión activa vencida proyecta `SESSION_INVALID` sin
  modificar la fila.
- Una operación de escritura con hash de sesión activa vencida materializa
  `invalidated` atómicamente y devuelve una salida interna etiquetada
  `SESSION_INVALID` después de confirmar.
- Una sesión finalizada se reconoce como tal; nunca se reabre.
- La actividad y `expires_at` de base solo se renuevan si `start_game` confirma o
  `submit_answer` acepta por primera vez una respuesta.
- Tras una respuesta aceptada por primera vez, Next.js emite la cookie actualizada
  hasta el nuevo `session_expires_at`. Únicamente al recuperar idempotentemente
  `submit_answer`, Next.js puede **reemitir** esa cookie con el tiempo restante hasta
  el mismo instante; el replay no prolonga la sesión.
- Al finalizar, `finish_game` fija y devuelve internamente
  `result_access_until = finished_at + 7 días`. Next.js sincroniza la cookie una sola
  vez hasta ese instante, con máximo 604800 segundos; repetir la finalización devuelve
  el mismo corte y no lo prolonga.
- `get_game_state` y `get_game_result` son lecturas puras: no cambian estado,
  `invalidated_at`, actividad, expiración ni ninguna otra fila.
- `advance_game`, `finish_game`, errores y reintentos que solo recuperan información
  NO renuevan la vigencia. Como operaciones de escritura, las dos primeras sí deben
  materializar atómicamente una sesión activa vencida antes de devolver
  `SESSION_INVALID`.

## 6. Operaciones de la fachada

Las firmas siguientes son contractuales y conceptuales. La migración puede usar
parámetros PostgreSQL equivalentes, pero NO DEBE alterar semántica, campos o
privilegios sin actualizar este documento.

Todas las funciones:

- son `SECURITY INVOKER`;
- fijan `search_path` vacío;
- califican cada objeto con su esquema;
- devuelven columnas explícitas, nunca tipos de fila privados ni `SELECT *`;
- revocan `EXECUTE` a `PUBLIC`, `anon` y `authenticated`;
- conceden `EXECUTE` únicamente a `service_role`;
- usan el reloj de PostgreSQL como autoridad temporal.

### 6.1 `api.start_game`

**Propósito**
Crear una sesión utilizable y asignar su ronda completa en una transacción.

**Asociación**
No requiere sesión previa. El token lo genera Next.js; el alias no funciona como
credencial.

**Entrada interna**

| Campo | Regla |
|---|---|
| `alias` | Valor ya normalizado, validado y moderado por el caso de uso servidor; la función repite defensas estructurales de vacío, longitud y forma canónica. |
| `session_token_hash_hex` | Exactamente 64 caracteres hexadecimales minúsculos; al decodificar, sus 32 bytes no deben existir en otra sesión. |
| `round_size` | `RoundSize` validado: entero 1–10 tomado de `GAME_ROUND_SIZE`; Production usa 5. Nunca procede de un campo editable por el jugador. |

**Proceso atómico**

1. valida alias, hash y `RoundSize`, repitiendo en SQL el rango 1–10;
2. comprueba que existan suficientes preguntas completas y publicadas;
3. crea una sesión `started`, con regla `single-choice-100-v1`, 100/0 y expiración a 24 horas;
4. selecciona sin repetición y persiste el orden pseudoaleatorio;
5. confirma cantidad y posiciones continuas;
6. devuelve éxito únicamente si todo quedó utilizable.

**Salida interna permitida**

- estado de sesión;
- alias;
- progreso `1 / round_size`;
- `session_expires_at`, instante UTC interno usado para fijar la expiración de cookie;
- indicador de creación confirmada.

No retorna solución, hash, UUID interno de sesión ni la ronda completa.

**Errores contractuales**

- `INVALID_ALIAS`;
- `BLOCKED_ALIAS` antes de invocar la función, desde la moderación del caso de uso;
- `QUESTIONS_UNAVAILABLE`;
- `GAME_START_FAILED` para un fallo interno recuperable, sin exponer SQL.

**Idempotencia**

- Dos inicios explícitos con tokens distintos crean sesiones distintas, como exige
  “volver a jugar”.
- Un reintento de infraestructura con el mismo hash devuelve la sesión ya confirmada
  si alias y ronda coinciden y la sesión continúa vigente; nunca crea una segunda
  fila para ese hash. Si esa sesión activa ya venció, bloquea y materializa
  `invalidated` con la misma salida interna etiquetada `SESSION_INVALID` usada por las
  demás escrituras.
- Una transacción fallida no deja cookie ni sesión parcial utilizable.

**Seguridad**

- no acepta puntuación, estado, identificador de sesión ni lista de preguntas;
- la selección y el orden son exclusivos del servidor;
- el alias se guarda como texto canónico, no HTML.

### 6.2 `api.get_game_state`

**Propósito**
Recuperar el último estado confirmado después de navegación o recarga.

**Asociación**
Hash derivado exclusivamente de la cookie `httpOnly`.

**Entrada interna**

- `session_token_hash_hex`.

**Salida discriminada**

1. **Pregunta pendiente**
   - alias;
   - estado;
   - referencia pública opaca de pregunta;
   - mecánica `single_choice`;
   - enunciado;
   - metadatos visuales permitidos;
   - opciones con `public_ref`, texto y orden;
   - posición y total.
2. **Respuesta confirmada**
   - alias, estado y progreso;
   - la misma pregunta pública actual, con sus referencias, enunciado, imagen y
     opciones;
   - opción seleccionada;
   - corrección;
   - puntos otorgados;
   - opción correcta solo cuando el contrato de retroalimentación lo requiere;
   - explicación, señales y recomendación;
   - indicador `can_advance` o `can_finish`.
3. **Finalizada**
   - alias, puntuación, aciertos, total y versión/valores de puntuación;
   - fecha de finalización solo para el adaptador;
   - indicador terminal; la aplicación calcula `maxScore`, añade el literal
     `MVP_EDUCATIONAL_CLOSING_MESSAGE` y construye `FinishedGameState` sin reabrir la
     partida.

La variante pendiente NO contiene `correct_option_id`, `is_correct` por opción, regla
privada ni metadatos equivalentes.

**Errores contractuales**

- `SESSION_NOT_FOUND`;
- `SESSION_INVALID` si está vencida, invalidada o la ronda persistida no puede
  reconciliarse;
- errores internos mapeados sin detalles.

**Idempotencia**

Lectura idempotente y estrictamente pura. No ejecuta `INSERT`, `UPDATE`, `DELETE` ni
funciones con efectos; no cambia `status`, `invalidated_at`, `last_activity_at`,
`expires_at`, cursor o detalle. Si `expires_at <= now()` para una sesión
`started`/`in_progress`, devuelve la variante de error `SESSION_INVALID` como
proyección de lectura y deja la materialización a una mutación posterior o a la
rutina de retención. Una finalizada conserva su estado. La función se declara
`STABLE`; la verificación inspecciona `pg_proc.provolatile = 's'` además de comparar
las filas antes y después.

### 6.3 `api.submit_answer`

**Propósito**
Aceptar como máximo una selección para la asignación actual, evaluar y devolver
retroalimentación educativa.

**Asociación**
Hash de cookie; las referencias públicas se resuelven y validan dentro de esa sesión.

**Entrada interna**

| Campo | Regla |
|---|---|
| `session_token_hash_hex` | Resuelto por servidor, validado y decodificado dentro de la función. |
| `question_ref` | Referencia pública de la pregunta de `current_position`; la función resuelve su asignación dentro de la sesión. |
| `option_ref` | Referencia pública obligatoria de una opción; debe pertenecer a la pregunta asignada. |

No admite `is_correct`, opción correcta, puntos, estado ni puntuación.

**Orden de bloqueo**

1. fila de `game_sessions`;
2. fila de `session_questions`.

Todas las funciones de escritura respetan este orden para evitar interbloqueos.

**Proceso atómico**

1. resuelve y bloquea sesión;
2. comprueba el vencimiento antes de cualquier cambio de juego; si venció, fija
   `invalidated`, `invalidated_at` al valor previo de `expires_at`, anula
   `expires_at`, deriva la purga desde ese instante y devuelve una salida interna
   etiquetada `SESSION_INVALID`;
3. exige estado `started` o `in_progress`;
4. valida asignación, cursor y estado `pending`;
5. valida pertenencia de la opción;
6. lee la solución únicamente dentro de `private`;
7. calcula corrección y puntos con la regla de sesión;
8. inserta `player_answers`;
9. cambia la asignación a `answered`;
10. cambia `started` a `in_progress` si corresponde;
11. actualiza `last_activity_at` y `expires_at`;
12. devuelve retroalimentación.

`current_position` NO cambia en esta operación.

La salida etiquetada del paso 2 es un resultado normal de la función y no una
excepción SQL. El adaptador solo la mapea al error contractual después del commit;
por tanto, la transición de invalidación no se revierte al comunicar el rechazo.

**Salida permitida**

- referencias públicas necesarias para reconciliar;
- `accepted_new`, booleano interno que indica si la función insertó la primera
  respuesta y renovó la actividad en base;
- `session_expires_at`, instante UTC interno con la vigencia persistida, tanto en
  primera aceptación como en recuperación idempotente;
- selección aceptada;
- correcto/incorrecto;
- puntos de esa respuesta;
- opción correcta si la selección fue incorrecta;
- explicación educativa;
- una o más señales;
- recomendación;
- progreso;
- posibilidad de continuar o finalizar.

**Errores contractuales**

- `OPTION_NOT_SELECTED`;
- `SESSION_NOT_FOUND`;
- `SESSION_INVALID`;
- `SESSION_FINISHED`;
- `QUESTION_NOT_ASSIGNED`;
- `QUESTION_ALREADY_ANSWERED`;
- `OPTION_NOT_ALLOWED`;
- `ANSWER_SAVE_FAILED`.

**Idempotencia y concurrencia**

- `UNIQUE(session_question_id)` resuelve dos inserciones concurrentes.
- Si un reintento se refiere a la asignación actual ya respondida, la función devuelve
  la respuesta canónica y no evalúa de nuevo la nueva selección.
- Si intenta modificar una asignación anterior, devuelve
  `QUESTION_ALREADY_ANSWERED`.
- Un reintento que solo recupera la respuesta existente no cambia la expiración en
  base.
- En ese reintento `accepted_new = false`; en la primera inserción confirmada es
  `true`.
- La RPC devuelve el `session_expires_at` persistido en ambos casos. Next.js elimina
  `accepted_new` y `session_expires_at` del `AnswerResult` público. Si
  `accepted_new = true`, emite la cookie actualizada; solo si `accepted_new = false`
  por replay idempotente la **reemite** hasta el mismo instante. Así, si la primera
  respuesta se confirmó y su HTTP `Set-Cookie` se perdió, el reintento recupera la
  vigencia restante sin renovar nuevamente la actividad.
- Nunca existen dos filas, dos conjuntos de puntos ni dos retroalimentaciones
  autoritativas.

**Seguridad**

- la solución se consulta después de asociar sesión, asignación y opción;
- ninguna comparación de corrección ocurre en el navegador;
- una opción de otra pregunta falla por validación y FK compuesta;
- una asignación de otra sesión falla aunque su UUID sea válido.

### 6.4 `api.advance_game`

**Propósito**
Registrar la decisión de dejar la retroalimentación y mostrar la pregunta siguiente.

**Asociación**
Hash de cookie.

**Entrada interna**

- `session_token_hash_hex`.

**Reglas**

- bloquea la sesión y comprueba el vencimiento antes de cambiar el cursor;
- si la sesión activa venció, materializa `invalidated` con
  `invalidated_at = expires_at`, anula `expires_at` y devuelve el resultado interno
  etiquetado `SESSION_INVALID` después de confirmar, sin avanzar;
- la asignación de `current_position` debe estar respondida;
- si no es la última, incrementa exactamente una posición;
- la nueva posición debe estar `pending`;
- si es la última, no incrementa y devuelve `ADVANCE_NOT_ALLOWED`; la
  retroalimentación ya indicó `nextAction = "finish"`;
- avanzar no cambia respuestas ni renueva la vigencia.

**Salida permitida**

- estado público de la pregunta siguiente.

**Errores contractuales**

- `SESSION_NOT_FOUND`;
- `SESSION_INVALID`;
- `SESSION_FINISHED`;
- `QUESTION_NOT_ASSIGNED`;
- `ADVANCE_NOT_ALLOWED` cuando la asignación actual sigue pendiente o ya no existe
  una siguiente posición.

**Idempotencia**

La primera llamada válida incrementa una posición. Un reintento encuentra la nueva
asignación `pending` y devuelve `ADVANCE_NOT_ALLOWED`; nunca incrementa dos veces ni
salta una pregunta. La misma respuesta se usa si se llama desde la última
retroalimentación. La condición se decide dentro del mismo bloqueo de sesión.

### 6.5 `api.finish_game`

**Propósito**
Calcular y persistir el único resultado definitivo después de todas las respuestas.

**Asociación**
Hash de cookie.

**Entrada interna**

- `session_token_hash_hex`.

No recibe alias, puntuación, número de aciertos, total, fecha ni posición.

**Proceso atómico**

1. bloquea la sesión;
2. si está `finished`, devuelve el resultado existente;
3. rechaza si está ausente o invalidada; si está activa y vencida, materializa
   `invalidated` con `invalidated_at = expires_at`, anula `expires_at`, programa la
   purga desde ese instante y devuelve una salida interna etiquetada
   `SESSION_INVALID` después de confirmar;
4. exige exactamente una respuesta por cada asignación;
5. calcula aciertos y suma puntos desde `player_answers`;
6. valida límites contra la regla guardada;
7. fija `finished`, resultado, `finished_at` y
   `result_access_until = finished_at + 7 días` una sola vez;
8. programa la purga de detalle.

**Salida permitida**

- alias;
- puntuación definitiva;
- respuestas correctas;
- total;
- código de regla aplicada;
- fecha de finalización;
- `result_access_until`, solo como metadato interno para sincronizar la cookie;
- posición global calculada, si está disponible.

La aplicación omite fecha/posición cuando construye `FinalResult`, calcula
`maxScore` con los valores guardados y añade la constante contractual
`MVP_EDUCATIONAL_CLOSING_MESSAGE`.

**Errores contractuales**

- `SESSION_NOT_FOUND`;
- `SESSION_INVALID`;
- `GAME_NOT_COMPLETE`;
- `GAME_FINISH_FAILED`.

**Idempotencia**

Las llamadas posteriores devuelven exactamente el resultado persistido. No actualizan
`finished_at` ni `result_access_until`, no recalculan desde preguntas y no crean una
fila de ranking.

**Seguridad**

- el cliente no aporta ningún dato de resultado;
- una sesión incompleta o invalidada nunca se vuelve elegible para ranking;
- la finalización no modifica ni elimina respuestas antes de la ventana de retención.

### 6.6 `api.get_game_result`

**Propósito**
Recuperar el resultado final asociado a la cookie.

**Asociación**
Hash de cookie.

**Entrada interna**

- `session_token_hash_hex`.

**Salida permitida**

- alias;
- puntuación;
- respuestas correctas;
- total;
- regla aplicada;
- `finished_at`.

No retorna UUID de sesión, hash, respuestas detalladas ni soluciones.
El adaptador construye el mismo `FinalResult` que `finish_game`: deriva `maxScore`,
omite la fecha y añade la misma constante educativa.

**Comportamiento por estado**

- `finished`: devuelve el resultado;
- `finished` con `result_access_until <= now()`: `RESULT_ACCESS_EXPIRED` sin
  modificar la fila;
- `started` o `in_progress` todavía vigentes: `RESULT_NOT_AVAILABLE`, para que la
  aplicación regrese a `/play`;
- `started` o `in_progress` con `expires_at <= now()`: proyecta `SESSION_INVALID`
  sin modificar estado ni fechas;
- `invalidated` o inexistente: error no recuperable para esa partida. La expiración
  de juego no transforma una sesión `finished`.

**Errores contractuales**

- `SESSION_NOT_FOUND`;
- `SESSION_INVALID`;
- `RESULT_NOT_AVAILABLE`;
- `RESULT_ACCESS_EXPIRED`;
- fallo interno mapeado a `UNEXPECTED_ERROR` sin exponer detalles.

**Idempotencia**

Lectura idempotente y estrictamente pura; no ejecuta `INSERT`, `UPDATE`, `DELETE` ni
funciones con efectos, y no renueva cookie, estado, `invalidated_at`, actividad,
expiración, sesión ni fechas. La función se declara `STABLE`; la verificación exige
`pg_proc.provolatile = 's'` y ausencia de cambios persistidos.

### 6.7 `api.get_leaderboard`

**Propósito**
Proporcionar, en una sola instantánea, el top global y la posición de la sesión actual
cuando corresponda.

**Definición**

- función de lectura `SECURITY INVOKER`, `STABLE`, con `search_path = ''`;
- fuente exclusiva: `private.game_sessions`;
- filtro: `status = 'finished'` y resultado completo;
- una fila por PK de sesión;
- posición mediante puntuación descendente, `finished_at` ascendente e UUID ascendente;
- UUID usado como desempate e identidad interna, pero ausente del JSON proyectado;
- una única sentencia SQL con CTE ordenada calcula top, pertenencia y posición bajo la
  misma instantánea de PostgreSQL.

**Entrada interna**

- `session_token_hash_hex`, opcional. Si la cookie falta o su forma no es válida, el
  adaptador invoca con nulo. Un hash desconocido o una sesión no finalizada produce
  ranking público sin `currentPlayerEntry`; nunca bloquea la lista.

**Salida exacta**

| Campo | Exposición |
|---|---|
| `entries` | Arreglo de cero a diez filas con `position`, `alias`, `score` e `isCurrentPlayer`. |
| `currentPlayerEntry` | La misma forma, solo para la sesión actual fuera del top diez; nulo en los demás casos. |

No retorna token, hash, UUID, fecha, aciertos, respuestas, opciones, preguntas ni
soluciones. `finished_at` solo participa dentro de la sentencia para ordenar.

**Consistencia**

- La función marca `isCurrentPlayer` al comparar el UUID interno de cada fila con la
  sesión resuelta por hash antes de proyectar el JSON.
- Si esa sesión está en el top, solo esa fila queda marcada y
  `currentPlayerEntry = null`.
- Si queda fuera, todas las filas del top quedan sin marca y aparece una sola
  `currentPlayerEntry` con posición mayor que diez.
- Una partida que finaliza en paralelo solo puede aparecer o no aparecer dentro de la
  instantánea completa; no puede desplazar la posición entre dos consultas.
- No se exige socket, suscripción ni materialización.
- Un fallo se mapea a `RANKING_UNAVAILABLE` y no bloquea inicio o juego.
- Una lista sin filas es un resultado válido, no un error.

## 7. Atomicidad e invariantes transaccionales

### Límites transaccionales

| Operación | Filas que deben confirmarse juntas |
|---|---|
| Inicio | sesión + `RoundSize` asignaciones completas |
| Respuesta | respuesta + estado de asignación + estado/actividad de sesión |
| Avance | comprobación de respuesta + cursor |
| Finalización | comprobación de totalidad + aciertos + puntuación + estado/fecha final |
| Invalidación durante escritura | estado terminal + `invalidated_at = expires_at` previo + anulación de expiración + fecha de purga + salida interna etiquetada |
| Limpieza | materialización de abandono o eliminación de detalle + retiro de credencial o eliminación terminal |

No se implementan estas operaciones mediante secuencias independientes de
`.insert().update()` desde Next.js.

### Reglas frente a carreras

- bloquear siempre sesión antes de asignación;
- mantener transacciones cortas y sin red ni I/O externo;
- usar unicidad de asignación respondida como última defensa;
- tratar violación única por carrera como reconciliación, no como segunda respuesta;
- calcular resultado después de bloquear la sesión;
- no actualizar una fila terminal, excepto campos de retención mediante la función
  privada;
- comunicar una invalidación materializada mediante una salida interna etiquetada,
  nunca mediante una excepción que revierta la transacción;
- ejecutar `game_session_transition_guard`, `player_answer_integrity_guard` y
  `game_session_result_consistent` también ante DML directo del rol servidor.

## 8. Grants, RLS y Data API

### Configuración obligatoria

1. En `supabase/config.toml`, la clave real `schemas = [...]` dentro de la sección
   `[api]` —`api.schemas` en el modelo de configuración de la CLI— incluye `api` y no
   incluye `private`.
2. `api` es el único esquema propio expuesto; `private` permanece fuera de Data API.
3. RLS se habilita en las seis tablas de `private`.
4. No se crean políticas permisivas para `anon` o `authenticated`.
5. Se revoca a `PUBLIC`, `anon` y `authenticated`:
   - `USAGE` de `private` y `api`;
   - todo privilegio sobre sus tablas y secuencias;
   - `EXECUTE` de funciones privadas y `api`.
6. Los privilegios predeterminados de futuros objetos quedan revocados.
   Cada sentencia `ALTER DEFAULT PRIVILEGES` identifica expresamente el rol de
   migración propietario y el esquema (`private` o `api`) al que aplica.
7. `service_role` recibe `USAGE` sobre `api` y `private`, solo los privilegios
   subyacentes requeridos por las funciones `SECURITY INVOKER`, `EXECUTE` sobre esas
   funciones y `SELECT` sobre las tablas privadas estrictamente necesarias. No recibe
   ejecución de limpieza.
8. La función de limpieza solo es ejecutable por el propietario/rol usado por
   Supabase Cron; no por la aplicación ni por roles públicos. `service_role` no recibe
   membresía, capacidad de `SET ROLE` hacia ese ejecutor ni un camino alternativo para
   activar su excepción.
9. Cada migración vuelve a declarar grants del objeto que crea; no depende de
   privilegios históricos de un proyecto.

La clave secreta usa un rol con capacidad de omitir RLS. Por tanto:

- RLS es una segunda barrera contra exposición accidental;
- el control principal de sesión es el hash validado en cada RPC;
- la aplicación no usa operaciones directas sobre tablas aunque el rol técnico tenga
  privilegios subyacentes requeridos por `SECURITY INVOKER`;
- las guardas y constraint triggers SQL son la última defensa contra estados
  terminales reabiertos, respuestas mutadas, corrección/puntos falsificados o
  puntuaciones inconsistentes, incluso cuando `service_role` omita RLS;
- la excepción de retención solo reconoce al rol propietario/Cron y no es ejecutable
  ni simulable por `service_role`.

### Matriz de permisos

| Actor/rol | Tablas `private` | RPC `api`, incluido ranking | Limpieza |
|---|---|---|---|
| Navegador | Sin conexión Supabase | No | No |
| `anon` | Denegado | Denegado | Denegado |
| `authenticated` | Denegado | Denegado | Denegado |
| Next.js con `service_role` | Privilegios mínimos subyacentes; acceso de aplicación solo por fachada | Permitido | Denegado |
| Propietario/Cron | Administración controlada | Según migración | Permitido |

El ranking sigue siendo público porque cualquier visitante puede solicitar la página
Next.js, no porque la base permita `SELECT` anónimo.

## 9. Proyecciones y datos prohibidos

### Antes de responder

Se puede devolver:

- `public_ref` de la pregunta asignada;
- mecánica;
- enunciado;
- imagen y alternativa;
- opciones con `public_ref`, texto y orden;
- progreso.

No se puede devolver:

- `correct_option_id`;
- booleanos o pesos de corrección por opción;
- `is_correct`;
- regla de evaluación interna;
- campos cuyo patrón identifique mecánicamente la solución;
- hash o UUID interno de sesión.

### Después de aceptar

Se añade únicamente la retroalimentación de la asignación ya respondida:

- selección aceptada;
- correcto/incorrecto;
- solución cuando corresponda;
- puntos;
- explicación, señales y recomendación.

La solución de preguntas futuras permanece protegida.

### Resultado y ranking

- resultado propio público: alias, totales, puntuación y regla; `finished_at` solo
  llega al adaptador para comprobar el hecho histórico y no entra en `FinalResult`;
- ranking público: posición, alias, puntuación e `isCurrentPlayer`; la fecha y el UUID
  solo ordenan/identifican dentro de PostgreSQL y no se retornan;
- nunca respuestas detalladas de otra sesión.

## 10. Retención y Supabase Cron

### Actividad y expiración

- durante el juego, `last_activity_at` cambia solo al crear la sesión o aceptar una
  respuesta nueva; la retención puede anularlo;
- en `started` o `in_progress`, `expires_at` equivale a esa actividad más 24 horas;
- para sesiones `started` o `in_progress`, `get_game_state` y `get_game_result`
  proyectan `SESSION_INVALID` cuando `expires_at <= now()` sin escribir ninguna fila;
- cada RPC de escritura ligada a sesión comprueba primero el vencimiento y, si
  corresponde, materializa en una sola transacción `invalidated`,
  `invalidated_at = expires_at` previo, `expires_at = null` y la fecha de purga
  derivada; devuelve una salida interna etiquetada que permite confirmar antes de
  mapear `SESSION_INVALID`;
- al finalizar o invalidar, `expires_at` pasa a nulo y el estado terminal no cambia
  por vencimiento;
- al finalizar, `result_access_until` se fija exactamente siete días después de
  `finished_at`; `get_game_result` devuelve `RESULT_ACCESS_EXPIRED` desde ese instante
  sin convertir la sesión en `invalidated`;
- el Cron programado invalida además sesiones activas abandonadas que no reciban otra
  llamada. Para ellas fija `invalidated_at` al `expires_at` vencido, no al instante en
  que Cron las encontró.

### Eliminación

La función privada idempotente, programada cada seis horas:

1. materializa sesiones activas abandonadas vencidas usando como
   `invalidated_at` el valor previo de `expires_at` y deriva desde allí
   `details_purge_after`; si esa fecha ya venció, puede eliminarlas en la misma
   transacción;
2. elimina sesiones invalidadas completas, con cascada a asignaciones y respuestas;
3. en sesiones finalizadas, elimina respuestas y asignaciones, anula cursor, inicio,
   última actividad y fecha pendiente de purga, y registra `details_purged_at`, pero
   conserva el hash hasta `result_access_until`;
4. elimina el hash de sesiones finalizadas cuando vence `result_access_until`; la
   lectura ya rechaza desde el instante exacto aunque Cron todavía no haya corrido;
5. conserva solo el resultado mínimo mientras el MVP esté público;
6. elimina resultados cuyo `ranking_retention_until` venció.

Las fechas se fijan para el primer ciclo de seis horas desde que se cumplen seis días,
dejando margen antes del límite de siete. Si el MVP se retira, una migración SQL
versionada y revisada, ejecutada por el propietario, fija
`ranking_retention_until` para los resultados retenidos; no existe función pública ni
acción de interfaz para hacerlo.

La tarea de Cron se instala mediante migración versionada. Es la única rutina que
puede usar la excepción documentada de las guardas terminales y de inmutabilidad; su
rol propietario/Cron no es `service_role`. Su verificación incluye:

- invocación directa con reloj/datos controlados en Supabase local;
- comprobación de cascadas;
- comprobación de que un resultado retenido sigue en ranking;
- comprobación de que el resultado desaparece al vencer el retiro;
- inspección de que el trabajo quedó programado en cada entorno;
- comprobación de la última ejecución satisfactoria en `cron.job_run_details`.

La función busca todas las filas vencidas, no solo las del ciclo actual, por lo que
una ejecución tardía recupera trabajo pendiente. Antes de la demostración, la última
ejecución correcta debe tener menos de seis horas. Mientras el MVP siga público, el
runbook operativo revisa `cron.job_run_details` con un intervalo máximo de seis horas.
Si alcanza seis horas sin éxito o el trabajo está deshabilitado, exige ejecutar de
inmediato la misma función idempotente con el rol propietario, corregir la
programación y volver a comprobar el resultado. Esa recuperación no amplía el plazo
contractual ni se presenta como una función del producto.

No se registran alias completos, token, hash, selección ni solución durante la
limpieza.

## 11. Mapeo de fallos

PostgreSQL puede usar estados internos o restricciones específicas, pero el adaptador
solo entrega códigos definidos en `errors.md`.

| Condición de base | Código contractual |
|---|---|
| Alias no válido | `INVALID_ALIAS` |
| Coincidencia de bloqueo | `BLOCKED_ALIAS` |
| Hash sin sesión | `SESSION_NOT_FOUND` |
| Sesión vencida o invalidada | `SESSION_INVALID` |
| Sesión terminal al intentar jugar | `SESSION_FINISHED` |
| Menos preguntas elegibles que la ronda | `QUESTIONS_UNAVAILABLE` |
| Fallo transaccional al iniciar | `GAME_START_FAILED` |
| Referencia enviada ajena, inexistente o fuera del cursor | `QUESTION_NOT_ASSIGNED` |
| Asignación ya respondida y no reconciliable como reintento | `QUESTION_ALREADY_ANSWERED` |
| Selección ausente | `OPTION_NOT_SELECTED` |
| Opción no perteneciente a la pregunta | `OPTION_NOT_ALLOWED` |
| Fallo no reconciliable al persistir | `ANSWER_SAVE_FAILED` |
| Estado actual no permite avanzar | `ADVANCE_NOT_ALLOWED` |
| Ronda incompleta al finalizar | `GAME_NOT_COMPLETE` |
| Fallo transaccional de finalización | `GAME_FINISH_FAILED` |
| Resultado solicitado antes de finalizar | `RESULT_NOT_AVAILABLE` |
| Fallo de lectura del ranking | `RANKING_UNAVAILABLE` |
| Fallo interno no clasificable | `UNEXPECTED_ERROR` |

Los mensajes públicos no incluyen SQLSTATE, nombre de función, tabla, restricción,
stack, URL, clave ni fragmentos de consulta.

## 12. Pruebas de acceso y consistencia

Cada migración o conjunto coherente de migraciones DEBE probar al menos un acceso
permitido y uno rechazado por control.

### Accesos permitidos

| ID | Preparación y acción | Resultado esperado |
|---|---|---|
| DB-ALLOW-001 | Con rol servidor, iniciar con alias válido, `RoundSize = 5` de Production y diez preguntas elegibles. | Una sesión y exactamente cinco asignaciones, sin ronda parcial. |
| DB-ALLOW-002 | Con hash hexadecimal correcto, leer estados pendiente, respondido, finalizado y activo vencido. | Cada variante valida contra `GameState`; ninguna solución futura se filtra y la lectura vencida devuelve `SESSION_INVALID` sin cambiar ninguna fila. |
| DB-ALLOW-003 | Responder con opción perteneciente a la asignación actual. | Una respuesta, puntos derivados, estado respondido y retroalimentación. |
| DB-ALLOW-004 | Repetir el mismo envío tras respuesta incierta. | Misma respuesta canónica y una sola fila. |
| DB-ALLOW-005 | Avanzar desde una asignación respondida y repetir la operación. | Una sola posición de avance, sin salto. |
| DB-ALLOW-006 | Finalizar cinco respuestas y repetir. | Un resultado idéntico y fecha estable. |
| DB-ALLOW-007 | Consultar ranking tras finalizar varias sesiones. | Solo finalizadas; orden  score/fecha/UUID; máximo diez al limitar. |
| DB-ALLOW-008 | Consultar ranking con una sesión finalizada fuera del top diez. | Posición propia correcta sin alterar el top. |
| DB-ALLOW-009 | Ejecutar limpieza con datos vencidos. | Detalle eliminado; hash/cursor/actividad nulos; resultado mínimo retenido o eliminado según plazo. |

### Accesos rechazados

| ID | Preparación y acción | Resultado esperado |
|---|---|---|
| DB-DENY-001 | `anon` intenta `SELECT` en cada tabla `private`. | Permiso denegado, incluso sin depender del filtro RLS. |
| DB-DENY-002 | `authenticated` intenta `SELECT`, `INSERT`, `UPDATE` o `DELETE`. | Permiso denegado. |
| DB-DENY-003 | `anon`/`authenticated` intenta ejecutar cada RPC, incluido el ranking. | Permiso denegado. |
| DB-DENY-004 | Hash A intenta responder asignación de sesión B. | `QUESTION_NOT_ASSIGNED`; ninguna escritura. |
| DB-DENY-005 | Se elige una opción de otra pregunta. | `OPTION_NOT_ALLOWED`; FK compuesta protege incluso ante defecto de RPC. |
| DB-DENY-006 | Dos transacciones responden simultáneamente la misma asignación. | Una fila; la otra recupera el resultado canónico. |
| DB-DENY-007 | Se intenta responder una sesión finalizada o invalidada. | Rechazo; resultado y respuestas sin cambios. |
| DB-DENY-008 | Con `service_role`, se intenta insertar por DML directo una respuesta con `is_correct` o `points_awarded` distintos de solución/regla. | `player_answer_integrity_guard` rechaza la sentencia; no hay respuesta ni cambio de sesión. |
| DB-DENY-009 | Se publica una pregunta sin 2–4 opciones, solución propia o retroalimentación. | La transacción no confirma. |
| DB-DENY-010 | Se intenta cambiar contenido/opciones de una pregunta publicada. | Rechazo por inmutabilidad. |
| DB-DENY-011 | Se intenta leer solución desde una salida pendiente o de ranking. | Campo ausente por proyección; acceso físico denegado. |
| DB-DENY-012 | Con `service_role`, se intenta modificar `finished_at`, puntuación, regla final, tamaño de ronda o reabrir una sesión terminal. | `game_session_transition_guard` rechaza la sentencia; la fila queda idéntica. |
| DB-DENY-013 | Se intenta jugar una sesión con más de 24 horas y también se consulta mediante ambas lecturas. | La escritura confirma la invalidación antes de devolver `SESSION_INVALID`; `get_game_state` y `get_game_result` devuelven `SESSION_INVALID` sin mutar estado ni fechas. |
| DB-DENY-014 | Se inspeccionan grants y privilegios predeterminados tras migrar. | Ningún objeto nuevo accesible a `PUBLIC`, `anon` o `authenticated`. |
| DB-DENY-015 | Se envía un hash que no contiene exactamente 64 caracteres hexadecimales minúsculos. | Rechazo antes de consultar sesión; no se registra el valor. |
| DB-DENY-016 | Con `service_role`, se intenta actualizar o eliminar una respuesta registrada. | `player_answer_integrity_guard` rechaza la sentencia; solo el rol propietario/Cron puede eliminarla durante retención. |
| DB-DENY-017 | Con `service_role`, se intenta finalizar mediante DML con aciertos o puntuación distintos del conteo/suma de respuestas. | `game_session_result_consistent` impide confirmar la transacción. |
| DB-DENY-018 | Con `service_role`, se intenta simular la excepción de retención mediante un parámetro o bandera de sesión. | La guarda compara el rol propietario/Cron y rechaza el DML. |

### Pruebas de ranking

- excluye `started`, `in_progress` e `invalidated`;
- excluye filas sin resultado coherente;
- resuelve empate por finalización anterior;
- resuelve empate exacto con UUID sin proyectarlo;
- representa cada sesión una sola vez;
- una finalización concurrente no puede mezclar el top de una instantánea con la
  posición propia de otra;
- el alias se devuelve como dato textual, nunca como HTML ejecutable;
- una tabla vacía devuelve lista vacía;
- el fallo de Supabase se mapea sin impedir iniciar una partida.

### Pruebas de retención

- expiración funcional exactamente después de 24 horas de actividad permitida;
- `get_game_state` y `get_game_result` no cambian `status`, `invalidated_at`,
  `last_activity_at`, `expires_at` ni ninguna tabla, incluso al observar una sesión
  vencida;
- avanzar no desplaza `expires_at`; si ya venció, confirma la invalidación sin
  cambiar el cursor;
- respuesta nueva sí lo desplaza;
- el replay idempotente de `submit_answer` devuelve el mismo `session_expires_at`, no
  desplaza la base y es el único caso que permite **reemitir** la cookie al tiempo
  restante;
- Cron materializa una sesión abandonada con `invalidated_at = expires_at` previo y
  la retención se calcula desde ese instante, incluso si el ciclo llegó tarde;
- sesión invalidada desaparece en el ciclo comprometido antes de siete días;
- detalle de finalizada desaparece y su ranking permanece;
- retiro del MVP elimina el mínimo dentro de siete días;
- la tarea Cron y la función privada no son ejecutables por roles públicos.

## 13. Verificación de migraciones

Antes de aplicar a Preview o Production:

1. restablecer Supabase local desde cero;
2. aplicar todas las migraciones en orden;
3. crear toda migración nueva mediante `supabase migration new <nombre>`;
4. aplicar la migración versionada de datos educativos aprobados y confirmar al menos
   diez preguntas publicadas;
5. solo en local/Preview, cargar `supabase/seed.sql` y comprobar que converge al mismo
   conjunto sin duplicados;
6. ejecutar las pruebas permitidas y rechazadas;
7. inspeccionar RLS, grants, privilegios predeterminados y esquemas expuestos;
8. confirmar que todas las funciones de `api` son `SECURITY INVOKER`, tienen
   `search_path` vacío y carecen de grants públicos;
9. confirmar que `api.get_leaderboard` produce top y posición propia en una sola
   sentencia/instantánea sin proyectar UUID;
10. confirmar la FK compuesta diferible de la solución;
11. confirmar las cuatro familias y los ocho constraint triggers diferibles, incluidos
    cambios originados desde cada una de sus tablas, y sus formas antes/después de
    purga;
12. confirmar las dos guardas inmediatas mediante DML directo con `service_role`;
13. comprobar que `get_game_state` y `get_game_result` no generan escrituras;
14. ejecutar carreras de respuesta y finalización;
15. probar limpieza, revisar `cron.job_run_details` y verificar la programación de
    Supabase Cron cada seis horas.

Production solo recibe migraciones ya verificadas en local y Preview mediante
`supabase db push`, sin `--include-seed`. `supabase/seed.sql` se usa únicamente en
local y Preview. El conjunto educativo de Production se inserta mediante una
migración de datos versionada creada por Supabase CLI.

La migración de datos es la referencia del conjunto aprobado y el seed reproduce sus
mismas claves lógicas y contenido. Ambos caminos deben producir el mismo checksum
determinista de mecánica, preguntas, opciones y retroalimentación. La inserción es
idempotente: una clave existente con contenido idéntico no genera otra fila y una
divergencia hace fallar la transacción, sin sobrescribir una pregunta publicada. El
contenido no depende de servicios ni imágenes remotas.

## 14. Trazabilidad

| Área contractual | Requisitos cubiertos |
|---|---|
| Inicio, alias y sesión opaca | FR-004–FR-012, FR-060–FR-062 |
| Asignación y proyección segura | FR-013–FR-020, FR-031 |
| Respuesta única y recuperación | FR-021–FR-025, FR-032–FR-036 |
| Retroalimentación estructurada | FR-026–FR-030 |
| Puntuación/finalización | FR-037–FR-043 |
| Consulta consistente y orden del ranking | FR-044–FR-050, FR-063 |
| Metadatos visuales | FR-016, FR-057 |
| Estados de error de datos | FR-058, FR-062 |
| Alcance proporcional | FR-064 |
| Expiración y privacidad | FR-065–FR-066 |

FR-001–FR-003 y FR-051–FR-056/FR-059 se verifican principalmente en presentación,
accesibilidad y rendimiento. Este contrato los respalda con datos mínimos y
proyecciones seguras, sin introducir campos ni capacidades ajenas al MVP.

No se detectan contradicciones con la especificación ni con la constitución 1.0.0.
