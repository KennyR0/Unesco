# Contrato de accesibilidad

**Feature**: `001-trivia-mvp-flow`
**Versión del contrato**: 1.0.0
**Historias**: US1–US7
**Requisitos principales**: FR-009, FR-014–FR-017, FR-022, FR-026–FR-030,
FR-032, FR-041, FR-048, FR-051–FR-058
**Criterios de éxito**: SC-002, SC-003, SC-009, SC-011, SC-012

## Propósito y alcance

Este contrato convierte la accesibilidad del MVP en obligaciones verificables para
las pantallas de inicio, partida, retroalimentación, resultados y ranking. Aplica a
los estados inicial, cargando, lista, enviando, respondida, vacío, error recuperable
y error no recuperable.

Las verificaciones automáticas reducen regresiones, pero no sustituyen las pruebas
manuales de foco visible, zoom, lector de pantalla, contraste perceptible y uso
táctil. Una funcionalidad con interfaz no se considera aprobada hasta registrar
ambos tipos de evidencia cuando la matriz los exige.

## Semántica mínima

- El documento declara español mediante `lang="es"` y tiene un título descriptivo.
- Cada pantalla conserva una jerarquía de encabezados lógica y un único encabezado
  principal que identifica la vista.
- El alias usa un control de texto con etiqueta visible. Las instrucciones y el
  mensaje de error se asocian mediante identificadores estables; un error activa
  `aria-invalid="true"` sin retirar del campo el valor seguro.
- La selección única usa HTML nativo: `fieldset`, `legend`, entre dos y cuatro
  controles `radio` y una etiqueta visible por opción. No se recrea el patrón con
  elementos genéricos.
- Acciones son `button` cuando cambian estado y enlaces reales cuando navegan. Su
  nombre accesible describe el resultado de activarlas.
- El progreso siempre incluye texto equivalente a “Pregunta 2 de 5”; un indicador
  gráfico, si existe, es complementario.
- Los alias se renderizan como texto. Iconos decorativos tienen
  `aria-hidden="true"`; nunca sustituyen un nombre, estado o instrucción.
- Los estados “Correcta” e “Incorrecta” se expresan con texto y, si se usa, icono;
  el color solo puede reforzar esa información.
- Cada pregunta informativa con imagen cumple
  [el contrato de medios](./media.md). Una imagen puramente decorativa usa
  alternativa vacía y no recibe rol o etiqueta adicional.

## Navegación por teclado y foco

El orden de tabulación sigue el orden visual y de lectura. No se utilizan valores
positivos de `tabIndex`. El flujo completo se puede terminar con `Tab`,
`Shift+Tab`, `Enter`, `Espacio` y las flechas nativas del grupo de radios, sin
gestos de puntero.

