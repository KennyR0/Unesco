# Contrato lógico del flujo de juego

**Estado**: contrato previo a implementación
**Transporte aprobado**: Server Components para lecturas y Server Actions para
mutaciones originadas en la interfaz
**Fuentes**: `spec.md` FR-004–FR-050, FR-060–FR-063; `research.md` decisiones
3, 4, 6–10

Este documento define operaciones de aplicación, no rutas REST ni endpoints. La
primera versión no crea Route Handlers porque no existe consumidor externo. Una
operación no se publicará a la vez como Server Action y como endpoint.

Las firmas usan los tipos de [`domain.ts`](./domain.ts). Toda salida de juego adopta
`OperationResult<T>` y debe validarse antes de llegar a la presentación.
`clearInvalidSession` es la única excepción: no produce DTO porque termina con una
redirección después de expirar una cookie.

## Asociación y autoridad de sesión

- Al iniciar, el servidor genera 32 bytes aleatorios con un generador
  criptográficamente seguro. El navegador recibe solo el valor opaco en la cookie
  `antidoto_session`; Supabase persiste únicamente su SHA-256.
- La cookie usa `httpOnly`, `secure` en entornos HTTPS, `sameSite=lax` y `path=/`.
  Mientras la sesión está activa, su expiración se alinea con `session_expires_at`
  de PostgreSQL y su `maxAge` es el tiempo restante, con máximo 86400 segundos. Solo
  crear una sesión o aceptar una respuesta renueva en base la ventana activa de
  24 horas. Al finalizar, la acción la sincroniza una sola vez con
  `result_access_until = finished_at + 7 días`, con máximo 604800 segundos.
- Las operaciones de una partida resuelven la sesión exclusivamente desde esa
  cookie. Ninguna acepta token, hash, identificador de sesión o clave primaria de
  base de datos como entrada.
- `QuestionRef` y `OptionRef` son referencias públicas opacas, acotadas a la
  experiencia y sin autoridad propia. No son claves primarias ni credenciales. El
  servidor las resuelve dentro de la sesión asociada y verifica pertenencia.
- Una lectura de sesión desconocida o purgada produce `SESSION_NOT_FOUND`; una
  sesión terminalmente invalidada produce `SESSION_INVALID`. Esos códigos y
  `RESULT_ACCESS_EXPIRED` permanecen diferenciados en dominio, logs y pruebas, pero
  proyectan la `Presentación segura común` definida exclusivamente en
  [`errors.md`](./errors.md). Sin una credencial vigente, la interfaz no infiere ni
  confirma que existió una partida anterior.
- Si la cookie está ausente, la vista segura se renderiza directamente y sus acciones
  son enlaces normales; no se escribe, expira ni crea cookie alguna. Si está presente
  pero es desconocida, malformada o invalidada, se muestra la misma presentación y la
  acción de regreso puede usar `clearInvalidSession` para retirar únicamente
  `antidoto_session`. No se añade cookie auxiliar, `localStorage`, query parameter ni
  marcador persistente de “sesión anterior”.
- Una sesión finalizada mantiene la asociación hasta `result_access_until` para
  mostrar su resultado y señalar su posición. No acepta nuevas respuestas ni pasa a
  `invalidated` por inactividad.
- `getGameState` y `getGameResult` son lecturas estrictamente puras. Si la sesión
  activa está vencida, proyectan `SESSION_INVALID` sin cambiar estado,
  `invalidatedAt`, actividad, expiración ni persistencia.
- Toda Server Action de juego comprueba primero el vencimiento de la sesión. Cuando
  la RPC de escritura materializa `invalidated`, devuelve un discriminante interno
  `SESSION_INVALID` como resultado normal para que la transacción confirme antes de
  que el adaptador construya el error público.
- Toda corrección, puntuación, transición y elegibilidad para ranking proviene del
  servidor. El navegador nunca envía `isCorrect`, puntos, progreso, estado ni
  puntuación final.

`RoundSize` es el único concepto de cantidad de preguntas: entero de 1 a 10 validado
por el contrato TypeScript/Zod y por la frontera SQL. `GAME_ROUND_SIZE` es la única
configuración en ejecución y Production la fija en 5. El valor persistido en la
sesión determina progreso, resultado y puntuación máxima históricos.

## Mapa de ejecución

