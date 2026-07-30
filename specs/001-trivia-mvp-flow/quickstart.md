# Quickstart de Antídoto

Esta guía describe el entorno que deberá quedar ejecutable al implementar el plan de
`001-trivia-mvp-flow`. El repositorio conserva un prototipo estático legado y el
checkout puede contener trabajo local del nuevo proyecto Next.js fuera de la línea base;
ese trabajo no constituye evidencia de tareas completadas ni aprobación del
Checkpoint 0. `tasks.md` define las 150 tareas de implementación, todas pendientes;
por ello, los comandos de aplicación se convierten en puertas exigibles cuando la fase
de Fundación y sus verificaciones estén aprobadas.

## 0. Línea base documental previa a implementación

Antes de iniciar cualquier tarea T001–T150 se crea una línea base documental
auditable. Esta operación no implementa la aplicación ni completa tareas: solo
versiona los artefactos normativos ya aprobados.

La línea base incluye, como mínimo:

- `.gitignore`;
- `.specify/memory/constitution.md`;
- la configuración, integraciones, scripts, templates y workflows normativos bajo
  `.specify/`;
- `specs/001-trivia-mvp-flow/spec.md`;
- `specs/001-trivia-mvp-flow/plan.md`;
- `specs/001-trivia-mvp-flow/tasks.md`;
- `specs/001-trivia-mvp-flow/research.md`;
- `specs/001-trivia-mvp-flow/data-model.md`;
- `specs/001-trivia-mvp-flow/quickstart.md`;
- todos los contratos y checklists bajo `specs/001-trivia-mvp-flow/`;
- `specs/001-trivia-mvp-flow/evidence/content/educational-content-approval.md` y
  cualquier otro artefacto normativo aprobado que pertenezca al feature.

El inventario normativo de este corte es, por tanto, la Constitución; la configuración,
integraciones, scripts, templates y workflows bajo `.specify/`; `spec.md`, `plan.md`,
`tasks.md`, `research.md`, `data-model.md` y `quickstart.md`; todos los archivos bajo
`contracts/` y `checklists/`; y la evidencia educativa canónica bajo `evidence/content/`.
Las rutas de `evidence/` que todavía no existan son salidas futuras y no se agregan por
anticipado. `.agents/` queda fuera de la línea base y, en este checkout, se excluye
mediante la regla existente de `.gitignore`.

La carpeta `.agents/` contiene herramientas locales de Spec Kit y no constituye por
sí misma un contrato del producto. En este checkout no se agrega a la línea base
porque la regla existente de `.gitignore` la excluye expresamente. Si la política del
repositorio exige compartir esas herramientas, se revisa su contenido y se versiona en
un commit de tooling separado; si son locales o generadas, permanecen fuera de la línea
base y se documenta esa decisión sin mezclarla con el commit del feature.

Ejecutar el siguiente procedimiento desde la raíz del repositorio. Los comandos se
presentan para su ejecución manual después de aprobar los documentos:

1. Revisar todos los archivos sin seguimiento o modificados:

   ```powershell
   git status --short
   ```

2. Revisar las reglas de exclusión y comprobar que `.specify/`, `specs/` y los
   artefactos requeridos no estén ignorados:

   ```powershell
   Get-Content .gitignore
   Get-Content .git/info/exclude
   git check-ignore -v -- .specify/memory/constitution.md specs/001-trivia-mvp-flow/spec.md specs/001-trivia-mvp-flow/plan.md specs/001-trivia-mvp-flow/tasks.md
   ```

   `git check-ignore` debe terminar sin identificar esos archivos. `.gitignore`
   protege secretos locales, dependencias, salidas de build, estado temporal de
   Supabase y archivos de editor, no excluye `.specify/` ni `specs/`, y excluye
   explícitamente `.agents/`.

3. Inspeccionar posibles secretos sin imprimir su valor. Cualquier coincidencia se
   revisa y se retira o sustituye antes de continuar:

   ```powershell
   $baselineFiles = Get-ChildItem -Path .specify,specs -Recurse -File
   $secretPatterns = '(?m)^\s*SUPABASE_(SECRET|SERVICE_ROLE)_KEY\s*=\s*\S+|sk-[A-Za-z0-9_-]{16,}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|postgres(?:ql)?://[^:\s]+:[^@\s]+@|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+'
   $baselineFiles | Select-String -Pattern $secretPatterns | Select-Object Path,LineNumber
   ```

   La salida esperada es vacía. Los nombres de variables y placeholders vacíos son
   documentación válida; una credencial real no lo es.

