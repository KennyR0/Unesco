# Plan de implementación: Trivia educativa MVP

**Rama Git activa**: `main`
**Feature Spec Kit**: `001-trivia-mvp-flow`
**Fecha**: 2026-07-29
**Especificación**: [spec.md](./spec.md)
**Constitución**: 1.0.0

## Resumen

Antídoto se implementará como una sola aplicación Next.js App Router con una
frontera cliente pequeña y un backend dentro de Next.js. El visitante introduce un
alias, una Server Action crea una sesión anónima ligada a una cookie opaca y una
función PostgreSQL asigna de forma atómica el `RoundSize` configurado; Production
usa cinco preguntas. Cada carga
recupera únicamente el estado confirmado; el navegador recibe una pregunta por vez y
nunca su solución. Enviar, avanzar y finalizar son transiciones autoritativas del
servidor. Supabase conserva contenido, sesiones, respuestas y el ranking derivado.

La solución utiliza React Server Components (RSC) para lecturas, Server Actions para
mutaciones de la interfaz y funciones PostgreSQL solo donde aportan atomicidad o una
proyección segura sobre tablas privadas. El ranking se calcula directamente desde
sesiones finalizadas mediante una lectura consistente; no existe una tabla duplicada.
Imágenes locales optimizadas reducen el riesgo de la demostración.

## Gobernanza documental y fuentes normativas

Para evitar que una corrección local introduzca divergencias en otro artefacto, cada
decisión normativa tiene una única fuente de verdad. Los documentos consumidores
DEBEN enlazarla o citarla y NO DEBEN crear una segunda definición literal:

| Contenido normativo | Fuente de verdad | Uso de los demás artefactos |
|---|---|---|
| Alcance, historias, requisitos, criterios de aceptación, Cohorte MVP y fixture inicial de alias bloqueados | [`spec.md`](./spec.md) | El plan explica la estrategia y las tareas exigen evidencia sin redefinir el requisito. |
| Mensajes públicos, acciones de recuperación y mapeo de códigos internos | [`contracts/errors.md`](./contracts/errors.md) | Los demás contratos y tareas verifican el mapeo por referencia. |
| Operaciones del juego, entradas, salidas y estados de aplicación | [`contracts/game-api.md`](./contracts/game-api.md) | Research y plan justifican decisiones sin redefinir firmas ni presentaciones. |
| Entidades persistidas, ciclo de vida y semántica temporal | [`data-model.md`](./data-model.md) | El contrato de base y las tareas consumen las transiciones sin redefinirlas. |
| Esquemas SQL, RPC, privilegios y códigos de base de datos | [`contracts/database.md`](./contracts/database.md) | El modelo explica el dominio; la implementación respeta esta interfaz de persistencia. |
| Accesibilidad, perfil de tecnología asistiva y criterios manuales | [`contracts/accessibility.md`](./contracts/accessibility.md) | La especificación y las tareas remiten al perfil contractual. |
| Protocolo operativo de usabilidad, consentimiento y evidencia | [`quickstart.md`](./quickstart.md) | La cohorte de `spec.md` define las cuotas; T145 ejecuta el protocolo sin copiarlo. |
| Arquitectura, secuencia y estrategia técnica | Este `plan.md` | No puede modificar requisitos o contratos mediante una decisión secundaria. |
| Responsables, dependencias, archivos y verificaciones ejecutables | [`tasks.md`](./tasks.md) | Cada tarea consume las fuentes anteriores y permanece pendiente hasta producir evidencia. |

Si dos textos parecen discrepar, se corrige primero la fuente indicada en esta tabla
y después se reemplaza el texto secundario por una referencia. Una síntesis no puede
ampliar ni restringir la obligación canónica.

La asignación de propietarios es normativa únicamente en `tasks.md`. Cualquier cambio
de responsable se realiza primero allí; `spec.md`, este plan y los demás artefactos
pueden describir capacidades funcionales de los roles, pero no repetir asignaciones
concretas que puedan divergir.

## Línea base documental previa a implementación

