# Contrato de imágenes de preguntas

**Feature**: `001-trivia-mvp-flow`
**Versión del contrato**: 1.0.0
**Historias**: US3, US4, US5
**Requisitos principales**: FR-016, FR-054, FR-057, FR-059
**Criterios de éxito**: SC-002, SC-009

## Alcance y fuente aprobada

El MVP usa únicamente imágenes locales, revisadas y versionadas en
`public/images/questions/`. El contenido educativo versionado —el seed de
desarrollo/Preview y la migración de datos aprobada para Production— guarda la misma
ruta local y los mismos metadatos sincronizados; no guarda URLs externas.

Quedan fuera de este contrato:

- Supabase Storage;
- dominios remotos y configuración `remotePatterns`;
- imágenes obtenidas durante la partida desde servicios externos;
- carga o edición de imágenes desde una interfaz administrativa; y
- SVG animado, GIF animado, video o recursos generados en tiempo de ejecución.

Esta decisión elimina una dependencia de red de la demostración y no impide
especificar Supabase Storage en una versión futura.

## Formatos, dimensiones y peso

| Propiedad | Obligación |
|-----------|------------|
| Formatos permitidos | AVIF, WebP, JPEG y PNG. Se prioriza AVIF o WebP; JPEG se reserva para fotografía cuando produzca menor peso; PNG solo cuando la transparencia o el detalle de interfaz lo justifique. |
| Formatos excluidos | SVG y GIF, además de cualquier formato no enumerado. |
| Límite recomendado por archivo | El objetivo recomendado es `≤ 300000` bytes. Superarlo genera un hallazgo que debe justificarse y optimizarse cuando sea posible, pero no sustituye el límite máximo. |
| Límite máximo por archivo | Ningún archivo fuente puede superar 1000000 bytes. El límite se verifica sobre el archivo versionado, no sobre una estimación de transferencia. |
| Límite máximo de transferencia inicial | La suma de todos los recursos necesarios para la vista inicial no supera 1000000 bytes bajo FR-059. Es un presupuesto de vista independiente del máximo por archivo. |
| Dimensiones recomendadas | 1200 × 675 píxeles para recursos nuevos con relación 16:9. Deben aportar detalle suficiente para pantallas de alta densidad sin exceder el peso. |
| Relaciones admitidas | Se prefieren 16:9 y 4:3. Otra relación requiere una razón educativa registrada con el contenido y una prueba móvil específica. |
| Recorte | No se recorta evidencia educativa. La presentación conserva la relación original y usa un ajuste equivalente a `contain`. |
| Metadatos obligatorios | Ruta, formato, ancho intrínseco, alto intrínseco, peso en bytes y alternativa textual. Ancho y alto son enteros positivos y su relación coincide con el archivo. |

La imagen no debe contener texto imprescindible que falte en el enunciado o en la
alternativa. Si la evidencia depende de un detalle pequeño, el recurso y la copia
deben permitir identificarlo desde un teléfono sin introducir zoom de imagen como
nueva funcionalidad.

## Texto alternativo

- Toda imagen de pregunta se considera informativa y tiene una alternativa no vacía,
  específica y revisada junto con el contenido.
- La alternativa comunica el propósito y las señales necesarias para responder, no
  una descripción de cada píxel. No revela la opción correcta ni una regla privada.
- No se inicia con “Imagen de” salvo que el tipo de medio sea información relevante.
- El texto visible del enunciado y la alternativa no se duplican innecesariamente.
- La alternativa conserva contexto suficiente para que el fallo del recurso no
  impida razonar y responder.
- Una imagen decorativa de interfaz, si existe fuera de las preguntas, usa
  `alt=""`, carece de nombre accesible adicional y no forma parte del contenido
  educativo.

La revisión de publicación compara la imagen, el enunciado, las opciones y la
alternativa. Una pregunta no puede publicarse si su alternativa adelanta la solución,
omite evidencia esencial o no permite continuar cuando el archivo falla.

## Presentación mediante `next/image`

Cada imagen de pregunta se renderiza con `next/image` y:

- `src` como ruta local permitida;
- `width` y `height` tomados de metadatos validados;
- `alt` tomado del contenido estructurado;
- `sizes` acorde con el contenedor Mobile-First;
- carga diferida predeterminada;
- `placeholder="empty"`; y
- un contenedor que reserva la relación de aspecto antes de cargar.

El valor contractual recomendado para `sizes` es equivalente a:

```text
(max-width: 640px) calc(100vw - 32px), 640px
```

Puede cambiar si el layout aprobado usa otro ancho real, pero debe reflejar ese
layout y verificarse en 320 píxeles. No se usa `fill` sin un contenedor con
dimensiones estables. No se usa `preload` por defecto; solo se autoriza si una
medición demuestra que la imagen activa es el elemento LCP y no rompe el presupuesto
inicial.

El contenedor nunca supera el ancho disponible, no introduce desplazamiento
horizontal y evita cambios de layout. El fondo neutral de reserva no se comunica como
contenido.

## Estado de error y reintento

El manejo de `onError` pertenece a una frontera Client Component pequeña; no mueve
autoridad de juego al navegador. Cuando falla la imagen:

1. se mantiene el espacio y la relación de aspecto para evitar cambios de layout;
2. se oculta el recurso fallido y se muestra la alternativa como texto visible;
3. aparece un mensaje comprensible que indica que la imagen no pudo cargarse;
4. se ofrece “Reintentar imagen” mediante un control de al menos 44 × 44 píxeles;
5. responder sigue disponible usando enunciado y alternativa;
6. se conservan sesión, progreso y opción seleccionada; y
7. el reintento ocurre solo por acción explícita, sin bucle automático.

El estado se anuncia sin repetir toda la pregunta ni revelar rutas internas. Un nuevo
fallo conserva el mismo fallback. La indisponibilidad de una imagen no crea ni
invalida una sesión.

## Criterio verificable de contenido utilizable

Para FR-059 y SC-009, el cronómetro comienza con una carga fría bajo el perfil de red
acordado y se detiene únicamente cuando se cumplen simultáneamente estas condiciones:

1. el encabezado y el contenido principal de la vista son visibles y comprensibles;
2. el control principal correspondiente está renderizado, habilitado, tiene nombre
   accesible y puede recibir foco mediante teclado;
3. no existe un overlay o estado de carga que impida operar ese control;
4. si una imagen sigue pendiente o falló, su alternativa equivalente está visible y
   la pregunta puede responderse sin esperar el archivo; y
5. no existe desplazamiento horizontal que oculte contenido o acciones necesarios.

El contenido se considera utilizable solo si las cinco condiciones se cumplen en
3 segundos o menos y la transferencia acumulada de la vista no supera 1000000 bytes.
Que el HTML haya respondido o que aparezca un esqueleto, por sí solo, no satisface el
criterio.

## Validación antes de publicar

Una pregunta con imagen solo es elegible si:

- el archivo existe dentro de `public/images/questions/`;
- extensión y formato real pertenecen a la lista permitida;
- el archivo registra si cumple el recomendado de 300000 bytes y nunca supera el
  máximo de 1000000 bytes;
- ancho y alto declarados coinciden con el recurso;
- la relación de aspecto está aprobada y se conserva;
- la alternativa es no vacía, útil y no revela la solución;
- explicación, señales y recomendación siguen siendo comprensibles;
- el recurso se presenta correctamente desde 320 píxeles y con zoom 200 %; y
- el recurso no depende de una fuente externa durante la demostración.

El contenido se prepara y revisa como borrador antes de generar los artefactos de
datos. Solo el conjunto que ya superó la validación de archivo, metadatos, opciones,
solución protegida y retroalimentación completa puede quedar publicado en el seed de
desarrollo/Preview y en la migración de datos versionada de Production. Ambos
artefactos deben conservar sincronizados la ruta y los metadatos aprobados.

## Matriz de verificación

| ID | Verificación automática | Verificación manual | Criterio de aprobación |
|----|-------------------------|---------------------|------------------------|
| MEDIA-001 | Una prueba de fixtures inspecciona extensión, firma o tipo real, dimensiones y peso de cada archivo referenciado por el contenido educativo sincronizado; informa por separado recomendado y máximo. | Revisar y justificar cualquier recurso que supere el recomendado sin comprimir fuera evidencia educativa. | Todos los recursos existen, usan formato aprobado, declaran dimensiones correctas, reportan si superan 300000 bytes y ninguno supera 1000000 bytes. |
| MEDIA-002 | La validación de contenido rechaza ruta externa, ruta fuera del directorio aprobado, alternativa vacía o dimensiones no positivas. | Comparar alternativa con imagen y enunciado. | Ninguna pregunta publicada puede omitir metadatos o filtrar la solución. |
| MEDIA-003 | Testing Library comprueba nombre accesible de imágenes informativas y ausencia de nombre en decorativas. | Recorrer una pregunta con lector de pantalla con imagen disponible. | La alternativa comunica la evidencia necesaria sin duplicación perturbadora. |
| MEDIA-004 | Playwright en 320 × 640 verifica ausencia de scroll horizontal, relación estable antes/después de carga y dimensiones no superiores al contenedor. | Revisar 320 píxeles y zoom 200 % en cada relación aprobada. | No hay deformación, recorte educativo ni cambio de layout que desplace controles. |
| MEDIA-005 | Una prueba de componente provoca `onError` y comprueba texto alternativo visible, mensaje, reintento, selección conservada y respuesta habilitada. | Simular red o archivo fallido y completar la pregunta. | El fallo no bloquea la partida ni pierde estado; el reintento no entra en bucle. |
| MEDIA-006 | La inspección de configuración comprueba que no existan `remotePatterns` ni host externo para preguntas. | Ejecutar la demostración con acceso externo restringido después de iniciar servicios requeridos. | Todas las imágenes de preguntas proceden del build local. |
| MEDIA-007 | La medición de carga fría bajo FR-059 registra el instante en que se cumplen las cinco condiciones de contenido utilizable e incluye cada recurso solicitado en el total transferido. | Confirmar mediante teclado que la acción principal está disponible y que un recurso pendiente o fallido conserva información equivalente. | Las cinco condiciones se cumplen en ≤ 3 segundos y la transferencia inicial total es ≤ 1000000 bytes. |

Los resultados se registran con archivo evaluado, peso, dimensiones, formato, entorno,
resultado esperado y observado. Un recurso pendiente de revisión mantiene su pregunta
en borrador.
