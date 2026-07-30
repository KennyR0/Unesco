# Investigación técnica: Trivia educativa MVP

**Fecha**: 2026-07-29
**Especificación**: `specs/001-trivia-mvp-flow/spec.md`
**Constitución**: 1.0.0

## Resultado

Todas las decisiones necesarias para diseñar el corte vertical están resueltas. No
queda ninguna aclaración pendiente.

Se identificaron dos contradicciones técnicas reales, ambas resolubles sin cambiar el
alcance funcional:

1. El repositorio contiene un prototipo estático anterior cuyo `README.md` describe
   seis juegos, puntuación en el navegador y persistencia en `localStorage`. Si se
   reutilizara como implementación del MVP, contradiría el alcance de una sola
   mecánica, la autoridad del servidor y la arquitectura Next.js + Supabase. Se
   conservará como material legado fuera del build nuevo; no se portarán sus otras
   mecánicas ni su motor de puntuación. Su eliminación o archivo físico requerirá una
   decisión posterior.
2. La solicitud evalúa `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
   `SUPABASE_SERVICE_ROLE_KEY`, pero Supabase clasifica `anon` y `service_role` como
   claves heredadas que prevé deprecar al final de 2026. Para un proyecto nuevo se
   usarán `SUPABASE_URL` y `SUPABASE_SECRET_KEY`; la clave heredada
   `SUPABASE_SERVICE_ROLE_KEY` será únicamente un fallback temporal y mutuamente
   excluyente. No habrá cliente Supabase en el navegador, por lo que no se necesita
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Decisión 1 — Base de ejecución

**Decisión**

Usar un único proyecto Next.js 16.2.x con App Router, React 19, TypeScript 5 en modo
estricto y Node.js 24 LTS. La versión inicial de referencia será Next.js 16.2.12,
fijada junto con las demás dependencias en `package.json` y el lockfile. Se
actualizarán parches dentro de 16.2.x solo después de ejecutar todas las puertas de
calidad.

El runtime será Node.js, sin declarar Edge. Turbopack será el bundler predeterminado
de Next.js 16. El lint se ejecutará con ESLint como comando separado: no se dependerá
de `next lint` ni de que `next build` ejecute lint.

**Motivo**

Es la base estable compatible con App Router al momento de este plan. Node.js ofrece
las primitivas criptográficas y la compatibilidad de paquetes que necesita la sesión
opaca y el cliente de Supabase. Edge no aporta una ventaja demostrable para un
prototipo con una única región de datos.

**Alternativas descartadas**

- Next.js canary o 16.3 preview: introduce riesgo sin una capacidad necesaria.
- Edge Runtime: añade restricciones de compatibilidad y no elimina el viaje a la base
  de datos.
- Mantener el sitio estático como runtime: impediría cumplir las reglas autoritativas
  de sesión, respuesta y puntuación.

**Consecuencias**

- El nuevo proyecto se inicializa en la raíz y el prototipo estático anterior no
  participa en su build.
- `package.json` declara `engines.node: "24.x"`.
- El CI ejecuta `lint`, `typecheck`, pruebas y `build` como puertas distintas.

**Fuentes**

- [Next.js 16.2.12](https://github.com/vercel/next.js/releases/tag/v16.2.12)
- [Política de soporte de Next.js](https://nextjs.org/support-policy)
- [Requisitos de instalación de Next.js](https://nextjs.org/docs/app/getting-started/installation)
- [Ciclo de versiones de Node.js](https://nodejs.org/en/about/previous-releases)

## Decisión 2 — Límites del sistema

**Decisión**

Mantener cuatro límites concretos dentro de una sola aplicación:

- **Presentación**: páginas App Router, componentes, estilos, estados visuales,
  gestión de foco e interacción.
- **Aplicación**: casos de uso para iniciar, recuperar, responder, avanzar, finalizar,
  obtener resultado y consultar ranking.
- **Dominio**: normalización de alias, estados, regla de puntuación, invariantes y
  errores estables.
- **Infraestructura**: cliente Supabase exclusivo de servidor, llamadas RPC,
  variables y registro de errores.

No se creará un repositorio genérico ni una capa por entidad. Habrá un adaptador
concreto de juego para concentrar el mapeo Supabase → contratos y evitar que las
páginas conozcan filas o errores SQL.

**Motivo**

La separación protege la lógica crítica sin convertir un prototipo pequeño en una
arquitectura empresarial. El adaptador concreto tiene una responsabilidad real:
ocultar el modelo físico y validar las proyecciones que devuelve Supabase.

**Alternativas descartadas**

- Acceso a Supabase desde componentes: filtraría infraestructura hacia presentación.
- Repositorios genéricos CRUD: no representan transacciones ni reglas del juego.
- Microservicio separado: duplica despliegue, contratos y operación sin beneficio
  para el alcance.

**Consecuencias**

- La presentación solo consume contratos públicos.
- Las funciones puras de dominio se prueban sin Next.js ni Supabase.
- Los casos de uso y el adaptador pueden dividirse en tareas pequeñas después de
  aprobar los contratos.

## Decisión 3 — Server Components, Client Components y transporte

**Decisión**

- Usar Server Components para `page.tsx`, contenido inicial, recuperación de sesión,
  lectura del estado de juego, resultados y ranking.
- Usar Client Components mínimos para el formulario de alias, el grupo de opciones,
  los estados de envío, la transición visible de retroalimentación y el fallback de
  imagen que requiere `onError`.
- Usar Server Actions para las mutaciones originadas en la interfaz: iniciar,
  responder, avanzar y finalizar. Se autoriza además una acción mínima,
  `clearInvalidSession`, exclusivamente para expirar la cookie cuando una lectura
  servidor ya determinó que la sesión es irrecuperable. “Volver a jugar” reutiliza
  en resultados el formulario de alias con el valor actual precargado; confirmarlo o
  editarlo ejecuta el mismo `startGame` y crea siempre una sesión nueva.
- Leer desde los Server Components mediante casos de uso internos; no llamar una API
  HTTP propia.
- No crear Route Handlers en este MVP. Se reservan para webhooks, clientes externos o
  una API pública futura, ninguno de los cuales forma parte del alcance.

`contracts/game-api.md` describe operaciones lógicas, no endpoints REST. Una misma
operación no se duplicará como Server Action y Route Handler.

**Motivo**

Las páginas y layouts son Server Components por defecto. Las lecturas directas desde
servidor evitan peticiones internas y mantienen secretos fuera del bundle. Las Server
Actions encajan con formularios del mismo origen, estados pendientes y escritura de
cookies.

**Alternativas descartadas**

- Route Handlers para todo: añaden una segunda superficie interna sin consumidor
  externo.
- SPA con fetch desde el navegador: aumenta JavaScript y obliga a exponer una API.
- Server Actions para lecturas: usan POST y no son el mecanismo natural de lectura.

**Consecuencias**

- `/play` y `/results` serán rutas dinámicas porque leen `cookies()`.
- Sus casos de uso y las RPC `get_game_state`/`get_game_result` son lecturas puras:
  no escriben cookies ni tablas, incluso cuando proyectan una sesión vencida.
- Cada Server Action de juego se tratará como una operación públicamente invocable:
  validará entrada, cookie, pertenencia y estado. `clearInvalidSession` no recibe
  entrada ni opera sobre el juego; su efecto queda confinado a la cookie propia.
- `cookies()`, `params` y `searchParams` se usarán como APIs asíncronas.
- No se configurará `serverActions.allowedOrigins`; el mismo origen será el único
  permitido. `SameSite=Lax` protege además el envío de la cookie. Se conservará el
  límite de cuerpo predeterminado de 1 MB.

**Fuentes**

- [Server y Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Mutaciones con Server Actions](https://nextjs.org/docs/app/getting-started/mutating-data)
- [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [Seguridad de Server Actions](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions)

### Subdecisión 3A — Limpieza de una cookie de sesión irrecuperable

**Decisión**

Una lectura de `/play` o `/results` continúa en un Server Component y nunca intenta
escribir cabeceras. Cuando no existe una credencial vigente que autorice una partida
recuperable, la interfaz proyecta la `Presentación segura común` cuya definición
literal y acciones viven exclusivamente en
[`contracts/errors.md`](./contracts/errors.md).

`SESSION_NOT_FOUND`, `SESSION_INVALID` y `RESULT_ACCESS_EXPIRED` permanecen
diferenciados en dominio, logs y pruebas, pero la presentación pública no confirma si
existió una partida anterior. No se añade cookie auxiliar, `localStorage`, query
parameter ni marcador persistente de “sesión anterior”.

Si la cookie está ausente, la vista segura se renderiza directamente y ambas acciones
son enlaces normales: no se escribe, expira ni crea cookie alguna. Si la cookie está
presente pero es desconocida, malformada o corresponde a una sesión invalidada, se
muestra la misma presentación pública y la acción de regreso puede usar el formulario
servidor que referencia `clearInvalidSession(): Promise<never>` para retirar
únicamente `antidoto_session`.

La Server Action:

- no acepta `FormData`, token, hash, UUID, código de error ni otro dato del cliente;
- expira únicamente `antidoto_session` mediante la política común de cookies, con
  `Max-Age=0`, `expires` pasado, `httpOnly: true`, `sameSite: "lax"`, `path: "/"` y
  el mismo valor de `secure` usado al crearla;
- ejecuta `redirect("/")` después de emitir la cookie expirada;
- no usa el cliente Supabase, no invoca RPC, no finaliza una partida y no inicia otra;
- es idempotente: si la cookie ya no existe, la misma instrucción de expiración y la
  misma redirección siguen siendo una salida correcta.

La condición se establece en el servidor antes de renderizar el formulario. La
acción no acepta una afirmación cliente sobre esa condición. Una invocación repetida
o fuera del flujo solo puede eliminar la cookie de Antídoto del mismo navegador; no
puede afectar otra sesión ni datos persistidos.

**Motivo**

Next.js permite leer cookies durante el render de un Server Component, pero solo
permite modificarlas en una Server Function o un Route Handler. Una Server Action
referenciada por un `<form>` resuelve el cambio de cabecera sin crear una API HTTP
paralela. El efecto acotado hace innecesario consultar Supabase otra vez.

**Alternativas descartadas**

- Borrar durante el render del Server Component: Next.js no permite modificar la
  cookie en esa fase.
- Crear un Route Handler solo para limpiar la cookie: añade una superficie HTTP sin
  consumidor externo y duplica el transporte interno.
- Aceptar un identificador o un código de estado desde el cliente: convertiría datos
  no confiables en autoridad innecesaria.
- Revalidar o modificar la sesión en Supabase desde la acción: duplica la lectura ya
  resuelta y amplía el efecto de una operación que solo debe limpiar credenciales
  locales.
- Crear automáticamente otra partida: contradice el flujo explícito de alias e inicio.

**Consecuencias**

- El estado sin partida recuperable necesita acciones visibles “Consultar ranking” e
  “Iniciar otra partida”; no se dispara una mutación durante GET y, sin cookie, ambas
  acciones son enlaces normales.
- La prueba debe activar el formulario y observar un `Set-Cookie` expirado y la
  redirección, no exigir esa cabecera en la respuesta de lectura.
- La acción comparte nombre, path y atributos con la política central de creación de
  cookie, pero no comparte el adaptador de Supabase.
- No se añade código de error, DTO público, Route Handler ni dependencia.
- Una pestaña irrecuperable que quede abierta podría borrar después la cookie de una
  partida nueva creada en otra pestaña. El efecto residual se limita a cerrar la
  asociación local: no modifica esa partida en Supabase, y evitarlo exigiría aceptar
  un identificador, almacenar autorización adicional o reconsultar la base, opciones
  descartadas por esta decisión.

**Fuentes**

- [Cookies en Next.js](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [Formularios con Server Actions](https://nextjs.org/docs/app/guides/forms)
- [Redirección en Server Actions](https://nextjs.org/docs/app/api-reference/functions/redirect)

## Decisión 4 — Sesión anónima ligada al navegador

**Decisión**

Al iniciar:

1. El servidor genera 32 bytes criptográficamente aleatorios y los codifica como
   Base64URL sin padding. La cookie válida contiene exactamente 43 caracteres del
   alfabeto `[A-Za-z0-9_-]`.
2. El servidor calcula SHA-256, lo codifica como 64 caracteres hexadecimales
   minúsculos para el argumento JSON de la RPC y PostgreSQL lo decodifica a los 32
   bytes que persiste; el token sin hash nunca se registra ni se envía a Supabase.
3. El token sin hash se guarda en una cookie `antidoto_session` con:
   `httpOnly: true`, `sameSite: "lax"`, `path: "/"`,
   `secure: true` en Preview/Production y `false` únicamente en HTTP local.
   Mientras la sesión está activa, `expires` usa el `session_expires_at` devuelto por
   PostgreSQL y `maxAge` los segundos restantes, con máximo 86400.
4. Cada lectura o mutación del juego resuelve la sesión desde esa cookie y vuelve a
   validar el hash en la base de datos. La acción de higiene
   `clearInvalidSession` no es una operación del juego y no accede a la base.

PostgreSQL desplaza la vigencia únicamente al crear la sesión o aceptar una respuesta
nueva, los dos eventos de actividad confirmada definidos por FR-034/FR-065. La RPC
devuelve internamente el instante persistido. Únicamente un reintento idempotente de
`submitAnswer`, después de que una aceptación pudo perder su cabecera de respuesta,
puede reemitir la cookie con el tiempo restante hasta ese mismo instante, sin
prolongarlo. Una lectura, un error o un estado visual no emiten cookie ni prolongan la
sesión. Un inicio nuevo reemplaza la cookie. Si una lectura determina que la sesión no
existe, está invalidada o no puede recuperarse, presenta la vista segura de la
Subdecisión 3A: sin cookie usa enlaces normales y, con una cookie presente que deba
retirarse, permite la acción explícita de higiene. Si está finalizada, `/play` conduce
al resultado y nunca reabre la ronda.

Al finalizar, `finish_game` fija de forma determinista
`result_access_until = finished_at + 7 días` y lo devuelve solo como metadato interno.
La Server Action sincroniza la misma cookie hasta ese instante, con máximo 604800
segundos desde la finalización. Repetir `finishGame` devuelve el mismo resultado y el
mismo corte, sin prolongarlo. `getGameResult` continúa como lectura pura: entrega el
resultado mientras `now() < result_access_until`. Cuando una sesión válida continúa
en estado `started` o `in_progress`, devuelve `RESULT_NOT_AVAILABLE`. Cuando la
sesión está `finished` y `now() >= result_access_until`, devuelve
`RESULT_ACCESS_EXPIRED`, sin cambiarla a `invalidated` ni modificar fechas,
credencial, detalle o ranking. Un nuevo `startGame` reemplaza la cookie y abandona
voluntariamente la asociación con el resultado anterior.

Ningún identificador recibido por formulario, URL o estado cliente funciona como
autoridad de sesión.

**Motivo**

Un token aleatorio de 256 bits es no secuencial y no predecible. La cookie `httpOnly`
reduce la exposición a scripts y permite recuperación tras recarga sin cuentas ni
Supabase Auth. Guardar solo su hash limita el impacto de una lectura de base de datos.

**Alternativas descartadas**

- Alias como identificador: no es único, secreto ni verificable.
- ID de sesión en URL o campo oculto: permite intentar operar sobre otra sesión.
- `localStorage`: es accesible a JavaScript y no puede ser una credencial autoritativa.
- Supabase Auth anónimo: añade un sistema de identidad y ciclo de tokens innecesario
  para una sola partida temporal.

**Consecuencias**

- El estado local no reemplaza el estado confirmado por el servidor.
- Robar la cookie equivale a controlar esa partida; por eso no se registra ni se
  expone su valor y se usa HTTPS fuera de local.
- Las páginas que no necesitan sesión, como inicio y ranking, no leen la cookie salvo
  que deban destacar el resultado actual.

**Fuente**

- [Cookies en Next.js](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [Argumentos JSON de funciones RPC en PostgREST](https://postgrest.org/en/stable/references/api/functions.html)

## Decisión 5 — Frontera Supabase y claves

**Decisión**

La ruta de datos será:

```text
Navegador
  → Server Components / Server Actions de Next.js
  → cliente Supabase marcado `server-only`
  → esquema Data API `api`
  → tablas del esquema no expuesto `private`
