# Contrato de persistencia del arcade

**Estado**: modelo lógico pendiente de diseño físico y migración aprobada.

## Frontera de confianza

El navegador nunca accede directamente a datos privados. El servidor valida
cookies o credenciales opacas, crea el cliente server-only y expone solo
proyecciones contractuales.

La autoridad de evaluación, expiración, idempotencia, resultado, puntuación y
elegibilidad del ranking vive en el servidor.

## Objetos lógicos

| Objeto | Finalidad | Exposición |
|---|---|---|
| game_catalog | seis gameCode, mecánica, versión y disponibilidad | proyección pública filtrada |
| game_items | prompt, contenido, orden y referencia de feedback | proyección pública sin solución |
| game_item_solutions | solución y regla privada por item | solo servidor |
| media_assets | src, alt, dimensiones, peso, derechos y fallback | proyección pública segura |
| game_sessions | alias, gameCode, estado, tiempos y ciclo de vida | solo servidor; estado proyectado |
| session_items | items asignados, orden y estado de respuesta | solo servidor |
| player_answers | una aceptación idempotente, entrada validada y resultado educativo | solo servidor; feedback proyectado |
| game_results | resumen final, score aprobado y elegibilidad de sesión | sesión propietaria; ranking derivado |

La forma física, nombres de columnas y migraciones quedan abiertos hasta
aprobar data-model.md y la reconciliación de las 22 migraciones locales.

## Invariantes

- gameCode solo puede pertenecer al catálogo aprobado;
- una sesión pertenece a un solo juego;
- session_items solo referencia items de ese juego y versión;
- un item tiene como máximo una respuesta aceptada por sesión;
- una respuesta no puede mutar después de aceptarse;
- el feedback se materializa después de evaluación;
- finished y expired son terminales para nuevas respuestas;
- el resultado no se duplica por reintento;
- la puntuación se calcula en servidor con la fórmula aprobada para el juego;
- los campos lógicos de score son consistentes con el resultado final;
- el ranking solo incluye resultados terminados y elegibles;
- la capacidad global conserva la posición, pero no condiciona el aprendizaje.

## Campos lógicos de resultado

game_results debe poder materializar, con los nombres físicos que se aprueben
después, al menos:

- points y maxPoints;
- correct, errors, bonusPoints y penaltyPoints;
- timeLimitSeconds y timeUsedSeconds cuando aplique;
- answered, total, learningSummary, gameCode y estado terminal;
- rankingScore normalizado y leaderboardEligible.

La puntuación no se acepta desde el cliente y no se deriva de datos públicos.

## Ranking global secundario

La línea base conserva un ranking global persistido. El modelo lógico debe
permitir una tabla, snapshot o proyección persistible de resultados elegibles;
la forma física se decidirá al reconciliar las migraciones. La lectura debe:

- incluir resultados finished y elegibles de cualquiera de los seis juegos;
- exigir `status = finished`, `answered = total`, `total > 0`, alias normalizado
  permitido, ausencia de marcas de abuso/invalidez, `maxPoints > 0` y
  `0 <= points <= maxPoints`; excluir expired, invalid e incompletos;
- ordenar por rankingScore descendente, `completedAt` ascendente y `resultId`
  ascendente como desempate estable;
- limitar la respuesta a diez entradas;
- devolver alias normalizado, gameCode, points, maxPoints, rankingScore y fecha
  autorizada, sin datos de sesión;
- fallar de forma independiente sin impedir jugar, ver feedback o consultar el
  resultado propio.

rankingScore es una métrica normalizada de comparación (points/maxPoints,
expresada en porcentaje) y no reemplaza la escala educativa propia del juego.
La ruta de ranking es secundaria y se alcanza desde el resultado o navegación
secundaria; no aparece como tarjeta ni CTA principal del landing.

Reglas adicionales de servidor: rankingScore se calcula como
`clamp(round(points / maxPoints * 100), 0, 100)` solo después de validar el
denominador. Con `maxPoints <= 0` el resultado queda fuera de la proyección y
no se publica un score sintético. Ningún campo de score o elegibilidad enviado
por el cliente es confiable.

## Acceso

La implementación futura debe:

- versionar cada cambio mediante migración SQL;
- definir claves primarias, relaciones, checks e índices necesarios;
- activar RLS en toda tabla expuesta;
- usar grants explícitos de mínimo privilegio;
- si el leaderboard o cualquier otra proyección se expone mediante una vista,
  debe usar `security_invoker = true` y respetar las políticas de sus tablas;
  si no puede cumplirlo, debe permanecer en un esquema no expuesto y sin
  grants públicos;
- mantener soluciones, sesiones y respuestas fuera de lectura pública;
- probar acceso permitido y rechazado por cada operación;
- no exponer service_role ni secretos al cliente.

## Operaciones lógicas

El diseño físico debe soportar startGame, getGameState, submitGameAction,
advanceGame, getGameResult y getLeaderboard descritas en game-api.md. La
interfaz pública no debe depender de filas o nombres internos de Supabase.

## Retención

Cada campo persistido debe documentar finalidad y retención antes de migrar. Para
el modelo arcade, sesiones, session_items y player_answers se eliminan 24 horas
después de `finished` o `expired`; game_result y su alias normalizado se
conservan 30 días; y la proyección pública del ranking se purga a los 30 días
desde `completedAt`. El contenido editorial versionado se conserva mientras la
versión esté publicada o referenciada, sin datos de jugador.

La migración futura debe expresar estos plazos con timestamps de cierre,
índices de purga y eliminación en cascada. No se reutiliza automáticamente la
retención de single_choice. La decisión física sigue bloqueada para la puerta
de Supabase, pero la finalidad y los plazos del modelo ya no quedan
indeterminados.

## Puerta de Supabase

No modificar, aplicar, resetear, seedear, lintar ni publicar las migraciones
locales durante esta fase. La comparación está en
supabase-reconciliation.md.