4. Detectar archivos generados o temporales que no deben entrar en la línea base:

   ```powershell
   Get-ChildItem -Path .specify,specs -Recurse -File | Where-Object {
     $_.Name -match '(\.tmp|\.temp|\.log|\.bak|\.swp|~)$' -or
     $_.FullName -match '[\\/](node_modules|\.next|dist|build|coverage)[\\/]'
   } | Select-Object FullName
   ```

   La salida esperada es vacía. Cualquier excepción se explica antes de agregar
   archivos.

5. Agregar únicamente la línea base aprobada. `.agents/` queda expresamente fuera:

   ```powershell
   git add -- .gitignore .specify specs/001-trivia-mvp-flow
   ```

6. Revisar la selección y el contenido staged antes de crear el commit:

   ```powershell
   git diff --cached --check
   git diff --cached --name-status
   git diff --cached
   ```

   Deben estar presentes todos los artefactos enumerados, no debe aparecer ningún
   secreto, temporal ni archivo de `.agents/`, y no debe existir error de whitespace.

7. Crear el commit de línea base documental cuando el staging y las revisiones anteriores
   hayan sido aprobados:

   ```powershell
   git commit -m "docs(spec): establish approved trivia MVP baseline"
   ```

8. Verificar el estado final:

   ```powershell
   git status --short
   ```

   El árbol debe quedar limpio. Si quedan archivos —por ejemplo `.agents/`— se
   documenta para cada uno si es tooling local, generado o trabajo ajeno, y no se
   considera resuelta la puerta si queda sin explicación un artefacto normativo del
   feature. Este parche documental no ejecuta Git, no crea staging ni crea commits; solo
   deja preparado este procedimiento para una ejecución posterior y autorizada.

## 1. Prerrequisitos

- Git.
- Node.js 24.x LTS. El futuro `package.json` debe declarar
  `engines.node: "24.x"`.
- Corepack y la versión exacta de pnpm fijada en `packageManager`.
- Docker Desktop o un runtime compatible para Supabase local.
- Una cuenta de Supabase solo para el flujo remoto.
- Un repositorio GitHub y una cuenta Vercel solo para Preview y Production.

Comprobar el entorno:

```powershell
node --version
corepack --version
docker --version
git --version
```

`node --version` debe devolver `v24.x`. Si se usa un gestor de versiones compatible
con el comando `nvm`, la selección puede hacerse con:

```powershell
nvm install 24
nvm use 24
```

Después de que Fundación defina la versión exacta de pnpm en `package.json`:

```powershell
corepack enable
corepack install
pnpm --version
```

En Windows, si la política de PowerShell bloquea el shim, puede ejecutarse
`pnpm.cmd` con los mismos argumentos. No se instala una versión global distinta de
la declarada por el proyecto.

## 2. Instalar dependencias

Desde la raíz del repositorio:

```powershell
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

La primera instalación del proyecto puede usar `pnpm install` para crear el
lockfile; una vez versionado, desarrollo, CI y despliegue usan
`--frozen-lockfile`. Playwright descarga Chromium una sola vez por entorno. En CI
Linux se puede instalar además sus dependencias del sistema mediante la opción
correspondiente de Playwright.

## 3. Configurar variables

La propuesta exacta para `.env.example` es:

```dotenv
# Supabase: solo servidor. Defina la URL y exactamente una de las dos claves.
SUPABASE_URL=
SUPABASE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Juego: solo servidor. Valor predeterminado de la demostración.
GAME_ROUND_SIZE=5
```

Copiarla sin versionar secretos:

```powershell
Copy-Item .env.example .env.local
```

Contrato de configuración:

| Variable | Uso | Regla |
|----------|-----|-------|
| `SUPABASE_URL` | URL de Data API accesible por el servidor Next.js. | Obligatoria y válida como URL. |
| `SUPABASE_SECRET_KEY` | Clave secreta actual para un backend controlado. | Opción preferida en proyectos remotos; solo servidor. |
| `SUPABASE_SERVICE_ROLE_KEY` | Fallback heredado y clave disponible en Supabase local. | Se usa solo cuando `SUPABASE_SECRET_KEY` está vacía; solo servidor. |
| `GAME_ROUND_SIZE` | Única entrada de configuración para el concepto `RoundSize`. | Solo servidor; entero entre 1 y 10, con valor predeterminado y de Production `5`. |

La validación Zod del entorno debe fallar al arrancar si falta `SUPABASE_URL`, si no
existe ninguna clave privada, si ambas claves privadas están definidas o si
`GAME_ROUND_SIZE` está presente y no es un entero entre 1 y 10. Si se omite, Zod
aplica el valor predeterminado `5`. El mismo `RoundSize` validado se entrega a la RPC,
se persiste como total de la sesión y determina progreso, resultado y puntuación
máxima (`totalQuestions × 100`); ninguna capa usa otro máximo fijo. Los módulos de
entorno, configuración de juego y cliente Supabase se marcan como `server-only`; una
importación desde Client Components debe fallar en build.

### Variables públicas heredadas

`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` fueron evaluadas y no
forman parte del runtime del MVP:

- el navegador no consulta Supabase;
- el ranking público se sirve desde un Server Component, no mediante acceso anónimo
  a una tabla; y
- ninguna solución, sesión, respuesta o puntuación debe quedar al alcance de una
  clave cliente.

Por tanto, no deben aparecer en `.env.example`, `.env.local` ni en Vercel. Si una
herramienta las crea por defecto, se eliminan antes de aprobar la configuración. Una
especificación futura que introduzca acceso directo desde navegador deberá redefinir
contratos, grants y RLS antes de incorporarlas.

## 4. Opción A: Supabase local

El proyecto implementado debe incluir `supabase/config.toml`, migraciones versionadas
y `supabase/seed.sql`. El esquema Data API expuesto será `api`; `private` permanece
fuera de la lista de esquemas expuestos. `seed.sql` es exclusivo de local y Preview;
el contenido de Production forma parte de una migración de datos versionada.

Iniciar y restablecer el entorno:

```powershell
pnpm exec supabase start
pnpm exec supabase status
pnpm exec supabase db reset
```

`db reset` recrea la base local, aplica todas las migraciones —incluida la migración
de contenido aprobada— y después carga `supabase/seed.sql`. El seed debe ser
idempotente, no duplicar las filas que ya dejó la migración y dejar como mínimo:

- la mecánica `single_choice`;
- diez preguntas publicadas y elegibles;
- entre dos y cuatro opciones por pregunta y una solución protegida;
- explicación, al menos una señal y una recomendación por pregunta;
- al menos una pregunta solo de texto y una con imagen local válida; y
- datos suficientes para varias rondas con `RoundSize=5`.

La migración de datos se crea mediante la CLI; nunca se inventa su timestamp:

```powershell
pnpm exec supabase migration new load_approved_educational_content
```

`seed.sql` y esa migración usan las mismas referencias públicas estables y el mismo
contenido aprobado. Para comprobar la sincronización, ejecutar:

```powershell
pnpm test:integration -- educational-content-sync
```

La prueba ejecuta internamente `supabase db reset --no-seed`, guarda la proyección
normalizada, ejecuta `supabase db reset` y exige que la segunda proyección coincida en
referencias, textos, opciones, solución protegida, explicación, señales,
recomendación y metadatos multimedia, sin conteos duplicados. Los fixtures de sesiones
o ranking no forman parte de ninguno de los dos scripts.

Obtener la URL y la clave local:

```powershell
pnpm exec supabase status -o env
```

Copiar a `.env.local` únicamente la URL como `SUPABASE_URL` y la clave de rol de
servicio como `SUPABASE_SERVICE_ROLE_KEY`; dejar `SUPABASE_SECRET_KEY` vacía. No
copiar la clave anónima porque la aplicación no la usa.

Las pruebas de permisos sí deben ejercer los roles reales. El harness de integración
obtiene la clave anónima efímera desde `supabase status -o env` durante la ejecución,
o usa `SET LOCAL ROLE anon` y `SET LOCAL ROLE authenticated` en transacciones de
prueba separadas. Esa credencial
es solo de Supabase local, no se importa desde código de aplicación ni se añade a
`.env.example`; nunca se reutiliza una clave alojada.

Detener el entorno al terminar:

```powershell
pnpm exec supabase stop
```

## 5. Opción B: conectar Supabase remoto

Crear un proyecto no productivo para Development/Preview y reservar otro proyecto
para Production. Para Preview:

```powershell
pnpm exec supabase login
pnpm exec supabase link --project-ref <PREVIEW_PROJECT_REF>
pnpm exec supabase db push --include-seed
```

Para Production, enlazar explícitamente el proyecto correcto y aplicar solo
migraciones:

```powershell
pnpm exec supabase link --project-ref <PRODUCTION_PROJECT_REF>
pnpm exec supabase db push --dry-run
pnpm exec supabase db push
```

Nunca se usa `--include-seed` con Production. El catálogo aprobado llega por la
migración de datos versionada y sus referencias/operaciones idempotentes evitan
duplicados.

`<PREVIEW_PROJECT_REF>` y `<PRODUCTION_PROJECT_REF>` son identificadores públicos, no
claves. La contraseña
de base y las claves se entregan por canales seguros o por el prompt de la CLI, no se
guardan en el repositorio ni en el historial de comandos.

Para remoto, llenar `.env.local` con `SUPABASE_URL` y, preferentemente,
`SUPABASE_SECRET_KEY`; dejar vacío el fallback heredado. Antes de cargar el seed en
un entorno ya usado, confirmar que se trata del proyecto no productivo correcto. En
Production no se carga `seed.sql`; cada cambio posterior del catálogo requiere una
nueva migración de datos generada por Supabase CLI y el seed se actualiza en el mismo
cambio para conservar la equivalencia.

Después de aplicar migraciones, comprobar:

- `private` no está expuesto por Data API;
- `anon` y `authenticated` no pueden consultar tablas ni ejecutar RPC;
- `service_role` puede ejecutar solo las operaciones aprobadas;
- la lectura `api.get_leaderboard` usa `SECURITY INVOKER`, no mezcla instantáneas y
  no expone UUID; y
- la limpieza de ciclo de vida y su programación están configuradas.

## 6. Ejecutar desarrollo

Con Supabase accesible y `.env.local` válido:

```powershell
pnpm dev
```

Abrir la URL local indicada por Next.js y comprobar:

- `/`: propósito, alias y acceso al ranking;
- `/play`: recuperación o pregunta activa de la sesión ligada a la cookie;
- `/results`: resultado de una sesión finalizada; y
- `/leaderboard`: top diez, resultado propio cuando corresponda, vacío o error no
  bloqueante.

La cookie de sesión es segura en Production. En desarrollo local conserva `httpOnly`
y `sameSite=lax`, pero omite `secure` únicamente para permitir HTTP local.

## 7. Puertas de calidad

El futuro `package.json` debe exponer estos scripts con responsabilidades separadas:

| Script | Responsabilidad |
|--------|-----------------|
| `typecheck` | TypeScript estricto sin emitir archivos. |
| `lint` | ESLint; no depende de `next lint` ni de `next build`. |
| `test` | Vitest en modo no interactivo para dominio y componentes con Testing Library. |
| `test:integration` | Integración contra Supabase local restablecido y seed conocido, incluidas pruebas de permisos. |
| `test:e2e` | Playwright contra `next build` + `next start`, Chromium escritorio y móvil. |
| `build` | Build de producción de Next.js. |

Con Supabase local en ejecución:

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm exec supabase db reset
pnpm exec supabase db lint --local --fail-on error
pnpm test:integration
pnpm build
pnpm test:e2e
```

