# Contrato de errores del arcade

## Envelope

Todo error de operación contiene:

- code interno estable;
- message seguro y accionable;
- retryable;
- correlationId solo para diagnóstico de servidor, nunca para autoridad del
  cliente.

El cliente no muestra SQL, nombres de tablas, reglas privadas, solución,
credenciales ni diferencias que permitan enumerar sesiones.

## Catálogo

| Código | Situación | Reintento |
|---|---|---|
| INVALID_GAME | gameCode inexistente o no disponible | No; volver al arcade |
| INVALID_ALIAS | alias vacío, fuera de límites o no permitido | Sí, corregir alias |
| SESSION_NOT_FOUND | no existe una sesión recuperable | No; iniciar juego |
| SESSION_INVALID | credencial malformada, desconocida o invalidada | No; iniciar juego |
| GAME_MISMATCH | sesión y ruta no pertenecen al mismo juego | No; volver al juego correcto |
| ITEM_NOT_FOUND | item inexistente | No; recuperar estado |
| ITEM_NOT_IN_SESSION | item no asignado a la sesión | No; recuperar estado |
| INVALID_ACTION | entrada no válida para la mecánica o el estado | Sí, corregir control |
| ANSWER_ALREADY_ACCEPTED | item ya respondido | No; leer feedback |
| SESSION_EXPIRED | límite de sesión o Feed 60” expirado | No; consultar resultado o iniciar otra |
| RESULT_NOT_AVAILABLE | la sesión todavía no terminó | No; volver a partida |
| RESULT_ACCESS_EXPIRED | resultado fuera de su ventana de acceso | No; volver al arcade |
| LEADERBOARD_UNAVAILABLE | fallo al leer el ranking global secundario | Sí; reintentar sin afectar la partida |
| LEADERBOARD_EMPTY | no hay resultados elegibles | No; mostrar estado vacío |
| CONFLICT | carrera de submit, advance o finalización | Sí; leer estado |
| CONTENT_UNAVAILABLE | media o contenido no utilizable | Sí; usar fallback |
| INTERNAL_ERROR | fallo no clasificable | Sí; reintentar sin duplicar |

## Regla pública común

SESSION_NOT_FOUND, SESSION_INVALID y RESULT_ACCESS_EXPIRED pueden tener
diagnósticos internos diferentes, pero muestran la misma pantalla segura:
explicar que no hay una partida recuperable, ofrecer volver al arcade y permitir
iniciar una nueva. Con cookie ausente no se escribe estado auxiliar.

## Reglas de reintento

- submit repetido con la misma identidad e item devuelve la aceptación anterior;
- submit repetido con otro input después de aceptar rechaza sin modificar;
- advance incierto se recupera con getGameState;
- finalización incierta se recupera con getGameResult;
- un fallo de getLeaderboard no invalida la sesión, el feedback ni el resultado
  propio;
- no se usa localStorage, query parameter ni cookie auxiliar como autoridad;
- los errores de validación se asocian al control específico y se anuncian.
