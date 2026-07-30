# Feature Specification: Trivia educativa MVP

**Feature Branch**: `main`

**Created**: 2026-07-29

**Status**: Approved

**Functional approval recorded**: 2026-07-30

**Approval basis**: La persona responsable solicitó expresamente planificar y
descomponer en tareas esta “especificación vigente”; la aprobación funcional no se
infiere de la mera existencia de contratos.

**Input**: Definir el corte vertical funcional de la primera versión de Antídoto,
desde la explicación inicial y el alias temporal hasta la ronda educativa, el
resultado y el ranking global.

## Scope

### Objective

Entregar un flujo público, anónimo, Mobile-First y demostrable que permita a una
persona comprender el propósito educativo de Antídoto, completar una ronda de
selección única, aprender mediante retroalimentación inmediata y consultar su
resultado y el ranking global.

### In Scope

- Página pública de inicio y explicación breve del propósito educativo.
- Instrucciones breves, alias temporal y validación comprensible.
- Sesión de juego anónima sin cuenta permanente.
- Una ronda configurable de preguntas de selección única, con cinco preguntas por
  defecto para la demostración.
- Preguntas de texto y preguntas con imagen acompañada por texto.
- Una pregunta por vez, una única respuesta por pregunta y progreso visible.
- Validación de respuestas, control de intentos y puntuación en el servidor.
- Retroalimentación educativa inmediata después de cada respuesta aceptada.
- Finalización única, pantalla de resultados, ranking global y opción de volver a
  jugar.
- Experiencia Mobile-First, navegación mediante teclado y estados de carga, envío,
  vacío y error.

### Out of Scope

- Registro con correo o contraseña, perfiles permanentes y recuperación de cuentas.
- Panel administrativo o creación y edición de preguntas desde la interfaz.
- Equipos, partidas multijugador o chat.
- Compartir resultados en redes sociales o entregar premios.
- Generación de preguntas mediante inteligencia artificial.
- Mecánicas de trivia distintas de selección única.
- Moderación avanzada de alias y sistema antifraude avanzado.
- Estadísticas personales históricas.
- Temporizadores obligatorios o bonificaciones por velocidad.

### Actors

- **Visitante**: persona que todavía no ha iniciado una partida. Puede comprender el
  propósito, consultar instrucciones, ingresar un alias, iniciar una partida y
  consultar el ranking público.
- **Jugador anónimo**: visitante con una sesión temporal. Puede responder preguntas,
  consultar progreso, recibir retroalimentación, finalizar, consultar su resultado y
  comenzar otra partida. No tiene una cuenta permanente.

## User Scenarios & Testing *(mandatory)*

Las prioridades indican orden de entrega y aislamiento de pruebas, no opcionalidad.
Las siete historias son obligatorias para completar esta especificación.

### User Story US1 - Comprender el propósito de Antídoto (Priority: P1)

Como visitante, quiero comprender rápidamente de qué trata Antídoto para decidir si
deseo participar.

**Why this priority**: Es la puerta de entrada al aprendizaje y permite que una
persona tome una decisión informada antes de jugar.

**Independent Test**: Abrir la pantalla inicial sin sesión, comprobar que una persona
entiende el propósito en lenguaje no técnico y que puede comenzar o consultar el
ranking.

**Acceptance Scenarios**:

1. **AC-US1-01** — **Given** una persona abre Antídoto, **When** consulta el contenido inicial,
   **Then** encuentra una explicación breve de que la experiencia enseña a reconocer
   desinformación y contenido engañoso.
2. **AC-US1-02** — **Given** la pantalla inicial está visible en un viewport de 320 píxeles,
   **When** la persona revisa el contenido principal, **Then** puede leerlo sin
   desplazamiento horizontal e identifica claramente la acción para comenzar.
3. **AC-US1-03** — **Given** la persona utiliza únicamente teclado, **When** recorre la pantalla,
   **Then** alcanza y activa la acción principal con orden de foco lógico y foco
   visible.
4. **AC-US1-04** — **Given** la persona no ha iniciado una partida, **When** elige consultar el
   ranking, **Then** puede abrirlo sin registro ni sesión de juego.

---

### User Story US2 - Iniciar una partida con alias temporal (Priority: P1)

Como visitante, quiero ingresar un alias temporal para participar sin crear una
cuenta.

**Why this priority**: La sesión anónima permite participar con privacidad mínima y
establece el contexto confiable de toda la ronda.

**Independent Test**: Probar valores válidos e inválidos en el formulario y confirmar
que solo un alias válido produce una sesión independiente y utilizable.

**Acceptance Scenarios**:

1. **AC-US2-01** — **Given** el visitante escribe un alias válido de entre 3 y 20 caracteres visibles,
   **When** inicia la partida, **Then** se eliminan los espacios externos, se conserva
   el alias resultante y se crea una sesión anónima independiente.
2. **AC-US2-02** — **Given** el alias está vacío, contiene solo espacios, mide menos de 3 o más de
   20 caracteres, **When** se intenta enviar, **Then** no se inicia la partida y se
   muestra un mensaje específico asociado al campo.
3. **AC-US2-03** — **Given** el alias contiene un carácter no permitido o coincide con la lista
   básica de bloqueos, **When** se valida, **Then** se rechaza con un mensaje asociado
   al campo que identifica si debe corregir el formato o elegir otro alias, sin
   revelar normalización, fixture ni diagnóstico técnico.
4. **AC-US2-04** — **Given** el formulario está disponible, **When** se completa únicamente con
   teclado, **Then** todos sus controles y mensajes son alcanzables y comprensibles.
5. **AC-US2-05** — **Given** ocurre un fallo al crear la sesión, **When** el sistema comunica el
   error, **Then** se conserva el alias, se ofrece reintentar y no queda una partida
   incompleta utilizable.
6. **AC-US2-06** — **Given** el alias ya es válido, **When** el visitante está por
   iniciar, **Then** se le informa que su alias y puntuación pueden mostrarse en el
   ranking público y puede continuar o corregir el alias.

---

### User Story US3 - Responder una ronda de trivia (Priority: P1)

Como jugador anónimo, quiero responder una ronda de preguntas para poner a prueba mi
capacidad de reconocer desinformación.

**Why this priority**: Es la interacción central que permite practicar las señales de
alfabetización mediática e informacional.

**Independent Test**: Iniciar una sesión con cinco preguntas elegibles y completar
cada selección comprobando unicidad, protección de la solución y recuperación ante
un envío fallido.

**Acceptance Scenarios**:

1. **AC-US3-01** — **Given** existe una sesión válida, **When** comienza la ronda, **Then** se presenta
   una pregunta por vez, entre 2 y 4 opciones y la posición textual dentro del total.
2. **AC-US3-02** — **Given** una pregunta contiene imagen, **When** se presenta, **Then** también
   contiene texto y la imagen informativa ofrece una alternativa textual apropiada.
3. **AC-US3-03** — **Given** ninguna opción está seleccionada, **When** se intenta enviar,
   **Then** no se realiza el envío y se muestra un error asociado al grupo de
   opciones.
4. **AC-US3-04** — **Given** el jugador usa teclado, **When** recorre y selecciona las opciones,
   **Then** puede elegir exactamente una y enviar su respuesta.
5. **AC-US3-05** — **Given** la pregunta todavía está pendiente, **When** se solicita su contenido,
   **Then** el navegador no recibe la respuesta correcta ni información que permita
   inferir la regla privada de evaluación.
6. **AC-US3-06** — **Given** el servidor acepta una respuesta, **When** termina el procesamiento,
   **Then** la respuesta queda registrada una sola vez y ya no puede cambiarse.
7. **AC-US3-07** — **Given** ocurre doble clic, pérdida temporal de conexión o un resultado de envío
   incierto, **When** el jugador reintenta, **Then** el sistema recupera la respuesta
   ya aceptada o registra una sola, sin duplicarla y conservando la selección.
8. **AC-US3-08** — **Given** la ronda está en curso, **When** el jugador permanece en una pregunta,
   **Then** no existe un temporizador obligatorio ni una bonificación por velocidad.

---

### User Story US4 - Recibir retroalimentación educativa (Priority: P1)