| Operación lógica | Frontera Next.js | Acceso de datos previsto |
|---|---|---|
| `startGame` | Server Action | RPC transaccional `api.start_game` |
| `getGameState` | Lectura desde Server Component | RPC segura `api.get_game_state` |
| `clearInvalidSession` | Server Action | Ninguno; solo cabecera `Set-Cookie` y redirección |
| `getActiveQuestion` | Proyección de aplicación en Server Component | Reutiliza `getGameState`; no añade RPC |
| `submitAnswer` | Server Action | RPC transaccional `api.submit_answer` |
| `advanceGame` | Server Action | RPC transaccional `api.advance_game` |
| `finishGame` | Server Action | RPC transaccional `api.finish_game` |
| `getGameResult` | Lectura desde Server Component | RPC segura `api.get_game_result` |
| `getLeaderboard` | Lectura desde Server Component | RPC segura `api.get_leaderboard` con instantánea única |

Los nombres de RPC son parte del contrato de base de datos, no endpoints públicos
del frontend. Las Server Actions de juego se consideran invocables por un cliente
hostil: validan entrada, cookie, pertenencia, estado y salida en cada llamada.
`clearInvalidSession` también se considera invocable: al no aceptar entrada y limitar
su efecto a la cookie propia, una invocación directa no puede operar sobre Supabase ni
sobre otra sesión.

## `startGame`

```ts
startGame(input: StartGameInput): Promise<OperationResult<StartGameResult>>
```

**Propósito**: normalizar y validar el alias, moderarlo, crear una sesión anónima y
asignarle exactamente el `RoundSize` configurado de preguntas publicadas de
`single_choice` en un orden persistido; Production configura cinco.

**Asociación**: no requiere sesión previa. Una ejecución correcta crea una asociación
nueva y sustituye la cookie del navegador. El alias nunca se usa como identidad.

**Entrada**:

- `alias`: texto sin confiar proveniente del formulario.
- La pantalla debe haber informado antes que el alias y la puntuación final pueden
  aparecer en el ranking; no se añade una casilla de consentimiento ni otro dato.

**Salida correcta**:

- `StartGameResult` con `nextPath: "/play"`; el Client Component navega únicamente
  después del éxito y `/play` obtiene el estado autoritativo mediante
  `getGameState`.
- La cookie solo se escribe después de que la sesión y sus `RoundSize` asignaciones hayan
  quedado confirmadas en la misma transacción; usa el `session_expires_at` interno
  devuelto por `api.start_game`, que no forma parte de `StartGameResult`.

**Errores**:

- `INVALID_ALIAS`, `BLOCKED_ALIAS`
- `QUESTIONS_UNAVAILABLE`
- `GAME_START_FAILED`, `UNEXPECTED_ERROR`

**Idempotencia**: no es idempotente por diseño; cada inicio confirmado representa una
partida distinta. Mientras la acción está pendiente, la interfaz bloquea reenvíos.
Un reintento de infraestructura dentro de la misma invocación reutiliza token/hash y
la RPC devuelve la sesión ya confirmada si continúa vigente. Si ese reintento
encuentra la sesión activa vencida, la RPC confirma su invalidación y devuelve el
discriminante interno `SESSION_INVALID`; no la recupera como activa. Una activación
explícita posterior genera otro token. Un fallo nunca devuelve una sesión parcial ni
escribe su cookie.

**Seguridad**:

- El servidor aplica normalización NFC, conteo de grafemas, caracteres permitidos y
  comparación completa contra la lista bloqueada.
- Solo preguntas elegibles se asignan. La respuesta correcta, explicación, señales,
  recomendación y metadatos privados no forman parte de `StartGameResult`.

**Trazabilidad**: US2; FR-004–FR-013, FR-060, FR-065; BR-001–BR-005, BR-011.

## `getGameState`

```ts
getGameState(): Promise<OperationResult<GameState>>
```

**Propósito**: recuperar el último estado confirmado después de navegación, recarga
o resultado incierto.

**Asociación**: exige la cookie; no recibe parámetros de sesión.

**Salida correcta**:

- `view: "question"` si la asignación actual sigue pendiente;
- `view: "feedback"` si la respuesta actual ya fue aceptada y todavía no se avanzó;
- `view: "finished"` si la partida ya tiene resultado definitivo.

