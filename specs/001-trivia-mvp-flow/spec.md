# Especificación de feature: Antídoto Arcade MIL

**Feature**: 001-trivia-mvp-flow
**Revisión**: arcade basado en el prototipo
**Creada**: 2026-07-31
**Estado**: backlog regenerado; análisis de consistencia pendiente antes de
implementar

## Cambio de alcance

Esta revisión supersede como objetivo de producto la especificación anterior de
una ronda de cinco preguntas single_choice. El código existente, los contratos
anteriores y las 22 migraciones locales permanecen como material histórico de
auditoría; no constituyen autorización para continuar la implementación.

La primera versión redefinida es un arcade educativo de seis juegos
independientes, inspirado en la experiencia, estilo y navegación del directorio
prototipo/. El prototipo es una referencia de producto, no una dependencia
técnica del nuevo build.

## Objetivo

Permitir que una persona practique alfabetización mediática e informacional en
seis experiencias breves, visuales y rejugables. Cada juego debe enseñar una
habilidad concreta mediante una decisión, una consecuencia y una explicación
educativa en la misma vista.

## Alcance incluido

- Portada arcade visualmente dominante con seis juegos.
- Rutas independientes para cada juego:
  real-o-ia, grupo, clickbait-swipe, radar-de-fuentes, feed-60 y
  mente-maestra.
- Una sesión anónima independiente por juego; empezar otro juego no reutiliza
  ni muta la sesión anterior.
- Shell compartida de introducción, instrucciones, progreso, estado de
  respuesta, feedback inline y resultado propio del juego.
- Componentes de interacción específicos para cada mecánica.
- Servidor autoritativo para validar entradas, evaluar respuestas, controlar
  intentos, finalizar la sesión y calcular el resultado.
- Contenido estructurado y solución privada, sin revelar la respuesta antes de
  una respuesta aceptada o una expiración autoritativa.
- Adaptación responsive desde 320 px, teclado, foco visible, anuncios de
  estado, texto alternativo y reduced motion.
- Contenido inicial adaptado del prototipo, sujeto a revisión educativa y a
  sustitución posterior de imágenes provisionales por imágenes reales o
  definitivas.

## Fuera de alcance de esta redefinición

- Ranking como eje de competencia, llamada principal del landing o elemento que
  condicione el aprendizaje. Se permite un ranking secundario y discreto.
- Cuenta permanente, correo, perfil social o autenticación compleja.
- Partidas multijugador, equipos, chat y premios.
- Panel editorial completo o generación automática de contenido con IA.
- Copiar el prototipo como dependencia o conservar sus defectos de UX.
- Cerrar fórmulas de puntuación sin aprobación explícita.
- Implementar frontend, migraciones, seed, reset, lint o push de Supabase en
  esta fase documental.

## Dirección visual y de interacción

La reinterpretación debe conservar la personalidad arcade del prototipo:

- papel cálido e tinta negra;
- ácido, magenta, cian, ámbar y verde como acentos;
- tipografía display para titulares, cuerpo legible y mono para metadatos;
- bordes gruesos, sombras rígidas, stickers, marquee y tarjetas arcade;
- portada dominante, con lectura clara de los seis destinos;
- feedback educativo dentro de la vista actual, nunca escondido en una pestaña;
- animaciones con alternativa equivalente cuando la persona prefiere menos
  movimiento.

El nuevo diseño debe corregir desbordamientos, foco perdido, dependencia de
color, controles pequeños, mensajes efímeros no anunciados y cualquier
interacción táctil que no tenga alternativa de teclado.

## Matriz de mecánicas