Como jugador anónimo, quiero entender por qué mi respuesta es correcta o incorrecta
para aprender de cada pregunta.

**Why this priority**: La constitución establece que el aprendizaje tiene prioridad
sobre la competencia y la puntuación.

**Independent Test**: Responder correctamente e incorrectamente una pregunta y
comprobar que ambos resultados presentan retroalimentación completa y accesible antes
de permitir avanzar.

**Acceptance Scenarios**:

1. **AC-US4-01** — **Given** una respuesta fue aceptada, **When** aparece la retroalimentación,
   **Then** se indica si fue correcta o incorrecta sin depender únicamente del color.
2. **AC-US4-02** — **Given** la selección fue incorrecta, **When** se presenta el resultado,
   **Then** se identifica la opción correcta.
3. **AC-US4-03** — **Given** cualquier respuesta aceptada, **When** se muestra la retroalimentación,
   **Then** incluye una explicación educativa coherente con la respuesta correcta,
   al menos una señal relevante para detectar desinformación y una recomendación
   clara y aplicable fuera del juego, tomadas de una versión de contenido con
   aprobación educativa vigente y evidencia completa.
4. **AC-US4-04** — **Given** una tecnología de asistencia está activa, **When** cambia el estado a
   respondida, **Then** la retroalimentación importante se anuncia de forma
   comprensible.
5. **AC-US4-05** — **Given** la respuesta sigue procesándose, **When** el jugador intenta continuar,
   **Then** la acción permanece no disponible.
6. **AC-US4-06** — **Given** la retroalimentación ya está completa, **When** el jugador decide
   continuar, **Then** avanza a la siguiente pregunta sin abandonar la experiencia.

---

### User Story US5 - Consultar el progreso de la ronda (Priority: P1)

Como jugador anónimo, quiero conocer mi progreso para entender cuánto falta para
terminar.

**Why this priority**: Mantiene orientado al jugador y permite recuperar el flujo sin
comprometer respuestas ya confirmadas.

**Independent Test**: Avanzar por una ronda, recargar en distintos estados y
comprobar que el progreso confirmado se conserva sin habilitar modificaciones ni
duplicados.

**Acceptance Scenarios**:

1. **AC-US5-01** — **Given** la ronda está activa, **When** se muestra una pregunta,
   **Then** aparece la posición actual y el total mediante texto además de cualquier
   indicador visual.
2. **AC-US5-02** — **Given** el jugador avanza, **When** aparece la siguiente pregunta,
   **Then** el progreso se actualiza y no existe una acción para volver a modificar
   respuestas anteriores.
3. **AC-US5-03** — **Given** se recarga el navegador con una sesión activa todavía válida,
   **When** termina la recuperación, **Then** se restaura el alias, las respuestas
   aceptadas, la retroalimentación confirmada y la siguiente acción pendiente, sin
   crear otra respuesta.
4. **AC-US5-04** — **Given** una selección no había sido enviada antes de la recarga,
   **When** se recupera la sesión, **Then** se informa el estado confirmado y se
   permite volver a seleccionar si esa pregunta continúa pendiente.
5. **AC-US5-05** — **Given** la sesión está finalizada, **When** se intenta volver a una pregunta,
   **Then** no se reabre la ronda ni se aceptan nuevas respuestas.
6. **AC-US5-06** — **Given** el jugador avanza mediante teclado o tecnología de
   asistencia, **When** aparece una nueva pregunta, **Then** el foco se ubica de forma
   lógica y el nuevo progreso textual puede anunciarse.

---

### User Story US6 - Finalizar y consultar resultados (Priority: P1)

Como jugador anónimo, quiero consultar mi resultado al completar la ronda.

**Why this priority**: Cierra el ciclo educativo, presenta una puntuación confiable y
ofrece continuar con el ranking o una nueva partida.

**Independent Test**: Completar las preguntas asignadas, verificar la fórmula de
puntuación y recargar el resultado sin producir una segunda finalización.

**Acceptance Scenarios**:

1. **AC-US6-01** — **Given** todas las preguntas asignadas tienen una respuesta aceptada,
   **When** termina la ronda, **Then** la sesión se finaliza una sola vez y el servidor
   calcula la puntuación definitiva.
2. **AC-US6-02** — **Given** una ronda de cinco preguntas con tres aciertos, **When** se calcula el
   resultado, **Then** la puntuación es 300, sin penalización ni bonificación por
   velocidad.
3. **AC-US6-03** — **Given** la partida terminó, **When** aparece la pantalla de resultados,
   **Then** muestra alias, puntuación total, aciertos, total de preguntas y un mensaje
   educativo de cierre.
4. **AC-US6-04** — **Given** se recarga la pantalla de resultados durante los siete
   días posteriores a la finalización o se reintenta una finalización incierta,
   **When** se consulta el estado desde el mismo navegador, **Then** se devuelve el
   mismo resultado sin crear otra puntuación ni invalidar la sesión finalizada por
   inactividad.
5. **AC-US6-05** — **Given** el jugador consulta sus acciones posteriores, **When** elige ranking o
   volver a jugar, **Then** puede consultar la clasificación o confirmar o editar el
   alias actual para crear una sesión diferente.
6. **AC-US6-06** — **Given** aparece el resultado, **When** el jugador usa teclado o
   tecnología de asistencia, **Then** el resultado se anuncia y las acciones de
   ranking y nueva partida son alcanzables con foco visible.

---

### User Story US7 - Consultar el ranking global (Priority: P2)

Como visitante o jugador anónimo, quiero consultar las mejores puntuaciones para
conocer resultados destacados.

**Why this priority**: Añade motivación social sin impedir el objetivo educativo ni
el flujo principal cuando la clasificación no está disponible.

**Independent Test**: Consultar el ranking con cero, menos de diez y más de diez
resultados, incluidos empates y el resultado actual fuera del top diez.

**Acceptance Scenarios**:

1. **AC-US7-01** — **Given** existen partidas finalizadas válidas, **When** se consulta el ranking,
   **Then** se muestran como máximo diez entradas con posición, alias y puntuación.
2. **AC-US7-02** — **Given** existen puntuaciones distintas y empates, **When** se ordenan,
   **Then** aparece primero la puntuación mayor y, en empate, la partida finalizada
   anteriormente; si también coincide el instante, el orden permanece estable entre
   consultas.
3. **AC-US7-03** — **Given** una sesión no está finalizada, fue invalidada o ya tiene una entrada,
   **When** se forma el ranking, **Then** no se añade una entrada inelegible o
   duplicada.
4. **AC-US7-04** — **Given** un alias contiene texto potencialmente interpretable como contenido
   activo, **When** se muestra, **Then** se presenta únicamente como texto.
5. **AC-US7-05** — **Given** no existen resultados, **When** se abre el ranking,
   **Then** el estado indica que todavía no hay resultados y ofrece una acción para
   jugar.
6. **AC-US7-06** — **Given** el ranking no está disponible, **When** ocurre el fallo,
   **Then** se ofrece reintentar y el visitante todavía puede iniciar o continuar una
   partida.
7. **AC-US7-07** — **Given** el resultado del jugador no está entre los diez primeros,
   **When** consulta la clasificación después de finalizar, **Then** puede reconocer
   su resultado por separado sin convertirlo en una entrada adicional del top diez.
8. **AC-US7-08** — **Given** el ranking ya estaba abierto, **When** el visitante vuelve a consultarlo,
   **Then** puede obtener los datos disponibles en ese momento sin requerir
   actualización en tiempo real.
9. **AC-US7-09** — **Given** el ranking se consulta con teclado o tecnología de
   asistencia, **When** se recorren sus entradas y acciones, **Then** las posiciones,
   alias y puntuaciones siguen un orden comprensible y las acciones tienen foco
   visible.

### End-to-End Demonstration Flow

1. El visitante abre Antídoto y comprende el propósito educativo.
2. Ingresa un alias válido y solicita comenzar.
3. El sistema crea una sesión anónima con una ronda elegible.
4. Se presenta la primera pregunta sin revelar la solución.
5. El jugador selecciona y envía una opción.
6. El servidor valida, registra una sola respuesta y devuelve el resultado permitido.
7. El jugador revisa la explicación, la señal y la recomendación, y decide continuar.
8. Los pasos 4 a 7 se repiten hasta responder las cinco preguntas predeterminadas.
9. El servidor finaliza una sola vez y calcula la puntuación.
10. El jugador consulta su resultado y después abre el ranking global.
11. El jugador regresa desde el ranking y comienza una nueva sesión.

