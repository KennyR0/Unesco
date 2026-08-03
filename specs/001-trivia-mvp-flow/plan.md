# Plan de implementación: Antídoto Arcade MIL

**Feature**: 001-trivia-mvp-flow
**Estado**: convergencia visual entregada; scoring aprobado y normativo.
Siguiente foco: sesiones/submit (US2–US3). Persistencia física Supabase
(T017–T019/T070) permanece bloqueada hasta autorización renovada.

## Resumen

El producto pasa de una trivia de cinco preguntas single_choice a un arcade de
seis juegos independientes basado en la experiencia del prototipo. Next.js
continúa siendo la tecnología nueva, pero la navegación, el lenguaje visual y
las mecánicas se reinterpretan desde prototipo/.

La primera versión tendrá portada arcade, rutas dinámicas
/games/[gameCode], un shell visual compartido, componentes especializados y
feedback educativo inline. Tendrá un ranking global secundario, accesible
desde resultados o navegación secundaria, pero no desde el landing principal.
Cada juego tendrá una sesión y un resultado propios.

## Gobernanza documental

La autoridad de producto se reparte así:

1. spec.md define alcance, historias, requisitos y criterios de éxito.
2. contracts/ define entradas, salidas, estados, seguridad y accesibilidad.
3. data-model.md define entidades, relaciones, exposición y retención.
4. plan.md define arquitectura futura y orden de diseño.
5. tasks.md es la única fuente normativa de progreso y propietarios.
6. scoring-proposal.md está aprobado desde 2026-07-31; su fórmula es normativa
   para contratos, modelo, dominio y pruebas. El archivo conserva el historial
   de la propuesta, pero ya no queda “fuera” de implementación.
7. prototype-comparison.md compara explícitamente experiencia previa y propuesta.
8. supabase-reconciliation.md conserva la auditoría de la línea base local.

El código adelantado de la aplicación y las migraciones locales no cambian la
autoridad de estos documentos.

## Contexto técnico

| Decisión | Plan |
|---|---|
| Aplicación nueva | Next.js con App Router y TypeScript estricto |
| Renderizado | Server Components por defecto; Client Components solo para interacción, foco y APIs del navegador |
| Estilos | CSS custom properties y CSS semántico por componente; Tailwind queda configurado para el código existente sin exigir una reescritura a utilidades |
| Tipografía | Anton, Archivo y Space Mono mediante `next/font`, sin solicitudes externas en runtime |
| Persistencia | Supabase server-only después de aprobar el modelo |
| Contenido visual | next/image para imágenes informativas; fallback y alt contractual |
| Despliegue | El mecanismo existente del proyecto, después de verificar Preview; no se despliega en esta revisión |
| Prototipo | Fuente de intención, experiencia y sistema visual en prototipo/; no se importa ni se enlaza como dependencia del build |

Excepción proporcional (constitución XII): la constitución lista Tailwind en el
stack aprobado; esta feature lo mantiene configurado, pero la convergencia
visual entrega tokens y CSS semántico por componente sin reescribir toda la UI
a utilidades. No se elimina Tailwind del proyecto.

“Referencia, no dependencia” no debilita la obligación visual: evita copiar el
HTML antiguo, pero exige conservar su energía, contraste, geometría, lenguaje
arcade y propósito del movimiento. La fuente normativa de implementación es
`contracts/visual-system.md`.

## Arquitectura y límites

    Portada arcade
        |
        +-- Shell de juego compartida
        |       +-- introducción e instrucciones
        |       +-- progreso y estado de carga
        |       +-- área especializada de la mecánica
        |       +-- feedback educativo inline
        |       +-- resultado del juego
        |
        +-- Servicio de sesión autoritativo
                +-- valida gameCode, sesión, item y entrada
                +-- evalúa la respuesta y el tiempo
                +-- persiste una aceptación idempotente
                +-- finaliza la sesión y materializa el resultado

