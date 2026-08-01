# Contrato lógico del flujo arcade

**Estado**: contrato revisado con puntuación aprobada y ranking global
secundario.

## Autoridad

El servidor resuelve alias, gameCode, sesión, item, estado, entrada,
idempotencia, expiración, feedback, puntuación y resultado. El navegador solo
presenta el estado, conserva selección local mientras se envía y solicita una
transición.

Una sesión se vincula a un solo gameCode. Una cookie o identificador opaco no
puede seleccionar otra sesión ni cambiar de juego.

## Operaciones

### startGame

Entrada:

- alias temporal sujeto a la política de longitud, normalización y moderación;
- gameCode de la lista exacta de seis juegos.

Salida:

- sessionId opaco no predecible;
- gameCode y mechanic resueltos por el servidor;
- estado intro o active;
- primer estado público sin solución.

Rechazos: INVALID_ALIAS, INVALID_GAME, INTERNAL_ERROR.

### getGameState

Entrada: sesión resuelta por cookie o credencial de servidor y, si aplica,
gameCode de la ruta.

Salida: GameState de domain.ts, con item público, progreso textual, feedback
previamente aceptado y nextAction.

Reglas:

- no crea una sesión por una lectura;
- no recupera un juego distinto;
- no devuelve solución de un item active;
- una sesión invalid o expired se proyecta al estado seguro común.

### submitGameAction

Entrada:

- sessionId resuelto;
- gameCode;
- itemId;
- entrada discriminada propia de mechanics.md.

El servidor descarta cualquier campo desconocido o de autoridad, verifica
pertenencia y registra como máximo una aceptación por item. Una repetición
idempotente devuelve el mismo feedback ya materializado sin sumar otra vez.

Salida aceptada:

- estado feedback;
- resultado de la evaluación del item;
- explicación, señales y recomendación;
- siguiente acción advance o result.

No acepta score, bonus, penalty o rank enviados por el cliente. La puntuación
sale del servidor según las fórmulas aprobadas.

### advanceGame

Entrada: sessionId e itemId con feedback aceptado.

Reglas:

- exige que el feedback exista;
- no acepta avanzar dos veces;
- no permite volver a modificar una respuesta;
- resuelve el siguiente item solo en servidor;
- al terminar cambia a finished y materializa el resultado propio del juego.

### getGameResult

Entrada: sesión finalizada y credencial de esa sesión.

Salida:

- gameCode, alias temporal, estado finished o expired;
- answered, total y learningSummary;
- GameScore con puntos, máximo, errores, bonos, penalizaciones y tiempo cuando
  aplique.

### getLeaderboard

Entrada: ninguna; el servidor resuelve la lectura global.

Salida: Leaderboard con como máximo diez resultados finalizados y elegibles de
cualquier juego, ordenados por rankingScore descendente, `completedAt`
ascendente y `resultId` ascendente. Solo entran resultados con
`status = finished`, `answered = total`, `total > 0`, alias normalizado
permitido, sin marca de abuso/invalidez, `maxPoints > 0` y
`0 <= points <= maxPoints`; se excluyen expired, invalid e incompletos.
fecha de finalización. Cada entrada conserva gameCode, points y maxPoints para
dar contexto, pero rankingScore es una métrica normalizada de comparación y no
sustituye la puntuación educativa del juego.

La operación es pública y de lectura, como en la línea base, pero su enlace se
muestra solo como acción secundaria desde el resultado o navegación secundaria.
No se presenta en el landing principal, no es requisito para iniciar o completar
un juego y no usa lenguaje de competencia como objetivo de aprendizaje.

El servidor calcula rankingScore como
`clamp(round(points / maxPoints * 100), 0, 100)` después de validar el
denominador. Con `maxPoints <= 0` no se genera rankingScore ni se incluye la
entrada; ningún score o campo de elegibilidad enviado por el cliente es
confiable.

## Máquina de estados

    intro -> active -> processing -> feedback -> active
                                      |
                                      +-> finished -> result

    active -> expired -> result
    cualquier estado recuperable -> invalid solo por decisión autoritativa

El cliente no puede efectuar una transición de active a finished, reabrir
feedback, alterar expired ni escribir puntos o ranking.

## Errores y recuperación

Los códigos internos se definen en errors.md. La proyección pública debe usar el
mensaje y las acciones de recuperación del contrato común, sin revelar si el
fallo provino de una cookie, una fila privada o una regla de evaluación.

Un fallo incierto de submit se puede reintentar con el mismo item y entrada. Un
fallo de advance vuelve a leer estado; no se envía una respuesta nueva. Un
fallo de leaderboard permite reintentar sin afectar la partida.