| Código | Juego | Interacción principal | Entrada discriminada | Salida pública después de responder | Feedback educativo |
|---|---|---|---|---|---|
| real-o-ia | ¿Real o IA? | Observar imagen y elegir Real o Generada por IA | verdict: real o ai | Veredicto aceptado, imagen, pistas observables y siguiente acción | Manos, texto, sombras, anatomía, textura y búsqueda inversa |
| grupo | El Grupo | Leer chat y escoger reenviar, verificar o frenar | action: forward, verify o pause | Consecuencia narrativa, evaluación de la acción y siguiente escena | Fuente oficial, contexto, phishing, daño de amplificar y responsabilidad comunitaria |
| clickbait-swipe | Clickbait Swipe | Deslizar, usar botones o flechas para clasificar titular | classification: journalism o clickbait | Clasificación aceptada, señales del titular y estado de racha | Urgencia, mayúsculas, vaguedad, emoción extrema y curiosity gap |
| radar-de-fuentes | Radar de Fuentes | Seleccionar una fuente y asignar una categoría | category: reliable, doubtful o fraudulent | Categoría aceptada, razones y progreso de clasificación | Dominio, autor, fecha, referencias, sátira, suplantación y phishing |
| feed-60 | Feed 60” | Revisar publicación, opcionalmente verificar y compartir o descartar | action: verify, share o discard | Tiempo restante, pistas de verificación, decisión aceptada y feedback | SIFT, contexto, fuente, fecha, gráfico manipulado y responsabilidad de compartir |
| mente-maestra | Mente Maestra | Elegir cuatro piezas de una fake news y leer su autopsia | step choice por objetivo, emoción, titular y prueba | Simulación de alcance, autopsia y recomendaciones de detección | Cómo se combinan miedo, autoridad falsa, formatos oficiales, imagen reciclada o IA y ejes truncados |

La matriz define interacción y aprendizaje, no una fórmula aprobada de puntos.
La propuesta separada está en scoring-proposal.md.

## User Scenarios & Testing

Las historias P1 son obligatorias para el corte documental y las historias de
juego deben poder probarse de forma aislada después de aprobar los contratos.

### US1 — Descubrir el arcade (Priority: P1)

Como visitante quiero entender rápidamente el propósito de Antídoto y elegir
uno de seis juegos.

**Criterios de aceptación**

1. La portada muestra los seis nombres, una descripción de la habilidad que
   enseña cada uno y una acción clara para abrirlo.
2. En 320 px no existe desplazamiento horizontal y la acción principal se
   puede alcanzar con teclado.
3. La portada no presenta una tarjeta ni llamada principal de ranking; el acceso
   puede aparecer después del resultado o en navegación secundaria.
4. Un código inválido muestra un estado seguro y ofrece volver al arcade.

### US2 — Jugar con una sesión independiente (Priority: P1)

Como jugador anónimo quiero comenzar un juego sin registro y conservar su estado
sin mezclarlo con otros juegos.

**Criterios de aceptación**

1. Un alias temporal válido y un gameCode válido crean una sesión vinculada a
   ese juego.
2. Cada nuevo juego crea una sesión nueva; recargar recupera solo la sesión
   correspondiente si sigue vigente.
3. La sesión no acepta un gameCode distinto ni un item que no le pertenezca.
4. Un alias inválido, una sesión desconocida, una sesión expirada y un estado
   incierto tienen mensajes comprensibles y acciones de recuperación.

### US3 — Responder y aprender en la misma vista (Priority: P1)

Como jugador quiero ver qué ocurrió y por qué antes de pasar al siguiente
desafío.

**Criterios de aceptación**

1. El cliente envía solo la entrada propia de la mecánica; nunca envía la
   solución, puntos, resultado de corrección ni estado final como autoridad.
2. Una respuesta aceptada produce una sola retroalimentación inline con
   resultado, explicación, señales y recomendación aplicable fuera del juego.
3. No se permite avanzar mientras la respuesta está procesándose y no se puede
   editar una respuesta ya aceptada.
4. Un reintento por doble clic o red incierta devuelve el mismo resultado o
   registra una sola respuesta.
5. La retroalimentación no depende únicamente de color y se anuncia de forma
   accesible.

### US4 — Detectar imágenes sintéticas (Priority: P1)

Como jugador quiero decidir si una imagen es real o generada por IA y aprender a
inspeccionarla.

**Criterios de aceptación**

1. La partida presenta una imagen con contexto y exactamente las dos decisiones
   disponibles.
2. Después del veredicto se muestran las pistas concretas de esa imagen y una
   acción para continuar.
3. La imagen tiene texto alternativo útil o se marca como decorativa cuando
   corresponda; una imagen no disponible conserva la pregunta y el feedback.
4. Las imágenes provisionales se identifican como contenido sujeto a sustitución
   y no bloquean el contrato de interacción.

### US5 — Decidir dentro de El Grupo (Priority: P1)