Presentación no calcula corrección, puntos ni finalización. Aplicación coordina
inicio, recuperación, respuesta, avance y resultado. Dominio define las seis
entradas y estados, pero no conoce React. Infraestructura encapsula Supabase,
cookies, logs y secretos.

## Rutas y superficies

| Ruta | Responsabilidad | Estado |
|---|---|---|
| / | Portada arcade con seis tarjetas y llamada a la acción | Implementada; convergencia visual cerrada en evidencia |
| /games/[gameCode] | Introducción, partida, feedback inline y estados del shell | Shell e introducciones listos; sesión/submit pendientes |
| /games/[gameCode]/result | Proyección post-partida (alias, aprendizaje, GameScore, enlace discreto al ranking) | Diseñar/implementar en US3; no sustituye el feedback inline |
| código desconocido | Estado seguro con vuelta al arcade | Implementado en ruta dinámica |
| /leaderboard | Ranking global secundario, máximo diez resultados | Diseñar después del resultado; no aparece como tarjeta principal |
| /ranking | Ruta no canónica | Ausente/404 |

Contrato de navegación cerrado: el feedback educativo (resultado de la
decisión, explicación, señales y recomendación) DEBE mostrarse inline en la
vista de respuesta dentro del shell. `/games/[gameCode]/result` es solo la
proyección de cierre de partida; NUNCA mueve ni oculta ese feedback.

## Shell visual compartido

El shell tendrá:

- papel cálido, tinta negra, ácido, magenta, cian, ámbar y verde;
- display para títulos, cuerpo legible y mono para metadatos;
- bordes gruesos, sombras rígidas, stickers y marquee con fallback estático;
- encabezado con nombre del juego, progreso textual y estado de sesión;
- región principal con título, contenido y controles;
- región live para feedback, errores y expiración;
- acciones de continuar, reintentar y volver al arcade;
- estados de carga, vacío, error, sesión inválida y contenido no disponible.

`GameShell` recibe `gameCode` solo como contrato de presentación y expone
`data-game-code`; no gana autoridad de dominio. El mismo atributo estabiliza el
acento de `GameCard`, de modo que reordenar el catálogo no altera la identidad
de un juego.

Las tarjetas y sombras sirven a la jerarquía visual; no se debe envolver cada
elemento en una tarjeta ni convertir el arcade en una cuadrícula bento.

## Componentes específicos

| Mecánica | Concepto | Archivo de UI | Decisiones que debe soportar |
|---|---|---|---|
| real-o-ia | ImageVerdictGame | `src/components/games/real-o-ia-game.tsx` | imagen, contexto, Real/IA, pistas y fallback |
| grupo | GroupChatGame | `src/components/games/group-game.tsx` | mensajes, acciones de cuidado, consecuencia y avance |
| clickbait-swipe | HeadlineSwipeGame | `src/components/games/clickbait-swipe-game.tsx` | gesto cancelable, botones, flechas, racha y feedback |
| radar-de-fuentes | SourceRadarGame | `src/components/games/source-radar-game.tsx` | selección, categorías, estado de tarjeta y explicación |
| feed-60 | FeedTimerGame | `src/components/games/feed-60-game.tsx` | reloj textual, verificar, acción final, expiración y recuperación |
| mente-maestra | MisinformationAutopsyGame | `src/components/games/misinformation-autopsy-game.tsx` | cuatro pasos, alcance simulado, autopsia y detección |

Todos consumen el shell y el contrato común; ninguno recibe la solución privada
ni calcula la autoridad del resultado.

## Payloads y contratos

El contrato común usa un discriminante gameCode y un segundo discriminante
mechanic. Se definen en contracts/domain.ts y se explican en
contracts/mechanics.md.

Entrada pública conceptual:

- startGame: alias temporal y gameCode;
- submitGameAction: sessionId, itemId, gameCode y la entrada propia de la
  mecánica;
- advanceGame: sessionId e itemId aceptados;
- getGameState y getGameResult: identificador resuelto por sesión segura.