### Edge Cases

- Alias de exactamente 3 o 20 caracteres frente a valores de 2 o 21.
- Alias que queda vacío después de eliminar espacios externos.
- Letras acentuadas, espacios internos, guion y guion bajo frente a caracteres no
  permitidos.
- Menos preguntas publicadas y completas que la cantidad configurada para la ronda.
- Imagen informativa no disponible durante una pregunta.
- Doble envío, respuesta aceptada cuya confirmación se perdió y reintento con una
  selección distinta.
- Recarga antes del envío, durante el envío y después de una respuesta aceptada.
- Pregunta asignada que deja de estar disponible durante una sesión.
- Acceso a una sesión inexistente, invalidada o ya finalizada.
- Fallo de finalización después de aceptar la última respuesta.
- Más de diez resultados, empates exactos y resultado actual fuera del top diez.
- Ranking vacío o temporalmente no disponible.
- Flujo completo a 320 píxeles, con zoom de 200 %, reducción de movimiento y solo
  teclado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001 [US1]**: Antídoto DEBE presentar públicamente su propósito de enseñar a
  reconocer desinformación y contenido engañoso mediante lenguaje no técnico.
- **FR-002 [US1]**: La pantalla inicial DEBE ofrecer una acción principal claramente
  identificable para comenzar y acceso a instrucciones breves.
- **FR-003 [US1, US7]**: El visitante DEBE poder consultar el ranking desde la
  pantalla inicial sin crear cuenta ni iniciar una partida. La única ruta pública
  normativa del ranking es `/leaderboard`; cualquier plan, contrato o tarea que
  consuma esta capacidad DEBE referenciar esta ruta y no crear un alias público.
- **FR-004 [US2]**: El visitante DEBE proporcionar un alias antes de iniciar una
  partida, y el servidor DEBE normalizarlo, validarlo y aplicar la moderación básica
  antes de crear la sesión.
- **FR-005 [US2]**: El sistema DEBE eliminar espacios al inicio y al final y validar
  entre 3 y 20 caracteres visibles sobre una representación canónica del valor
  resultante; formas canónicamente equivalentes DEBEN contarse y moderarse de manera
  consistente.
- **FR-006 [US2]**: El alias solo PUEDE contener letras de cualquier sistema de
  escritura, dígitos, espacios internos, guiones y guiones bajos.
- **FR-007 [US2]**: Un alias vacío, compuesto solo por espacios, fuera del límite de
  longitud o con caracteres no permitidos DEBE rechazarse.
- **FR-008 [US2]**: El sistema DEBE rechazar coincidencias de una lista básica de
  alias bloqueados. La normalización para esta comparación DEBE eliminar únicamente
  espacios exteriores, aplicar NFC y convertir a minúsculas con locale español. La
  coincidencia DEBE comparar el alias completo: no colapsa espacios internos ni
  realiza coincidencias parciales. La lista no se presenta como moderación
  exhaustiva y su fixture inicial versionado se define en Assumptions.
- **FR-009 [US2]**: Cada alias inválido DEBE producir un mensaje específico y
  asociado al campo que indique qué debe corregirse y la acción siguiente, sin jerga
  ni diagnósticos internos. El mensaje DEBE conservar el valor para su corrección
  cuando sea seguro mostrarlo.
- **FR-010 [US2, US6]**: El alias DEBE conservarse durante la sesión actual, PUEDE
  reutilizarse en partidas distintas y NO DEBE tratarse como identidad verificada ni
  como valor único. Antes de iniciar, el visitante DEBE ser informado de que el alias
  y la puntuación de una partida finalizada pueden aparecer en el ranking público.
  El alias DEBE presentarse únicamente como texto en toda la experiencia.
- **FR-011 [US2]**: Un inicio válido DEBE crear una sesión independiente con un
  identificador no secuencial y no predecible.
- **FR-012 [US2, US3]**: Una partida solo DEBE considerarse iniciada cuando exista una
  sesión válida con suficientes preguntas elegibles asignadas; un fallo NO DEBE
  dejar una partida incompleta utilizable.
- **FR-013 [US3]**: Cada ronda DEBE utilizar una cantidad configurable de preguntas
  publicadas y completas; el valor predeterminado para la demostración DEBE ser cinco.
- **FR-014 [US3, US5]**: La ronda DEBE presentar una pregunta por vez e indicar
  mediante texto la posición actual y el total.
- **FR-015 [US3]**: Cada pregunta DEBE presentar entre 2 y 4 opciones y admitir una
  sola selección.
- **FR-016 [US3]**: El conjunto demostrable DEBE incluir al menos una pregunta solo
  de texto y una pregunta con imagen informativa acompañada por texto y alternativa
  textual apropiada.
- **FR-017 [US3]**: El jugador DEBE poder seleccionar una opción mediante teclado y
  NO DEBE poder enviar sin una selección.
- **FR-018 [US3]**: Solo la pregunta pendiente asignada a una sesión activa PUEDE
  recibir una respuesta.
- **FR-019 [US3]**: El servidor DEBE validar la respuesta, determinar si es correcta
  y registrar el intento sin confiar en valores de corrección enviados por el
  cliente.
- **FR-020 [US3]**: Antes de aceptar la respuesta, el navegador solo PUEDE recibir el
  contenido educativo visible de la pregunta. NO DEBE recibir un marcador, metadato,
  respuesta correcta o regla privada que identifique mecánicamente la solución; el
  jugador sí PUEDE deducirla razonando sobre el enunciado, las opciones y sus señales.
- **FR-021 [US3]**: Solo la primera respuesta aceptada para una pregunta de una sesión
  DEBE registrarse y, desde ese momento, DEBE ser inmutable.
- **FR-022 [US3]**: Mientras un envío está pendiente, el sistema DEBE impedir nuevos
  envíos de esa pregunta y mostrar un estado de procesamiento.
- **FR-023 [US3, US5]**: Un reintento después de un resultado incierto DEBE recuperar
  la respuesta previamente aceptada o registrar exactamente una, sin duplicarla.
- **FR-024 [US3]**: Ante un error recuperable de envío, la selección DEBE conservarse
  y el jugador DEBE poder reintentar.
- **FR-025 [US3]**: Esta versión NO DEBE imponer temporizador, estado de expiración de
  pregunta, puntos negativos ni bonificaciones por velocidad.
- **FR-026 [US4]**: Después de aceptar una respuesta, el sistema DEBE indicar si fue
  correcta o incorrecta sin depender únicamente del color.
- **FR-027 [US4]**: Si la selección fue incorrecta, la retroalimentación DEBE
  identificar la opción correcta.
- **FR-028 [US4]**: La retroalimentación DEBE incluir explicación educativa coherente
  con la respuesta correcta, al menos una señal relevante para detectar
  desinformación y una recomendación clara y aplicable fuera del juego. Esos
  elementos DEBEN proceder de una versión de contenido con aprobación educativa
  vigente conforme a la puerta definida en esta especificación.
- **FR-029 [US4]**: La retroalimentación DEBE permanecer en la misma experiencia y
  anunciarse de forma accesible cuando aparezca.
- **FR-030 [US4]**: El jugador DEBE decidir cuándo avanzar y NO DEBE poder hacerlo
  mientras la respuesta siga procesándose.
- **FR-031 [US4]**: Una pregunta o recurso solo PUEDE llegar al flujo público si su
  versión editorial está en estado `approved`, conserva evidencia completa de la
  puerta de aprobación educativa y contiene respuesta correcta protegida,
  explicación, señales y recomendación suficientes para la retroalimentación
  requerida. Una versión sin aprobar, rechazada, retirada o desactualizada NO PUEDE
  materializarse como contenido `published`.
- **FR-032 [US5]**: El progreso textual y cualquier indicador visual DEBEN
  actualizarse al avanzar.
