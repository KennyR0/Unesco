<!--
Sync Impact Report
- Cambio de versión: plantilla sin versión -> 1.0.0
- Principios definidos:
  - Principio 1 de la plantilla -> I. Educación antes que competencia
  - Principio 2 de la plantilla -> II. Desarrollo Contract-First
  - Principio 3 de la plantilla -> III. Servidor como fuente de verdad
  - Principio 4 de la plantilla -> IV. Privacidad mínima
  - Principio 5 de la plantilla -> V. Accesibilidad obligatoria
  - Añadido -> VI. Mobile-First y rendimiento
  - Añadido -> VII. Seguridad de Supabase
  - Añadido -> VIII. Separación de contenido y lógica
  - Añadido -> IX. Tipado y validación
  - Añadido -> X. Tareas pequeñas y trabajo en equipo
  - Añadido -> XI. Verificación antes de completar
  - Añadido -> XII. Alcance proporcional
- Secciones añadidas:
  - Alcance, arquitectura y separación
  - Flujo de entrega y puertas de calidad
- Secciones eliminadas: ninguna; se sustituyeron todos los marcadores de la plantilla.
- Plantillas dependientes: sin cambios; consumen esta constitución durante sus propios flujos.
- Pendientes dentro de la constitución: ninguno.
-->
# Constitución de Antídoto

## Principios fundamentales

### I. Educación antes que competencia

El objetivo principal de Antídoto DEBE ser enseñar alfabetización mediática e
informacional. Cada pregunta jugable DEBE tener, como contenido estructurado, una
respuesta correcta, una explicación educativa, las señales que el jugador debía
identificar y una recomendación aplicable fuera del juego. Esa información DEBE
mostrarse como retroalimentación después de que el servidor acepte una respuesta o
declare expirada la pregunta.

La puntuación y el ranking DEBEN apoyar el aprendizaje y NO DEBEN ocultar, sustituir
ni condicionar el acceso a la retroalimentación. Las decisiones de diseño que
enfrenten aprendizaje y competencia DEBEN favorecer el aprendizaje. La razón es que
el éxito del producto se mide primero por la comprensión adquirida, no por la
posición obtenida.

### II. Desarrollo Contract-First

Antes de implementar una integración, su contrato DEBE definir entradas, salidas,
campos requeridos y opcionales, estados válidos, reglas de negocio, errores esperados
y restricciones de seguridad. Los contratos compartidos DEBEN aprobarse antes de
dividir una funcionalidad entre frontend, servidor y base de datos.

Durante la implementación NO SE PUEDEN inventar campos, tablas, estados, endpoints,
tipos de mecánica, formatos de respuesta ni reglas de puntuación. Un cambio de
contrato DEBE actualizar primero la fuente contractual y sus criterios de
verificación; el código solo PUEDE cambiar después. La estructura interna de
Supabase NO DEBE funcionar como contrato público del frontend. Estas reglas evitan
integraciones incompatibles y decisiones de negocio accidentales.

### III. Servidor como fuente de verdad

El servidor DEBE validar las respuestas, determinar si son correctas, calcular las
puntuaciones, controlar los intentos, finalizar las partidas, registrar los
resultados y actualizar el ranking. Los valores de puntuación o finalización enviados
por el cliente NUNCA DEBEN considerarse confiables.

El contrato público de una pregunta NO DEBE entregar la respuesta correcta, la regla
privada de evaluación ni datos que permitan inferirlas antes de que el jugador
responda o expire la pregunta. La retroalimentación completa solo PUEDE salir del
servidor después de validar la transición. Los temporizadores y estados visuales
PUEDEN ejecutarse en el navegador, pero la aceptación de intentos y la expiración
autoritativa DEBEN resolverse en el servidor. Esto protege la integridad educativa y
competitiva de cada partida.

### IV. Privacidad mínima

Antídoto DEBE funcionar sin registro obligatorio. Solo se DEBEN persistir los datos
necesarios para ejecutar la trivia, registrar respuestas y mostrar el ranking. Todo
campo persistido DEBE tener una finalidad documentada y una regla de conservación en
el contrato o modelo de datos correspondiente; no se DEBEN recopilar datos personales
por conveniencia futura.