| Transición | Destino o conservación del foco | Anuncio requerido |
|------------|----------------------------------|-------------------|
| Entrada inicial | El foco permanece en el documento; el primer `Tab` alcanza navegación o alias siguiendo el orden visual. No se enfoca automáticamente el campo. | El encabezado y propósito están disponibles en el orden de lectura. |
| Alias inválido | El foco vuelve al campo de alias. Se conserva el valor y se conectan instrucciones y error mediante `aria-describedby`. | El error específico se anuncia una vez; el campo expone `aria-invalid="true"`. |
| Inicio o recuperación en curso | El control activado permanece en el DOM, muestra texto de carga y no admite otro envío. El contenedor relevante expone `aria-busy="true"`. | Región de estado: “Iniciando partida…” o “Recuperando partida…”. |
| Pregunta disponible | Al entrar desde otra pantalla, el encabezado de pregunta puede recibir foco programático con `tabIndex="-1"`. | El encabezado incluye o está precedido por el progreso textual. |
| Envío sin opción | El foco pasa al primer radio del grupo. La explicación del error queda asociada al grupo. | `role="alert"` comunica que debe seleccionarse una opción. |
| Respuesta en curso | Se conserva la selección visible. El botón activado permanece en el DOM, cambia a “Comprobando…” y queda deshabilitado hasta resolver. | La zona de pregunta expone `aria-busy="true"`; no se anuncia progreso falso. |
| Respuesta aceptada | No se mueve el foco a la región de estado. El mismo control de acción pasa a “Continuar” cuando la respuesta está completa. | Una región preexistente `role="status"`, `aria-live="polite"` y `aria-atomic="true"` anuncia correcta/incorrecta, explicación, señal y recomendación una sola vez. |
| Error recuperable | Se conserva foco y selección. La acción cambia a “Reintentar” o queda disponible junto al error. | Un `role="alert"` comunica el problema y la acción posible sin detalles internos. |
| Continuar | El foco pasa al encabezado de la nueva pregunta con `tabIndex="-1"`. | Se puede percibir el nuevo progreso y enunciado sin recorrer contenido anterior. |
| Última retroalimentación | Se mantiene hasta que el jugador elige “Ver resultados”. | La retroalimentación se anuncia antes de cualquier resultado final. |
| Resultados | El foco pasa al encabezado de resultados; ranking y nueva partida quedan después del resumen. | El resumen comunica alias, puntuación, aciertos y total. |
| Ranking vacío o con error | El foco permanece en el encabezado o en la acción que originó la recarga. | El estado vacío usa texto normal; el fallo recuperable usa `role="alert"` y ofrece reintentar o jugar. |
| Ranking con resultado actual | El orden del foco no cambia por el resaltado. | La fila o bloque incluye el texto “Tu resultado”; no se identifica únicamente por color. |
| Error no recuperable | El foco pasa al encabezado del estado seguro. | Se usa el mensaje público común y se ofrecen “Consultar ranking” e “Iniciar otra partida”, sin confirmar historial de sesión. |

Una región `aria-live` existe desde el render inicial y se actualiza después; no se
inserta una nueva región por cada mensaje. Los estados informativos usan prioridad
`polite`; los errores que exigen corrección usan `role="alert"`. No se anuncian
simultáneamente el mismo texto con `role="status"` y `role="alert"`.

## Objetivos de interacción y presentación

- Todos los controles táctiles principales —alias, opción completa, responder,
  continuar, reintentar, jugar, ranking y volver— tienen un rectángulo interactivo
  mínimo de 44 × 44 píxeles CSS.
- La etiqueta completa de una opción activa el radio. La distancia entre objetivos
  evita activar una opción vecina por error.
- El flujo no presenta desplazamiento horizontal a 320 píxeles CSS. Texto, controles,
  tablas o listas de ranking e imágenes reajustan su ancho dentro del viewport.
- Con zoom del navegador al 200 %, el contenido y las acciones siguen visibles,
  legibles, ordenados y operables; no se superponen ni quedan recortados.
- No se bloquea el zoom y no se fija un ancho mínimo de página superior a
  320 píxeles.
- El texto principal usa tamaño y espaciado legibles; instrucciones y errores no
  dependen de texto de marcador de posición.
- Las animaciones no son necesarias para comprender, responder o avanzar. Bajo
  `prefers-reduced-motion: reduce`, animaciones y transiciones no esenciales se
  eliminan o se vuelven instantáneas; no se usa desplazamiento suave obligatorio.
- Los estados de carga conservan suficiente estructura para evitar pérdida de
  contexto y contienen texto visible, no solo un indicador animado.
- En un teléfono de prueba de 360 a 430 píxeles de ancho, en orientación vertical,
  las acciones principales y las opciones se alcanzan y activan con una mano.

## Perfil canónico de tecnología asistiva

La puerta mínima de SC-003 y T131 usa **la versión estable más reciente de NVDA
disponible en la fecha de ejecución, con la versión estable más reciente de Google
Chrome disponible sobre Windows de escritorio**. La evidencia registra fecha, versión
de NVDA, versión de Chrome y versión de Windows. Si alguna de esas versiones presenta
un defecto conocido que impide completar la prueba, el bloqueo se documenta y no se
sustituye el perfil sin actualizar primero este contrato.