Las pruebas deben cubrir, como mínimo:

- normalización y validación de alias, `RoundSize` 1–10, puntuación y transiciones de
  sesión;
- asignación del tamaño configurado —5 en Production—, respuesta correcta e
  incorrecta, opción ajena,
  pregunta no asignada, respuesta duplicada y finalización idempotente;
- exclusión de sesiones incompletas y protección de soluciones ante roles públicos;
- `get_game_state` activo vigente o vencido sin cambios en estado,
  `invalidated_at`, actividad, expiración ni otra tabla; `get_game_result` devuelve el
  mismo resultado inmediatamente, después de 24 horas y antes de siete días, y
  rechaza de forma segura el acceso posterior sin invalidar la sesión finalizada;
  mutaciones activas vencidas se rechazan después de materializar atómicamente la
  invalidación cuando corresponda;
- formulario, error asociado, radios con teclado, envío, retroalimentación, progreso
  y ranking vacío;
- partida completa, recarga y recuperación, doble envío, resultados, ranking y flujo
  crítico solo con teclado; el fixture E2E garantiza al menos una pregunta solo de
  texto y otra con imagen;
- alias vacío/corto o inválido en Playwright, con error asociado, foco corregido y
  ausencia de cookie/sesión; y
- los casos automáticos definidos en
  [accessibility.md](./contracts/accessibility.md) y
  [media.md](./contracts/media.md).

Las pruebas E2E no sustituyen la revisión manual de lector de pantalla, zoom 200 %,
foco visible y uso con una mano. No se fija un porcentaje arbitrario de cobertura.