- **FR-033 [US5]**: El jugador NO DEBE poder regresar para modificar respuestas
  aceptadas.
- **FR-034 [US5]**: Al recargar en el mismo navegador, el sistema DEBE intentar
  recuperar el último estado confirmado de una sesión activa todavía válida sin
  crear otra respuesta. Una sesión sin finalizar DEBE conservar esa validez durante
  24 horas desde su última actividad confirmada. Para este límite, solo la creación
  de la sesión o la aceptación de una respuesta reinician el periodo. Para la
  transición por vencimiento, FR-034 es complementario de FR-065: este requisito
  gobierna la recuperación del último estado confirmado; FR-065 es la fuente
  principal de la invalidación por 24 horas. Ambos requisitos siguen siendo
  obligatorios.
- **FR-035 [US5]**: La recuperación DEBE restaurar alias, respuestas aceptadas,
  progreso y retroalimentación confirmados; una selección no enviada PUEDE requerir
  una nueva selección.
- **FR-036 [US5, US6]**: Una sesión finalizada NO PUEDE regresar a un estado anterior
  ni aceptar respuestas nuevas.
- **FR-037 [US6]**: La sesión DEBE finalizar una sola vez después de aceptar respuestas
  para todas sus preguntas asignadas.
- **FR-038 [US6]**: Cada respuesta correcta DEBE otorgar 100 puntos y cada incorrecta
  0; la puntuación máxima DEBE ser el total de preguntas multiplicado por 100.
- **FR-039 [US6]**: El servidor DEBE calcular la puntuación definitiva y el número de
  aciertos; el cliente NO DEBE establecer esos valores.
- **FR-040 [US6]**: El resultado final DEBE conservar la regla de puntuación aplicada
  para que cambios futuros no recalculen resultados ya guardados.
- **FR-041 [US6]**: La pantalla de resultados DEBE mostrar alias, puntuación total,
  respuestas correctas, total de preguntas y un mensaje educativo de cierre.
- **FR-042 [US6]**: Durante los siete días posteriores a `finished_at`, recargar el
  resultado desde el mismo navegador o reintentar una finalización incierta DEBE
  devolver el mismo resultado y NO DEBE finalizar otra vez la sesión, crear una
  segunda puntuación ni tratar la sesión finalizada como invalidada por inactividad.
  Después de esa ventana, el acceso individual PUEDE terminar con un estado seguro
  sin modificar el resultado mínimo que todavía sea elegible para ranking.
- **FR-043 [US6, US7]**: La pantalla de resultados DEBE ofrecer una acción para
  consultar el ranking y otra para volver a jugar; volver a jugar DEBE permitir
  confirmar o editar el alias actual sin exponerlo en la dirección, y DEBE crear una
  sesión diferente antes de presentar otra ronda.
- **FR-044 [US7]**: El ranking global DEBE ser público y mostrar como máximo diez
  entradas con posición, alias y puntuación.
- **FR-045 [US7]**: Las entradas DEBEN ordenarse por puntuación descendente y, en
  empate, por fecha de finalización ascendente. Si ambos valores coinciden
  exactamente, el identificador no predecible de la sesión DEBE proporcionar un
  tercer orden estable sin mostrarse al público.
- **FR-046 [US7]**: Solo sesiones válidas y finalizadas DEBEN ser elegibles y cada
  sesión PUEDE aparecer una sola vez.
- **FR-047 [US7]**: Los alias del ranking DEBEN mostrarse únicamente como texto y no
  PUEDE interpretarse su contenido como instrucciones o contenido activo.
- **FR-048 [US7]**: Un ranking vacío DEBE indicar explícitamente que todavía no hay
  resultados y ofrecer una acción para jugar. Un fallo temporal DEBE indicar que el
  ranking no está disponible, ofrecer una acción para reintentar y mantener una
  acción para jugar, sin jerga ni diagnósticos internos.
- **FR-049 [US6, US7]**: Después de finalizar, el jugador DEBE poder identificar su
  propio resultado aunque no pertenezca al top diez, sin añadirlo artificialmente a
  esas diez entradas.
- **FR-050 [US7]**: El ranking PUEDE actualizarse cada vez que se consulta; esta
  versión NO REQUIERE comunicación en tiempo real.
- **FR-051 [US1-US7]**: El flujo principal DEBE ser completamente operable mediante
  teclado, con orden de foco lógico y foco visible. Etiquetas, mensajes y estados
  DEBEN cumplir el `Criterio operativo de lenguaje claro` de
  `contracts/accessibility.md`.
- **FR-052 [US1-US7]**: Los mensajes de validación DEBEN estar asociados a sus
  controles, los cambios importantes DEBEN anunciarse y ninguna información esencial
  DEBE depender solo del color.
- **FR-053 [US1-US7]**: La interfaz DEBE conservar contenido y funcionalidad con zoom
  de 200 % y respetar la preferencia de reducción de movimiento.
- **FR-054 [US1-US7]**: Las imágenes informativas DEBEN incluir alternativa textual;
  las decorativas DEBEN ser ignoradas por tecnologías de asistencia.
- **FR-055 [US1-US7]**: Los controles táctiles principales DEBEN ofrecer un área
  mínima de 44 por 44 píxeles y el flujo principal DEBE funcionar desde 320 píxeles
  sin desplazamiento horizontal.
- **FR-056 [US1-US7]**: El contenido, las opciones y las acciones principales DEBEN
  mantener legibilidad y ser alcanzables con una sola mano en un teléfono habitual.
- **FR-057 [US3]**: Cada imagen de pregunta DEBE declarar dimensiones, preservar su
  proporción, adaptarse sin deformar el flujo, tomar 300000 bytes como límite
  recomendado y no superar el límite máximo de 1000000 bytes por archivo, y ofrecer
  un estado de error que mantenga disponible su alternativa textual. Su contrato de
  contenido DEBE identificar el formato optimizado aprobado antes de publicarla.
- **FR-058 [US1-US7]**: Los estados inicial, cargando, lista, enviando, respondida,
  vacío, error recuperable y error no recuperable DEBEN ser distinguibles y
  comprensibles cuando correspondan.
- **FR-059 [US1-US7]**: Bajo el perfil móvil lento de aceptación, el
  contenido principal inicial DEBE ser utilizable en 3 segundos o menos y la
  transferencia inicial NO DEBE superar el límite máximo de 1000000 bytes. El perfil
  de aceptación DEBE usar 1,6 Mbps de descarga, 750 Kbps de carga y 150 ms de latencia
  con una carga inicial sin recursos previamente disponibles; todos los recursos
  necesarios para esa vista cuentan dentro del presupuesto. “Utilizable” significa
  que el contenido principal es visible y comprensible, la acción principal de la
  vista está renderizada, habilitada y puede recibir foco mediante teclado, y una
  imagen pendiente o fallida no bloquea la acción ni la información equivalente
  necesaria para continuar.
- **FR-060 [US1-US7]**: La aplicación NO DEBE exigir información personal y el alias
  NO DEBE considerarse una identidad verificada.
- **FR-061 [US2, US3, US5]**: No se DEBEN aceptar respuestas para otra sesión, para una
  pregunta inexistente o no asignada, ni modificaciones de una sesión finalizada.
- **FR-062 [US1-US7]**: Los errores NO DEBEN revelar secretos, reglas privadas de
  evaluación ni detalles internos.
- **FR-063 [US7]**: El ranking DEBE utilizar únicamente resultados válidos,
  finalizados y calculados por el servidor.
- **FR-064 [US1-US7]**: La versión NO DEBE incorporar ninguna funcionalidad incluida
  en la sección Out of Scope ni ninguna capacidad no enumerada expresamente en
  In Scope.
- **FR-065 [US2, US5]**: Después de 24 horas sin actividad confirmada, una sesión sin
  finalizar DEBE pasar a `Invalidada`, dejar de aceptar respuestas y exigir una nueva
  sesión para jugar. La actividad confirmada se limita a crear la sesión o aceptar
  una respuesta. FR-065 es el requisito principal para el vencimiento e invalidación
  de sesiones activas. FR-034 lo complementa exclusivamente respecto de la
  recuperación en el mismo navegador; ambos requisitos siguen siendo obligatorios.