VoiceOver con Safari en iOS puede añadirse como comprobación complementaria por el
enfoque Mobile-First, pero no sustituye el perfil canónico ni es necesario para
aprobar SC-003.

## Criterio operativo de lenguaje claro

Toda referencia normativa a un mensaje, etiqueta o estado “comprensible” se aprueba
solo cuando cumple simultáneamente estos criterios:

1. una etiqueta describe el propósito del control o el resultado de activarlo;
2. un estado indica qué ocurrió o qué condición existe;
3. cuando la persona puede actuar, el texto o la acción adyacente indica el siguiente
   paso;
4. un error de validación identifica qué debe corregirse sin revelar reglas privadas;
   y
5. el texto público no contiene nombres de tablas, funciones, códigos internos,
   normalización, stack traces ni otra jerga de implementación.

La presencia de una acción genérica o de un encabezado, por sí sola, no satisface el
criterio.

## Matriz de verificación

| ID | Obligación y trazabilidad | Verificación automática | Verificación manual | Criterio de aprobación |
|----|---------------------------|-------------------------|---------------------|------------------------|
| A11Y-001 | Teclado completo y orden lógico (FR-051; AC-US1-03, AC-US2-04, AC-US3-04, AC-US6-06, AC-US7-09) | Testing Library usa `userEvent.tab()` y teclado sobre formulario/radios. Playwright completa las cinco preguntas sin `.click()` ni APIs de puntero. | Recorrer inicio → partida → retroalimentación → resultados → ranking con teclado real, hacia delante y atrás. | Todas las acciones se alcanzan una vez en orden comprensible, se activan y no existe trampa de foco. |
| A11Y-002 | Foco visible (FR-051) | Playwright comprueba que el elemento enfocado no queda fuera del viewport ni oculto. | Revisar en cada control, con teclado y en modo de alto contraste, que el indicador sea perceptible sobre su fondo. | Ningún control interactivo carece de indicador de foco visible. |
| A11Y-003 | Gestión de foco entre estados (FR-029, FR-032; AC-US5-06) | Pruebas de componente verifican foco en alias tras error, conservación durante envío/error, y foco en encabezado después de continuar. E2E verifica el ciclo dos veces. | Con lector de pantalla, confirmar que no se pierde contexto ni se repite contenido innecesariamente. | Cada transición cumple la tabla de foco y no mueve el foco durante el anuncio de retroalimentación. |
| A11Y-004 | Etiquetas, radios y nombres (FR-015, FR-017, FR-051) | Testing Library localiza alias por etiqueta, grupo por leyenda, radios y botones por rol/nombre. Prueba flechas para cambiar una única selección. | Confirmar que el lector anuncia nombre, estado seleccionado/no seleccionado y posición del grupo. | No hay control sin nombre; el grupo permite exactamente una selección mediante teclado. |
| A11Y-005 | Errores asociados (FR-009, FR-017, FR-024, FR-052) | Se verifica `aria-invalid`, asociación con el texto específico y `role="alert"`; el error de opciones referencia al grupo y conserva la selección en fallo recuperable. | Provocar cada error de interfaz y confirmar que se entiende qué ocurrió y cómo corregirlo. | Error visible y anunciado una vez, asociado al origen, con acción posible y datos permitidos conservados. |
| A11Y-006 | Carga, envío y prevención de duplicados (FR-022, FR-030, FR-058) | Testing Library comprueba texto visible, `aria-busy`, acción deshabilitada y ausencia de una segunda invocación. | En conexión lenta, confirmar que el estado aparece antes de poder repetir la acción. | El estado es perceptible por vista y tecnología asistiva y no admite doble envío. |
| A11Y-007 | Retroalimentación y resultado anunciados (FR-026–FR-030, FR-041, FR-052) | Se verifica región preexistente `role="status"` con `aria-live="polite"` y `aria-atomic`, texto correcta/incorrecta, explicación, señal y recomendación; resultado contiene los cinco campos contractuales. | Con el perfil canónico de tecnología asistiva, responder correcto e incorrecto y escuchar el anuncio completo una sola vez. | No depende del color, no se adelanta la solución y el anuncio ocurre tras la aceptación. |
| A11Y-008 | Imágenes y alternativas (FR-016, FR-054, FR-057) | Testing Library encuentra imagen informativa por alternativa; imágenes decorativas no tienen nombre accesible. La prueba de error verifica alternativa visible y reintento. | Comparar imagen y alternativa para confirmar que transmiten la misma evidencia educativa relevante. | Toda imagen informativa tiene alternativa útil; una decorativa es ignorada; el fallo no bloquea la pregunta. |
| A11Y-009 | Reflow 320 y zoom 200 % (FR-053, FR-055; SC-002, SC-003) | Playwright en 320 × 640 afirma que `scrollWidth` no supera el ancho visible y que controles/contenido no quedan recortados. | En navegador de escritorio, aplicar zoom 200 % en cada pantalla; verificar lectura, foco, radios, errores, feedback, resultado y ranking. | No hay desplazamiento horizontal, superposición, pérdida de texto ni acción inaccesible. |
| A11Y-010 | Reducción de movimiento (FR-053) | Playwright usa `reducedMotion: "reduce"` y verifica que las animaciones/transiciones no esenciales tengan duración efectiva nula o que no existan. | Activar reducción de movimiento en el sistema y recorrer el flujo. | No aparece movimiento no esencial ni se pierde información al eliminarlo. |
| A11Y-011 | Objetivos táctiles y una mano (FR-055, FR-056; SC-012) | Playwright móvil mide `getBoundingClientRect()` de cada control principal y exige ancho y alto de al menos 44 píxeles CSS. | En teléfono de 360–430 píxeles, completar el flujo vertical con una mano y comprobar activaciones vecinas accidentales. | El 100 % de controles principales cumple 44 × 44 y el flujo puede terminarse con una mano. |
| A11Y-012 | Información no dependiente del color (FR-026, FR-052) | Las pruebas exigen texto explícito para correcta/incorrecta, selección, error, progreso y estados. Iconos decorativos se ignoran. | Revisar en escala de grises y modo de alto contraste. | Toda información esencial sigue siendo identificable sin color. |
| A11Y-013 | Lenguaje claro y estados comprensibles (FR-001, FR-009, FR-048, FR-051, FR-058, SC-011) | Se comprueban los cinco puntos del criterio operativo y `<html lang="es">`. | Pedir durante la prueba moderada que se identifique el estado y la próxima acción sin explicación del facilitador. | Todos los puntos del criterio operativo se cumplen; el facilitador no necesita explicar ni reformular el contenido. |