SC-001 y SC-010 requieren además una prueba moderada con todas las cuotas de la
Cohorte MVP de usabilidad definida en `spec.md`. El registro anónimo P01–P10 debe
medir si cada participante comprende el propósito e inicia en menos de 60 segundos,
y si después menciona una señal o recomendación. Se aprueba con al menos 90 % y
80 %, respectivamente; si falta una cuota o no hay participantes disponibles, esta
verificación permanece pendiente o bloqueada.

## 8. Protocolo de usabilidad y consentimiento

Este es el procedimiento autorizado para SC-001, SC-010 y T145. La **Líder QA de
Accesibilidad e Investigación UX** es la autoridad responsable del protocolo:
confirma la autorización antes de cada sesión, custodia la evidencia externa y firma
la conclusión agregada de `evidence/usability-study.md`.

Se debe priorizar el reclutamiento de participantes de 18–19 años para cubrir la
banda 15–19 sin involucrar menores. Si participa una persona de 15–17 años, la prueba
solo puede continuar después de obtener consentimiento de su madre, padre o
representante legal y el asentimiento de la persona participante. Para participantes
de 18 años o más basta su consentimiento informado. Si cualquiera de las
autorizaciones aplicables falta, no puede verificarse o se retira, la sesión no se
ejecuta y T145 permanece bloqueada hasta sustituirla por una sesión autorizada.

El procedimiento por participante es:

1. Asignar el siguiente código anónimo P01–P10 sin registrar un identificador
   persistente.
2. Explicar propósito, duración, actividades, carácter voluntario, datos registrados
   y derecho a detener la prueba sin consecuencia.
3. Obtener antes de empezar el consentimiento aplicable y, para 15–17 años, también
   el asentimiento.
4. Registrar en la evidencia del repositorio únicamente código anónimo, banda de
   edad, estado `consentimiento: sí/no`, estado `asentimiento: sí/no/no aplica`,
   fecha e iniciales del facilitador.
5. Ejecutar la sesión sin traducción asistida y con la clasificación de dispositivos
   definida en la sección `Cohorte MVP de usabilidad` de `spec.md`.
6. Al terminar, registrar solo los campos permitidos por esa sección y resultados
   agregados.

Los formularios originales o registros identificables se almacenan exclusivamente
fuera del repositorio, en la carpeta institucional de acceso restringido
`Antídoto/Usabilidad/Consentimientos-2026`, bajo custodia de la Líder QA de
Accesibilidad e Investigación UX. `specs/`, issues, pull requests y evidencias del
repositorio no pueden contener nombres, firmas, copias de autorizaciones ni enlaces
públicos a esa carpeta. La evidencia admisible dentro del repositorio es solamente el
registro anonimizado descrito en el paso 4 y la declaración agregada de que la
autoridad responsable comprobó los originales.

## 9. Preparar Preview y Production

Flujo de despliegue:

1. Publicar el repositorio en GitHub sin `.env.local` ni secretos.
2. Aplicar migraciones y `seed.sql` al proyecto Supabase no productivo; ejecutar la
   comparación de contenido sincronizado.
3. Importar el repositorio en Vercel y mantener Node.js 24.x.
4. Configurar `SUPABASE_URL` y exactamente una clave privada para Preview usando el
   proyecto Supabase no productivo.
5. Configurar las mismas variables para Production con el proyecto Supabase de la
   demostración, además de `GAME_ROUND_SIZE=5`. Marcar las claves privadas como
   sensibles.
6. No configurar credenciales de Production en Preview ni variables
   `NEXT_PUBLIC_SUPABASE_*` en ningún entorno.
7. Aplicar y verificar migraciones en Preview antes de Production.
8. Enlazar Production, revisar `supabase db push --dry-run` y ejecutar
   `supabase db push` sin `--include-seed`.
9. Usar cada pull request para crear un Preview y el merge a `main` para desplegar
   Production.
10. Volver a desplegar después de cambiar una variable de entorno.

Las migraciones no se ejecutan implícitamente desde el proceso web. Deben aprobarse y
aplicarse antes del despliegue que depende de ellas. Un Preview compartido puede
contener datos de prueba, pero nunca debe contaminar el ranking de Production.

El retiro futuro del MVP no usa una pantalla ni una RPC administrativa. Se prepara
una migración SQL versionada que, con el rol propietario, fija
`ranking_retention_until` dentro de seis días para los resultados retenidos; después
se verifica que el Cron los elimine antes del séptimo día.