- **FR-066 [US2, US3, US5, US6, US7]**: Los datos de sesiones invalidadas y las
  respuestas detalladas de partidas finalizadas DEBEN eliminarse dentro de los
  7 días siguientes a su invalidación o finalización. El resumen necesario para
  recuperar el resultado individual y la credencial que lo autoriza DEBEN conservarse
  hasta completar los siete días posteriores a `finished_at`; al terminar esa ventana,
  la credencial DEBE dejar de autorizar la consulta individual. El resultado mínimo
  necesario para el ranking PUEDE conservarse mientras el MVP público permanezca
  operativo y DEBE eliminarse dentro de los 7 días siguientes a su retiro.

### Business Rules

- **BR-001 — Alias**: primero se eliminan espacios externos; después se validan entre
  3 y 20 caracteres visibles sobre una representación canónica consistente.
- **BR-002 — Caracteres permitidos**: se admiten letras de cualquier sistema de
  escritura, dígitos, espacios internos, guion y guion bajo.
- **BR-003 — Moderación básica**: la lista bloqueada es pequeña y se compara sin
  distinguir mayúsculas y minúsculas contra el alias normalizado completo; no
  pretende cubrir moderación avanzada.
- **BR-004 — Inicio consistente**: una partida solo se considera iniciada cuando la
  sesión y su ronda completa son utilizables.
- **BR-005 — Contenido elegible**: solo participan preguntas cuya versión editorial
  tenga aprobación educativa vigente, materializadas como `published`, de selección
  única, con entre 2 y 4 opciones y retroalimentación educativa completa. La
  migración o el seed no constituyen aprobación por sí mismos.
- **BR-006 — Unicidad**: una pregunta asignada admite como máximo una respuesta
  aceptada por sesión; un reintento devuelve el estado confirmado.
- **BR-007 — Autoridad**: la aceptación, corrección, finalización y puntuación
  pertenecen al servidor; el estado enviado por el cliente no tiene autoridad.
- **BR-008 — Puntuación**: puntuación igual a respuestas correctas multiplicadas por
  100; la regla aplicada queda vinculada al resultado histórico.
- **BR-009 — Última respuesta**: la retroalimentación de la última respuesta se
  muestra antes de presentar el resultado final.
- **BR-010 — Ranking**: top diez por puntuación descendente y finalización ascendente;
  un empate exacto usa el identificador de sesión como orden estable final; existe una
  entrada por sesión válida finalizada.
- **BR-011 — Repetición**: un alias puede repetirse, pero cada partida pertenece a una
  sesión independiente.
- **BR-012 — Recuperación**: solo se recupera como canónico el estado confirmado por
  el servidor; el estado visual local no crea una respuesta.
- **BR-013 — Sin tiempo**: una pregunta no expira y la velocidad no afecta la
  puntuación en esta versión.

### Puerta de aprobación educativa

Esta puerta es obligatoria antes de materializar cualquier pregunta o recurso en el
flujo público. El flujo editorial usa los estados `draft`, `in_review`,
`changes_requested`, `approved`, `rejected` y `retired`:

- `draft` puede pasar a `in_review` cuando la versión y sus fuentes o recursos están
  completas.
- `in_review` puede pasar a `changes_requested`, `approved` o `rejected`.
- `changes_requested` exige una corrección y una nueva versión en `draft`; la
  aprobación anterior, si existía, no se hereda.
- `approved` puede pasar a `retired`. Solo `approved` puede materializarse como
  `published` en el modelo de ejecución.
- `rejected` y `retired` no pueden publicarse. Una reformulación crea una nueva
  versión en `draft`.

Los roles que revisan, aprueban o rechazan se asignan exclusivamente en
[`tasks.md`](./tasks.md), que es la fuente normativa de responsables. La revisión y
la aprobación son decisiones separadas: quien revisa aplica la rúbrica completa y
formula observaciones; quien aprueba o rechaza comprueba esa revisión y emite la
decisión final. Estas puertas no crean corresponsabilidad sobre la tarea que
materializa el contenido.

El seed y cualquier migración de contenido son consumidores de una decisión editorial
vigente; escribir SQL, sincronizar datos o completar campos estructurales NO constituye
revisión ni aprobación. Si la evidencia canónica no registra `approved`, ningún seed ni
migración puede materializar el contenido como `published`.

Cada versión se evalúa, como mínimo, contra la siguiente rúbrica:

1. exactitud educativa;
2. correspondencia entre pregunta, respuesta correcta y explicación;
3. relevancia de cada señal utilizada para detectar desinformación;
4. claridad y utilidad de la recomendación accionable;
5. calidad, vigencia y trazabilidad de las fuentes;
6. ausencia de afirmaciones no sustentadas;
7. lenguaje comprensible para la población objetivo;
8. ausencia de sesgos o generalizaciones engañosas;
9. permiso, licencia o procedencia válida de imágenes, audios y otros recursos;
10. cumplimiento de privacidad y minimización de datos.

Un criterio fallido impide la aprobación. Se usa `changes_requested` cuando los
hallazgos son corregibles sin abandonar el propósito educativo de la versión; se usa
`rejected` cuando existe información falsa o no sustentable, incoherencia esencial,
sesgo o generalización engañosa grave, procedencia o derechos no demostrables,
incumplimiento de privacidad, o cuando la corrección alteraría sustancialmente el
contenido evaluado.

La evidencia canónica se registra en
`specs/001-trivia-mvp-flow/evidence/content/educational-content-approval.md` y
conserva, por cada decisión:

- `approvalSchemaVersion`, `approvalRevision` y `catalogVersion`;
- `catalogDigestAlgorithm` y `catalogDigest`, calculados sobre la proyección
  canónica del catálogo aprobado;
- identificador estable y `contentVersion` de cada pregunta;
- identificador y versión de cada recurso asociado;
- rol e iniciales del revisor responsable y del aprobador;
- fecha de revisión;
- resultado `pass`, `fail` o `not_applicable` y observaciones para cada criterio;
- fuentes verificadas, su fecha de consulta y su relación con las afirmaciones;
- por cada fuente, `consultedAt`, `stableLocator`, `verifiedPassage`,
  `sourceFingerprintType` (`sha256` o `stable_revision`) y `sourceFingerprint`;
- licencia, permiso o procedencia de cada recurso;
- observaciones y correcciones solicitadas;
- decisión final, fecha y, cuando corresponda, versión reemplazada o motivo de
  retiro.

La versión inicial del catálogo aprobado usa `catalogVersion: "2026-07-30.1"`,
`approvalSchemaVersion: 1` y `approvalRevision: 1`. `approvalRevision` es un entero
de revisión de la evidencia editorial, independiente de `catalogVersion`: una
corrección de trazabilidad que no cambia el catálogo incrementa esta revisión, mientras
que un cambio de contenido, fuente o recurso incrementa también la versión aplicable.
`catalogDigestAlgorithm` es
`SHA-256` y `catalogDigest` es el hexadecimal en minúsculas del catálogo normalizado.
La proyección canónica ordena por `public_ref` y contiene, por cada pregunta, la
mecánica, referencia pública, `contentVersion`, enunciado, posiciones y textos de
opciones, referencia de la solución protegida, explicación, señales, recomendación y
la ruta, versión y metadatos aprobados de sus recursos. Incluye todos los valores que
se materializan en el seed o en la migración, pero nunca se entrega al cliente.

El mismo `catalogVersion`, algoritmo y digest se registran en la evidencia y como las
tres líneas de comentario siguientes, una sola vez y antes de la primera sentencia,
en `supabase/seed.sql` y en la migración de Production:

```sql
-- antidoto-catalog-version: 2026-07-30.1
-- antidoto-catalog-digest-algorithm: SHA-256
-- antidoto-catalog-digest:
```

El valor final del digest se genera por T044; la forma anterior define las claves y
el formato, no un valor pendiente que pueda publicarse. T044 compara las tres líneas
antes de aplicar SQL; T145 compara la proyección de Preview, seed, migración pendiente
y recursos; T146 repite la comparación sobre Production. Una diferencia mantiene la
puerta pendiente o bloqueada y no autoriza publicación o despliegue. Estos metadatos
no son columnas, DTO ni parte del contrato público.