Los alias NO DEBEN exigir nombres reales. Su contrato DEBE establecer y aplicar en el
servidor límites de longitud, normalización, caracteres admitidos, sanitización y
moderación de contenido ofensivo. Las sesiones anónimas DEBEN usar identificadores
aleatorios, no predecibles y con un ciclo de vida definido. Esta minimización reduce
el impacto de seguridad sin impedir la participación pública.

### V. Accesibilidad obligatoria

La accesibilidad DEBE formar parte de los criterios de aceptación de toda historia con
interfaz. El flujo completo de la trivia DEBE:

- poder utilizarse con teclado, con orden de foco lógico y foco visible;
- evitar comunicar información únicamente mediante color;
- proporcionar texto alternativo a imágenes informativas e ignorar correctamente las
  decorativas para tecnologías de asistencia;
- anunciar de forma accesible los mensajes y cambios de estado importantes;
- respetar `prefers-reduced-motion`;
- conservar contenido y funcionalidad con zoom de 200 %;
- definir y verificar un tamaño táctil mínimo medible para sus controles; y
- asociar cada error al control correspondiente.

Toda mecánica con límite de tiempo DEBE documentar en sus criterios de aceptación cómo
mantiene un flujo accesible. El uso de Radix UI, primitivas equivalentes o pruebas
automatizadas NO SUSTITUYE la verificación manual del flujo completo con teclado y
tecnologías de asistencia relevantes.

### VI. Mobile-First y rendimiento

La experiencia DEBE diseñarse primero para teléfonos y funcionar desde un viewport de
320 píxeles de ancho. Cada especificación con interfaz DEBE fijar y verificar
presupuestos medibles de carga y datos transferidos, criterios de interacción táctil,
el coste aceptable de sus dependencias y estados visibles de carga y error.

Cada imagen DEBE definir dimensiones, texto alternativo o tratamiento decorativo,
comportamiento responsive, límite de peso, formato optimizado y estado de error. El
contenido visual DEBE usar `next/image` salvo una excepción técnica documentada. Las
especificaciones que incorporen multimedia DEBEN fijar límites medibles y el contexto
de su verificación. No se DEBEN añadir animaciones, bibliotecas o recursos pesados sin
una función educativa explícita y una justificación de rendimiento.

### VII. Seguridad de Supabase

Todo cambio de base de datos DEBE realizarse mediante una migración SQL versionada.
Cada tabla DEBE definir claves primarias, relaciones, restricciones, índices
necesarios y políticas de acceso. Toda exposición mediante la Data API DEBE usar
`GRANT` explícitos de mínimo privilegio. Row Level Security DEBE estar habilitado en
toda tabla expuesta. Toda vista expuesta DEBE usar `security_invoker = true` y
respetar las políticas de sus tablas subyacentes; en caso contrario, DEBE permanecer
en un esquema no expuesto y sin acceso para roles públicos. Cualquier excepción para
un objeto exclusivamente de servidor DEBE justificarse con su modelo de acceso.

Las claves secretas de Supabase y `service_role` NUNCA DEBEN exponerse en el cliente,
incluirse en variables públicas ni incorporarse al repositorio. Cada política de
acceso DEBE tener al menos una verificación de acceso permitido y otra de acceso
rechazado. Los privilegios DEBEN limitarse a lo estrictamente necesario. Estas reglas
impiden que la participación anónima se convierta en acceso anónimo irrestricto.

### VIII. Separación de contenido y lógica

Las preguntas, opciones y explicaciones educativas DEBEN almacenarse como contenido
estructurado. La lógica del juego NO DEBE depender de textos escritos directamente en
componentes visuales.

Cada mecánica DEBE definir tipo de interacción, tipo de respuesta, contenido
multimedia permitido, regla de evaluación, tiempo límite cuando aplique,
retroalimentación y requisitos de accesibilidad. Todas las preguntas DEBEN cumplir una
interfaz común, y una mecánica PUEDE usar un componente especializado cuando su
interacción lo requiera. La proyección pública del contenido DEBE excluir las
soluciones y reglas privadas de evaluación. Esta separación permite revisar el
contenido educativo sin duplicar ni comprometer las reglas del juego.