La variante de retroalimentación incluye la pregunta pública, la selección canónica,
el resultado permitido y `nextAction`. Nunca reconstruye una selección que no fue
aceptada. La variante finalizada se compone con los hechos definitivos retornados por
la misma RPC y añade el mensaje constante
`MVP_EDUCATIONAL_CLOSING_MESSAGE` definido en `domain.ts`.

**Errores**:

- `SESSION_NOT_FOUND`, `SESSION_INVALID`
- `UNEXPECTED_ERROR`

**Idempotencia**: lectura idempotente y estrictamente pura. No ejecuta ninguna
mutación en Supabase, no renueva la actividad, no cambia progreso, `status`,
`invalidatedAt` o expiración. Si observa `expires_at <= now()` en una sesión activa,
devuelve `SESSION_INVALID` sin materializar el estado; una mutación posterior o la
rutina privada de retención podrá hacerlo.

**Seguridad**: la consulta liga el hash de cookie a una única sesión y retorna una
unión discriminada validada. No expone token, hash, identificadores de persistencia
ni solución antes de responder.

**Trazabilidad**: US3–US6; FR-020, FR-023, FR-034–FR-036, FR-061–FR-062;
BR-007, BR-012.

## `clearInvalidSession`

```ts
clearInvalidSession(): Promise<never>
```

**Propósito**: retirar la credencial local que ya no puede asociarse con una partida
recuperable y regresar a un estado seguro.

**Precondición de presentación**: una lectura servidor de `/play` o `/results`
determinó `SESSION_NOT_FOUND`, `SESSION_INVALID` o que la cookie presente es
malformada. Solo esa rama con una cookie que retirar puede renderizar el formulario
asociado a esta acción. La ausencia de cookie renderiza directamente la vista segura
con enlaces normales y no invoca esta acción. La condición no se recibe ni se confía
desde el cliente.

**Entrada**: ninguna. La firma no acepta `FormData`, token, hash, UUID, identificador
de sesión, código de error, ruta de retorno ni valor enlazado mediante `.bind`.

**Efecto correcto**:

- expira únicamente la cookie de nombre fijo `antidoto_session`;
- emite `Max-Age=0` y un `expires` pasado con `httpOnly: true`,
  `sameSite: "lax"`, `path: "/"` y el mismo valor de `secure` aplicado al crearla
  (`true` en Preview/Production y `false` solo en HTTP local);
- no lee ni modifica Supabase, no invoca el gateway o una RPC, no invalida ni
  finaliza una partida y no crea una sesión nueva;
- después de emitir la cabecera ejecuta `redirect("/")`; el destino es constante y
  no procede del cliente.

**Errores**: no introduce códigos de dominio ni devuelve `ErrorEnvelope`. Si la
respuesta HTTP no puede completarse, no se presume que la cookie fue eliminada y la
interfaz puede ofrecer de nuevo la misma acción; no existe cambio persistente que
reconciliar.

**Idempotencia**: obligatoria. Con cookie presente, ausente, expirada o ya eliminada,
la acción emite la misma instrucción limitada de expiración y redirige a `/`.
Repetirla no cambia información de la partida ni crea efectos adicionales.

**Seguridad**:

- la acción reutiliza la política central de cookie para evitar divergencias de
  nombre, path o atributos;
- solo se expone en la rama irrecuperable determinada por el servidor, pero se diseña
  de forma segura ante invocación directa: el máximo efecto es borrar la cookie de
  Antídoto del navegador que la invoca;
- no se usa para `SESSION_FINISHED`, errores recuperables ni `UNEXPECTED_ERROR`;
- se mantienen la comprobación same-origin de Server Actions y `SameSite=Lax`.

**Trazabilidad**: US5; FR-034–FR-035, FR-061–FR-062; escenario de acceso directo a
una partida inexistente.

## `getActiveQuestion`

```ts
getActiveQuestion(): Promise<OperationResult<QuestionGameState>>
```

**Propósito**: entregar a la presentación únicamente la pregunta pendiente en la
posición actual.

**Asociación**: exige cookie; no recibe identificadores.

**Salida correcta**: alias, estado de sesión, progreso y una sola `PublicQuestion`
con 2–4 opciones. Es una proyección de `getGameState`, no otro transporte ni otra
consulta pública.

**Errores**:

- `SESSION_NOT_FOUND`, `SESSION_INVALID`, `SESSION_FINISHED`
- `QUESTION_ALREADY_ANSWERED` si el estado recuperable es la retroalimentación
- `UNEXPECTED_ERROR`

**Idempotencia**: lectura idempotente; no avanza, no renueva actividad y no descarga
el resto de la ronda.

**Seguridad**: la salida excluye por esquema `isCorrect`, opción correcta,
retroalimentación, puntos y regla de evaluación.

**Trazabilidad**: US3, US5; FR-014–FR-020, FR-032, FR-057; BR-005.

## `submitAnswer`

```ts
submitAnswer(input: SubmitAnswerInput): Promise<OperationResult<AnswerResult>>
```

**Propósito**: registrar la primera selección válida de la asignación actual,
evaluarla y devolver la retroalimentación educativa permitida.

**Asociación**: exige cookie. `questionRef` debe corresponder a la posición actual y
`optionRef` debe pertenecer a esa pregunta dentro de la misma sesión.

**Entrada**:

- `questionRef`: referencia pública presentada en el último estado confirmado.
- `optionRef`: referencia pública de una opción; ausente o vacía se traduce a
  `OPTION_NOT_SELECTED`.
- No se aceptan corrección, puntos, tiempo, estado ni progreso enviados por cliente.

**Salida correcta**:

- `AnswerResult` canónico con selección aceptada, `outcome`, 100 o 0 puntos,
  progreso y retroalimentación.
- Si fue incorrecta, incluye `correctOptionRef`; si fue correcta, la opción
  seleccionada ya identifica la solución.
- La sesión pasa de `started` a `in_progress` con la primera respuesta, pero la
  posición no avanza hasta `advanceGame`.

**Errores**:

- `OPTION_NOT_SELECTED`, `OPTION_NOT_ALLOWED`
- `QUESTION_NOT_ASSIGNED`, `QUESTION_ALREADY_ANSWERED`
- `SESSION_NOT_FOUND`, `SESSION_INVALID`, `SESSION_FINISHED`
- `ANSWER_SAVE_FAILED`, `UNEXPECTED_ERROR`

**Idempotencia y concurrencia**:

- La RPC comprueba el vencimiento después de bloquear la sesión y antes de cualquier
  cambio de juego. Si venció, materializa `invalidated` con
  `invalidated_at = expires_at` previo, anula la expiración, deriva la purga desde ese
  instante y devuelve el discriminante interno `SESSION_INVALID` sin insertar una
  respuesta. El adaptador mapea el error solo después del commit.
- Inserción, comprobación de pertenencia, corrección, puntos y transición ocurren en
  una transacción.
- Dos peticiones concurrentes solo pueden confirmar una fila por asignación.
- Si la asignación actual ya tiene una respuesta, un reintento devuelve el
  `AnswerResult` guardado, aunque el reintento lleve otra opción; nunca modifica la
  primera selección.
- La salida interna de la RPC incluye `accepted_new` y el `session_expires_at`
  persistido. El adaptador elimina ambos antes de formar `AnswerResult`.
- Tras una primera aceptación, la Server Action emite la cookie actualizada hasta el
  nuevo `session_expires_at`. Únicamente durante su recuperación idempotente la
  **reemite** con el tiempo restante hasta ese mismo instante; el replay no lo
  desplaza y solo recupera una eventual cabecera `Set-Cookie` perdida.
- Una referencia de una asignación anterior ya avanzada devuelve
  `QUESTION_ALREADY_ANSWERED`.
- Ante resultado incierto se invoca esta misma operación o `getGameState`; ambas
  recuperan la respuesta canónica.

**Seguridad**:

- La opción correcta se consulta únicamente dentro de PostgreSQL después de bloquear
  y validar sesión/asignación.
- La restricción única de base de datos es la defensa definitiva; deshabilitar el
  botón es solo protección de experiencia.
- Solo una aceptación nueva renueva la actividad y `expires_at` en base; reemitir la
  cookie contra el mismo instante persistido no extiende la vigencia.

**Trazabilidad**: US3–US5; FR-017–FR-030, FR-034–FR-035, FR-061–FR-062;
BR-006–BR-009, BR-012–BR-013.

## `advanceGame`

```ts
advanceGame(): Promise<OperationResult<QuestionGameState>>
```

**Propósito**: mover el cursor persistido a la siguiente pregunta después de que el
jugador haya revisado la retroalimentación.