La entrada no acepta score, correct, solution, nextItem, completed,
remainingSeconds ni estado de sesión aportados por el cliente. El servidor
reconstruye esos valores.

Antes de responder, la proyección contiene únicamente el texto, media, contexto,
opciones y metadatos permitidos. Después de aceptar contiene feedback, señales,
recomendación y la transición pública permitida. La fórmula de puntos aprobada
en scoring-proposal.md ya es autoridad de dominio: el servidor la calcula y el
cliente nunca la aporta ni la sobrescribe.

## Modelo de datos y persistencia

El nuevo modelo conceptual contiene:

- catálogo de juegos y versiones de mecánica;
- contenido estructurado por item y variante;
- media pública con metadatos de accesibilidad;
- solución y regla privada de evaluación;
- sesión anónima por gameCode;
- item asignado dentro de esa sesión;
- respuesta aceptada idempotente;
- feedback materializado después de la transición;
- resultado propio del juego.

El ranking global se conserva desde la línea base. El modelo incorpora la
puntuación aprobada y deriva rankingScore como porcentaje normalizado para
ordenar hasta diez resultados elegibles; no reutiliza automáticamente columnas
single_choice ni altera la puntuación educativa de cada juego.

La elegibilidad se resuelve antes de ordenar: solo entran resultados `finished`
con `answered = total`, alias permitido, score acotado y `maxPoints > 0`.
Resultados expirados, inválidos, incompletos, abusivos o con denominador cero
se excluyen. El servidor calcula `rankingScore` con
`clamp(round(points / maxPoints * 100), 0, 100)` y aplica el orden estable
`rankingScore DESC`, `completedAt ASC`, `resultId ASC`; ningún campo de score o
elegibilidad del cliente es autoridad.

## Reconciliación de Supabase

supabase-reconciliation.md registra que el checkout contiene 22 migraciones
locales no versionadas y un seed no versionado, mientras que el historial
remoto se trata como vacío según la decisión de alcance. La revisión:

- conserva seguridad, sesiones y auditoría como ideas aprovechables;
- no modifica las 22 migraciones;
- no hace push, reset, seed, lint ni cambios SQL;
- no considera definitivas las tablas/RPC single_choice;
- exige comparar el modelo aprobado con cada objeto local antes de cualquier
  migración versionada nueva.

## Adaptación desde el prototipo

La adaptación se hará por intención, no por copia mecánica:

| Elemento del prototipo | Reinterpretación |
|---|---|
| Portada arcade y seis tarjetas | Portada dominante con rutas dinámicas y estados accesibles |
| Overlays de misión y resultado | Shell persistente con foco gestionado y feedback inline |
| Papel, tinta y colores fuertes | Tokens visuales compartidos, contraste comprobado y no dependencia de color |
| Gestos de Swipe | Gesto cancelable más botones y teclado |
| Feed con reloj | Temporizador autoritativo, texto visible, expiración y control accesible |
| LocalStorage de progreso | Sesión de servidor independiente por juego; no usarlo como autoridad |
| Rangos y guardado local | Resultado por juego con fórmula aprobada; ranking global secundario derivado |
| SVGs e imágenes de prueba | Media estructurada, alt, peso, fallback y futura sustitución editorial |

## Accesibilidad y responsive

Cada juego debe verificar:

- 320 px sin scroll horizontal y zoom 200 %;
- teclado completo, foco visible y orden lógico;
- touch target mínimo de 44 por 44 CSS px;
- no depender solo de color, movimiento, sonido o posición;
- live region para feedback, error, progreso y expiración;
- reduced motion con transición equivalente;
- gesto con cancelación y control alternativo;
- temporizador con texto, aviso anticipado y estado de expiración;
- alt informativo o media decorativa explícita;
- errores asociados al control que los originó.

La validación automatizada es una ayuda; la revisión manual con teclado y
tecnología de asistencia sigue siendo obligatoria.

## Rendimiento y media