Como jugador quiero practicar cómo responder a mensajes que pueden dañar a
otras personas.

**Criterios de aceptación**

1. Cada escena presenta el mensaje y las acciones de reenviar, verificar o
   frenar que correspondan a esa escena.
2. La acción elegida produce una consecuencia narrativa y explica la acción
   verificadora o protectora más adecuada.
3. El flujo no premia el cinismo automático: también puede ser correcto
   compartir una alerta oficial verificada.
4. Los mensajes y controles se pueden recorrer y activar con teclado y lector
   de pantalla.

### US6 — Separar periodismo de clickbait (Priority: P1)

Como jugador quiero clasificar titulares rápido sin perder la explicación.

**Criterios de aceptación**

1. Cada titular se puede clasificar con gesto, botones y flechas de teclado.
2. El gesto tiene un umbral claro, cancelación visible y alternativa sin gesto.
3. La tarjeta revela las señales del titular después de cada decisión y mantiene
   una racha solo como información motivacional.
4. La siguiente tarjeta no aparece antes de que el feedback sea perceptible y
   anunciable.

### US7 — Calibrar Radar de Fuentes (Priority: P1)

Como jugador quiero distinguir una fuente confiable, dudosa o fraudulenta.

**Criterios de aceptación**

1. El jugador puede seleccionar una fuente y elegir exactamente una de las tres
   categorías.
2. Una decisión queda registrada una sola vez; el estado de la tarjeta y el
   progreso se recuperan al recargar.
3. El feedback identifica las señales que justifican la clasificación y
   distingue sátira u opinión de fraude.
4. La interacción de seleccionar y clasificar tiene equivalentes de teclado y
   foco visible.

### US8 — Priorizar en Feed 60” (Priority: P1)

Como jugador quiero decidir qué compartir, descartar o verificar bajo presión
de tiempo sin perder accesibilidad.

**Criterios de aceptación**

1. El tiempo restante es visible en texto y no se comunica solo mediante una
   barra o color.
2. Verificar revela pistas y consume el tiempo definido por el contrato; solo
   después se puede tomar la decisión final.
3. La expiración autoritativa termina la sesión una sola vez y muestra el
   feedback de la última decisión aceptada.
4. El jugador puede pausar la animación o recuperar el foco de forma
   comprensible; la pausa visual no detiene el reloj autoritativo y ninguna
   animación impide la acción equivalente con teclado.

### US9 — Desmontar una fake news (Priority: P1)

Como jugador quiero construir una simulación controlada y reconocer después sus
técnicas de manipulación.

**Criterios de aceptación**

1. El flujo presenta cuatro pasos: objetivo, emoción, titular y prueba.
2. Todas las opciones producen una simulación educativa, sin publicar contenido
   real ni ofrecer una cuenta o alcance real.
3. La autopsia aparece en la misma vista y convierte las técnicas elegidas en
   señales para detectarlas.
4. El resultado no premia hacer una manipulación más dañina; la viralidad es
   una representación acotada para explicar el mecanismo.

## Requisitos funcionales

- **FR-001**: El sistema debe publicar un catálogo de exactamente seis juegos
  con gameCode estable, nombre, objetivo, mecánica, estado de disponibilidad y
  ruta.
- **FR-002**: La ruta de juego debe resolver el gameCode desde una lista
  permitida; valores desconocidos no deben seleccionar contenido por defecto.
- **FR-003**: Cada juego debe usar una sesión independiente con alias
  temporal, estado, progreso, respuestas aceptadas y resultado propios.
- **FR-004**: Los payloads de estado y entrada deben ser discriminados por
  gameCode y mechanic; no se debe forzar a todos los juegos a single_choice.
- **FR-005**: El servidor debe validar identidad de sesión, pertenencia del
  item, estado, duplicado, entrada permitida, límite temporal cuando aplique,
  corrección y finalización.
- **FR-006**: La proyección previa a responder debe excluir soluciones,
  claves de evaluación, puntos por opción y cualquier campo que permita
  inferirlos.
- **FR-007**: La respuesta aceptada debe devolver solo el feedback permitido
  para ese item, la transición siguiente y el resultado provisional que el
  contrato apruebe.
- **FR-008**: El feedback educativo de cada item debe contener respuesta o
  decisión correcta, explicación, señales observables y recomendación aplicable.