## Entornos de prueba

La puerta mínima utiliza:

- Vitest, jsdom, Testing Library y `user-event` para semántica y estados de Client
  Components;
- Playwright con Chromium de escritorio y Chromium móvil a 320 × 640 con `touch`,
  más un recorrido entre 360 y 430 píxeles para objetivos táctiles;
- un navegador de escritorio a zoom 200 %;
- un teléfono real o emulado de 360–430 píxeles en orientación vertical; y
- las versiones estables más recientes disponibles de NVDA y Chrome en Windows de
  escritorio, según el perfil canónico y registrando sus versiones y la fecha.

Firefox y WebKit pueden aportar pruebas de humo, pero no sustituyen ninguno de los
entornos anteriores ni son puerta obligatoria del prototipo.

## Evidencia exigida

La verificación registra por cada fila aplicable:

1. identificador de la verificación;
2. historia, requisito y escenario relacionado;
3. fecha, commit y entorno;
4. resultado esperado;
5. comando automático y resultado observado, cuando corresponda;
6. pasos y resultado de la revisión manual;
7. capturas o trazas solo si ayudan a reproducir un fallo; y
8. bloqueo pendiente.

Una comprobación no ejecutada se registra como pendiente o bloqueada; no se convierte
en aprobada por el hecho de que el proyecto compile.