## 10. Lista previa a la demostración

Registrar fecha, entorno, commit, resultado esperado y observado para cada punto:

- [ ] Node.js es 24.x; instalación con lockfile, tipado, lint, pruebas y build
      terminan correctamente.
- [ ] `GAME_ROUND_SIZE` vale 5 en el entorno de demostración.
- [ ] La base de Production responde y todas las migraciones aprobadas están
      aplicadas.
- [ ] El historial de Production contiene la migración de contenido creada por
      Supabase CLI y el comando aplicado fue `supabase db push` sin
      `--include-seed`.
- [ ] Existen al menos diez preguntas publicadas y cinco elegibles para cada ronda,
      incluida una de texto y una con imagen.
- [ ] La migración educativa de Production y `seed.sql` local/Preview pasaron la
      comparación de contenido: cada pregunta incluye solución protegida,
      explicación, señal y recomendación, y una segunda aplicación no crea
      duplicados.
- [ ] Una persona inicia sin cuenta, completa cinco preguntas, ve la última
      retroalimentación, obtiene puntuación de servidor y puede confirmar o editar el
      alias actual para volver a jugar con una sesión y token nuevos.
- [ ] Doble clic, reintento, recarga y finalización repetida no crean respuestas ni
      puntuaciones duplicadas.
- [ ] El ranking muestra como máximo diez resultados en el orden contractual; una
      indisponibilidad simulada no impide jugar.
- [ ] Todas las imágenes locales tienen objetivo de `300000` bytes y ninguna supera
      `1000000` bytes. Cada una se decodifica dentro de su contenedor estable y
      conserva su alternativa; si falla, el fallback muestra esa alternativa,
      permite reintentar y mantiene opciones y respuesta operables.
- [ ] El flujo termina con teclado, muestra foco visible y supera la revisión con el
      lector de pantalla registrado.
- [ ] La prueba moderada cubre todas las cuotas de la Cohorte MVP de usabilidad:
      ≥90 % comprende el propósito e inicia en menos de 60 segundos y ≥80 % recuerda
      una señal o recomendación; si falta una cuota o no se ejecutó, permanece
      pendiente.
- [ ] A 320 píxeles y zoom 200 % no existe desplazamiento horizontal ni pérdida de
      contenido; en teléfono de 360–430 píxeles todos los controles principales
      miden al menos 44 × 44 y se usan con una mano.
- [ ] Bajo 1,6 Mbps de descarga, 750 Kbps de carga, 150 ms de latencia y caché vacía,
      la vista inicial es utilizable en 3 segundos o menos y transfiere como máximo
      `1000000` bytes. “Utilizable” exige propósito, campo de alias, acción para
      comenzar y enlace al ranking visibles, enfocables y activables sin esperar otro
      recurso crítico.
- [ ] `prefers-reduced-motion: reduce` elimina movimiento no esencial y todos los
      estados de carga/error son visibles y comprensibles.
- [ ] Una inspección del bundle y de los artefactos confirma que no contiene claves,
      token/hash de sesión, solución, `SUPABASE_SECRET_KEY`,
      `SUPABASE_SERVICE_ROLE_KEY` ni variables `NEXT_PUBLIC_SUPABASE_*`.
- [ ] `anon` y `authenticated` reciben rechazo al intentar leer datos privados,
      soluciones, respuestas, sesiones o ejecutar RPC; el acceso servidor permitido
      está probado.
- [ ] La limpieza de sesiones/respuestas y la fecha de retiro del ranking cumplen las
      ventanas de 24 horas y 7 días definidas por FR-065 y FR-066; una sesión
      finalizada sigue recuperable durante siete días, nunca se invalida por
      inactividad y deja de autorizar acceso individual al terminar la ventana.
- [ ] Las 23 filas de la matriz de errores de `spec.md` enlazan una prueba automática
      o evidencia manual que confirma acción, información preservada, continuidad y
      necesidad de nueva sesión.
- [ ] Supabase Cron ejecuta la limpieza cada seis horas,
      `cron.job_run_details` registra un éxito en las últimas seis horas y el runbook
      de ejecución manual idempotente está disponible. Mientras el MVP esté público,
      la revisión se repite con un intervalo máximo de seis horas; al alcanzar seis
      horas sin éxito, se ejecuta el runbook de inmediato y se vuelve a comprobar.

Una comprobación que requiera credenciales, infraestructura o dispositivo no
disponible permanece pendiente o bloqueada; no se marca como aprobada por
inferencia.
