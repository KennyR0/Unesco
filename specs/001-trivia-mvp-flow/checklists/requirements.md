# Checklist de calidad documental: Antídoto Arcade MIL

**Purpose**: Validar la redefinición documental antes de regenerar tareas de
implementación.

**Created**: 2026-07-31
**Feature**: spec.md
**Estado**: revisión ejecutada; puntuación y ranking global secundario aprobados; backlog ejecutable pendiente

## Alcance y coherencia de producto

- [x] El alcance define exactamente seis juegos y sus gameCode.
- [x] La portada arcade y las rutas dinámicas están descritas.
- [x] Cada juego tiene interacción, entrada, salida, feedback y criterio de prueba.
- [x] Las sesiones y resultados son independientes por juego.
- [x] El ranking global se conserva solo como resultado secundario, fuera del landing principal y sin ser el objetivo competitivo.
- [x] La relación con prototipo/ distingue referencia de dependencia técnica.

## Contratos y seguridad

- [x] domain.ts contiene payloads discriminados por gameCode y mechanic.
- [x] La proyección previa no contiene solución, regla privada ni puntuación.
- [x] El servidor conserva autoridad sobre sesión, item, evaluación, tiempo y finalización.
- [x] Hay reglas de idempotencia, carreras, errores y recuperación.
- [x] Las soluciones y respuestas permanecen fuera de exposición pública.
- [x] El modelo no reutiliza automáticamente tablas single_choice.

## Educación

- [x] Cada item exige explicación, señales y recomendación.
- [x] El feedback aparece inline antes de avanzar.
- [x] Mente Maestra separa simulación de daño real y autopsia.
- [x] La puntuación no puede sustituir ni bloquear el feedback.
- [x] La propuesta de puntuación tiene aprobación explícita registrada.

## Accesibilidad y responsive

- [x] Se fija 320 px sin scroll horizontal.
- [x] Se fija zoom 200 %, teclado, foco visible, live region y reduced motion.
- [x] Clickbait Swipe tiene alternativa sin gesto.
- [x] Feed 60” comunica tiempo en texto y documenta expiración.
- [x] Media exige alt, dimensiones, peso, responsive y fallback.
- [X] La verificación manual/hardware queda definida como condición de cierre y se ejecutará en T067/T072; no bloquea la migración T017.

## Supabase y gobernanza

- [x] Se cuentan las 22 migraciones locales.
- [x] Se registra que no están versionadas en Git.
- [x] Se registra que no se modifican ni publican en esta fase.
- [x] Se documenta la comparación futura con el nuevo modelo.
- [x] La decisión de ranking global secundario es compatible con la constitución 1.0.0.
- [X] El backlog ejecutable fue regenerado después de las aprobaciones.

## Notas

El único check de planificación pendiente es regenerar el backlog ejecutable.
No se debe ejecutar speckit-implement mientras esa tarea permanezca abierta.