Todo cambio de pregunta, respuesta, explicación, señal, recomendación, fuente o
recurso incrementa la versión de contenido o catálogo afectada, vuelve el elemento a
`draft` y exige repetir la revisión completa. Para esta especificación, una fuente
**pierde vigencia** cuando su propietario la retira o sustituye, expira la fecha que
la hacía aplicable, deja de respaldar la afirmación evaluada o ya no puede consultarse
en la referencia registrada durante la revalidación. Un cambio de fuente es
**material** cuando altera la afirmación respaldada, la respuesta, la explicación,
una señal, la recomendación, la autoridad o fecha relevante, o los derechos de uso;
los cambios restantes deben quedar documentados como inmateriales por el revisor.
Cada fuente debe conservar `consultedAt`, `stableLocator`, `verifiedPassage` y una
`sourceFingerprint`: puede ser el SHA-256 de la representación consultada
(`sourceFingerprintType: sha256`) o un identificador de revisión estable del
publicador/archivo (`sourceFingerprintType: stable_revision`). Si no existe ninguna
de esas dos formas reproducibles, la afirmación no puede aprobarse. Cualquiera de esos
cambios invalida la aprobación hasta completar una nueva revisión. Una corrección que
solo arregla la evidencia sin cambiar el contenido incrementa `approvalRevision` y
conserva la versión de contenido, dejando trazabilidad del valor anterior.

Estos estados son editoriales y documentales; no amplían el contrato público ni el
enum persistido de ejecución. La proyección a ejecución es unidireccional:
editorial `approved` permite `questions.status = 'published'`; cualquier otro estado
editorial impide esa publicación.

### Mecanismo de reloj controlado para pruebas

El reloj autoritativo de Preview y Production sigue siendo el reloj de PostgreSQL y las
reglas públicas continúan expresadas con `now()`. Para las pruebas locales de
expiración de sesión, acceso a resultados y retención/Cron, el arnés de integración DEBE
usar una conexión aislada y un reloj de prueba privado. Dentro de la misma transacción,
el arnés fija una instantánea UTC explícita en la configuración de sesión
`antidoto.test_now`; las funciones internas de tiempo la leen mediante
`private.current_time()` únicamente para el rol de pruebas local y fuera de ese contexto
usan el reloj de PostgreSQL. El arnés ejecuta las RPC o la función privada de retención
contra esa instantánea.
El valor se restablece al cerrar la transacción; no se añade un parámetro de tiempo a
ninguna RPC pública, no se permite que `anon`, `authenticated` o `service_role` alteren
el reloj, y el Cron real se verifica además con datos vencidos y
`cron.job_run_details`. Cada caso registra la instantánea, el límite evaluado y la
salida obtenida para reproducir los cortes exactos (`<= expires_at`,
`>= result_access_until` y retiro posterior).

### Functional State Model

#### Game Session

| State | Meaning | Allowed next state |
|-------|---------|--------------------|
| Iniciada | Sesión válida con ronda asignada y ninguna respuesta aceptada. | En progreso, Invalidada |
| En progreso | Al menos una respuesta aceptada y la sesión aún no está finalizada; puede tener preguntas pendientes o estar esperando la finalización después de la última respuesta. | Finalizada, Invalidada |
| Finalizada | Todas las respuestas fueron aceptadas y existe puntuación definitiva; el resultado puede recuperarse desde el mismo navegador durante siete días desde la finalización. | Ninguno |
| Invalidada | Una inconsistencia no recuperable o el límite de inactividad impide continuar. | Ninguno |

Una sesión `Finalizada` o `Invalidada` es terminal. No puede regresar a un estado
anterior. Una sesión `Iniciada` o `En progreso` pasa a `Invalidada` después de
24 horas sin actividad confirmada. Una sesión `Finalizada` no se invalida por
inactividad; su acceso individual termina siete días después de `finished_at`, sin
alterar su elegibilidad histórica para el ranking mientras el MVP siga operativo.

#### Question Within a Session

| State | Meaning | Allowed next state |
|-------|---------|--------------------|
| Pendiente | Puede recibir la primera respuesta válida de su sesión. | Respondida |
| Respondida | Tiene una respuesta aceptada e inmutable. | Ninguno |

No existe estado de expiración. `Enviando` es un estado temporal de interfaz, no un
estado conceptual de la pregunta.

#### Interface

| State | Observable behavior |
|-------|---------------------|
| Inicial | Presenta propósito, alias o acciones de entrada. |
| Cargando | Comunica que se recupera o consulta información. |
| Lista | Presenta opciones de una pregunta o entradas del ranking. |
| Enviando | Conserva la selección visible e impide envíos duplicados. |
| Respondida | Presenta resultado y retroalimentación antes de continuar. |
| Vacía | Explica que no existen resultados o contenido disponible. |
| Error recuperable | Conserva información útil y ofrece una acción de reintento. |
| Error no recuperable | Presenta la vista segura común con “Consultar ranking” e “Iniciar otra partida”, sin revelar historial de sesión. |

### Error and Recovery Matrix

| Case | What the user observes | Available action | Can continue? | Information preserved | New session required? |
|------|------------------------|------------------|---------------|-----------------------|-----------------------|
| Alias vacío | Mensaje de campo obligatorio asociado al alias. | Escribir un alias. | Sí, antes de iniciar. | Texto ingresado. | No existe sesión todavía. |
| Alias demasiado corto | Mensaje que indica el mínimo de 3 caracteres visibles. | Corregir y reenviar. | Sí. | Alias ingresado. | No. |
| Alias demasiado largo | Mensaje que indica el máximo de 20 caracteres visibles. | Corregir y reenviar. | Sí. | Alias ingresado. | No. |
| Alias con caracteres no permitidos | Mensaje que enumera las categorías permitidas. | Sustituir caracteres. | Sí. | Alias ingresado. | No. |
| Alias bloqueado | Mensaje neutral de alias no permitido. | Elegir otro alias. | Sí. | Alias ingresado. | No. |
| Error al iniciar una sesión | Error recuperable sin entrar a la ronda. | Reintentar, editar alias o consultar ranking. | No hasta iniciar correctamente. | Alias válido. | El reintento crea la primera sesión utilizable. |
| Preguntas no disponibles | Estado que explica que la ronda no está disponible. | Reintentar más tarde, volver al inicio o consultar ranking. | No en esa ronda. | Alias. | Sí, el próximo inicio válido crea otra sesión; cualquier parcial queda inutilizable. |
| Imagen que no puede cargarse | Espacio estable, alternativa textual y opción de reintentar la imagen. | Responder con la alternativa o reintentar la imagen. | Sí. | Sesión, selección y progreso. | No. |
| Envío sin opción seleccionada | Error asociado al grupo de opciones. | Seleccionar una opción. | Sí. | Sesión y progreso. | No. |
| Doble clic o doble envío | Un único estado de envío y una sola retroalimentación. | Esperar o continuar al resolverse. | Sí. | Selección y respuesta canónica. | No. |
| Pérdida temporal de conexión | Aviso recuperable y acción de reintento. | Reintentar el envío o la consulta. | Sí, al recuperar conexión. | Selección y último estado confirmado. | No, salvo que luego se confirme invalidez. |
| Respuesta enviada a sesión inválida | Vista segura común sin confirmar historial de sesión. | Consultar ranking o iniciar otra partida. | No. | Alias puede conservarse para corrección; no se conserva progreso como jugable. | Sí. |
| Sesión invalidada por 24 horas de inactividad | Vista segura común sin confirmar historial de sesión. | Consultar ranking o iniciar otra partida. | No en esa sesión. | El alias puede conservarse para una nueva partida; el progreso deja de ser jugable. | Sí. |
| Intento de responder dos veces | Retroalimentación canónica de la primera respuesta o aviso de que ya fue respondida. | Continuar desde el estado confirmado. | Sí, sin modificar. | Primera respuesta y progreso. | No. |
| Pregunta inexistente o no asignada | Intento de recuperar la pregunta vigente; si falla, error no recuperable. | Reintentar recuperación o volver al inicio. | Solo si se recupera un estado coherente. | Respuestas ya confirmadas. | Sí si la sesión se invalida. |
| Sesión ya finalizada dentro de la ventana de siete días | Aviso de finalización y resultado existente. | Consultar resultado, ranking o volver a jugar confirmando o editando el alias. | No puede responder; sí puede seguir con acciones posteriores. | Resultado final y alias actual. | Solo para volver a jugar. |
| Acceso individual al resultado vencido | Vista segura común sin confirmar que existió una sesión anterior. | Consultar ranking o iniciar otra partida. | Sí, fuera del acceso anterior. | Solo el mínimo todavía elegible para ranking según FR-066. | Sí para volver a jugar. |
| Error al guardar una respuesta | Error recuperable con la opción todavía visible. | Reintentar; el sistema reconcilia si el primer envío llegó. | Sí tras resolver. | Selección y estado confirmado. | No, salvo invalidez confirmada. |
| Error al finalizar la partida | Mensaje recuperable después de la última respuesta. | Reintentar la finalización. | Sí hacia resultados. | Todas las respuestas aceptadas y progreso completo. | No. |
| Ranking sin resultados | Estado que indica que todavía no hay resultados. | Comenzar una partida o volver. | Sí. | Sesión actual, si existe. | No. |
| Ranking temporalmente no disponible | Error recuperable que no bloquea el juego. | Reintentar, jugar o volver a resultados. | Sí. | Sesión y resultado actuales. | No. |
| Recarga durante la ronda | Estado de recuperación y regreso al último punto confirmado. | Continuar o volver a seleccionar si el envío nunca ocurrió. | Sí cuando la sesión sigue válida. | Alias, respuestas, progreso y retroalimentación confirmados. | Solo si la sesión ya no es válida. |
| Acceso directo a una partida inexistente | Vista segura común sin confirmar que existió una partida. | Consultar ranking o iniciar otra partida. | No en esa dirección. | Ninguna información de partida. | Sí para jugar. |

