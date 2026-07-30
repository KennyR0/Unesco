# Contrato de errores

**Estado**: contrato previo a implementación
**Fuentes**: `spec.md` matriz de errores, FR-007–FR-009, FR-021–FR-024,
FR-034–FR-048 y FR-061–FR-062

Los códigos son estables y aptos para lógica. Los mensajes son texto seguro en
español para el usuario; nunca se reemplazan con mensajes de Supabase, PostgreSQL,
Zod, excepciones o stack traces.

## Envelope

Todas las operaciones lógicas fallidas devuelven la variante definida en
[`domain.ts`](./domain.ts):

```ts
type ErrorEnvelope = {
  ok: false;
  error: GameError;
};
```

Ejemplo de error de campo:

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_ALIAS",
    "message": "El alias debe tener al menos 3 caracteres visibles.",
    "recoverable": true,
    "field": "alias",
    "issue": "too_short"
  }
}
```

Reglas del envelope:

- `code` es el único valor usado para bifurcar comportamiento.
- `message` es presentable como texto y no contiene HTML.
- `recoverable: true` significa que el jugador puede corregir, reintentar o
  recuperar el estado confirmado sin descartar la sesión utilizable. No autoriza un
  reintento automático.
- `field` solo aparece como `alias` u `option` cuando el mensaje debe asociarse a ese
  control.
- `issue` solo aparece con `INVALID_ALIAS`.
- No se devuelven token, hash, identificadores internos, selección correcta, SQL,
  nombres de tablas, detalles de políticas, secretos, trazas ni contenido de la
  lista bloqueada.
- El servidor registra la causa interna de forma separada y sanitizada. La interfaz
  conserva únicamente datos locales que el contrato indique como seguros.

## Validación del alias

La entrada se recorta, se normaliza a NFC y después se evalúa en este orden. Solo el
primer problema aplicable se presenta para que el foco permanezca en una corrección
concreta.

`ALIAS_VALIDATION_MESSAGES` y `BLOCKED_ALIAS_MESSAGE` de
[`domain.ts`](./domain.ts) son la fuente canónica de estos textos. La frontera de
aplicación traduce `aliasIssue` o `BLOCKED_ALIAS` a esas constantes. La tabla
siguiente las reproduce literalmente para revisión; no autoriza mensajes alternos.

| Caso | Código e `issue` | Mensaje canónico | Asociación y acción |
|---|---|---|---|
| Vacío o solo espacios | `INVALID_ALIAS` / `required` | “Escribe un alias para comenzar.” | `field: "alias"`; conservar el campo y enfocarlo |
| Menos de 3 grafemas visibles | `INVALID_ALIAS` / `too_short` | “El alias debe tener al menos 3 caracteres visibles.” | `field: "alias"`; conservar y corregir |
| Más de 20 grafemas visibles | `INVALID_ALIAS` / `too_long` | “El alias debe tener como máximo 20 caracteres visibles.” | `field: "alias"`; conservar y corregir |
| Carácter fuera de letras, números, espacio interno, guion o guion bajo | `INVALID_ALIAS` / `invalid_characters` | “Usa solo letras, números, espacios internos, guiones y guiones bajos.” | `field: "alias"`; conservar como texto y corregir |
| Coincidencia completa con la lista básica | `BLOCKED_ALIAS` | “Ese alias no está permitido. Elige otro.” | `field: "alias"`; conservar como texto y sustituir |

La moderación ocurre después de validar forma y compara el alias canónico completo
sin distinguir mayúsculas. No se informa qué término provocó el bloqueo ni se
promete moderación exhaustiva.

## Presentación segura común

Esta sección es la única fuente literal de la presentación pública usada cuando no
existe una credencial vigente que permita recuperar una partida.

- **Mensaje canónico**: “No hay una partida recuperable en este navegador. Puedes
  consultar el ranking o iniciar otra.”
- **Acciones públicas**: “Consultar ranking” e “Iniciar otra partida”.
- **Códigos internos que la proyectan**: `SESSION_NOT_FOUND`, `SESSION_INVALID` y
  `RESULT_ACCESS_EXPIRED`.

Los tres códigos permanecen distintos en dominio, logs y pruebas. La interfaz no
revela cuál ocurrió ni confirma que existió una partida anterior. El catálogo usa la
referencia **Presentación segura común** para evitar copias divergentes del texto.

## Catálogo de códigos

| Código | Mensaje canónico | `recoverable` | Acción disponible | Información conservada | ¿Nueva sesión? |
|---|---|---:|---|---|---|
| `INVALID_ALIAS` | Según la tabla de validación. | Sí | Corregir y reenviar. | Alias escrito. | No existe todavía. |
| `BLOCKED_ALIAS` | “Ese alias no está permitido. Elige otro.” | Sí | Elegir otro alias. | Alias como texto para editar. | No existe todavía. |
| `SESSION_NOT_FOUND` | Presentación segura común | No | Acciones de la presentación segura común; si existe una cookie inválida que retirar, la segunda acción puede usar `clearInvalidSession`. | Ningún progreso se presenta como recuperable. | Sí |
| `SESSION_FINISHED` | “Esta partida ya terminó. Puedes consultar tu resultado.” | No | Ir al resultado, al ranking o volver a jugar. | Resultado definitivo. | Solo para volver a jugar |
| `SESSION_INVALID` | Presentación segura común | No | Acciones de la presentación segura común; si existe una cookie inválida que retirar, la segunda acción puede usar `clearInvalidSession`. | El alias puede reutilizarse si estaba disponible de forma segura; el progreso no es jugable. | Sí |
| `QUESTIONS_UNAVAILABLE` | “No hay suficientes preguntas disponibles para crear la ronda.” | Sí | Reintentar más tarde, volver o consultar el ranking. | Alias válido; no existe partida utilizable. | El próximo inicio crea una |
| `QUESTION_NOT_ASSIGNED` | “Esa pregunta no pertenece al estado actual de tu partida.” | Sí | Recuperar el estado confirmado. | Sesión y respuestas aceptadas. | No |
| `QUESTION_ALREADY_ANSWERED` | “Esta pregunta ya fue respondida. Recuperaremos tu avance.” | Sí | Recuperar la retroalimentación o la pregunta actual. | Primera respuesta aceptada y progreso. | No |
| `OPTION_NOT_SELECTED` | “Selecciona una opción antes de responder.” | Sí | Elegir una opción y reenviar. | Pregunta actual. | No |
| `OPTION_NOT_ALLOWED` | “La opción seleccionada no pertenece a esta pregunta.” | Sí | Recargar las opciones y seleccionar una válida. | Sesión, respuestas previas y pregunta actual; no se conserva la referencia inválida. | No |
| `ANSWER_SAVE_FAILED` | “No pudimos confirmar tu respuesta. Reintenta para recuperar el estado guardado.” | Sí | Reintentar el mismo envío o recuperar la partida. | Selección local, mientras no se sustituya por la respuesta canónica; todo estado ya confirmado. | No |
| `GAME_START_FAILED` | “No pudimos iniciar la partida. Tu alias se conserva para reintentar.” | Sí | Reintentar, editar alias o consultar ranking. | Alias válido; no se expone sesión parcial. | El reintento crea la primera utilizable |
| `ADVANCE_NOT_ALLOWED` | “Todavía no puedes avanzar desde este estado.” | Sí | Recuperar el estado; responder, continuar o finalizar según corresponda. | Pregunta, respuesta y progreso confirmados. | No |
| `GAME_NOT_COMPLETE` | “Aún faltan preguntas por completar antes de ver el resultado.” | Sí | Volver a la partida recuperada. | Todas las respuestas aceptadas y progreso. | No |
| `GAME_FINISH_FAILED` | “No pudimos confirmar el resultado. Reintenta o vuelve a consultarlo.” | Sí | Reintentar finalización o consultar resultado/estado. | Todas las respuestas aceptadas; posible resultado canónico. | No |
| `RESULT_NOT_AVAILABLE` | “El resultado estará disponible cuando completes la ronda.” | Sí | Volver a la partida. | Sesión, respuestas y progreso. | No |
| `RESULT_ACCESS_EXPIRED` | Presentación segura común | No | Acciones de la presentación segura común mediante enlaces normales; no limpiar la cookie durante la lectura. | Solo el resultado mínimo todavía elegible para ranking. | Sí para volver a jugar |
| `RANKING_UNAVAILABLE` | “El ranking no está disponible por el momento.” | Sí | Reintentar, jugar o volver al resultado. | Partida y resultado actuales no cambian. | No |
| `UNEXPECTED_ERROR` | “Ocurrió un problema inesperado. Reintenta o vuelve al inicio.” | Sí | Reintentar una vez o navegar a un estado seguro. | Solo estado confirmado; nunca se asume éxito. | Solo si la recuperación indica sesión inválida |

## Uso por operación

| Operación | Códigos admitidos |
|---|---|
| `startGame` | `INVALID_ALIAS`, `BLOCKED_ALIAS`, `QUESTIONS_UNAVAILABLE`, `GAME_START_FAILED`, `UNEXPECTED_ERROR` |
| `getGameState` | `SESSION_NOT_FOUND`, `SESSION_INVALID`, `UNEXPECTED_ERROR` |
| `getActiveQuestion` | `SESSION_NOT_FOUND`, `SESSION_INVALID`, `SESSION_FINISHED`, `QUESTION_ALREADY_ANSWERED`, `UNEXPECTED_ERROR` |
| `submitAnswer` | `OPTION_NOT_SELECTED`, `OPTION_NOT_ALLOWED`, `QUESTION_NOT_ASSIGNED`, `QUESTION_ALREADY_ANSWERED`, `SESSION_NOT_FOUND`, `SESSION_INVALID`, `SESSION_FINISHED`, `ANSWER_SAVE_FAILED`, `UNEXPECTED_ERROR` |
| `advanceGame` | `ADVANCE_NOT_ALLOWED`, `QUESTION_NOT_ASSIGNED`, `SESSION_NOT_FOUND`, `SESSION_INVALID`, `SESSION_FINISHED`, `UNEXPECTED_ERROR` |
| `finishGame` | `GAME_NOT_COMPLETE`, `SESSION_NOT_FOUND`, `SESSION_INVALID`, `GAME_FINISH_FAILED`, `UNEXPECTED_ERROR` |
| `getGameResult` | `SESSION_NOT_FOUND`, `SESSION_INVALID`, `RESULT_NOT_AVAILABLE`, `RESULT_ACCESS_EXPIRED`, `UNEXPECTED_ERROR` |
| `getLeaderboard` | `RANKING_UNAVAILABLE`, `UNEXPECTED_ERROR` |

Un código que no figure para la operación se mapea a `UNEXPECTED_ERROR` en la
frontera de aplicación y se registra internamente. Nunca se incorpora un código
nuevo durante la implementación sin actualizar primero `domain.ts`, este documento
y las pruebas contractuales.

## Reintentos y estados inciertos

### Doble envío de respuesta

Mientras existe una petición en curso, la presentación deshabilita el envío. Si dos
peticiones alcanzan el servidor, la restricción única y la transacción aceptan una
sola. La segunda llamada a la asignación actual devuelve éxito con el
`AnswerResult` canónico; no muestra dos retroalimentaciones ni usa un error como
mecanismo normal de idempotencia.

`QUESTION_ALREADY_ANSWERED` se reserva para una referencia anterior que ya no es la
posición actual. La acción entonces recupera `getGameState`.

### Pérdida temporal de conexión

Si no llega ningún envelope, la presentación usa el comportamiento de
`ANSWER_SAVE_FAILED`: conserva la selección, anuncia que el resultado es incierto y
permite reintentar. No afirma que la respuesta falló, porque el servidor puede haberla
aceptado. El reintento o `getGameState` devuelve la única respuesta canónica.

### Finalización incierta

`GAME_FINISH_FAILED` tampoco implica que no exista resultado. El jugador puede
reintentar `finishGame`, que es idempotente, o consultar `getGameResult`. Nunca se
calcula una puntuación local como fallback.

## Casos observables que no generan un error de dominio

`SESSION_NOT_FOUND`, `SESSION_INVALID` y `RESULT_ACCESS_EXPIRED` conservan códigos
internos distintos para dominio, logs y pruebas, pero usan el mismo mensaje y las
mismas acciones públicas. Sin una credencial vigente, la interfaz no revela cuál
ocurrió ni confirma que existió una partida anterior. No usa cookie auxiliar,
`localStorage`, query parameter ni marcador persistente de “sesión anterior”.

Con cookie ausente, la vista segura y sus dos enlaces normales no escriben, expiran ni
crean cookies. Con cookie presente pero desconocida, malformada o invalidada, la misma
presentación puede usar `clearInvalidSession` al iniciar otra partida para retirar
únicamente `antidoto_session`.

| Caso | Resultado contractual |
|---|---|
| Ranking sin resultados | Éxito con `entries: []`; el estado indica que todavía no hay resultados y ofrece jugar. |
| Imagen que no carga | Fallback local que conserva dimensiones y muestra la alternativa textual; la pregunta sigue siendo respondible. |
| Recarga durante la ronda | `getGameState` restaura solo estado confirmado; una selección nunca enviada puede perderse. |
| Acceso directo sin partida | `SESSION_NOT_FOUND`; muestra la vista segura común con ranking y nueva partida. Sin cookie, ambas acciones son enlaces normales y no se emite `Set-Cookie`. |
| Repetición de `finishGame` | Éxito con el mismo `FinalResult`. |
| Consulta de ranking sin cookie | Éxito público; `currentPlayerEntry` es `null`. |
| Sesión vencida por 24 horas | `SESSION_INVALID`; muestra la vista segura común. Si existe cookie inválida, “Iniciar otra partida” puede retirarla antes de volver a `/`. |

## Presentación accesible

- Un error de alias usa `aria-invalid="true"`, `aria-describedby` y foco en el campo.
- `OPTION_NOT_SELECTED` se asocia al `fieldset`/grupo de radios y se anuncia.
- Los errores recuperables asíncronos usan una región `role="alert"` sin depender
  únicamente del color.
- El error no sustituye ni borra la selección mientras su conservación sea segura.
- El foco permanece en el control o acción que permite recuperarse; al enviar de
  nuevo no se crean anuncios duplicados.

## Trazabilidad de escenarios

| Escenario de `spec.md` | Resolución |
|---|---|
| Alias vacío, corto, largo o con caracteres no permitidos | `INVALID_ALIAS` + `issue` específico |
| Alias bloqueado | `BLOCKED_ALIAS` |
| Fallo al iniciar | `GAME_START_FAILED`; alias conservado, sin cookie parcial |
| Preguntas no disponibles | `QUESTIONS_UNAVAILABLE` |
| Envío sin selección | `OPTION_NOT_SELECTED` |
| Doble clic/doble envío | Único éxito canónico |
| Pérdida temporal de conexión | Conducta `ANSWER_SAVE_FAILED` y recuperación |
| Sesión inválida o vencida | `SESSION_INVALID`; nueva partida |
| Segundo intento | Éxito canónico o `QUESTION_ALREADY_ANSWERED` si ya se avanzó |
| Pregunta inexistente/no asignada | `QUESTION_NOT_ASSIGNED` |
| Sesión finalizada | `SESSION_FINISHED` o lectura correcta del resultado |
| Error al guardar | `ANSWER_SAVE_FAILED` |
| Error al finalizar | `GAME_FINISH_FAILED` |
| Ranking vacío | Éxito con lista vacía |
| Ranking no disponible | `RANKING_UNAVAILABLE` no bloqueante |
| Recarga | `getGameState` |
| Acceso directo a partida inexistente | `SESSION_NOT_FOUND` |