**Asociación**: exige cookie; la posición se obtiene del estado servidor.

**Precondiciones**:

- la RPC bloquea la sesión y comprueba su vencimiento antes de cambiar el cursor; si
  venció, confirma `invalidated`, con `invalidated_at = expires_at` previo, y devuelve
  el discriminante interno `SESSION_INVALID`;
- la asignación actual está respondida;
- existe una siguiente posición;
- la sesión permanece `in_progress`.

**Salida correcta**: la siguiente `QuestionGameState`, con progreso actualizado y sin
datos de solución.

**Errores**:

- `ADVANCE_NOT_ALLOWED` si la pregunta sigue pendiente, no existe siguiente pregunta
  o la petición repetida ya dejó una nueva pregunta pendiente
- `SESSION_NOT_FOUND`, `SESSION_INVALID`, `SESSION_FINISHED`
- `QUESTION_NOT_ASSIGNED`, `UNEXPECTED_ERROR`

**Idempotencia**: no es una operación repetible con efecto, pero es segura ante doble
envío. La primera llamada avanza una posición; la segunda encuentra una pregunta
pendiente y devuelve `ADVANCE_NOT_ALLOWED`, por lo que nunca salta dos preguntas.
En la última retroalimentación también devuelve `ADVANCE_NOT_ALLOWED`; esa vista solo
ofrece `finishGame`. No renueva la ventana de actividad.

**Seguridad**: el cliente no envía la posición siguiente. La transición solo usa el
cursor y la asignación confirmados por servidor.

**Trazabilidad**: US4, US5; FR-029–FR-035; BR-009, BR-012.

## `finishGame`

```ts
finishGame(): Promise<OperationResult<FinalResult>>
```

**Propósito**: finalizar después de mostrar la retroalimentación de la última
respuesta del `RoundSize` persistido, calcular el resultado definitivo y hacerlo
elegible para ranking.

**Asociación**: exige cookie; no recibe puntuación, conteos ni identificador.

**Precondiciones**: todas las preguntas asignadas tienen una respuesta aceptada y el
cursor está en la última retroalimentación.

**Salida correcta**: `FinalResult` con alias, aciertos, total, puntuación, máximo,
regla aplicada y el literal versionado `MVP_EDUCATIONAL_CLOSING_MESSAGE`. La
aplicación añade ese texto tanto al finalizar como al recuperar; no se inventa ni se
persiste por sesión. La fecha usada internamente para ordenar y conservar el
resultado no se expone porque la pantalla no la necesita.

La RPC devuelve además `result_access_until` como metadato interno, fuera de
`FinalResult`. La Server Action lo usa para sincronizar la cookie hasta exactamente
ese instante. Una repetición idempotente devuelve el mismo corte y no lo desplaza.

**Errores**:

- `GAME_NOT_COMPLETE`
- `SESSION_NOT_FOUND`, `SESSION_INVALID`
- `GAME_FINISH_FAILED`, `UNEXPECTED_ERROR`

**Idempotencia**: obligatoria. La primera ejecución bloquea la sesión, suma los
puntos guardados y persiste un único resultado. Si ya está finalizada, devuelve
exactamente ese resultado sin recalcular, duplicar puntuación ni crear otra entrada.
Ante resultado incierto se puede reintentar o llamar `getGameResult`.

Tras bloquear, una sesión activa vencida se materializa atómicamente como
`invalidated`, con `invalidated_at = expires_at` previo y la purga derivada de ese
instante. La RPC comunica el discriminante interno `SESSION_INVALID` como salida
normal; el adaptador lo convierte en error después del commit. No calcula ni persiste
un resultado para esa sesión.

**Seguridad**: puntuación y aciertos se derivan de respuestas aceptadas; la regla
`single-choice-100-v1` queda guardada. La sesión finalizada es terminal.

**Trazabilidad**: US6; FR-036–FR-043, FR-061–FR-063; BR-007–BR-009.

## `getGameResult`

```ts
getGameResult(): Promise<OperationResult<FinalResult>>
```

**Propósito**: consultar el resultado definitivo sin volver a finalizar.

**Asociación**: exige cookie y pertenencia a la sesión finalizada.

**Salida correcta**: el mismo `FinalResult` devuelto por `finishGame`.