- Presupuesto obligatorio de JS de interacción: 180 KB comprimidos por ruta de
  juego; 200 KB es el límite duro de fallo.
- Presupuesto obligatorio de transferencia inicial no multimedia: 350 KB
  comprimidos por ruta; cada acción cliente-servidor no debe superar 16 KB
  comprimidos salvo una justificación documentada.
- Coste de dependencias nuevas: máximo 50 KB comprimidos agregados al bundle de
  interacción por historia; cualquier excepción debe justificar su función
  educativa y su impacto.
- Presupuesto de media por imagen: 300 KB recomendado y 1 MB máximo; la media
  visible en la primera vista no debe superar 1.5 MB.
- La portada debe poder mostrar la estructura y acción principal antes de cargar
  media secundaria.
- Feed 60” no precarga todo el catálogo si no es necesario.
- Cada imagen declara dimensiones, formato, alt, comportamiento responsive y
  fallback.

Estos valores son criterios de aceptación del MVP y se validarán en T071 y en
la revisión de quickstart; una superación debe quedar registrada con causa,
impacto y decisión explícita.

## Contenido y revisión educativa

Cada item publicado debe tener:

- situación o estímulo;
- entrada permitida;
- solución privada;
- explicación;
- señales observables;
- recomendación aplicable fuera del juego;
- fuente o justificación editorial;
- versión y estado de aprobación;
- media y derechos cuando aplique.

El contenido del prototipo es material inicial. La aprobación editorial debe
ocurrir después de cerrar el esquema de cada mecánica y antes de seed.

## Estrategia de pruebas

Antes del código se preparan:

1. pruebas de contrato para cada payload discriminado;
2. pruebas de seguridad que intentan enviar solución, score, item ajeno y
   gameCode ajeno;
3. pruebas de idempotencia y carreras de submit/advance;
4. pruebas de sesión independiente entre los seis juegos;
5. pruebas de feedback completo antes de avanzar;
6. pruebas específicas de gesto, timer, expiración, selección de fuente y
   autopsia;
7. pruebas de 320 px, teclado, foco, live region, zoom y reduced motion;
8. pruebas de media ausente o demasiado pesada;
9. prueba documental de ranking global secundario, ausencia de cinco
   preguntas y single_choice como contrato vigente.

Las pruebas de valores de puntuación ya pueden prepararse con la fórmula
aprobada. Las pruebas del ranking deben confirmar baja prominencia, máximo diez
entradas globales, seguridad de alias, exclusión de estados incompletos o
expirados, `maxPoints <= 0`, clamp 0–100, desempate por fecha e identificador y
ausencia de dependencia para jugar.

## Fases de diseño e implementación posterior

Equivalencia con `tasks.md` (evitar confusión de numeración):

| Plan | tasks.md | Estado |
|---|---|---|
| Fase 0 documental | preparación + hallazgos de analyze | En cierre al alinear spec/plan/tasks |
| Fase 1 visual/shell | Phase 13 (T074–T081) + restos de T015/T021 | Convergencia visual entregada en evidencia |
| Fase 2 contratos/contenido/persistencia | Phase 2 (T005–T020) | Core lógico listo; T017–T019 bloqueadas |
| Fase 3 sesiones y juego | Phases 4–11 (US2–US9) | Siguiente foco: US2 → US3 |
| Fase 4 resultados y calidad | Phase 5 (resultado/ranking) + Phase 12 | Pendiente tras US3 |

### Fase 0 — Revisión y aprobación documental

- actualizar especificación, plan, contratos, modelo y tareas;
- ejecutar el análisis de consistencia y resolver sus hallazgos críticos;
  regenerar tasks.md solo si cambia el alcance o la descomposición;
- registrar la comparación del prototipo y la propuesta de puntuación;
- reconciliar Supabase local sin alterar sus archivos;
- mantener incorporada la fórmula aprobada en contratos y modelo;
- mantener diseñado el ranking global secundario sin añadirlo al landing
  principal.

### Fase 1 — Base visual y shell