Antes de iniciar cualquier tarea T001–T150, los artefactos normativos aprobados DEBEN
quedar versionados en una línea base documental. El procedimiento reproducible, los
archivos incluidos, las exclusiones y los comandos propuestos se definen en
[`quickstart.md`](./quickstart.md#0-línea-base-documental-previa-a-implementación).
Esta puerta incluye la Constitución, todos los artefactos del feature, sus contratos
y checklists, y exige revisar archivos sin seguimiento, reglas de ignore, posibles
secretos, temporales y el diff staged. La carpeta `.agents/` no forma parte
automáticamente de la línea base: se decide por separado según la política del
repositorio y nunca se mezcla por inferencia con los contratos del producto.

## Comprobación previa de consistencia

### Contradicciones resueltas

| Hallazgo | Impacto si se ignora | Resolución del plan |
|----------|----------------------|---------------------|
| El repositorio actual es un prototipo HTML/JS con seis juegos, puntuación cliente y `localStorage`. | Contradice una mecánica, servidor autoritativo y Next.js + Supabase. | Se conserva como legado fuera del build. El nuevo Next.js vive en la raíz y no importa `index.html`, `js/` ni `juegos/`. No se portan las otras mecánicas. |
| `README.md` afirma que no hacen falta servidor ni instalación. | Quedará falso para el MVP aprobado. | La futura fase Fundación actualiza la documentación de ejecución; `quickstart.md` es la guía contractual desde este plan. |
| Los nombres `anon` y `service_role` solicitados son claves heredadas de Supabase. | Un proyecto nuevo quedaría basado en una interfaz con deprecación anunciada para final de 2026. | Se usa `SUPABASE_SECRET_KEY`; `SUPABASE_SERVICE_ROLE_KEY` queda como fallback temporal. No se usa una clave pública en navegador. |

### Resultado

No existe contradicción funcional entre la constitución y la especificación vigente.
Las decisiones anteriores no cambian historias, reglas ni alcance. No queda ninguna
ambigüedad bloqueante.

## Contexto técnico

**Lenguaje/versión**: Node.js 24.x LTS; TypeScript 5.x con `strict: true`, sin
`any`; SQL PostgreSQL administrado por Supabase.

**Dependencias principales**: Next.js 16.2.x (referencia inicial 16.2.12), React 19,
Tailwind CSS, Zod, `@supabase/supabase-js`. Para selección única se usarán primitivas
HTML accesibles equivalentes a Radix; no se añadirá Radix hasta que exista una
interacción que lo necesite.

**Persistencia**: Supabase PostgreSQL, migraciones SQL versionadas, Row Level
Security (RLS), esquema privado para tablas y esquema `api` para RPC. El seed
reproducible se limita a local/Preview; Production recibe el contenido educativo
aprobado mediante una migración de datos SQL versionada. Supabase Storage no se usa en
esta versión.

**Pruebas**: Vitest; Testing Library y `user-event` en jsdom; integración contra
Supabase local; Playwright contra el build de producción; verificaciones manuales
accesibles documentadas.

**Plataforma objetivo**: navegador moderno en móvil y escritorio; Vercel con runtime
Node.js; Supabase alojado. Diseño desde 320 CSS px.

**Tipo de proyecto**: aplicación web full-stack única.

**Objetivos de rendimiento**:

- contenido principal inicial utilizable en 3 s o menos con 1,6 Mbps de descarga,
  750 Kbps de carga, 150 ms de latencia y caché fría; “utilizable” significa que el
  propósito, el campo de alias, la acción para comenzar y el enlace al ranking están
  visibles, reciben foco y pueden activarse sin esperar otro recurso crítico;
- transferencia inicial total máxima de `1000000` bytes;
- peso recomendado de `300000` bytes por imagen de pregunta y límite absoluto de
  `1000000` bytes, con dimensiones para evitar cambios de layout;
- una sola pregunta y sus opciones por proyección;
- JavaScript cliente limitado a formularios, estados y fallback visual;
- estado de envío visible antes de permitir una segunda activación.

**Restricciones**:

- un único `RoundSize` entero de 1 a 10, configurado en 5 para Production, mecánica
  `single_choice`, sin temporizador;
- 100 puntos por acierto, 0 por error;
- sesión activa durante 24 horas desde la última actividad confirmada;
- acceso individual al resultado final durante siete días desde `finished_at`, sin
  convertir la sesión finalizada en `invalidated`;
- purga de detalle e invalidadas dentro de siete días;
- ranking público de diez resultados, sin WebSockets;
- ninguna cuenta, panel administrativo, generación IA ni mecánica adicional.

**Escala/alcance**: prototipo de hackathon, al menos diez preguntas publicadas,
rondas cuyo `RoundSize` es 5 en Production, top diez público y tráfico de
demostración; no se diseña para escala masiva.

## Comprobación constitucional previa a Phase 0

| Principio | Puerta | Resultado y evidencia de diseño |
|-----------|--------|-------------------------------|
| I. Educación antes que competencia | Toda respuesta debe producir explicación, señal y recomendación antes de avanzar. | **PASS** — la puerta educativa de `spec.md` aprueba la versión antes de publicarla; `AnswerResult` exige los tres campos y la última retroalimentación precede al resultado. |
| II. Contract-First | Contratos aprobados antes de código e integración. | **PASS** — este flujo genera `contracts/` y `data-model.md`; no autoriza implementación todavía. |
| III. Servidor como fuente de verdad | Solución, intentos, puntos y finalización permanecen en servidor. | **PASS** — cookie resuelta por servidor y RPC transaccionales; DTO previo no contiene solución. |
| IV. Privacidad mínima | Sin cuenta, token no predecible, finalidad y retención documentadas. | **PASS** — token de 256 bits, solo hash persistido, cookie `httpOnly`, limpieza a 7 días. |
| V. Accesibilidad | Criterios verificables y verificación manual. | **PASS** — contrato específico con teclado, foco, anuncios, zoom, reflow, touch y lector. |
| VI. Mobile-First y rendimiento | Presupuestos y contrato de imagen medibles. | **PASS** — 320 px, `1000000` bytes, 3 s, `300000` bytes recomendados por imagen, `next/image` y fallback. |
| VII. Seguridad de Supabase | Migraciones, grants, RLS, RPC y pruebas positivas/negativas. | **PASS** — tablas privadas, RLS, grants explícitos, funciones `SECURITY INVOKER` restringidas. |
| VIII. Separación contenido/lógica | Preguntas estructuradas y mecánica común. | **PASS** — contenido en tablas; `single_choice` en catálogo; componentes no contienen preguntas. |
| IX. Tipado y validación | Strict TS, runtime validation y fuente única. | **PASS** — Zod en frontera de formulario, cookie y salida Supabase; tipos derivados/contrastados. |
| X. Tareas pequeñas/equipo | Plan preparado para tareas 1–5 archivos y paralelismo real. | **PASS** — fases, dependencias y archivos sensibles quedan identificados en `tasks.md`. |
| XI. Verificación antes de completar | Cada corte tiene una evidencia ejecutable o bloqueo honesto. | **PASS** — matriz de pruebas y puertas por fase; manual no disponible permanece pendiente. |
| XII. Alcance proporcional | Sin microservicios, auth compleja ni abstracciones especulativas. | **PASS** — una aplicación, un adaptador concreto y una sola mecánica. |

No hay violaciones que requieran Complexity Tracking.

## Arquitectura y límites

```text
Navegador
  ├─ HTML/RSC: inicio, estado, resultados y ranking
  └─ Client Components: formularios, pending, foco y error de imagen
          │
          ▼
Next.js Node.js
  ├─ Server Actions: iniciar, responder, avanzar, finalizar y limpiar la cookie irrecuperable
  ├─ Casos de uso: autorización, validación y mapeo contractual
  └─ Adaptador Supabase server-only
          │
          ▼
Supabase Data API — esquema `api`
  └─ RPC transaccionales y lecturas seguras, incluido el ranking
          │
          ▼
PostgreSQL — esquema `private`
  └─ contenido, sesiones, asignaciones y respuestas
```

### Presentación

Responsable de jerarquía visual, HTML semántico, Tailwind, estado pendiente,
selección local, fallback de imagen, foco y anuncios. Nunca calcula corrección,
puntos ni transiciones de sesión.

### Aplicación

Casos de uso explícitos:

- iniciar una partida;
- recuperar estado y pregunta activa;
- limpiar la cookie de una sesión que el servidor ya determinó irrecuperable;
- enviar una respuesta;
- avanzar después de la retroalimentación;
- finalizar una partida;
- consultar resultado;
- consultar ranking.

Cada caso de juego valida entrada y salida, resuelve errores y devuelve un contrato
público. `clearInvalidSession` es higiene de transporte sin entrada ni DTO: solo
aplica la política fija de expiración y redirige.

### Dominio

Contiene normalización/validación de alias, estados permitidos, puntuación 100/0,
el concepto único `RoundSize` como entero de 1 a 10, restricciones de respuesta,
orden del ranking y códigos de error. No importa React, Next.js ni Supabase.

### Infraestructura

Contiene variables server-only, generación/hash de token, cliente Supabase,
adaptador de RPC y registro estructurado. No devuelve filas de base de datos a
presentación.

## Estrategia de renderizado y operaciones

| Superficie | Render/transporte | Razón |
|------------|-------------------|-------|
| `/` | Server Component con `AliasForm` cliente pequeño | Contenido estable con poco JS; formulario necesita pending y errores. |
| `/play` | Server Component dinámico que lee cookie; `QuestionForm` cliente | Recupera estado autoritativo; solo la selección/envío necesita estado local. |
| Retroalimentación | Contrato retornado por Server Action y reconciliado en la misma vista | Mantiene aprendizaje inline, selección bloqueada y anuncio accesible. |
| `/results` | Server Component dinámico | Lee resultado por cookie; no calcula nada en cliente. |
| `/leaderboard` | Server Component con estado vacío/error | Lectura pública a través del servidor; no necesita hidratación salvo reintento. |
| Mutaciones | Server Actions | Formularios del mismo origen, validación Zod cuando existe entrada, cookies y pending; `clearInvalidSession` no recibe entrada y se limita a higiene de cookie y redirección. |
| Route Handlers | Ninguno en MVP | No existe cliente externo, webhook ni API REST pública. |

Las Server Actions se consideran endpoints públicos: nunca confían en campos ocultos,
`.bind`, opción seleccionada, posición o estado del cliente sin repetir la
autorización y validación en servidor. La excepción acotada es
`clearInvalidSession`: no acepta entrada ni autoriza una operación de juego, y su
único efecto posible es expirar la cookie de Antídoto del navegador que la invoca.

## Flujo técnico vertical

### 1. Inicio

1. El visitante recibe propósito, aviso de ranking y formulario.
2. `startGame` normaliza a NFC, elimina espacios externos, cuenta grafemas, valida
   caracteres y bloqueos exactos sin distinguir mayúsculas.
3. El servidor genera token y hash.
4. `api.start_game` valida el `RoundSize` enviado exclusivamente por la configuración
   server-only, crea la sesión y ese número de asignaciones o revierte todo. El valor
   de Production es 5.
5. Solo después del éxito se escribe la cookie y la acción devuelve
   `nextPath: "/play"`; el formulario navega entonces a `/play`.

### 2. Recuperación y pregunta

1. `/play` lee la cookie, valida su forma, calcula hash y llama
   `api.get_game_state`.
2. `api.get_game_state` es una lectura pura: no cambia `status`, `invalidated_at`,
   actividad ni `expires_at`, y no escribe en ninguna tabla. Comprueba estado y
   posición; si `expires_at <= now()`, proyecta `SESSION_INVALID` sin ejecutar
   `UPDATE`.
3. Si la asignación está pendiente, retorna únicamente enunciado, multimedia pública,
   opciones y progreso.
4. Si ya está respondida, retorna la retroalimentación confirmada.
5. Si finalizó, la página dirige a `/results`.
6. Si `getGameState` devuelve `SESSION_NOT_FOUND` o `SESSION_INVALID`, o la cookie
   ausente/malformada hace imposible recuperar la sesión, el Server Component no
   intenta modificar cabeceras: renderiza la vista segura común. Sin cookie, sus
   acciones son enlaces normales; con una cookie desconocida, malformada o invalidada
   que retirar, “Iniciar otra partida” puede usar `clearInvalidSession()`.
7. Esa Server Action sin argumentos expira únicamente `antidoto_session` con
   `Max-Age=0`, `expires` pasado y la misma política `httpOnly`, `secure`,
   `sameSite=lax` y `path=/` usada al crearla; después ejecuta `redirect("/")`.
   No llama Supabase, no finaliza ni crea partidas y repetirla es inocuo.

### 3. Respuesta

1. El cliente exige una selección y conserva su valor durante pending/error.
2. `submitAnswer` valida FormData y deriva sesión de la cookie.
3. `api.submit_answer` bloquea sesión/asignación y comprueba primero la expiración. Si
   sigue vigente, valida pertenencia y opción, inserta una sola respuesta, asigna
   100/0 y cambia estado. Si ya venció, materializa `invalidated` de forma atómica,
   fija `invalidated_at = expires_at` y devuelve un resultado interno etiquetado para
   que la transacción confirme antes de que Next.js lo mapee a `SESSION_INVALID`.
4. La salida permitida contiene corrección, puntos y contenido educativo; nunca se
   usa una puntuación enviada por el cliente.
5. La RPC devuelve internamente `accepted_new` y `session_expires_at`; el adaptador
   los retira del DTO público. La Server Action alinea la cookie con ese instante.
6. Únicamente un reintento idempotente de `submitAnswer` después de una aceptación
   incierta obtiene la respuesta canónica y puede reemitir la cookie con la vigencia
   restante hasta el `session_expires_at` ya persistido, sin cambiar nuevamente la
   actividad en base.

### 4. Avance y finalización

1. “Continuar” llama `api.advance_game`, que comprueba primero que la sesión no esté
   vencida e incrementa el cursor solo si la asignación actual está respondida.
2. Después de la quinta retroalimentación, “Ver resultados” llama
   `api.finish_game`.
3. `api.finish_game` comprueba primero que la sesión no esté vencida; después calcula
   aciertos y puntos desde respuestas guardadas, persiste `single-choice-100-v1` y
   finaliza. También fija `result_access_until = finished_at + 7 días` y lo devuelve
   como metadato interno para sincronizar la cookie hasta ese instante.
4. Repetir la finalización devuelve el mismo resultado y el mismo
   `result_access_until`, sin prolongarlo.

### 5. Resultado y ranking

1. `/results` obtiene el resultado por cookie mediante `api.get_game_result`, una
   lectura pura que no modifica estado, invalidación, actividad ni expiración. Una
   sesión finalizada devuelve el mismo resultado durante siete días; después produce
   `RESULT_ACCESS_EXPIRED` sin escribir ni cambiarla a `invalidated`.
2. `/leaderboard` llama una lectura SQL segura que calcula el top diez y la posición
   propia en una sola instantánea.
3. La base marca por identidad interna la sesión actual antes de retirar su UUID: su
   fila queda marcada si está en el top o se muestra aparte si queda fuera, nunca se
   duplica ni se añade una undécima entrada.
4. Un fallo del ranking conserva acciones para jugar o volver a resultados.

## Sesión anónima

| Aspecto | Decisión |
|---------|----------|
| Credencial | 32 bytes aleatorios codificados Base64URL sin padding: exactamente 43 caracteres validados antes de usar. |
| Persistencia | SHA-256 de 32 bytes, único; token sin hash solo en cookie. |
| Transporte a RPC | SHA-256 como 64 caracteres hexadecimales minúsculos; PostgreSQL valida y decodifica a `bytea`. |
| Cookie | `antidoto_session`, HttpOnly, SameSite=Lax, Path=/ y Secure fuera de local; mientras la sesión está activa, `expires` proviene de `session_expires_at` y Max-Age tiene máximo 86400; al finalizar se sincroniza una sola vez con `result_access_until` y máximo 604800. |
| Renovación | Solo crear sesión o aceptar una respuesta nueva desplaza `expires_at`; únicamente el reintento idempotente de `submitAnswer` puede volver a sincronizar la cookie con ese mismo instante, sin prolongarlo. Las lecturas nunca emiten ni renuevan la cookie. |
| Autoridad | Cookie + hash; nunca alias, URL, ID de formulario o estado React. |
| Recarga | Recupera pregunta o retroalimentación confirmada en `current_position`. |
| Finalizada | `/play` no reabre; `/results` devuelve el resultado existente hasta `result_access_until` y después presenta `RESULT_ACCESS_EXPIRED` sin invalidar la sesión. |
| Invalidada/inexistente/irrecuperable | La lectura servidor muestra una acción explícita; `clearInvalidSession()` expira solo `antidoto_session` y redirige a `/`. Nueva sesión requerida. |
| Nueva partida | En resultados, el alias actual aparece precargado para confirmarlo o editarlo; `startGame` crea nuevo token, UUID y asignaciones y reemplaza la cookie anterior. |

“Volver a jugar” reutiliza `AliasForm` en la pantalla de resultados con el alias
actual precargado desde `FinalResult`. El alias no entra en la URL ni en almacenamiento
cliente. Solo un nuevo envío válido de `startGame` crea la sesión distinta y reemplaza
la cookie.

## Preguntas y solución protegida

- `single_choice` es el único código activo de mecánica.
- Cada pregunta publicada tiene 2–4 opciones, `correct_option_id`, explicación,
  señales y recomendación.
- Preguntas y opciones usan referencias públicas opacas separadas de sus UUID
  internos; esas referencias nunca autorizan una operación.
- Las preguntas publicadas son inmutables; una corrección crea nueva versión.
- Se selecciona pseudoaleatoriamente en servidor el `RoundSize` configurado y sus
  posiciones se guardan; Production fija ese valor en 5.
- La proyección previa excluye `correct_option_id`, resultado, puntos y reglas
  privadas.
- Una opción solo es válida si su clave compuesta demuestra pertenencia a la pregunta
  asignada.
- La ronda no descarga las otras cuatro preguntas anticipadamente.

Los detalles físicos y sus invariantes están en [data-model.md](./data-model.md) y
[contracts/database.md](./contracts/database.md).

## Puntuación e idempotencia

La versión `single-choice-100-v1` fija:

- correcta: 100;
- incorrecta: 0;
- sin negativos;
- sin velocidad;
- máximo: `total_questions × 100`.

`player_answers` conserva `is_correct` y `points_awarded` como hechos históricos.
Finalizar suma esos hechos, no vuelve a evaluar contra contenido que pudiera cambiar.
Una restricción única evita dos respuestas por asignación y `finish_game` retorna el
resultado existente cuando la sesión ya está finalizada.

## Expiración y materialización del estado

`api.get_game_state` y `api.get_game_result` son lecturas puras. Para una sesión
activa vencida proyectan `SESSION_INVALID` cuando `expires_at <= now()` sin cambiar
ninguna fila. Para una sesión finalizada, `get_game_result` devuelve el resultado
hasta `result_access_until` y después proyecta `RESULT_ACCESS_EXPIRED`; nunca la
convierte en `invalidated`. La escritura automática queda limitada a dos casos:

- cada RPC de mutación bloquea la sesión y comprueba primero el plazo; si una sesión
  `started` o `in_progress` venció, materializa `invalidated` y
  `invalidated_at = expires_at` en una transacción que confirma antes de que la capa
  de aplicación devuelva `SESSION_INVALID`; y
- la rutina privada de retención, como única excepción programada, materializa de
  forma idempotente las sesiones abandonadas vencidas con el mismo anclaje
  `invalidated_at = expires_at`.

La purga de una sesión invalidada se calcula desde ese `invalidated_at` anclado, por
lo que ejecutar tarde la rutina no reinicia ni extiende los siete días de retención.
Una sesión `finished` no cambia a `invalidated`. La finalización sincroniza la cookie
con el corte de siete días; al vencer, la lectura proyecta `RESULT_ACCESS_EXPIRED` y
conserva el resultado mínimo para ranking. Cron elimina el hash en el siguiente ciclo,
pero el corte de autorización no depende de que esa ejecución ya haya ocurrido.

## Seguridad de Supabase

### Operaciones por cliente

| Contexto | Operaciones |
|----------|-------------|
| Navegador | Ninguna llamada directa a Supabase. |
| Next.js con clave secreta | RPC aprobadas, incluida la lectura `api.get_leaderboard`. |
| Funciones SQL | Operaciones transaccionales sobre `private`; lectura de solución solo durante validación. |
| `anon` / `authenticated` | Sin `USAGE` en `private` y sin `EXECUTE` en RPC. |

### Reglas

- `private` no está en los esquemas expuestos por Data API.
- Row Level Security (RLS) está habilitado en todas sus tablas, sin políticas
  públicas.
- Grants se declaran en migraciones; no se confía en defaults de Supabase.
- Toda función usa `SECURITY INVOKER`, `search_path = ''` y nombre calificado.
- `PUBLIC`, `anon` y `authenticated` pierden `EXECUTE` predeterminado.
- La clave secreta se importa solo desde un módulo `server-only`.
- Las Server Actions conservan la comprobación same-origin de Next.js; no se amplía
  `allowedOrigins`, y la cookie usa `SameSite=Lax`.
- Los logs nunca contienen token, hash, clave, solución, opción ni alias completo.
- Las pruebas intentan expresamente lecturas, escrituras, puntuación arbitraria,
  publicación, actualización y borrado rechazados.

## Diseño de pantallas y estados

### Inicio

- Encabezado y propósito educativo en lenguaje no técnico.
- Instrucciones breves antes del formulario.
- Etiqueta visible, ayuda 3–20 y aviso de ranking público.
- Error asociado y acción primaria de 44 × 44 o mayor.
- Enlace al ranking sin sesión.

### Partida

- Encabezado de pregunta enfocable programáticamente.
- Texto “Pregunta X de Y”, donde `Y` es el `RoundSize` persistido para la sesión
  (5 en Production), además de indicador visual.
- Enunciado y figura opcional con proporción estable.
- `fieldset`/`legend` y 2–4 radios nativos de área táctil completa.
- Botón “Comprobar respuesta”; durante pending permanece visible como
  “Comprobando…”.
- Error recuperable conserva selección y reintento.

### Retroalimentación

- Texto e icono “Correcta” o “Incorrecta”; el color es redundante.
- Opción correcta si la selección fue incorrecta.
- Explicación, señales y recomendación en la misma vista.
- Región de estado preexistente y botón “Continuar” o “Ver resultados”.

### Resultados

- Alias como texto, puntuación, aciertos, total y el mensaje contractual:
  “Antes de compartir, verifica la fuente, la evidencia y el contexto.”
- Acciones a ranking y nueva partida.
- La nueva partida reutiliza `AliasForm` con el alias actual precargado para
  confirmarlo o editarlo; el envío reutiliza `startGame` y crea una sesión distinta.

### Ranking

- La ruta pública única es `/leaderboard`, según `spec.md` FR-003; las tareas de
  aplicación y despliegue consumen esa referencia y no introducen otra ruta pública.
- Lista semántica de hasta diez: posición, alias y puntuación.
- Fila actual identificada con el texto “Tu resultado” dentro del top; resultado
  actual separado solo cuando no está entre los diez.
- Estado vacío con acción para jugar.
- Error no bloqueante con reintento y navegación alternativa.

### Estados transversales

`loading.tsx` comunica recuperación. Los Client Components distinguen `idle`,
`pending`, `success` y error recuperable. `error.tsx` es cliente por convención de
Next.js y ofrece `reset`. Los estados sin partida recuperable muestran el mensaje
seguro común y las acciones a ranking/nueva partida; nunca muestran mensajes SQL ni
confirman historial de sesión. Sin cookie, ambas acciones son enlaces normales. En
`/play`, solo una cookie presente desconocida, malformada o invalidada habilita
`clearInvalidSession`; no se borra la cookie durante el render ni mediante JavaScript
cliente.

## Estructura propuesta

### Documentación de la feature

```text
specs/001-trivia-mvp-flow/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── domain.ts
│   ├── game-api.md
│   ├── database.md
│   ├── errors.md
│   ├── accessibility.md
│   └── media.md
├── checklists/
│   ├── requirements.md
│   └── requirements-patch.md
├── evidence/                       # Se crea únicamente al ejecutar sus tareas
│   ├── content/
│   │   └── educational-content-approval.md   # T044
│   ├── blocked-aliases-review.md              # T054
│   ├── error-recovery-matrix.md               # T137
│   ├── checkpoint-d.md                        # T145
│   ├── usability-study.md                     # T145
│   ├── accessibility/                         # T128, T130 y T131
│   │   ├── zoom-200.md                        # T128
│   │   ├── one-hand-mobile.md                 # T130
│   │   └── assistive-technology.md            # T131
│   ├── deploy/                                # T139–T144 y T146–T149
│   │   ├── local-database.md                  # T139
│   │   ├── preview-database.md                # T140
│   │   ├── preview-security.md                # T141
│   │   ├── vercel-project-link.md             # T142
│   │   ├── vercel-preview-env.md              # T143
│   │   ├── vercel-pr-preview.md               # T144
│   │   ├── preview-smoke.md                    # T144
│   │   ├── production-database.md             # T146
│   │   ├── vercel-production-env.md           # T147
│   │   ├── production-release.md              # T148
│   │   └── production-health.md               # T149
│   └── demo-readiness.md                      # T150
└── tasks.md                         # Única fuente normativa de ejecución y responsables
```

El inventario anterior cubre todas las rutas de evidencia declaradas por T044, T054,
T128, T130, T131, T137 y T139–T150. Las rutas bajo `evidence/` describen salidas
futuras y no implican que la evidencia exista o esté aprobada antes de ejecutar la
tarea correspondiente. Una evidencia ausente mantiene la tarea pendiente o
bloqueada. Si una tarea futura añade una ruta, el árbol y su comentario de cobertura
deben actualizarse en el mismo cambio documental; `tasks.md` sigue siendo la fuente
normativa de la ruta concreta.

### Código fuente futuro

```text
public/
└── images/
    └── questions/

src/
├── app/
│   ├── page.tsx
│   ├── play/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── results/
│   │   └── page.tsx
│   ├── leaderboard/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── game/
│   │   ├── alias-form.tsx
│   │   ├── question-form.tsx
│   │   ├── question-image.tsx
│   │   ├── feedback-panel.tsx
│   │   └── round-progress.tsx
│   └── leaderboard/
│       └── leaderboard-list.tsx
├── features/
│   └── game/
│       ├── actions/
│       │   ├── start-game.action.ts
│       │   ├── clear-invalid-session.action.ts
│       │   ├── submit-answer.action.ts
│       │   ├── advance-game.action.ts
│       │   └── finish-game.action.ts
│       ├── application/
│       │   ├── start-game.ts
│       │   ├── get-game-state.ts
│       │   ├── submit-answer.ts
│       │   ├── advance-game.ts
│       │   ├── finish-game.ts
│       │   ├── get-game-result.ts
│       │   └── get-leaderboard.ts
│       ├── domain/
│       │   ├── alias.ts
│       │   ├── scoring.ts
│       │   └── session-state.ts
│       └── infrastructure/
│           ├── supabase-game-gateway.ts
│           └── map-database-error.ts
└── lib/
    ├── env/
    │   └── server.ts
    ├── security/
    │   └── session-token.ts
    └── supabase/
        └── server.ts

supabase/
├── config.toml
├── migrations/
└── seed.sql

tests/
├── integration/
├── e2e/
└── fixtures/
```

No se crea `src/app/api/` porque no hay Route Handlers. Los tests unitarios y de
componentes se colocan junto al archivo que prueban para que una futura tarea pueda
quedar dentro de 1–5 archivos. Solo integración, E2E y fixtures compartidos viven en
`tests/`.

[`contracts/domain.ts`](./contracts/domain.ts) es la única fuente ejecutable de
schemas y tipos compartidos. El futuro `tsconfig.json` define un alias
`@antidoto/contracts` hacia ese archivo y el código de `src/` lo importa
directamente. No se crea una segunda declaración bajo `src/contracts/`; si cambia un
contrato, primero cambia este archivo canónico. Los Client Components usan
`import type` y validación HTML/estado de interfaz; los schemas Zod se ejecutan en las
fronteras de servidor y no se incorporan innecesariamente al bundle cliente.

## Configuración de moderación básica de alias

La sección `Assumptions` de [`spec.md`](./spec.md) es la única definición normativa de
la ruta, esquema, versión, contenido inicial, normalización y gobierno del fixture
`blocked-aliases.v1.json`. La implementación de dominio lo carga localmente y no
consulta servicios externos ni una base remota.

Las revisiones obligatorias, sus responsables y el propietario principal de cada
tarea se consultan exclusivamente en las convenciones y cabeceras de
[`tasks.md`](./tasks.md). Una revisión es una puerta de aprobación y no
corresponsabilidad sobre la tarea.

## Estrategia de contenido educativo por entorno

La puerta y la rúbrica de aprobación educativa se definen únicamente en
[`spec.md`](./spec.md#puerta-de-aprobación-educativa). El seed y la migración solo
consumen versiones con decisión `approved` y evidencia vigente en
`evidence/content/educational-content-approval.md`; escribir SQL, ejecutar una
migración o completar campos estructurales no constituye revisión ni aprobación.

`supabase/seed.sql` será determinista e idempotente y se ejecutará exclusivamente en
local y Preview. Nunca se aplica a Production, ni directa ni indirectamente mediante
`--include-seed`.

El contenido educativo aprobado de Production se incorpora mediante una migración de
datos SQL versionada, creada primero con
`pnpm exec supabase migration new load_approved_educational_content`; el nombre real
del archivo conserva el timestamp generado por la CLI. El seed y esa migración usan
las mismas referencias públicas estables y el mismo contenido educativo aprobado:

- una fila de mecánica `single_choice`;
- al menos diez preguntas publicadas en español;
- referencias públicas opacas pre-generadas y estables para que cada reset sea
  determinista;
- 2–4 opciones por pregunta;
- una solución protegida por pregunta;
- explicación, una o más señales y recomendación;
- al menos una pregunta solo texto y una con imagen local;
- rutas y metadatos de imagen que cumplan el contrato;
- temáticas del alcance: desinformación, contenido manipulado, deepfakes, clickbait,
  contexto y uso responsable de IA;
- cero sesiones o ranking ficticio.

Fixtures de prueba pueden crear sesiones/resultados en Supabase local o Preview, pero
no forman parte del seed educativo ni de la migración de Production. Ningún contenido
necesita servicios externos.

Ambos scripts materializan únicamente el catálogo cuya versión e identificadores
coinciden con la evidencia aprobada. Dentro de la transacción siguen el orden
borrador → opciones → solución → publicación y usan operaciones idempotentes apoyadas
en referencias únicas estables, de modo que volver a ejecutar el bloque sincronizado
no crea mecánicas, preguntas ni opciones duplicadas.

Para hacer esa coincidencia ejecutable sin ampliar el esquema público, el seed y la
migración incluyen, una sola vez antes de su primera sentencia SQL, estas tres claves
de comentario con los valores de la evidencia: `-- antidoto-catalog-version:`,
`-- antidoto-catalog-digest-algorithm: SHA-256` y
`-- antidoto-catalog-digest:` seguido de exactamente 64 caracteres hexadecimales en
minúsculas. El digest es el de la proyección canónica definida en `spec.md`. La
proyección se ordena por `public_ref` e incluye todos los valores materializados:
mecánica, versiones, enunciados, opciones, solución protegida, explicación, señales,
recomendación y metadatos multimedia. T044 debe rechazar cualquier archivo cuyo
metadato no coincida con la evidencia; T145 y T146 deben recalcular el digest sobre
la proyección de cada entorno y compararlo antes de continuar. El digest y la versión
son metadata de verificación, no columnas, DTO ni datos visibles al cliente.

La verificación compara una proyección normalizada del catálogo después de
`supabase db reset --no-seed` con la obtenida después de `supabase db reset`; debe
coincidir en referencias, textos, opciones, solución protegida, explicación, señales,
recomendación, metadatos multimedia y versiones aprobadas. Cualquier cambio educativo
invalida la aprobación anterior y vuelve primero al flujo editorial definido en
`spec.md`. Una vez aprobada la nueva versión, se actualizan en el mismo cambio la
migración aún no desplegada y `seed.sql`; después de desplegarla, una corrección crea
una nueva migración versionada y mantiene el seed sincronizado.

## Estrategia de pruebas basada en riesgos

| Riesgo/requisitos | Nivel | Casos obligatorios | Evidencia |
|-------------------|-------|--------------------|-----------|
| Alias inconsistente o bloqueado, FR-004–009 | Unitario | trim Unicode, NFC, grafemas 2/3/20/21, caracteres, espacios, casefold y blocklist | Vitest |
| Alias inválido en flujo, AC-US2-02/SC-011 | E2E | enviar alias vacío/corto o inválido; error asociado y enfocado; sin cookie ni sesión creada | Playwright sobre build |
| Puntuación/estados, FR-025, FR-036–040 | Unitario | 100/0, máximo, transición válida/terminal, cálculo final | Vitest |
| Coherencia de contratos públicos | Unitario | `RoundSize` 1–10, progreso pregunta/feedback, pertenencia de referencias, acción siguiente, ranking sin posiciones ni resultado actual duplicados y puntuación entre 0 y `totalQuestions × 100`, múltiplo de 100 | Vitest |
| Error interno filtrado, FR-062 | Unitario | mapeo de todos los códigos y fallback genérico | Vitest |
| Inicio parcial, FR-011–013 | Integración | crea exactamente el `RoundSize` configurado; una elegible menos revierte; Production usa 5; orden persistido | Vitest + Supabase local |
| Solución expuesta, FR-020/031 | Integración/contrato | DTO y RPC previa sin solución; roles públicos rechazados | Vitest + inspección serializada |
| Respuesta manipulada/duplicada, FR-018–024/061 | Integración | correcta, incorrecta, opción ajena, pregunta ajena, concurrente; primera aceptación marca `accepted_new`, reintento devuelve falso y el mismo `session_expires_at` | Vitest + Supabase local |
| Finalización duplicada, FR-037–042 | Integración | incompleta rechazada; completa; dos llamadas mismo resultado | Vitest + Supabase local |
| Ranking incorrecto, FR-044–050/063 | Integración | top 10, empate triple, incompletas excluidas, resultado actual dentro/fuera y finalización concurrente sin mezclar instantáneas | Vitest + Supabase local |
| Lecturas y expiración: FR-065 principal; FR-034 y FR-042 complementarios | Integración | `get_game_state` activa vencida proyecta `SESSION_INVALID`; `get_game_result` finalizada devuelve el mismo resultado inmediatamente, después de 24 h y antes de 7 días, y después proyecta `RESULT_ACCESS_EXPIRED`; ninguna lectura cambia estado, fechas ni persistencia | Vitest + Supabase local con reloj controlado |
| Retención, FR-065–066 | Integración | 24 h activas; acceso de resultado por 7 días; Cron materializa abandonadas con `invalidated_at = expires_at`, purga detalle, elimina el hash después de `result_access_until` y retira mínimos en su plazo | Vitest + función SQL controlada |
| Matriz completa de errores, SC-011 | Trazabilidad + integración/manual | las 23 filas de `spec.md` enlazan prueba o evidencia y verifican acción, información conservada, continuidad y necesidad de nueva sesión | Vitest/Playwright + matriz de evidencia |
| RLS/grants, principio VII | Integración | server permitido; anon/auth leen/escriben/ejecutan rechazado | clientes por rol + Security Advisor |
| Formulario y selección, FR-017/022/051–052 | Componente | etiqueta/error, radios con teclado, pending, selección conservada | Testing Library + user-event |
| Feedback/progreso, FR-026–032 | Componente | texto/icono, señal, recomendación, `role=status`, foco | Testing Library |
| Ranking vacío/error, FR-048 | Componente/E2E | vacío, reintento y juego todavía disponible | Testing Library/Playwright |
| Corte vertical, SC-002/006/007 | E2E | fixture con cinco asignaciones que incluye texto e imagen; feedback cada vez, resultado, ranking y replay | Playwright sobre build |
| Recuperación, FR-034–035 | Integración/E2E | recarga pendiente y respondida; no duplica; finalizada no reabre; la vista segura usa enlaces normales sin cookie y `clearInvalidSession` solo para retirar una cookie presente inválida, sin tocar Supabase | Vitest + Playwright |
| Solo teclado, SC-003 | E2E + manual | Tab, flechas, Space/Enter, foco lógico, lector de pantalla | Playwright + registro manual |
| Móvil/rendimiento, FR-055–059 | E2E + medición | 320 px, sin scroll X, 44 × 44, caché fría, red especificada | Playwright + DevTools/Vercel |
| Zoom/movimiento, FR-053 | E2E + manual | reduced motion y zoom 200 % sin pérdida | Playwright + registro manual |
| Imagen fallida, FR-016/057 | Componente/E2E | dimensiones, alt visible de fallback, reintento y respuesta disponible | Testing Library/Playwright |
| Comprensión inicial y aprendizaje, SC-001/SC-010 | Prueba moderada manual | Cohorte MVP de usabilidad completa; medir propósito/inicio <60 s y recuerdo de señal/recomendación | protocolo anónimo, cuotas, observaciones y resultados agregados |

Vitest no se usará para renderizar Async Server Components; sus flujos se prueban
con Playwright. No se impone un porcentaje de cobertura.

### Reloj controlado de integración

Las pruebas locales de expiración, resultado y retención usan el mecanismo normativo de
`spec.md`: una conexión aislada de Supabase fija una instantánea UTC en la configuración
privada de sesión `antidoto.test_now`; `private.current_time()` la usa solo para el rol
de pruebas local y vuelve al reloj de PostgreSQL fuera de ese contexto. La configuración
se limpia al terminar la transacción. Las RPC públicas no reciben una fecha artificial y
los roles públicos no pueden modificar esa configuración. Los casos registran la instantánea y prueban por separado los
límites inclusivos; T053 también ejecuta la función privada con datos vencidos y
confirma una ejecución real en `cron.job_run_details`. Preview y Production solo usan el
reloj de PostgreSQL.

## Variables de entorno

La propuesta exacta está en [quickstart.md](./quickstart.md). Decisiones:

- `SUPABASE_URL`: requerida y server-only.
- `SUPABASE_SECRET_KEY`: clave actual preferida y server-only.
- `SUPABASE_SERVICE_ROLE_KEY`: fallback heredado, mutuamente excluyente.
- `GAME_ROUND_SIZE=5`: única entrada de configuración server-only para `RoundSize`,
  entero entre 1 y 10; Production fija 5.
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`: evaluadas, no usadas
  porque el navegador no consulta Supabase.

Zod valida las variables al iniciar. El módulo server-only rechaza que falte URL, que
la URL no sea válida, que falten ambas claves o que estén configuradas ambas. Ninguna
clave real se incluye en `.env.example`.

## Rendimiento

- RSC por defecto; el layout raíz no lee cookies.
- Sin cliente Supabase ni dataset de preguntas en el bundle.
- Pregunta actual únicamente; ranking máximo de diez.
- Componentes cliente en hojas pequeñas y sin proveedor global de estado.
- `next/image` con dimensiones, `sizes`, carga diferida y contenedor estable.
- Imágenes locales, objetivo de `300000` bytes y máximo absoluto de `1000000` bytes
  antes de commit. Una imagen es utilizable si se decodifica dentro de su contenedor
  estable y conserva alternativa correcta, o si el fallback visible presenta esa
  alternativa y la pregunta continúa siendo respondible.
- Fuentes locales o sistema; no se requiere una descarga tipográfica externa.
- Sin animación no educativa; transiciones desactivables con
  `prefers-reduced-motion`.
- Estados `loading` y `pending` visibles bajo red lenta.
- El presupuesto se mide con caché fría y cuenta todos los recursos de la vista.

## Despliegue

1. GitHub aloja el repositorio y aplica checks a pull requests.
2. Supabase local valida migraciones, seed local, RPC, RLS y retención.
3. Las mismas migraciones y el seed sincronizado se aplican al proyecto Preview.
4. Vercel conecta el repositorio y crea Preview por PR.
5. Preview usa un Supabase no productivo y variables propias.
6. Tras aprobar gates, se ejecuta `supabase db push` en Production sin
   `--include-seed`; el contenido educativo llega únicamente por su migración de
   datos versionada.
7. El merge a `main` crea el despliegue Production.
8. Se ejecuta el checklist previo a demostración sobre la URL pública.

No se añade un pipeline de despliegue personalizado ni WebSockets.

### Verificación previa a la demostración

- base de datos y esquema `api` accesibles desde el servidor;
- migraciones aplicadas y Security Advisor sin hallazgos aplicables;
- al menos diez preguntas publicadas y una ronda completa disponible;
- una partida de cinco preguntas finaliza con puntuación correcta;
- reintento y doble envío no duplican;
- ranking disponible, ordenado y con estado vacío/error probado;
- imágenes locales cargan, respetan `300000` bytes recomendados y `1000000` bytes
  máximos, o muestran un fallback que conserva alternativa y permite responder;
- viewport 320 px y teléfono 360–430 px sin desplazamiento horizontal;
- flujo solo teclado y comprobación manual con lector de pantalla;
- prueba moderada SC-001/SC-010 con todas las cuotas de la Cohorte MVP de usabilidad
  y umbrales documentados, o bloqueo explícito si aún no se realizó;
- zoom 200 % y movimiento reducido;
- perfil de red lenta dentro de 3 s/`1000000` bytes con los controles iniciales
  observables y operables;
- bundle, mapas y logs sin secretos ni token de sesión;
- Cron de retención habilitado, última ejecución correcta menor a seis horas y
  si no cumple, runbook de recuperación ejecutado de inmediato y salud comprobada
  otra vez;
- Preview no apunta a la base Production;
- ruta para jugar sigue disponible si falla ranking.

## Fases de implementación

### Fase 1 — Fundación

**Historias habilitadas**: US1–US7.
**Objetivo**: disponer de un Next.js mínimo verificable y fronteras seguras.

Entregables:

- proyecto Next.js/TypeScript strict/Tailwind;
- scripts de typecheck, lint, test, integración, E2E y build;
- validación Zod de entorno;
- cliente Supabase `server-only`;
- base Vitest, Testing Library y Playwright;
- layout, estilos globales Mobile-First y página inicial estática;
- actualización de documentación que deje el prototipo estático como legado.

**Dependencia**: Checkpoint 0 — línea base documental aprobada.
**Gate**: instalar, tipar, lint, prueba mínima y build.
**Paralelismo real**: después de fijar `package.json`/lockfile, configuración de
pruebas y estilos base pueden avanzar en archivos distintos. Nadie modifica
dependencias en paralelo.

### Fase 2 — Contratos y persistencia

**Historias habilitadas**: US2–US7.
**Objetivo**: fijar contratos y una base segura antes de dividir frontend/servidor.

Entregables:

- alias de compilación hacia el contrato canónico
  `specs/001-trivia-mvp-flow/contracts/domain.ts`, sin copiar schemas;
- migraciones de esquemas, tablas, constraints, índices y estados;
- RPC de escritura/lectura, grants y RLS;
- función/programación de retención;
- seed local/Preview y migración de datos de Production sincronizados, con diez o más
  preguntas y referencias estables sin duplicados;
- pruebas de datos, atomicidad y accesos permitidos/rechazados.

**Dependencia**: Fase 1 y aprobación de los contratos de este directorio.
**Gate**: `supabase db reset --no-seed`, `supabase db reset`, comparación del catálogo
sin/con seed, pruebas de integración, casos negativos y advisors.
**Paralelismo real**: las migraciones estructurales permanecen serializadas por
dependencias. Una vez cerradas, la migración de datos de Production, el seed
local/Preview y sus imágenes se actualizan juntos como un único conjunto educativo
sincronizado; no se editan en paralelo porque comparten claves y contenido aprobado.

### Fase 3 — Inicio de partida

**Historias**: US1, US2 y recuperación base de US5.
**Objetivo**: corte vertical inicio → sesión → primera pregunta recuperable.

Entregables:

- normalización, validación y moderación de alias;
- generación/hash/cookie;
- `start_game` y `get_game_state`;
- acción explícita e idempotente para limpiar solo la cookie de una sesión
  irrecuperable ya determinada por el servidor;
- formulario accesible con errores y aviso público;
- asignación persistida de cinco preguntas;
- recuperación tras recarga y fallos de preguntas no disponibles.

**Dependencia**: Fase 2.
**Gate**: unitarios de alias, integración de asignación, componente del formulario y
E2E inicio/recarga.
**Paralelismo real**: alias/formulario y RPC de inicio pueden desarrollarse en
archivos separados después de aprobar sus entradas/salidas; la integración ocurre
cuando ambos pasan aisladamente.

### Fase 4 — Juego y retroalimentación

**Historias**: US3, US4 y US5.
**Objetivo**: responder las cinco preguntas con aprendizaje y progreso confiable.

Entregables:

- proyección de pregunta activa;
- radios nativos, imagen/fallback y progreso textual;
- `submit_answer` y `advance_game`;
- unicidad, pertenencia, doble envío y reintento;
- retroalimentación completa y recuperación del estado respondido;
- foco, anuncios, errores y estados pending.

**Dependencia**: Fase 3.
**Gate**: unitarios, integración correcta/incorrecta/manipulada/concurrente,
componentes y E2E de cinco respuestas.
**Paralelismo real**: RPC/adapter y componentes pregunta/feedback pueden avanzar
después del contrato; `question-form.tsx` y `feedback-panel.tsx` no se asignan a dos
trabajos simultáneos.

### Fase 5 — Resultados y ranking

**Historias**: US6 y US7.
**Objetivo**: cerrar de forma idempotente y consultar clasificación pública.

Entregables:

- `finish_game` y resultado histórico;
- pantalla de resultados con alias precargado para confirmar o editar antes de crear
  una nueva partida;
- consulta consistente de ranking, desempates y resultado actual;
- estados vacío/error no bloqueante.

**Dependencia**: Fase 4.
**Gate**: finalización idempotente, fórmula, ranking/empates/exclusiones, componentes
y E2E hasta volver a jugar.
**Paralelismo real**: resultados y ranking pueden avanzar en páginas/adaptadores
distintos cuando `LeaderboardSnapshot` y `FinalResult` estén congelados.

### Fase 6 — Calidad y despliegue

**Historias**: US1–US7.
**Objetivo**: producir evidencia reproducible para la demostración.

Entregables:

- matriz completa de pruebas;
- revisión 320 px, teléfono real, zoom, teclado y lector;
- perfil de red, `1000000` bytes, imágenes y layout shift;
- pruebas de secretos, RLS/grants y retención;
- Vercel Preview/Production y checklist de demo;
- registro de resultados, archivos modificados y bloqueos.

**Dependencia**: Fases 1–5.
**Gate**: todas las verificaciones disponibles pasan; las manuales no ejecutadas
permanecen pendientes, nunca se presumen.
**Paralelismo real**: seguridad de datos, accesibilidad manual, rendimiento y
documentación pueden verificarse en paralelo porque no modifican los mismos archivos.

## Dependencias entre fases

```text
Checkpoint 0 — Línea base documental
  └─ Fase 1
       └─ Fase 2
            └─ Fase 3
                 └─ Fase 4
                      └─ Fase 5
                           └─ Fase 6
```

Checkpoint 0 es una puerta global heredada por todas las tareas T001–T150. Las
dependencias locales de cada tarea se evalúan únicamente después de aprobar esta
puerta.

Ninguna tarea puede conservar estado completado mientras no exista la línea base
documental aprobada; los registros históricos de trabajo no sustituyen esa puerta.

El paralelismo existe dentro de una fase después de congelar contratos; no se
paraleliza frontend, servidor y base de datos sobre una forma de datos todavía
inestable.

## Validación del backlog generado

Las tareas vigentes T001–T150 DEBEN conservar:

- tener un solo objetivo;
- indicar historia/requisito, archivos, dependencias y verificación;
- modificar 1–5 archivos salvo justificación técnica directa;
- usar `[P]` solo si no comparte archivos ni espera una decisión contractual;
- registrar resultado esperado, comando/prueba ejecutada, resultado observado,
  archivos y bloqueos;
- no marcar manual/infraestructura como aprobada sin evidencia.

Cualquier regeneración mediante `$speckit-tasks` DEBE preservar las asignaciones,
puertas y correcciones documentales vigentes; no puede sobrescribirlas sin revisión
explícita.

### Archivos compartidos o sensibles

| Archivo/área | Riesgo | Regla de coordinación |
|--------------|--------|-----------------------|
| `package.json` y lockfile | Conflictos y dependencias divergentes | Cambios serializados en Fundación; no dos instalaciones paralelas. |
| `tsconfig.json`, ESLint, Vitest y Playwright config | Cambia todas las verificaciones | Un cambio por vez con ejecución completa. |
| `specs/001-trivia-mvp-flow/contracts/domain.ts` | Rompe frontend, servidor y datos | Fuente única importada por `src/`; congelar antes de dividir y cambiar el contrato primero. |
| `supabase/migrations/` | Orden e historia irreversibles | Crear con CLI, una migración por objetivo, ordenar dependencias. |
| `supabase/config.toml` | Divergencia local/alojada del schema `api` | Responsable único por fase y revisión de seguridad. |
| `supabase/seed.sql` y migración de contenido | Divergencia o duplicados entre entornos | Seed solo local/Preview; migración versionada en Production; mismas referencias y payload aprobados, idempotencia y comparación automatizada. |
| `src/lib/env/server.ts` | Puede exponer secretos | Solo imports server-only y revisión de bundle. |
| `src/lib/supabase/server.ts` | Clave elevada y acceso amplio | Interfaz mínima; no importar desde cliente. |
| `src/app/layout.tsx` y `globals.css` | Conflictos entre pantallas | Estabilizar tokens/base antes del trabajo paralelo. |
| acciones y adaptador central | Cambios de operación compartida | Un archivo por acción; gateway se modifica de forma serializada. |

## Riesgos y mitigaciones

| Riesgo | Mitigación | Verificación |
|--------|------------|--------------|
| La clave secreta omite RLS. | `server-only`, tablas privadas, RPC cerradas, hash validado en cada operación y rotación preparada. | Bundle/logs + pruebas anon/auth + revisión de grants. |
| Dos envíos otorgan dos respuestas. | Bloqueo consistente + unique constraint + replay canónico. | Prueba concurrente e E2E doble activación. |
| Una recarga omite retroalimentación. | Cursor persistido y respuesta sin autoavance. | E2E recarga después de aceptar. |
| Contenido publicado cambia una ronda. | Publicación inmutable y versión nueva para correcciones. | Integración de asignación retirada. |
| Preview contamina ranking Production. | Proyecto y claves Supabase separados por entorno. | Inspección de variables y escritura de prueba en Preview. |
| No hay suficientes preguntas elegibles para `RoundSize`. | Inicio atómico y catálogo de diez; error `QUESTIONS_UNAVAILABLE`. | Reset/seed + caso con una elegible menos que el valor configurado. |
| Imagen externa falla durante demo. | Imágenes locales, alt visible y fallback. | Offline de recurso/fallo forzado. |
| Limpieza elimina el hash antes de siete días, mantiene acceso después del corte o no elimina detalle. | Retención separada, `result_access_until` autoritativo, función idempotente cada seis horas, revisión operativa y retiro por migración. | Pruebas con reloj controlado antes/después del corte + `cron.job_run_details`. |
| Alias Unicode se cuenta distinto. | NFC + grafemas + regex Unicode en una fuente de verdad. | Tabla de casos unitarios. |
| El prototipo legado se publica por error. | Next.js detectado en raíz y revisión del output de build. | URL pública y artefactos de despliegue. |

## Comprobación constitucional posterior a Phase 1

| Puerta posterior | Evidencia | Estado |
|------------------|----------|--------|
| Contratos completos antes de código | `contracts/domain.ts`, `game-api.md`, `errors.md`, `database.md`, `accessibility.md`, `media.md` | **PASS** |
| Modelo con relaciones, constraints, índices, estados y retención | `data-model.md` | **PASS** |
| Solución protegida en toda proyección previa | `domain.ts`, `game-api.md`, `database.md` | **PASS** |
| Diseño Supabase mínimo y verificable | esquemas `private`/`api`, transiciones críticas atómicas y consulta consistente sin tabla duplicada | **PASS** |
| Accesibilidad y rendimiento medibles | contratos específicos + matriz de pruebas | **PASS** |
| Guía de ejecución sin secretos | `quickstart.md` y propuesta `.env.example` | **PASS** |
| Sin alcance adicional | una sola mecánica, sin auth, admin, realtime, IA ni app nativa | **PASS** |
| Preparado para tareas pequeñas | fases, dependencias, archivos sensibles y gates | **PASS** |

La arquitectura posterior al diseño cumple la constitución 1.0.0. No se registra
ninguna excepción ni deuda constitucional.

## Complexity Tracking

No aplica. El plan no introduce ninguna violación constitucional que requiera
justificación.