### IX. Tipado y validación

TypeScript DEBE ejecutarse en modo estricto. El tipo `any` NO DEBE utilizarse salvo
una excepción localizada, justificada y documentada. Todo dato externo DEBE validarse
en tiempo de ejecución antes de usarse, incluidos formularios, parámetros de URL,
cookies, datos de Supabase, Route Handlers y Server Actions.

Los tipos de TypeScript NO SUSTITUYEN la validación en tiempo de ejecución. Los
contratos compartidos DEBEN tener una única fuente de verdad de la que se deriven o
contra la que se verifiquen tipos, validadores y pruebas. Esto evita que el compilador
ofrezca garantías sobre datos que nunca validó.

### X. Tareas pequeñas y trabajo en equipo

Los planes de implementación DEBEN dividirse en tareas pequeñas, independientes y
verificables. Cada tarea DEBE tener un solo objetivo, responsable, archivos afectados,
dependencias, criterio de verificación y relación con una historia o requisito. Como
regla general, una tarea DEBE modificar entre uno y cinco archivos. Si necesita más,
DEBE dividirse o documentar una razón técnica directa.

Las tareas paralelas NO DEBEN modificar los mismos archivos ni depender de contratos
sin definir. El marcador `[P]` solo PUEDE utilizarse cuando la tarea sea realmente
paralela. `tasks.md` DEBE usar un formato equivalente al siguiente:

```text
- [ ] T012 [US2] [P] Responsable: Integrante 2
      Implementar validación del alias temporal.
      Archivos: src/lib/validation/player-alias.ts,
                src/lib/validation/player-alias.test.ts
      Depende de: T004
      Verificación: ejecutar las pruebas unitarias.
```

La granularidad explícita reduce conflictos entre integrantes y hace verificable el
avance real.

### XI. Verificación antes de completar

Una tarea solo PUEDE marcarse como completada después de ejecutar su verificación.
Escribir el código o compilar el proyecto NO EQUIVALE por sí solo a completarla. El
registro de trabajo DEBE incluir resultado esperado, verificación realizada, resultado
observado, archivos modificados y bloqueos pendientes.

Cuando una verificación dependa de credenciales, infraestructura, hardware o una
prueba manual no disponible, la tarea DEBE permanecer pendiente o bloqueada. No se
DEBE sustituir evidencia faltante por una suposición de éxito. Esta regla mantiene
honesta y reproducible la entrega.

### XII. Alcance proporcional

Antídoto es un prototipo pequeño. La solución NO DEBE introducir microservicios,
arquitecturas distribuidas, abstracciones innecesarias, repositorios genéricos sin
necesidad, capas sin responsabilidad clara, infraestructura para una escala inexistente
ni autenticación compleja fuera del alcance.

Se DEBE elegir la solución más sencilla que conserve seguridad, accesibilidad,
contratos claros y capacidad de evolución. Toda capacidad no enumerada en el alcance
incluido se considera fuera del MVP y NO DEBE implementarse sin una especificación
posterior aprobada. Pruebas, migraciones, validación, accesibilidad y seguridad son
condiciones de entrega, no funcionalidades adicionales.

## Alcance, arquitectura y separación

Antídoto es una plataforma educativa pública y Mobile-First de alfabetización
mediática e informacional para el UNESCO Youth Hackathon 2026. El MVP utiliza una
trivia interactiva para enseñar a identificar desinformación, contenido manipulado,
deepfakes, titulares engañosos, información fuera de contexto y usos irresponsables
de inteligencia artificial.

**Incluido en el MVP**:

- trivia pública sin registro y alias temporal;
- sesiones de juego anónimas;
- preguntas organizadas por mecánicas;
- registro de respuestas y retroalimentación educativa inmediata;
- cálculo de puntuación en servidor;
- pantalla de resultados;
- ranking global persistido en Supabase;
- diseño accesible, adaptable a móviles y probado desde 320 píxeles; y
- optimización de imágenes.