- implementar tokens semánticos, `next/font`, texturas y primitivas físicas;
- construir portada, control global de movimiento, shell y estados comunes;
- restilizar únicamente ¿Real o IA?, El Grupo, Clickbait Swipe y Radar de
  Fuentes sin alterar eventos, payloads ni evaluación;
- verificar 1440×900, 390×844, 320 px, zoom 200 %, navegación, movimiento,
  responsive y accesibilidad base.

Esta fase se ejecuta con CSS por componentes sobre la interfaz existente. No
añade componentes ni lógica de Feed 60 o Mente Maestra; sus acentos quedan
definidos solamente en el contrato visual.

### Fase 2 — Contratos, contenido y persistencia aprobados

- payloads discriminados y fórmula por juego ya cerrados en contratos/modelo;
- diseñar migraciones nuevas o decisión de reemplazo (línea T017–T019);
- distinguir contenido estructuralmente válido de aprobación editorial final.

La aprobación física de Supabase solo habilita la línea de persistencia. Las
sesiones lógicas, mecánicas, componentes y pruebas pueden avanzar con el
gateway y fixtures server-only mientras esa decisión está pendiente.

### Fase 3 — Sesiones y juego

- implementar sesiones independientes (US2) antes de tratar un juego como
  jugable de punta a punta;
- completar submit/feedback/resultado (US3);
- implementar cada mecánica como historia aislable con fixtures hasta que
  US2/US3 cierren el transporte autoritativo;
- mantener feedback inline y autoridad en servidor.

### Fase 4 — Resultados y calidad

- materializar resultado propio por juego;
- verificar seguridad, accesibilidad, responsive, rendimiento y contenido;
- preparar Preview solo con puertas completas.

No se inicia una fase posterior por la mera existencia de una ruta o un archivo.

## Dependencias

    aprobación de alcance
        -> payloads, modelo y fórmulas aprobadas
            -> shell, fixtures server-only y sesiones lógicas
                -> seis mecánicas y resultados
                    -> Preview y verificación final
            -> ranking global secundario
                -> migraciones nuevas y RLS (línea condicionada)

Las seis mecánicas pueden desarrollarse en paralelo después de que el shell,
los contratos y el modelo estén aprobados, pero cada una debe tener su prueba
independiente y no compartir archivos de dominio sensibles sin coordinación.

## Comprobación constitucional

| Principio | Resultado |
|---|---|
| Educación antes que competencia | PASS documental: feedback, señales y recomendación preceden al avance |
| Contract-First | PASS: el contrato visual y de accesibilidad precede a la convergencia de código |
| Servidor como fuente de verdad | PASS de diseño: cliente no aporta solución, score ni finalización |
| Privacidad mínima | PASS de diseño: alias temporal y sesión por juego |
| Accesibilidad | PASS de requisitos; pausa global y equivalencia estática son verificables |
| Mobile-First y rendimiento | PASS de presupuestos fijados; medición queda pendiente |
| Seguridad de Supabase | PASS como restricciones; migraciones nuevas bloqueadas |
| Separación contenido/lógica | PASS mediante contenido estructurado y payloads |
| Tipado/validación | PASS como puerta de implementación |
| Tareas pequeñas | PASS en tasks.md nueva |
| Verificación antes de completar | PASS: cada puerta tiene criterio y registro |
| Alcance proporcional | PASS: seis juegos, ranking global secundario y sin auth compleja |

La constitución 1.0.0 enumera ranking global persistido en el alcance del MVP.
La decisión del 2026-07-31 lo conserva como capacidad secundaria, fuera del
landing y subordinada al feedback educativo; no hay contradicción de alcance
pendiente.

## Complexity Tracking

No se propone ranking como eje competitivo, autenticación permanente ni una
abstracción genérica de mecánicas que oculte diferencias reales. El ranking
global secundario es una lectura acotada de resultados finalizados y el
discriminante común solo evita duplicar transporte; cada juego conserva su
componente y evaluación especializada.