### Requirement Traceability

Cada fila conecta una historia y sus criterios identificados con el conjunto exacto
de requisitos que la implementan y verifican.

| User Story | Priority | Acceptance Scenarios | Functional Requirements | Demonstrable outcome |
|------------|----------|----------------------|-------------------------|----------------------|
| US1 | P1 | AC-US1-01–AC-US1-04 | FR-001–FR-003, FR-051–FR-056, FR-058–FR-060, FR-062, FR-064 | El visitante comprende el propósito, comienza o consulta ranking en móvil y con teclado. |
| US2 | P1 | AC-US2-01–AC-US2-06 | FR-004–FR-012, FR-051–FR-056, FR-058–FR-062, FR-064–FR-066 | Un alias válido crea una sesión anónima; los errores no dejan sesiones parciales. |
| US3 | P1 | AC-US3-01–AC-US3-08 | FR-012–FR-025, FR-051–FR-062, FR-064, FR-066 | Se completa una ronda de selección única sin revelar metadatos de solución ni duplicar respuestas. |
| US4 | P1 | AC-US4-01–AC-US4-06 | FR-026–FR-031, FR-051–FR-056, FR-058–FR-060, FR-062, FR-064 | Cada respuesta produce aprendizaje completo y accesible antes de avanzar. |
| US5 | P1 | AC-US5-01–AC-US5-06 | FR-014, FR-023, FR-032–FR-036, FR-051–FR-056, FR-058–FR-062, FR-064–FR-066 | El progreso confirmado se mantiene sin reabrir o duplicar respuestas. |
| US6 | P1 | AC-US6-01–AC-US6-06 | FR-010, FR-036–FR-043, FR-049, FR-051–FR-056, FR-058–FR-060, FR-062, FR-064, FR-066 | La partida finaliza una vez, puntúa de forma reproducible y ofrece ranking y nueva partida. |
| US7 | P2 | AC-US7-01–AC-US7-09 | FR-003, FR-043–FR-050, FR-051–FR-056, FR-058–FR-060, FR-062–FR-064, FR-066 | El top diez público se ordena correctamente y sus fallos no bloquean el juego. |

### Key Entities *(include if feature involves data)*

- **Pregunta**: desafío educativo con identificador, enunciado, mecánica de selección
  única, contenido visual opcional, opciones, respuesta correcta protegida,
  explicación, señales, recomendación y estado de publicación. Solo una pregunta
  completa y publicada es elegible.
- **Opción**: respuesta seleccionable perteneciente a una pregunta. Tiene contenido
  visible, orden dentro de la pregunta y una identidad inequívoca dentro de ella.
- **Sesión de juego**: participación anónima e independiente con identificador no
  predecible, alias, estado, preguntas asignadas, progreso, inicio, finalización,
  última actividad confirmada, fin del acceso individual al resultado, puntuación
  definitiva y regla de puntuación aplicada. Una sesión sin finalizar se invalida
  después de 24 horas de inactividad; una finalizada conserva acceso individual
  durante siete días desde su finalización.
- **Respuesta del jugador**: selección aceptada para una pregunta dentro de una
  sesión. Relaciona una única sesión, una pregunta asignada y una opción; conserva el
  resultado validado y los puntos otorgados. Es inmutable después de aceptarse y se
  elimina según la ventana definida en FR-066.
- **Resultado de ranking**: representación elegible de una sesión válida y
  finalizada. Contiene la información funcional necesaria para ordenar y mostrar
  posición, alias, puntuación y momento de finalización. Solo conserva el mínimo
  necesario mientras el MVP público está operativo.
- **Regla de puntuación**: definición identificable de la fórmula aplicada a una
  sesión. Para esta versión asigna 100 puntos por acierto y 0 por error, y permite
  interpretar resultados históricos sin recalcularlos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una prueba moderada con la Cohorte MVP de usabilidad definida en
  esta especificación, al menos 90 % identifica el propósito educativo e inicia una
  partida válida en menos de 60 segundos, sin crear una cuenta.
- **SC-002**: El 100 % de las pruebas del flujo principal completa una ronda
  predeterminada de cinco preguntas, retroalimentación, resultado y acción posterior
  desde un viewport de 320 píxeles sin desplazamiento horizontal, cubriendo al menos
  una pregunta solo de texto y otra acompañada por imagen.
- **SC-003**: El 100 % del flujo principal puede completarse únicamente con teclado,
  con foco visible y sin pérdida de contenido o funcionalidad al usar zoom de 200 %;
  una verificación manual con el perfil canónico definido en
  `contracts/accessibility.md` confirma etiquetas, mensajes, progreso y
  retroalimentación anunciados.
- **SC-004**: El 100 % de las preguntas y recursos publicados usados en la ronda
  corresponde exactamente a una versión editorial `approved` con evidencia vigente
  de los diez criterios de la puerta educativa, fuentes trazables y permisos de
  recursos verificados. La comprobación evalúa el catálogo completo y falla ante
  cualquier elemento sin aprobar, rechazado, retirado o desactualizado; además
  confirma respuesta protegida, explicación coherente, al menos una señal relevante
  y una recomendación clara y accionable.
- **SC-005**: El 100 % de las preguntas publicadas y elegibles, el 100 % de sus
  proyecciones públicas anteriores al envío y el 100 % de las respuestas de lectura
  del flujo previo a contestar carecen de marcadores, metadatos o reglas privadas que
  identifiquen mecánicamente la solución, sin impedir que el jugador la deduzca
  razonando. La verificación DEBE evaluar el conjunto completo, no una muestra.
- **SC-006**: En el 100 % de las pruebas de doble clic, reintento y recarga se registra
  como máximo una respuesta por pregunta y una puntuación final por sesión.
- **SC-007**: En el 100 % de las rondas verificadas, la puntuación final equivale al
  número de respuestas correctas multiplicado por 100, no cambia después de
  finalizar y se recupera sin una segunda finalización al recargar inmediatamente,
  después de 24 horas y antes de completar siete días.
- **SC-008**: El ranking muestra como máximo diez resultados en el orden definido y
  excluye el 100 % de las sesiones no finalizadas, invalidadas o duplicadas.
- **SC-009**: Bajo el perfil de aceptación definido en FR-059, el contenido principal
  inicial es utilizable en 3 segundos o menos y todo envío presenta un estado visible
  antes de que pueda repetirse.