- **FR-009**: El resultado de cada juego debe mostrar alias temporal, juego,
  estado final, contadores de aprendizaje y la puntuación aprobada en
  scoring-proposal.md.
- **FR-010**: El sistema debe conservar un ranking global secundario, con un
  máximo de diez resultados elegibles, accesible desde el resultado o una
  navegación secundaria, pero no desde una llamada principal del landing.
  rankingScore debe normalizar las escalas de los juegos solo para ordenar la
  lectura global; el ranking no debe ocultar, sustituir ni condicionar el
  feedback educativo. Solo son elegibles resultados con estado `finished`,
  todos sus items respondidos, alias normalizado y permitido, score válido y
  `maxPoints > 0`; las sesiones incompletas, expiradas, inválidas, abusivas o
  con denominador cero quedan fuera.
- **FR-011**: Feed 60” debe aplicar expiración autoritativa y comunicarla con
  texto. Su control de pausa solo detiene animaciones y recupera el foco; no
  detiene ni extiende el reloj del servidor. Los otros juegos no deben recibir
  un temporizador por defecto.
- **FR-012**: Mente Maestra debe separar alcance simulado de puntuación
  educativa y no debe producir una publicación externa.
- **FR-013**: El contenido debe vivir como datos estructurados versionables y
  una mecánica debe poder reutilizar el shell sin copiar textos en componentes.
- **FR-014**: Las imágenes informativas deben tener dimensión, formato, peso
  máximo, alt o tratamiento decorativo, comportamiento responsive y fallback.
- **FR-015**: Todo control debe funcionar con teclado, foco visible, orden
  lógico, tamaño táctil medible, mensajes asociados y soporte para zoom 200 %.
- **FR-016**: El diseño debe funcionar desde 320 px sin scroll horizontal y
  debe respetar prefers-reduced-motion.
- **FR-017**: La sesión debe funcionar sin registro obligatorio y solo persistir
  datos con finalidad y retención documentadas.
- **FR-018**: Ningún secreto de Supabase o autoridad de servidor puede aparecer
  en payload, cliente o contenido público.
- **FR-019**: Antes de implementar debe existir aprobación de contratos,
  modelo, estrategia de pruebas, alcance, puntuación y reconciliación de
  migraciones; la puntuación de scoring-proposal.md ya está aprobada y debe
  quedar incorporada en los contratos.

## Elegibilidad y casos límite del ranking global

El ranking global es una proyección secundaria y derivada. El servidor debe
aplicar estas reglas antes de ordenar o limitar la respuesta:

- un resultado solo es elegible cuando `status = finished`, `answered = total`,
  `total > 0`, el alias normalizado supera moderación, no tiene marca de abuso o
  invalidez y `points` es finito y está dentro de `0 <= points <= maxPoints`;
- un resultado `expired`, `invalid`, incompleto, repetido sin finalización o con
  `maxPoints <= 0` no participa y no recibe `rankingScore` público;
- el servidor calcula `rankingScore = clamp(round(points / maxPoints * 100), 0,
  100)` después de comprobar el denominador; ningún valor enviado por el
  cliente puede modificarlo;
- la proyección se ordena por `rankingScore DESC`, luego `completedAt ASC` y
  finalmente `resultId ASC` para que los empates sean reproducibles, y se
  limita a diez entradas;
- un fallo del ranking no bloquea iniciar, jugar, aprender o consultar el
  resultado propio.

## Estados comunes

| Estado | Significado | Siguiente transición |
|---|---|---|
| intro | Juego elegido, instrucciones visibles | start |
| active | Item público disponible y no respondido | submit |
| processing | Entrada enviada y sin resultado confirmado | accepted o error |
| feedback | Respuesta aceptada y explicación visible | next o finished |
| expired | Sesión o límite temporal expirado autoritativamente | result |
| finished | Todos los items resueltos o expiración | result |
| invalid | La sesión no se puede recuperar | arcade o nueva sesión |

No se permite una transición del cliente que salte de active a finished ni que
reabra feedback o una respuesta aceptada.

## Puerta de puntuación