Los hechos históricos son persistidos; el mensaje educativo se vuelve a componer
desde la misma constante contractual, por lo que ambas operaciones entregan el mismo
DTO.

**Errores**:

- `SESSION_NOT_FOUND`
- `SESSION_INVALID` únicamente para una sesión activa ya invalidada
- `RESULT_NOT_AVAILABLE` si la sesión todavía no está finalizada
- `RESULT_ACCESS_EXPIRED` si terminó `result_access_until`
- `UNEXPECTED_ERROR`

**Idempotencia**: lectura idempotente y estrictamente pura; no ejecuta ninguna
mutación, no renueva actividad y no modifica estado, `invalidatedAt`, expiración,
detalle ni ranking. Una sesión activa vencida produce `SESSION_INVALID` por
proyección, sin `UPDATE`; una activa vigente produce `RESULT_NOT_AVAILABLE` y una
finalizada fuera de su ventana produce `RESULT_ACCESS_EXPIRED`.

**Seguridad**: no admite un identificador de otra partida. La recuperación individual
está autorizada únicamente hasta `result_access_until`; después se rechaza aunque el
hash espere el siguiente ciclo de purga. El resultado mínimo puede seguir participando
en el ranking público.

**Trazabilidad**: US6; FR-036–FR-043, FR-066.

## `getLeaderboard`

```ts
getLeaderboard(): Promise<OperationResult<LeaderboardSnapshot>>
```

**Propósito**: obtener el top diez público y, cuando la cookie corresponde a una
partida finalizada, la posición propia aunque quede fuera del top.

**Asociación**: pública y sin sesión obligatoria. La cookie, si existe, solo se usa
para resolver `currentPlayerEntry`; nunca filtra ni amplía los datos del top.

**Salida correcta**:

- `entries`: entre cero y diez entradas con posición, alias, puntuación e
  `isCurrentPlayer`; el marcador es verdadero como máximo en la fila cuya posición
  coincide con la sesión de la cookie, y es falso en todas si no existe resultado
  asociado;
- `currentPlayerEntry`: la entrada marcada de la sesión finalizada solo cuando queda
  fuera del top diez; en otro caso es `null`.

Cada puntuación es un entero no negativo y múltiplo de 100. Su máximo se deriva para
cada resultado como `totalQuestions × pointsPerCorrect`; no existe un máximo fijo del
ranking. Production configura cinco preguntas y por ello su máximo actual es 500.

El orden es puntuación descendente, finalización ascendente y, solo como desempate
interno estable, identificador de sesión ascendente. Ni ese identificador ni la fecha
son necesarios en la proyección pública. `api.get_leaderboard` calcula top, posición e
identidad de la sesión de cookie dentro de una sola sentencia SQL y una sola
instantánea: marca por identidad interna antes de retirar el UUID, nunca compara alias
ni combina dos lecturas que puedan observar rankings distintos. Una lista vacía es una
respuesta correcta, no un error.

**Errores**:

- `RANKING_UNAVAILABLE`, `UNEXPECTED_ERROR`

**Idempotencia**: lectura idempotente y sin tiempo real. Volver a consultar obtiene
una instantánea nueva.

**Seguridad**:

- Solo sesiones válidas, finalizadas y puntuadas por servidor son elegibles.
- Cada sesión aparece una vez.
- El alias se entrega como texto; la presentación nunca lo interpreta como HTML.
- Un fallo del ranking no invalida la sesión ni bloquea iniciar, continuar o revisar
  una partida.

**Trazabilidad**: US1, US6, US7; FR-003, FR-043–FR-050, FR-062–FR-063,
FR-066; BR-010.

## Invariantes transversales

1. Ninguna operación recibe o devuelve token, hash, identificador de sesión, clave
   primaria de Supabase o `correct_option_id`.
2. La única proyección previa a responder es `PublicQuestion`.
3. Una respuesta aceptada es inmutable y una sesión `finished` o `invalidated` es
   terminal.
4. `getGameState` y `getGameResult` son lecturas puras; un reintento de respuesta y
   una finalización repetida convergen al estado canónico del servidor.
5. Los errores se traducen al contrato de [`errors.md`](./errors.md); nunca se
   propagan mensajes SQL, stack traces, claves, soluciones ni detalles de permisos.
6. `clearInvalidSession` no cambia estado de dominio ni persistencia; solo elimina la
   cookie local de Antídoto y usa un destino fijo.