- **SC-010**: En una prueba con la misma Cohorte MVP de usabilidad definida en esta
  especificación, al menos 80 % puede mencionar después de la ronda una señal
  aprendida o una recomendación aplicable fuera del juego.
- **SC-011**: El 100 % de los errores enumerados en la matriz ofrece una acción clara,
  conserva la información indicada y no exige una sesión nueva salvo en los casos
  marcados.
- **SC-012**: El 100 % de controles táctiles principales verificados dispone de un
  área mínima de 44 por 44 píxeles y puede operarse con una sola mano en orientación
  vertical en el teléfono de prueba, cuyo viewport DEBE estar entre 360 y 430 píxeles
  de ancho.
- **SC-013**: El 100 % de las pruebas de ciclo de vida invalida una sesión sin
  finalizar después de 24 horas de inactividad y cumple las ventanas de eliminación
  definidas en FR-066.

### Cohorte MVP de usabilidad

SC-001 y SC-010 usan una única cohorte de diez jóvenes de 15 a 29 años con estas
cuotas obligatorias:

- bandas de edad: al menos 3 participantes de 15–19, 3 de 20–24 y 3 de 25–29; la
  décima persona puede pertenecer a cualquiera de las tres bandas;
- idioma: las diez personas pueden realizar la experiencia en español sin traducción
  asistida. Esto prohíbe intérprete, traducción automática y que el facilitador
  traduzca, explique o reformule el contenido; permite lector de pantalla, zoom y
  ayuda puramente operativa con el dispositivo que no explique el contenido;
- experiencia digital: al menos 3 de nivel básico y 3 de nivel intermedio, y no más
  de 4 de nivel avanzado;
- dispositivo principal: al menos 6 sesiones en teléfono, con al menos 2 Android y
  2 iOS, y al menos 2 sesiones en computador portátil o de escritorio. Un teléfono
  es un handset Android o iOS; un computador es un portátil o escritorio con
  Windows, macOS o Linux. Tabletas y equipos híbridos solo pueden ocupar sesiones
  adicionales y no satisfacen ninguna de esas cuotas; y
- participantes menores: se aplica el `Protocolo de usabilidad y consentimiento`
  definido en `quickstart.md`. Sin la autorización allí exigida, la persona no
  participa y la puerta de T145 permanece bloqueada.

Para esta cohorte, nivel básico significa usar navegación y mensajería sin completar
habitualmente formularios o juegos web; nivel intermedio significa utilizar
formularios y aplicaciones web habitualmente; y nivel avanzado significa tener
experiencia técnica, de diseño o de desarrollo digital frecuente.

La evidencia mínima usa códigos anónimos P01–P10 y registra únicamente banda de edad,
adecuación de idioma, nivel digital, categoría de dispositivo/SO, tiempo y resultados
de SC-001/SC-010, además de resultados agregados. Cuando aplique el protocolo para
menores, también puede registrar estado de consentimiento y asentimiento, fecha e
iniciales del facilitador. No registra nombres, correo, teléfono, fecha de nacimiento,
dirección, cuenta, identificador persistente, IP, serial del dispositivo, firmas,
copias de autorizaciones ni grabaciones no necesarias.

## Assumptions

- El MVP dispone de un conjunto pequeño de preguntas preparado y revisado por el
  equipo antes de la demostración.
- La interfaz y el contenido inicial se presentan en español mediante lenguaje claro.
- La ronda usa selección única y cinco preguntas por defecto; el equipo puede ajustar
  la cantidad configurada sin ofrecer esa edición al público.
- El conjunto de demostración incluye al menos una pregunta solo de texto y una
  acompañada por imagen.
- El orden de preguntas puede ser predeterminado; no se exige aleatorización.
- Una sesión solo se presenta como iniciada si dispone de la ronda completa y
  elegible.
- El servicio compartido de persistencia requerido por la constitución estará
  disponible durante la demostración.
- El ranking es público, puede consultarse nuevamente para actualizarse y no requiere
  comunicación en tiempo real.
- Una persona puede jugar varias veces con el mismo alias; cada partida crea una
  sesión independiente y el alias no es único.
- La lista básica de alias bloqueados es un fixture local, sin servicio externo ni
  base remota, en `src/features/game/content/blocked-aliases.v1.json`. Su contenido
  inicial contractual es:

  ```json
  {
    "schemaVersion": 1,
    "listVersion": "2026-07-30.1",
    "normalization": "trim+nfc+es-lowercase+exact-full-alias",
    "aliases": [
      "admin",
      "administrador",
      "antidoto",
      "antídoto",
      "moderador",
      "root",
      "soporte",
      "system",
      "unesco"
    ]
  }
  ```

  Git conserva su historial y toda alta o baja incrementa `listVersion` sin modificar
  `schemaVersion`. Solo un cambio incompatible de estructura incrementa
  `schemaVersion` y crea el archivo correspondiente, comenzando por
  `blocked-aliases.v2.json`. Cada cambio se realiza
  mediante pull request, justifica altas y bajas y actualiza pruebas positivas,
  negativas, de mayúsculas y de equivalencia NFC. Las revisiones obligatorias y sus
  responsables se definen exclusivamente en las convenciones de
  [`tasks.md`](./tasks.md).
- La recuperación en el mismo navegador restaura únicamente información confirmada
  de una sesión que todavía sea válida; una selección nunca enviada puede perderse.
- Una imagen informativa publicada siempre dispone de una alternativa neutral
  suficiente para comprender y responder la pregunta si el recurso visual falla.
- No se espera escala masiva; el objetivo operativo es una demostración de hackathon.
- El procedimiento de aceptación usa el perfil de red definido en FR-059 y un
  teléfono en orientación vertical con viewport entre 360 y 430 píxeles; el equipo
  documentará el dispositivo y las condiciones de cada ejecución.
- Una sesión sin finalizar conserva su validez durante 24 horas desde la última
  actividad confirmada. Una sesión finalizada conserva acceso individual al resultado
  durante siete días desde `finished_at` y no se invalida por inactividad. Las reglas
  de eliminación y retiro del ranking son las definidas en FR-066.

## Constitution Compliance

| Principle | Evidence in this specification |
|-----------|--------------------------------|
| I. Educación antes que competencia | US4, FR-026–FR-031 y SC-004/SC-010 hacen obligatoria la retroalimentación educativa. |
| II. Desarrollo Contract-First | Las entradas, salidas observables, estados, reglas, errores y restricciones quedan definidos sin inventar APIs o datos físicos. |
| III. Servidor como fuente de verdad | FR-019–FR-023 y FR-037–FR-042 reservan al servidor validación, unicidad, puntuación y finalización. |
| IV. Privacidad mínima | US2, FR-010, FR-060–FR-063 y FR-065–FR-066 limitan datos, identidad, retención y exposición pública. |
| V. Accesibilidad obligatoria | Cada historia incluye escenarios accesibles y FR-051–FR-055 convierten el flujo en criterios verificables. |
| VI. Mobile-First y rendimiento | FR-055–FR-059 y SC-002/SC-009/SC-012 fijan viewport, tacto, imágenes y presupuestos medibles. |
| VII. Seguridad de Supabase | La especificación limita el acceso funcional y difiere el diseño físico a contratos y políticas posteriores; no expone secretos ni estructuras internas. |
| VIII. Separación de contenido y lógica | FR-020, FR-028, FR-031 y las entidades separan contenido educativo, solución protegida y evaluación. |
| IX. Tipado y validación | FR-005–FR-009, FR-017–FR-024 y FR-061–FR-062 identifican todas las entradas externas que requieren validación. |
| X. Tareas pequeñas y trabajo en equipo | `tasks.md` materializa T001–T150 con un responsable principal, archivos, dependencias, paralelismo, verificación y relación con historia, requisito o principio constitucional, sin perder la trazabilidad de esta especificación. |
| XI. Verificación antes de completar | Los escenarios, la matriz de errores y SC-001–SC-013 definen evidencia verificable antes de considerar completa la feature. |
| XII. Alcance proporcional | In Scope, Out of Scope y FR-064 limitan el corte vertical a la solución mínima aprobada. |