La propuesta de scoring-proposal.md fue aprobada el 2026-07-31 y ya fue
incorporada al contrato y al modelo con la fórmula por juego, sus límites, el
tratamiento de errores, el tiempo y el resultado educativo. El backlog ya fue
regenerado; la siguiente puerta es ejecutar el análisis de consistencia y
resolver sus hallazgos antes de implementar la lógica.

## Supuestos

- La feature sigue en specs/001-trivia-mvp-flow y no se crea una 002.
- Next.js sigue siendo la tecnología nueva del build, pero se documenta en
  plan.md, no como dependencia del prototipo.
- El contenido actual del prototipo es semilla inicial y no aprobación
  editorial definitiva.
- Las imágenes de ¿Real o IA? pueden ser provisionales en esta fase y deberán
  sustituirse o aprobarse antes de producción.
- Cada juego tiene su propia sesión y resultado.
- El ranking global se conserva como capacidad secundaria, no aparece en el
  landing principal y no compite con el feedback. Esta decisión mantiene la
  capacidad prevista por la constitución sin convertirla en el objetivo del
  producto.

## Criterios de éxito

- **SC-001**: Una persona puede identificar los seis juegos y abrir cualquiera
  desde la portada en menos de 30 segundos durante una prueba moderada.
- **SC-002**: El flujo completo de cada juego funciona desde 320 px sin scroll
  horizontal y con zoom de 200 %.
- **SC-003**: En pruebas de teclado, el 100 % de los controles de portada,
  shell, mecánica, feedback y resultado tiene foco visible y orden lógico.
- **SC-004**: Cada decisión aceptada muestra feedback educativo inline antes de
  permitir avanzar; ninguna historia deja la explicación detrás de otra ruta.
- **SC-005**: Un payload previo a responder no contiene solución, puntos por
  opción ni clave de evaluación en revisión contractual y prueba de frontera.
- **SC-006**: Dos sesiones iniciadas en juegos distintos no comparten progreso,
  respuesta, expiración ni resultado.
- **SC-007**: Una entrada repetida por reintento no genera más de un registro
  aceptado ni cambia el feedback ya confirmado.
- **SC-008**: Feed 60” comunica el tiempo restante en texto, gestiona la
  expiración una sola vez y ofrece una alternativa accesible a cada acción.
- **SC-009**: Los seis juegos tienen contenido estructurado con explicación,
  señales y recomendación para cada item publicado.
- **SC-010**: La revisión documental final muestra el ranking global únicamente
  como capacidad secundaria, fuera del landing y sin lenguaje competitivo como
  objetivo; elimina cinco preguntas y single_choice como contrato vigente, y
  registra la fórmula aprobada sin ocultar el feedback.

## Cumplimiento constitucional

| Principio | Estado de esta revisión |
|---|---|
| I. Educación antes que competencia | Cumplido: feedback inline, señales y recomendación son obligatorios; el ranking es secundario y no condiciona el aprendizaje |
| II. Contract-First | Cumplido como puerta: contratos y modelo se actualizan antes de código |
| III. Servidor como fuente de verdad | Cumplido como requisito: solución, evaluación, tiempo y resultado son autoritativos |
| IV. Privacidad mínima | Cumplido: alias temporal y sesiones sin registro |
| V. Accesibilidad obligatoria | Incluido en FR-015/FR-016 y contrato específico |
| VI. Mobile-First y rendimiento | Incluido desde 320 px, con presupuestos medibles en plan.md y estados visibles |
| VII. Seguridad de Supabase | Preservado como base, pero las migraciones viejas no se consideran definitivas |
| VIII. Separación de contenido y lógica | Cumplido mediante payloads discriminados y contenido estructurado |
| IX. Tipado y validación | Requerido para contratos y datos externos en la fase de implementación |
| X. Tareas pequeñas | La nueva tasks.md separa puertas documentales y futuras fases |
| XI. Verificación antes de completar | Se conservan evidencias históricas y se exige nueva aprobación |
| XII. Alcance proporcional | Se mantienen seis juegos, ranking global secundario y sin auth compleja |

La decisión del 2026-07-31 mantiene el ranking dentro del alcance, pero lo
desplaza fuera del landing principal y lo subordina al aprendizaje. No se
requiere enmienda constitucional para esta interpretación; la implementación
del ranking sigue sujeta a seguridad, privacidad y verificaciones propias.