```

No habrá cliente Supabase en el navegador. Next.js usará:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

Para un proyecto que todavía no ofrezca la clave actual se aceptará
`SUPABASE_SERVICE_ROLE_KEY` como fallback heredado, nunca a la vez que
`SUPABASE_SECRET_KEY`. `NEXT_PUBLIC_SUPABASE_URL` y
`NEXT_PUBLIC_SUPABASE_ANON_KEY` se evaluaron y se rechazan para el runtime porque
ninguna operación del MVP necesita hablar desde el navegador con Supabase.

El esquema `api` será el único esquema propio añadido a la lista de esquemas expuestos
de Data API. `private` permanecerá fuera de esa lista.

**Motivo**

La clave secreta actual está destinada a backends controlados y usa el rol elevado
`service_role`. Como no existe Supabase Auth, el servidor de Next.js debe aplicar la
autorización de la cookie antes de cada operación. El esquema privado impide que una
tabla con soluciones sea alcanzable accidentalmente por Data API.

**Alternativas descartadas**

- Clave publishable/anon en el navegador: no hay lectura pública de tablas que la
  necesite.
- Tablas de juego en `public`: dependen de revocaciones perfectas y amplían la
  superficie expuesta.
- Conexión PostgreSQL directa: añade credenciales, pooling y un segundo método de
  acceso sin ventaja para el prototipo.

**Consecuencias**

- La clave secreta evita RLS; RLS es defensa adicional, no la autorización principal
  frente a errores del servidor.
- Las pruebas deben demostrar que `anon` y `authenticated` no pueden leer tablas,
  ni ejecutar funciones.
- La configuración de esquemas expuestos debe coincidir en local, Preview y
  Production.

**Fuentes**

- [Claves actuales y heredadas de Supabase](https://supabase.com/docs/guides/getting-started/api-keys)
- [Esquemas personalizados](https://supabase.com/docs/guides/api/using-custom-schemas)
- [Seguridad de Data API](https://supabase.com/docs/guides/api/securing-your-api)

## Decisión 6 — Asignación de la ronda

**Decisión**

Existe un solo concepto `RoundSize`: entero de 1 a 10, validado por el contrato
TypeScript/Zod y nuevamente por SQL. `GAME_ROUND_SIZE` es su única entrada de
configuración y Production la fija en 5; el cliente nunca envía ese valor.

`api.start_game` recibirá el `RoundSize` validado desde el servidor, comprobará que
existan al menos esa cantidad de preguntas elegibles y, dentro de la misma
transacción, creará la sesión y exactamente ese número de filas de asignación.
Elegibilidad significa:

- estado `published`;
- mecánica `single_choice`;
- entre 2 y 4 opciones;
- una opción correcta;
- explicación no vacía;
- al menos una señal educativa;
- recomendación no vacía;
- metadatos visuales completos cuando exista imagen.

El orden se obtendrá con una selección pseudoaleatoria en servidor derivada del UUID
aleatorio de la sesión y se persistirá en `session_questions.position`. La sesión no
se devuelve ni se escribe en cookie si no quedó con exactamente su `RoundSize`.
`total_questions`, el progreso, el resultado y la puntuación máxima se derivan de ese
valor persistido. El ranking valida cada puntuación contra
`total_questions × 100`; no usa un máximo fijo de 1000.

Una pregunta publicada y sus opciones son inmutables. Para corregir contenido se crea
una nueva versión y se retira la anterior de futuras rondas; las sesiones existentes
pueden seguir leyendo la versión que ya asignaron.

**Motivo**

Persistir asignación y orden permite recargar sin cambiar la ronda. La
pseudoaleatoriedad ofrece variedad al volver a jugar sin requerir un servicio ni
estado adicional. La inmutabilidad evita copiar instantáneas completas por sesión.

**Alternativas descartadas**

- Descargar las diez preguntas y escoger en el navegador: expone contenido
  innecesario y no conserva autoridad.
- Elegir de nuevo en cada carga: cambia la ronda y rompe el progreso.
- Copiar enunciado y opciones a cada sesión: duplica contenido para un conjunto
  pequeño e inmutable.

**Consecuencias**

- La aprobación editorial ocurre antes de materializar el catálogo. El seed
  local/Preview y la migración de contenido de Production solo consumen versiones
  aprobadas; dentro de su transacción insertan preguntas como borrador, añaden
  opciones, definen solución y solo entonces las publican.
- Retirar una pregunta afecta únicamente nuevas asignaciones.
- El adaptador entrega solo la pregunta de `current_position`.

## Decisión 7 — Progreso y recuperación después de recargar

**Decisión**

Persistir `game_sessions.current_position`. Responder no incrementa esa posición:

- Si la asignación actual está `pending`, el estado público contiene la pregunta.
- Si está `answered`, el estado público contiene su retroalimentación confirmada.
- La operación `advance_game` incrementa la posición únicamente después de que el
  jugador activa “Continuar”.
- En la última pregunta, “Ver resultados” invoca `finish_game` después de que la
  retroalimentación ya fue presentada.

**Motivo**

Derivar siempre “la primera pregunta pendiente” perdería la retroalimentación al
recargar inmediatamente después de responder. El cursor persistido representa la
decisión del jugador de avanzar sin crear un nuevo estado conceptual de pregunta.

**Alternativas descartadas**

- Guardar “retroalimentación vista” solo en React: se pierde al recargar.
- Avanzar automáticamente al aceptar: contradice que el jugador decide cuándo
  continuar.
- Añadir estados adicionales de pregunta: no son necesarios; `pending` y `answered`
  permanecen como estados de dominio.

**Consecuencias**

- `advance_game` es una operación lógica necesaria aunque no sea un endpoint.
- La recuperación devuelve una unión discriminada de pregunta o retroalimentación.
- Una selección nunca enviada puede perderse; ninguna respuesta aceptada se pierde.

## Decisión 8 — Atomicidad, concurrencia e idempotencia

**Decisión**

Usar funciones PostgreSQL solo para límites transaccionales o para cruzar de manera
controlada el esquema privado:

- `api.start_game`: sesión + exactamente el `RoundSize` validado (5 en Production).
- `api.get_game_state`: lectura ligada al hash y proyección segura.
- `api.submit_answer`: bloqueo, validación, inserción, puntos, estado y progreso.
- `api.advance_game`: transición del cursor tras una respuesta.
- `api.finish_game`: cálculo y finalización idempotente.
- `api.get_game_result`: lectura ligada al hash.

`api.get_game_state` y `api.get_game_result` son funciones de lectura pura. No
modifican `status`, `invalidated_at`, `last_activity_at`, `expires_at` ni ninguna otra
fila. Si encuentran `expires_at <= now()`, proyectan `SESSION_INVALID` sin `UPDATE`.
Esto mantiene a los GET y Server Components libres de mutaciones y evita depender de
una escritura que podría revertirse al comunicar el error.

Las funciones serán `SECURITY INVOKER`, con `search_path = ''`, referencias
calificadas y retornos explícitos. Se revocará `EXECUTE` a `PUBLIC`, `anon` y
`authenticated`, concediéndolo solo a `service_role`.

Cada RPC de escritura bloquea la sesión y comprueba `expires_at` antes de aplicar su
mutación funcional. Para una sesión `started` o `in_progress` vencida puede
materializar en la misma transacción `status = invalidated` e
`invalidated_at = expires_at`. En vez de lanzar una excepción que revierta ese
`UPDATE`, retorna un resultado interno etiquetado; el adaptador lo transforma en
`SESSION_INVALID` únicamente después de que la llamada RPC confirmó. La rutina
privada de retención es la única otra operación autorizada para materializar
automáticamente esa transición.

`submit_answer` bloqueará primero la sesión y luego la asignación, siempre en ese
orden. Después de la comprobación de vigencia validará que la sesión esté activa, que
la posición sea la actual, que la asignación pertenezca a la sesión, que la opción
pertenezca a esa pregunta y que no exista respuesta. Una restricción única sobre
`session_question_id` será la defensa definitiva contra dos peticiones concurrentes.

Si un reintento llega después de una respuesta aceptada para la asignación actual, se
devuelve la respuesta canónica ya guardada y se ignora la nueva selección. Un intento
de modificar una asignación anterior devuelve `QUESTION_ALREADY_ANSWERED`.
La RPC retorna además, solo para el adaptador, `accepted_new` y el
`session_expires_at` persistido. En un reintento el primero es falso y el segundo no
cambia; la Server Action puede sincronizar la cookie al tiempo restante sin renovar
actividad.

`finish_game` bloquea la sesión, devuelve el resultado existente si ya está
finalizada y, en caso contrario, comprueba vigencia y exige todas las respuestas.
Calcula desde
`player_answers`, no desde la solución editable de una pregunta, y persiste la
versión de puntuación.

**Motivo**

Cada RPC de escritura se ejecuta en una transacción. Concentrar los pasos críticos
evita carreras y respuestas parciales sin convertir consultas simples en funciones.

**Alternativas descartadas**

- Varias llamadas `.insert().update()` desde Next.js: no forman una transacción
  única mediante Data API.
- Confiar en deshabilitar el botón: no evita concurrencia ni reintentos de red.
- `SECURITY DEFINER`: no es necesario porque la llamada ya usa el rol servidor y
  aumentaría el impacto de un permiso erróneo.

**Consecuencias**

- Las transacciones se mantienen cortas y no realizan I/O externo.
- Las invariantes entre filas se expresan en cuatro familias de
  `CONSTRAINT TRIGGER DEFERRABLE INITIALLY DEFERRED`: cada familia comparte una
  función de validación e instala un trigger por tabla origen, ocho triggers en total.
  Dos guardas inmediatas adicionales, `game_session_transition_guard` y
  `player_answer_integrity_guard`, protegen terminalidad, inmutabilidad, corrección y
  puntuación incluso ante DML directo con `service_role`.
  Los `CHECK` se reservan para una fila y la pertenencia de la solución usa una FK
  diferible nativa.
- Las pruebas de integración lanzan envíos concurrentes.
- Las pruebas toman una instantánea de la fila, llaman ambas lecturas en estado
  vigente y vencido, y confirman que ninguna columna ni tabla cambió.
- Las pruebas de mutación vencida confirman la materialización atómica y que
  `invalidated_at` conserva el instante histórico de `expires_at`, no el momento del
  reintento.
- Los errores SQL se traducen a códigos contractuales; nunca llegan sin procesar a la
  interfaz.

**Fuentes**

- [Funciones de base de datos en Supabase](https://supabase.com/docs/guides/database/functions)
- [Bloqueos de filas en PostgreSQL](https://www.postgresql.org/docs/current/sql-select.html)
- [Transacciones de PostgREST](https://postgrest.org/en/stable/references/transactions.html)
- [Constraint triggers de PostgreSQL](https://www.postgresql.org/docs/current/sql-createtrigger.html)

## Decisión 9 — Representación de la solución

**Decisión**

Guardar `questions.correct_option_id` en vez de un booleano público por opción. Una
clave foránea compuesta y diferible verificará que la opción correcta pertenezca a la
pregunta. Una pregunta no puede pasar a `published` mientras el valor sea nulo o su
contenido educativo esté incompleto.

La proyección `PublicQuestion` incluye referencias públicas Base64URL y textos de las
opciones, pero nunca claves primarias ni `correct_option_id`. Las referencias se
guardan separadas de los UUID internos y no funcionan como autorización.
`submit_answer` las resuelve dentro de la sesión, compara dentro de PostgreSQL y solo
después devuelve el resultado y, cuando corresponda, la opción correcta.

**Motivo**

La referencia única representa exactamente una solución y evita que dos opciones
queden marcadas como correctas. Un índice parcial sobre un booleano solo impondría
“como máximo una” y todavía requeriría otra regla para “al menos una”.

**Alternativas descartadas**

- `is_correct` en cada DTO de opción: filtra la solución.
- Regla textual o índice de opción en componentes: mezcla contenido y lógica.
- Validación solo en seed: permite que una migración futura publique contenido
  inválido.

**Consecuencias**

- El alta editorial pasa por la puerta de aprobación definida en `spec.md`. Solo una
  versión aprobada se materializa en orden: pregunta borrador → opciones → solución →
  publicación.
- Preguntas y opciones reciben referencias públicas opacas, únicas e inmutables; el
  seed conserva valores pre-generados para seguir siendo determinista.
- Las filas internas contienen la solución, pero ninguna vista o función previa a la
  respuesta la retorna.

## Decisión 10 — Ranking y retención

**Decisión**

No crear una tabla ni una vista de ranking duplicada. `api.get_leaderboard`, función
de lectura `SECURITY INVOKER`, consulta directamente sesiones finalizadas y calcula
en una sola sentencia SQL:

1. puntuación descendente;
2. `finished_at` ascendente;
3. UUID interno ascendente.

El UUID participa en el orden y en la identificación interna, pero no se selecciona.
La misma sentencia produce el top diez y, cuando existe una sesión finalizada en la
cookie, decora exactamente su fila si está en el top o la devuelve como
`currentPlayerEntry` fuera del top, nunca ambas. Este límite de lectura justifica la
función: evita combinar instantáneas si otra partida finaliza durante la consulta.

Para cumplir FR-066:

- una función privada idempotente, programada cada seis horas, materializa sesiones
  abandonadas `started`/`in_progress` con `expires_at <= now()` como `invalidated` y
  fija `invalidated_at = expires_at`; esta es la excepción documentada a las
  transiciones iniciadas por Server Actions;
- la misma función elimina sesiones invalidadas cuando han transcurrido siete días
  desde ese `invalidated_at` anclado, de modo que una ejecución tardía no desplaza el
  plazo de retención;
- para sesiones finalizadas, elimina `player_answers` y `session_questions` y borra el
  cursor y fechas de actividad dentro de siete días, conservando el hash hasta
  `result_access_until` para permitir la recuperación individual acordada;
- al alcanzar `result_access_until`, la lectura deja de autorizar el resultado aunque
  el ciclo de Cron todavía no haya borrado el hash; la siguiente ejecución elimina el
  hash y conserva en `game_sessions` solo UUID, alias, estado, regla, totales,
  puntuación y finalización;
- `ranking_retention_until` permanece nulo mientras el MVP público esté activo;
- al retirar el MVP, una migración SQL versionada ejecutada por el propietario fija
  esa fecha dentro de seis días y el mismo proceso elimina después los resultados
  mínimos.

Supabase Cron deja cuatro oportunidades diarias. La verificación invoca la función
con datos controlados y revisa `cron.job_run_details` antes de la demostración y al
menos una vez cada seis horas mientras el MVP esté público. Si la última ejecución
correcta alcanza seis horas o el trabajo está deshabilitado, el runbook ejecuta de
inmediato la misma función manualmente, corrige la programación y vuelve a comprobar.

**Motivo**

La sesión finalizada ya contiene el resultado mínimo; duplicarla en otra tabla o
cualquier vista persistida crea riesgo de divergencia. Borrar asignaciones y
respuestas satisface minimización sin perder el ranking durante la vida pública del
MVP.

**Alternativas descartadas**

- Tabla `leaderboard_entries`: duplica puntuación y finalización.
- Vista SQL, materializada o no: no compone por sí sola el top y la entrada propia en
  un único DTO ligado a la sesión; una con privilegios del creador también podría
  saltar RLS.
- Conservar respuestas indefinidamente: contradice el requisito de siete días.

**Consecuencias**

- La recuperación individual del resultado se garantiza durante siete días desde
  `finished_at`; después, el hash deja de autorizar y se elimina en el siguiente ciclo
  de limpieza.
- El retiro del ranking es una operación explícita y auditable, no una inferencia.
- La prueba de ciclo de vida cubre proyección vencida sin escritura, materialización
  programada con `invalidated_at = expires_at`, purga de detalle y retiro.
- Una partida finalizada nunca se convierte en `invalidated` por el reloj de
  inactividad; solo las sesiones `started` o `in_progress` expiran.

**Fuente**

- [Supabase Cron y registro de ejecuciones](https://supabase.com/docs/guides/cron)

## Decisión 11 — Grants y RLS

**Decisión**

- Activar RLS en todas las tablas de `private` como defensa en profundidad.
- No crear políticas permisivas para `anon` ni `authenticated`.
- Revocar `USAGE` de `private` y `api` a `PUBLIC`, `anon` y `authenticated`.
- Revocar privilegios predeterminados sobre tablas, secuencias y funciones.
- Declarar en migraciones `USAGE` sobre `api` y `private`, y cada privilegio
  subyacente, `EXECUTE` o `SELECT` necesario para `service_role`.
- Aplicar `ALTER DEFAULT PRIVILEGES` identificando el rol propietario que crea los
  objetos y el esquema concreto.
- Exponer en `api` solo las RPC aprobadas, incluida `api.get_leaderboard`.
- Revocar `EXECUTE` de esos objetos a roles públicos.
- Probar acceso permitido con el rol servidor y acceso rechazado con `anon` y
  `authenticated`.

**Motivo**

Desde mayo de 2026, proyectos nuevos de Supabase no exponen automáticamente las
tablas. Grants y RLS son controles independientes y deben quedar declarados, no
depender de la configuración histórica de un proyecto.

**Alternativas descartadas**

- Políticas anónimas basadas en un token enviado por el navegador: amplían la
  superficie y vuelven el hash un dato manipulable en la consulta.
- Confiar solo en RLS: un objeto sin grant no es alcanzable, y una clave secreta
  omite RLS.
- Confiar solo en el servidor: una concesión accidental podría exponer datos por Data
  API.

**Consecuencias**

- El Security Advisor y las pruebas negativas forman parte de la verificación.
- Una migración no se aprueba si deja una función ejecutable por `PUBLIC`.
- La página de ranking es pública a nivel de producto, no una tabla pública de
  Supabase.

**Fuente**

- [Cambio de exposición de Data API de 2026](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)

## Decisión 12 — Imágenes

**Decisión**

Usar únicamente imágenes locales versionadas bajo `public/images/questions/` para el
MVP. El contenido sincronizado guarda ruta, alternativa, ancho, alto, formato y peso
revisado. Se permiten AVIF, WebP, JPEG y PNG; se excluyen SVG y GIF. El objetivo por
fuente es `300000` bytes y el límite absoluto es `1000000` bytes.

`next/image` recibe dimensiones explícitas y `sizes`. Para rutas dinámicas locales se
usa `placeholder="empty"` con un contenedor de relación de aspecto y color neutral.
El fallback de error mantiene el espacio, muestra la descripción alternativa como
texto visible y permite reintentar sin impedir responder.

Una imagen se considera utilizable cuando se decodifica dentro del contenedor de
dimensiones reservadas y su alternativa coincide con el contenido informativo; si
falla, el estado también es utilizable cuando aparece la alternativa como texto, se
ofrece reintento y las opciones y el botón de respuesta permanecen operables.

Supabase Storage queda fuera de esta versión.

**Motivo**

Los recursos locales eliminan una dependencia durante la demostración, se revisan en
el repositorio y permiten cumplir el presupuesto. Un blur por imagen no justifica el
campo y procesamiento adicional.

**Alternativas descartadas**

- Supabase Storage: válido, pero añade bucket, políticas y red remota sin que exista
  carga de contenido desde interfaz.
- Dominios externos: comprometen disponibilidad y control de peso.
- `<img>`: pierde la optimización aprobada y facilita cambios de layout.

**Consecuencias**

- No se configura `remotePatterns` en el MVP.
- El componente de fallback es una frontera cliente pequeña porque `onError` necesita
  una función.
- `preload` solo se aplicará si una medición demuestra que la imagen activa es LCP;
  la carga predeterminada será diferida.

**Fuente**

- [`next/image`](https://nextjs.org/docs/app/api-reference/components/image)

## Decisión 13 — Primitivas accesibles y foco

**Decisión**

Usar elementos nativos cuando ya ofrecen la semántica necesaria:

- `<label>` e `<input>` para alias;
- `<fieldset>`, `<legend>` y radios nativos para selección única;
- `<button>` y enlaces reales para acciones y navegación.

Radix UI se añadirá solo si una interacción futura necesita una primitiva que HTML no
resuelve. El flujo de foco será:

- error de alias: texto asociado, `aria-invalid` y foco en el campo;
- envío: mismo botón, texto “Comprobando…”, deshabilitado y región `aria-busy`;
- respuesta: el botón permanece en el DOM y se convierte en “Continuar”; una región
  preexistente `role="status"` y `aria-atomic="true"` anuncia la retroalimentación;
- avance: foco programático al encabezado de la nueva pregunta con `tabIndex="-1"`;
- error recuperable: conservar opción y foco, anunciar con `role="alert"`.

**Motivo**

Los radios nativos incluyen la interacción esperada con Tab y flechas y evitan una
dependencia cliente. Mantener el elemento enfocado evita pérdidas de contexto.

**Alternativas descartadas**

- Radios visuales construidos con `div`: duplican teclado, estados y semántica.
- Mover el foco durante cada anuncio asíncrono: puede interrumpir al usuario y
  provocar anuncios duplicados.
- Considerar que una biblioteca sustituye la prueba manual: contradice la
  constitución.

**Consecuencias**

- El contrato exige comprobación automatizada del DOM y manual con lector de
  pantalla.
- Los controles principales medirán al menos 44 × 44 CSS px, obligación propia más
  estricta que el mínimo AA de WCAG 2.2.

**Fuentes**

- [Patrón de radio group de WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [Mensajes de estado](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
- [Reflow a 320 CSS px](https://www.w3.org/WAI/WCAG22/Understanding/reflow)

## Decisión 14 — Estrategia de pruebas

**Decisión**

- Vitest en entorno Node para dominio y aplicación sin DOM.
- Vitest + jsdom + Testing Library + `user-event` para Client Components.
- Pruebas de integración contra Supabase local restablecido y con seed.
- Playwright contra `next build` + `next start` para Async Server Components y flujo
  crítico.
- Proyectos Playwright obligatorios: Chromium de escritorio y Chromium móvil a
  320 × 640 con touch. Firefox/WebKit son smoke opcional, no puerta del hackathon.
- Locators por rol, etiqueta y texto; la prueba “solo teclado” no usa `.click()`.
- `reducedMotion: "reduce"`, medición de 44 × 44, ausencia de scroll horizontal y
  conservación tras recarga.
- Pruebas manuales documentadas para zoom de 200 %, indicador visible, lector de
  pantalla y uso con una mano.

No se fija porcentaje de cobertura.

**Motivo**

Next.js todavía no recomienda Vitest para Async Server Components. Playwright cubre
la composición real, mientras Vitest da retroalimentación rápida sobre reglas y
componentes interactivos.

**Alternativas descartadas**

- Probar todo E2E: vuelve lenta y opaca la localización de fallos.
- Renderizar Async Server Components con Vitest: no está soportado por la guía
  oficial.
- Sustituir revisión manual por assertions ARIA: no demuestra el anuncio real.

**Consecuencias**

- `test`, `test:integration` y `test:e2e` son comandos separados.
- Los E2E usan contenido seed conocido y consultan únicamente la interfaz pública.
- Las verificaciones de base de datos incluyen roles permitidos y rechazados.

**Fuentes**

- [Vitest con Next.js](https://nextjs.org/docs/app/guides/testing/vitest)
- [Playwright con Next.js](https://nextjs.org/docs/app/guides/testing/playwright)
- [Emulación en Playwright](https://playwright.dev/docs/emulation)

## Decisión 15 — Despliegue y separación de entornos

**Decisión**

Usar la integración Git de Vercel:

- Development: Supabase local.
- Preview: proyecto Supabase no productivo compartido para previews.
- Production: proyecto Supabase de la demostración.
- Cada PR crea Preview; el merge a `main` crea Production.

Las claves elevadas se configuran como sensibles y por entorno. Ningún Preview recibe
la clave de Production. Cambiar una variable exige un nuevo despliegue. Los logs
estructurados incluyen operación, código contractual y correlación, pero nunca token,
hash, clave, alias completo, opción ni solución.

**Motivo**

Separar Preview evita que pruebas y seeds alteren el ranking de la demostración. La
integración Git cubre el flujo requerido sin un pipeline de despliegue propio.

**Alternativas descartadas**

- Un mismo proyecto Supabase para Preview y Production: contamina ranking y datos.
- CI/CD personalizado: no aporta una capacidad exigida.
- Servicio externo de observabilidad: añade dependencia fuera del alcance.

**Consecuencias**

- Las migraciones se aplican primero a local/Preview y luego a Production.
- `supabase/seed.sql` se ejecuta solo en local/Preview. Production usa
  `supabase db push` sin `--include-seed`.
- El checklist previo a demo valida base, contenido, imágenes, flujo móvil, ranking y
  ausencia de secretos en el bundle.

### Subdecisión 15A — Publicación del contenido educativo

**Decisión**

El catálogo educativo aprobado se representa en dos scripts con propósito distinto:

- `supabase/seed.sql`, exclusivo de local y Preview; y
- una migración de datos SQL versionada para Production, creada primero con
  `pnpm exec supabase migration new load_approved_educational_content`.

Ambos conservan las mismas referencias públicas estables y el mismo payload
educativo cuya versión cuenta previamente con estado editorial `approved` y evidencia
vigente según `spec.md`. La revisión editorial no ocurre dentro de SQL. Los scripts
ejecutan en orden borrador → opciones → solución → publicación y son idempotentes
mediante las restricciones únicas y operaciones de upsert acordadas; una segunda
aplicación no crea mecánicas, preguntas ni opciones duplicadas. La sincronización se
verifica comparando la proyección normalizada del catálogo después de
`supabase db reset --no-seed` con la obtenida después de `supabase db reset`.

Antes de desplegar la migración, un cambio de contenido modifica ambos scripts en el
mismo cambio. Después de desplegarla, una corrección crea una nueva migración de datos
con Supabase CLI y actualiza el seed; no se reescribe una migración aplicada.

**Motivo**

La constitución exige cambios de base versionados y la guía de Supabase reserva el
seed para desarrollo o staging. La migración hace auditable Production; la comparación
automatizada impide que el entorno de prueba demuestre contenido distinto.

**Alternativas descartadas**

- `supabase db push --include-seed` en Production: aplica datos no gobernados por el
  historial de migraciones.
- Cargar el catálogo manualmente desde Studio: no es reproducible ni auditable.
- Mantener identificadores distintos por entorno: impide comprobar equivalencia y
  favorece duplicados.

**Consecuencias**

- Preview puede usar `--include-seed`; Production ejecuta únicamente
  `supabase db push`.
- La migración de datos es idempotente y materializa la decisión educativa ya
  aprobada; no sustituye ni forma parte de la revisión.
- Fixtures de sesiones o ranking continúan fuera de ambos scripts.

**Fuentes**

- [Integración Git de Vercel](https://vercel.com/docs/git)
- [Entornos de despliegue](https://vercel.com/docs/deployments/environments)
- [Variables de entorno de Vercel](https://vercel.com/docs/environment-variables)
- [Flujo local y migraciones de Supabase](https://supabase.com/docs/guides/local-development/cli-workflows)