**Excluido del MVP**:

- cuentas permanentes;
- inicio de sesión con correo y recuperación de contraseña;
- perfiles sociales;
- panel administrativo completo;
- aplicación móvil nativa; y
- generación automática de preguntas con inteligencia artificial.

No se PUEDE implementar una capacidad excluida o no enumerada sin una especificación
posterior aprobada.

**Arquitectura aprobada**:

- Next.js con App Router y TypeScript estricto;
- React Server Components por defecto para renderizado o acceso a datos que no
  requieran interacción del navegador;
- Client Components únicamente en las fronteras que necesiten interacción, estado
  visual local o APIs del navegador, sin trasladarles autoridad de negocio;
- Tailwind CSS;
- Radix UI o primitivas accesibles equivalentes;
- Supabase como base de datos PostgreSQL, persistencia y ranking;
- migraciones SQL versionadas;
- `next/image` para contenido visual; y
- Vercel para despliegue continuo.

Todo cambio tecnológico DEBE explicar su motivo e impacto y recibir aprobación antes
de implementarse.

La implementación DEBE mantener estas responsabilidades:

- **Presentación**: componentes, diseño, estados visuales e interacción del jugador.
- **Aplicación**: inicio de partida, envío de respuestas, finalización de sesión y
  consulta del ranking.
- **Dominio**: reglas de puntuación, estados de partida, tipos de mecánica y
  restricciones de respuestas.
- **Infraestructura**: Supabase, persistencia, configuración, logs y servicios
  externos.

La lógica crítica NO DEBE residir en componentes visuales. Estas fronteras NO
justifican capas adicionales sin una responsabilidad concreta.

## Flujo de entrega y puertas de calidad

Antes de implementar una funcionalidad DEBEN existir:

- una historia de usuario;
- criterios de aceptación;
- los contratos necesarios;
- el modelo de datos, cuando corresponda;
- una estrategia de pruebas; y
- un alcance definido.

Si falta una de estas entradas, la implementación DEBE permanecer bloqueada hasta
definirla. Antes de aprobar una funcionalidad se DEBEN verificar y registrar:

- compilación, tipado y lint;
- pruebas relacionadas;
- flujo principal y estados de error;
- cumplimiento de los criterios de accesibilidad aplicables;
- comportamiento móvil desde 320 píxeles;
- seguridad de datos y políticas de acceso; y
- ausencia de secretos en el cliente y en artefactos versionados.

Las verificaciones DEBEN ser proporcionales al riesgo, pero ninguna puerta aplicable
PUEDE omitirse sin documentar el bloqueo o tramitar una enmienda. Toda especificación,
plan y lista de tareas DEBE incluir una comprobación explícita de conformidad con esta
constitución.

## Gobernanza

Esta constitución tiene prioridad sobre decisiones informales del equipo y sobre
documentos de menor autoridad. Toda revisión de una especificación, plan, lista de
tareas o cambio de código DEBE comprobar su cumplimiento. Una desviación NO PUEDE
aprobarse de manera informal: el trabajo DEBE corregirse o la constitución DEBE
enmendarse primero.

Toda propuesta de enmienda DEBE:

1. explicar el motivo;
2. identificar los principios y secciones afectados;
3. evaluar el impacto en producto, arquitectura, datos, seguridad, accesibilidad y
   trabajo pendiente;
4. indicar la versión semántica resultante;
5. registrar la fecha del cambio; y
6. recibir aprobación explícita del equipo responsable del proyecto antes de entrar
   en vigor.

El versionado constitucional DEBE seguir SemVer:

- **MAJOR** para un cambio incompatible, eliminación o redefinición de principios;
- **MINOR** para incorporar un principio o ampliar obligaciones de forma material; y
- **PATCH** para aclaraciones que no cambien obligaciones.

Cada enmienda DEBE actualizar el Sync Impact Report y la línea de versión. Las
revisiones DEBEN exigir justificación de toda complejidad o excepción y evidencia de
las puertas de calidad aplicables.

**Versión**: 1.0.0 | **Ratificada**: 2026-07-29 | **Última enmienda**: 2026-07-29
