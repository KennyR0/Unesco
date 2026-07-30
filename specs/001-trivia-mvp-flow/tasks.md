---

description: "Backlog de implementación verificable para el corte vertical del MVP de Antídoto"
---

# Tasks: Antídoto — flujo MVP de trivia

**Entrada**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md` y los contratos aprobados de `specs/001-trivia-mvp-flow/contracts/`.

**Alcance**: una ronda anónima de cinco preguntas `single_choice`, con retroalimentación inmediata, resultado y ranking global. Este backlog no autoriza modificar contratos, arquitectura, alcance ni implementar otras mecánicas.

**Estado inicial**: todas las tareas están pendientes y tienen un único responsable
principal asignado por rol. Los registros `Registro`, `Archivos modificados` y
`Bloqueos pendientes` que ya aparecen en T001–T022 y T044 son históricos: describen
trabajo observado, pero no habilitan completitud ni permiten conservar `[X]` mientras
Checkpoint 0 y las verificaciones obligatorias no estén aprobados.

## Convenciones de ejecución

- `[P]` significa que, una vez satisfechas las dependencias indicadas, la tarea puede ejecutarse en paralelo con otras tareas `[P]` que no compartan archivos.
- Cada tarea tiene una única responsabilidad principal: `[SHARED]`, `[FRONTEND]`, `[BACKEND]`, `[SUPABASE]`, `[TESTING]` o `[DEVOPS]`.
- Las tareas que modifican `src/features/game/infrastructure/supabase-game-gateway.ts`, migraciones ordenadas, configuración central o páginas compartidas se serializan explícitamente.
- Los contratos de `specs/001-trivia-mvp-flow/contracts/` son entradas de solo lectura para este backlog.
- Cada tarea T023–T043 debe ejecutar primero `pnpm exec supabase migration new <nombre>` y usar el timestamp generado por la CLI; T044 aplica la misma regla para su migración de datos de Production. `<timestamp>` en “Archivos” representa la salida real de la CLI, no un nombre que deba crearse manualmente.
- Cada migración revoca explícitamente los privilegios públicos del objeto que crea; T042 concede y audita el acceso final, pero ninguna función o tabla queda temporalmente abierta esperando esa migración.
- T048–T053 deben usar el mecanismo de reloj controlado de `spec.md`: conexión local
  aislada, instantánea UTC fijada en `antidoto.test_now`, lectura interna mediante
  `private.current_time()` para el rol de pruebas y limpieza al terminar la transacción.
  No se agregan parámetros de tiempo a RPC públicas ni se permite que roles públicos
  alteren el reloj; T053 además exige una ejecución real y satisfactoria en
  `cron.job_run_details`.
- Una tarea no se marca como completada hasta ejecutar su verificación y registrar resultado esperado, verificación realizada, resultado obtenido, archivos modificados y bloqueos pendientes.
- Cuando una verificación requiera credenciales, infraestructura remota o prueba manual no disponible, la tarea permanece pendiente o bloqueada.
- Ninguna tarea puede conservar `[X]` mientras Checkpoint 0 no exista como línea base
  documental aprobada; una evidencia histórica no sustituye esa puerta ni convierte
  una migración, seed o despliegue en aprobación.
- Este archivo es la única fuente normativa para asignar responsables. Todo cambio
  de propietario se realiza primero en la cabecera de la tarea o en estas
  convenciones; `spec.md`, `plan.md` y los demás artefactos solo remiten aquí.
- El Líder QA de Accesibilidad e Investigación UX realiza la revisión educativa y
  documenta la rúbrica completa. El Líder técnico actúa como Responsable de Contenido
  y Moderación del MVP y emite la decisión final `approved` o `rejected`; si solicita
  correcciones, el contenido queda `changes_requested`.
- El Líder técnico también aprueba altas y bajas del fixture de alias bloqueados. El
  Líder backend añade revisión técnica únicamente cuando cambia su normalización o
  formato.
- El Líder de Datos y Supabase conserva la responsabilidad principal de T044 y solo
  puede materializar contenido cuya evidencia vigente registre `approved`.
- Las revisiones y aprobaciones anteriores son puertas de entrada, no
  corresponsabilidad sobre la tarea ni sustitución de su responsable principal.

## Mapa de dependencias entre fases

```text
Checkpoint 0 — Línea base documental
  └── Fase 1 — Fundación
      └── Checkpoint A
          └── Fase 2 — Contratos y configuración compartida
              └── Fase 3 — Supabase y persistencia
                  └── Checkpoint B
                      └── Fase 4 — Inicio de partida
                          └── Fase 5 — Flujo de juego
                              └── Checkpoint C
                                  └── Fase 6 — Resultados y ranking
                                      └── Fase 7 — Calidad, seguridad y despliegue
                                          └── Checkpoint D
```

Oportunidades principales después de cada puerta:

- Tras T001–T003 pueden avanzar en paralelo Tailwind, ESLint, Vitest, Playwright, variables y configuración local de Supabase.
- Tras T015 pueden verificarse en paralelo los esquemas Zod, las proyecciones públicas y los límites de importación.
- Tras T045 se ejecuta T046 de forma exclusiva porque restablece la base; al terminar, T047–T053 pueden ejecutarse en paralelo con fixtures aislados.
- Tras el Checkpoint B pueden avanzar en paralelo la validación de alias, la credencial anónima y las vistas estáticas de inicio.
- Tras T069 pueden desarrollarse en paralelo T070–T072; T078 espera la acción de respuesta y el gateway central permanece serializado.
- Tras el Checkpoint C pueden avanzar en paralelo las vistas de resultado y ranking cuando sus respectivos casos de uso estén disponibles.
- Tras T105 pueden ejecutarse en paralelo las pruebas E2E, accesibilidad, responsive y auditorías estáticas; las acciones remotas de Preview y Production siguen orden estricto.

## Prueba independiente por historia

| Historia | Criterio de prueba independiente |
|---|---|
| US1 | Abrir `/` a 320 px, entender el propósito sin conocimientos técnicos, activar “Comenzar” y abrir `/leaderboard` solo con teclado. |
| US2 | Enviar alias válidos e inválidos; confirmar que solo un alias válido crea una sesión completa, una cookie opaca `httpOnly` y una ronda de cinco preguntas. |
| US3 | Desde una sesión válida, seleccionar una opción, enviarla una sola vez y comprobar en servidor la aceptación o el rechazo de pregunta, opción y duplicado. |
| US4 | Responder correcta e incorrectamente y comprobar anuncio accesible, explicación, señales, recomendación y solución solo después del envío. |
| US5 | Avanzar sin retroceder, observar progreso textual y recargar en estados pendiente/respondido sin crear otra respuesta ni perder el estado confirmado. |
| US6 | Completar cinco respuestas, finalizar dos veces y obtener el mismo alias, puntuación, aciertos y total; “Volver a jugar” debe crear otra sesión. |
| US7 | Consultar sin sesión un máximo de diez resultados finalizados, verificar desempate y reconocer la partida actual dentro o fuera del top diez. |

## Decisión de consistencia resuelta

El plan y `contracts/game-api.md` autorizan `clearInvalidSession`, una Server Action
sin argumentos que solo puede presentarse cuando existe una cookie desconocida,
malformada o invalidada que retirar. Expira únicamente `antidoto_session` con la
política común, no accede a Supabase y redirige a `/`.

Cuando no hay una partida recuperable, `SESSION_NOT_FOUND`, `SESSION_INVALID` y
`RESULT_ACCESS_EXPIRED` conservan códigos internos distintos y proyectan la
`Presentación segura común` definida exclusivamente en `contracts/errors.md`. Las
pruebas comparan exactamente ese mensaje y sus acciones contra la fuente contractual,
sin copiarlos en este backlog. Con cookie ausente, la vista segura usa enlaces
normales y no escribe, expira ni crea cookies. No se añade cookie auxiliar,
`localStorage`, query parameter ni marcador persistente de “sesión anterior”.

Esto elimina el bloqueo de diseño de T060, T086 y T095 sin crear Route Handlers; las
tareas y el Checkpoint C siguen pendientes hasta ejecutar sus verificaciones.

La configuración y los contratos usan un único `RoundSize` de `1..10`; toda puntuación máxima se deriva como `RoundSize × 100`. Este corte de demostración fija `GAME_ROUND_SIZE=5` y, por tanto, prueba un máximo de 500 sin redefinir el rango general.

---

### Checkpoint 0 — Línea base documental

Antes de iniciar cualquier tarea T001–T150, ejecutar y documentar el procedimiento de
[`quickstart.md`](./quickstart.md#0-línea-base-documental-previa-a-implementación).
La puerta exige que Constitución, especificación, plan, tareas, research, modelo,
quickstart, contratos y checklists aprobados estén incluidos en un commit documental;
que el diff staged haya sido revisado; y que cualquier archivo restante esté
explicado. `.agents/` se decide por separado y no se agrega automáticamente. Este
checkpoint no completa ninguna tarea T001–T150.

**Estado: APROBADO (2026-07-30).** La línea base documental está registrada en el
commit `94ad7b4880079c52f77a18308f27c9c6ecbc6dad` y su evidencia está en
[`evidence/checkpoint-0.md`](./evidence/checkpoint-0.md). La aprobación habilita la
evaluación de dependencias posteriores, pero no cambia a `[X]` ninguna tarea.

## Fase 1 — Fundación del proyecto

**Objetivo**: disponer de un proyecto Next.js reproducible, estricto y con las herramientas mínimas de desarrollo y prueba.

- [ ] 1.1 T001 [SHARED] Responsable: Líder técnico
      Fijar Node.js 24 LTS, pnpm y las dependencias aprobadas, incluido Next.js 16.2.12, sin implementar funcionalidad.
      Requisito: Constitución IX — Tipado y validación.
      Archivos:
      - `.nvmrc`
      - `package.json`
      - `pnpm-lock.yaml`
      Depende de: Checkpoint 0
      Paralela: No
      Verificación:
      - Ejecutar `node --version` y confirmar una versión `24.x`.
      - Ejecutar `pnpm exec next --version` y confirmar `16.2.12`.
      - Ejecutar `pnpm install --frozen-lockfile` y confirmar salida 0.
      Registro: Node `v24.14.1`, Next `16.2.12`, pnpm `11.8.0` e instalación congelada con salida 0.
      Archivos modificados: `.nvmrc`, `package.json`, `pnpm-lock.yaml`.
      Bloqueos pendientes: ninguno.

- [ ] 1.2 T002 [SHARED] Responsable: Líder técnico
      Inicializar la entrada mínima de Next.js con App Router y documentar que el prototipo estático legado queda fuera del nuevo build.
      Requisito: Constitución XII — Alcance proporcional.
      Archivos:
      - `src/app/layout.tsx`
      - `src/app/page.tsx`
      - `src/app/globals.css`
      - `README.md`
      Depende de: T001
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec next --version` y confirmar que la CLI responde sin iniciar compilación ni generar configuración TypeScript.
      - Ejecutar `Test-Path src/app/layout.tsx,src/app/page.tsx,src/app/globals.css` y confirmar tres valores `True`.
      - Inspeccionar `src/app/page.tsx` y confirmar que no contiene `'use client'`.
      - Confirmar en `README.md` que App Router es el producto vigente y que el HTML/JS legado no entra al build.
      - Confirmar que T002 no crea ni modifica `tsconfig.json` o `next-env.d.ts`; la primera compilación queda reservada al Checkpoint A después de T003.
      Registro: `src/app/layout.tsx`, `src/app/page.tsx` y `src/app/globals.css` existen; Next.js responde `v16.2.12`; la página no usa `'use client'`; `tsconfig.json` y `next-env.d.ts` aún no existen.
      Archivos modificados: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `README.md`.
      Bloqueos pendientes: el prototipo legado fue movido externamente a `prototipo/`; se conserva fuera del build y requiere reconciliación posterior.

- [ ] 1.3 T003 [SHARED] Responsable: Líder técnico
      Configurar TypeScript en modo estricto, sin `any` implícito y con el alias canónico hacia el contrato aprobado.
      Requisito: Constitución IX — Tipado y validación.
      Archivos:
      - `tsconfig.json`
      - `next-env.d.ts`
      Depende de: T002
      Paralela: No
      Verificación:
      - Ejecutar `pnpm typecheck`.
      - Ejecutar `pnpm exec tsc --showConfig` y confirmar `"strict": true` y `"noEmit": true`.
      - Confirmar que `@antidoto/contracts` resuelve directamente a `specs/001-trivia-mvp-flow/contracts/domain.ts`.
      Registro: `pnpm typecheck` y `tsc --showConfig` pasan con `strict: true`, `noEmit: true` y el alias canónico hacia `contracts/domain.ts`.
      Archivos modificados: `tsconfig.json`, `next-env.d.ts`.
      Bloqueos pendientes: ninguno.

- [ ] 1.4 T004 [P] [SHARED] Responsable: Líder técnico
      Configurar Next.js para el App Router y mantener imágenes locales como única fuente del MVP.
      Requisito: Constitución VI — Mobile-First y rendimiento.
      Archivos:
      - `next.config.ts`
      Depende de: T002, T003
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm typecheck`.
      - Revisar `next.config.ts` y confirmar que no contiene `remotePatterns` ni dominios remotos.
      - Confirmar que `serverActions.allowedOrigins` no se configura ni amplía.
      Registro: `pnpm typecheck` pasa; `next.config.ts` mantiene configuración estricta sin `remotePatterns`, dominios remotos ni `serverActions.allowedOrigins`.
      Archivos modificados: `next.config.ts`.
      Bloqueos pendientes: ninguno.

- [ ] 1.5 T005 [P] [FRONTEND] Responsable: Líder frontend
      Configurar Tailwind CSS y la base Mobile-First sin introducir una identidad visual exhaustiva.
      Requisito: FR-055 | Constitución VI — Mobile-First y rendimiento.
      Archivos:
      - `postcss.config.mjs`
      - `src/app/globals.css`
      Depende de: T002, T003
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm build`.
      - Abrir `/` con viewport de `320x800` y confirmar que no existe desplazamiento horizontal.
      Registro: `pnpm build` pasa; Playwright verificó `/` en el proyecto móvil con viewport `320x800` y confirmó `scrollWidth <= innerWidth`.
      Archivos modificados: `postcss.config.mjs`, `src/app/globals.css`, `tests/e2e/foundation.spec.ts`.
      Bloqueos pendientes: ninguno.

- [ ] 1.6 T006 [P] [SHARED] Responsable: Líder técnico
      Configurar ESLint para TypeScript, React y límites básicos de código servidor/cliente.
      Requisito: Constitución IX — Tipado y validación.
      Archivos:
      - `eslint.config.mjs`
      Depende de: T001
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm lint` y confirmar salida 0 sobre el proyecto mínimo.
      Registro: `pnpm lint` termina con salida 0 sobre el proyecto y excluye explícitamente el prototipo legado.
      Archivos modificados: `eslint.config.mjs`.
      Bloqueos pendientes: ninguno.

- [ ] 1.7 T007 [P] [TESTING] Responsable: Líder QA de automatización
      Configurar Vitest para pruebas unitarias e integración sin modo interactivo.
      Requisito: Constitución XI — Verificación antes de completar.
      Archivos:
      - `vitest.config.ts`
      - `tests/setup/vitest.setup.ts`
      - `tests/setup/server-only-shim.ts`
      Depende de: T003
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- --passWithNoTests` y confirmar que Vitest inicia y termina con salida 0.
      Registro: Vitest ejecutó 3 archivos y 5 pruebas con salida 0, incluyendo el shim controlado de `server-only` para el entorno de pruebas.
      Archivos modificados: `vitest.config.ts`, `tests/setup/vitest.setup.ts`, `tests/setup/server-only-shim.ts`.
      Bloqueos pendientes: ninguno.

- [ ] 1.8 T008 [TESTING] Responsable: Líder QA de Accesibilidad e Investigación UX
      Configurar Testing Library, `user-event` y matchers de accesibilidad básica sobre jsdom.
      Requisito: Constitución V — Accesibilidad obligatoria.
      Archivos:
      - `tests/setup/testing-library.setup.ts`
      - `vitest.config.ts`
      Depende de: T007
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- testing-library-setup` y confirmar que los matchers DOM están disponibles.
      Registro: la suite de Vitest usó Testing Library, `user-event` y `@testing-library/jest-dom`; el test de `ActionButton` confirmó los matchers DOM y activación de teclado.
      Archivos modificados: `tests/setup/testing-library.setup.ts`, `vitest.config.ts`.
      Bloqueos pendientes: ninguno.

- [ ] 1.9 T009 [P] [TESTING] Responsable: Líder QA de automatización
      Configurar Playwright para Chromium de escritorio y un proyecto móvil contra `next build` y `next start`.
      Requisito: SC-002 | Constitución XI — Verificación antes de completar.
      Archivos:
      - `playwright.config.ts`
      - `tests/e2e/foundation.spec.ts`
      Depende de: T002, T003
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm exec playwright test tests/e2e/foundation.spec.ts`.
      - Confirmar que la prueba visita `/` tanto en el proyecto de escritorio como en el móvil.
      Registro: Playwright ejecutó Chromium de escritorio y el proyecto móvil basado en Pixel 5; ambos visitaron `/` y pasaron la comprobación de desbordamiento horizontal.
      Archivos modificados: `playwright.config.ts`, `tests/e2e/foundation.spec.ts`.
      Bloqueos pendientes: ninguno.

- [ ] 1.10 T010 [P] [DEVOPS] Responsable: Líder DevOps y Release
      Crear la plantilla de variables sin secretos reales y con separación explícita entre URL y clave privada.
      Requisito: Constitución VII — Seguridad de Supabase.
      Archivos:
      - `.env.example`
      Depende de: Checkpoint 0
      Paralela: Sí
      Verificación:
      - Ejecutar `Select-String -Path .env.example -Pattern 'NEXT_PUBLIC_.*SUPABASE|^SUPABASE_(SECRET|SERVICE_ROLE)_KEY=.+$'` y confirmar que no devuelve claves públicas de Supabase ni valores secretos.
      - Confirmar que existen `SUPABASE_URL=`, `SUPABASE_SECRET_KEY=`, `SUPABASE_SERVICE_ROLE_KEY=` y `GAME_ROUND_SIZE=5`.
      Registro: `.env.example` contiene las variables contractuales sin valores reales y la búsqueda no encontró claves públicas ni secretos.
      Archivos modificados: `.env.example`.
      Bloqueos pendientes: ninguno.

- [ ] 1.11 T011 [SHARED] Responsable: Líder técnico
      Validar en tiempo de ejecución las variables privadas, exigir exactamente una clave de servidor y reutilizar `RoundSizeSchema` para el tamaño de ronda contractual.
      Requisito: FR-013 | Constitución IX — Tipado y validación.
      Archivos:
      - `src/lib/env/server.ts`
      - `src/lib/env/server.test.ts`
      Depende de: T003, T010
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/lib/env/server.test.ts`.
      - Confirmar casos para clave ausente, dos claves simultáneas, URL inválida y `GAME_ROUND_SIZE` fuera de `1..10`.
      - Confirmar que la validación de `GAME_ROUND_SIZE` importa `RoundSizeSchema` desde `@antidoto/contracts` y no redefine el rango.
      - Ejecutar `pnpm typecheck`.
      Registro: las pruebas de entorno pasan para clave ausente, claves simultáneas, URL inválida y `GAME_ROUND_SIZE` fuera de `1..10`; `pnpm typecheck` pasa.
      Archivos modificados: `src/lib/env/server.ts`, `src/lib/env/server.test.ts`.
      Bloqueos pendientes: ninguno.

- [ ] 1.12 T012 [FRONTEND] Responsable: Líder frontend
      Crear una primitiva accesible de acción basada en HTML nativo, con foco visible, estado deshabilitado y área táctil mínima.
      Requisito: FR-051 | FR-055 | Constitución V — Accesibilidad obligatoria.
      Archivos:
      - `src/components/ui/action-button.tsx`
      - `src/components/ui/action-button.test.tsx`
      Depende de: T005, T008
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/components/ui/action-button.test.tsx`.
      - Confirmar activación con `Enter` y `Space`, nombre accesible y clases/estilos que establecen un mínimo de `44x44` CSS px.
      - Reservar la medición geométrica real para T127/T130.
      Registro: la prueba unitaria pasa; `ActionButton` tiene nombre accesible, activación de teclado y clases mínimas `44x44`.
      Archivos modificados: `src/components/ui/action-button.tsx`, `src/components/ui/action-button.test.tsx`.
      Bloqueos pendientes: medición física reservada para T127/T130.

- [ ] 1.13 T013 [P] [FRONTEND] Responsable: Líder frontend
      Crear estados globales de carga, error recuperable y ruta inexistente con lenguaje claro.
      Requisito: FR-058 | Constitución V — Accesibilidad obligatoria.
      Archivos:
      - `src/app/loading.tsx`
      - `src/app/error.tsx`
      - `src/app/not-found.tsx`
      Depende de: T003, T005
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm typecheck` y `pnpm lint`.
      - Provocar un error de render en desarrollo y confirmar que la pantalla ofrece una acción concreta sin mostrar stack ni detalles internos.
      Registro: `pnpm typecheck` y `pnpm lint` pasan; `GlobalError` fue probado con un error interno y solo presenta mensaje seguro y acción `Reintentar`, sin filtrar el detalle.
      Archivos modificados: `src/app/loading.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/error.test.tsx`.
      Bloqueos pendientes: ninguno.

- [ ] 1.14 T014 [P] [DEVOPS] Responsable: Líder DevOps y Release
      Configurar el proyecto local de Supabase para migraciones versionadas, seed y Cron reproducibles.
      Requisito: Constitución VII — Seguridad de Supabase.
      Archivos:
      - `supabase/config.toml`
      - `supabase/seed.sql`
      Depende de: T001
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm exec supabase --version`, `pnpm exec supabase migration new --help` y `pnpm exec supabase db push --help`.
      - Ejecutar `pnpm exec supabase start`.
      - Ejecutar `pnpm exec supabase status` y confirmar que el proyecto local queda saludable.
      - Ejecutar `Select-String -Path supabase/config.toml -Pattern '^schemas\s*=\s*\[[^\]]*\"api\"[^\]]*\]$'` dentro de `[api]` y confirmar una coincidencia; ejecutar la búsqueda equivalente para `"private"` y confirmar cero coincidencias.
      - Confirmar que `supabase start` acepta esa propiedad real de Supabase CLI sin error de configuración; T141 verifica después de crear los objetos que Data API acepta `api` y rechaza `private`.
      Registro: `supabase --version`, `migration new --help`, `db push --help`, `supabase start` y `supabase status` terminan correctamente. El seed local/Preview idempotente crea únicamente `api` y `private` antes de que PostgREST cargue el esquema; la comprobación confirmó una coincidencia de `api` y cero de `private` en `api.schemas`. Los servicios opcionales no habilitados por el MVP permanecen detenidos, mientras DB, REST, Auth, Realtime, Gateway y Edge Runtime quedan activos.
      Archivos modificados: `supabase/config.toml`, `supabase/seed.sql`.
      Bloqueos pendientes: ninguno.

### Checkpoint A — Fundación

No iniciar la Fase 2 ni Supabase persistente hasta registrar:

1. `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm build` con salida 0.
2. TypeScript estricto confirmado.
3. Variables públicas y privadas validadas sin secretos reales.
4. Vitest, Testing Library y Playwright ejecutables.
5. Next.js 16.2.12 sobre Node.js 24.x.

---

## Fase 2 — Contratos y configuración compartida

**Objetivo**: consumir los contratos aprobados como única fuente de verdad y cerrar las fronteras de datos antes de persistir.

- [ ] 2.1 T015 [SHARED] Responsable: Líder técnico
      Verificar y congelar la integración de `contracts/domain.ts` mediante el alias canónico sin copiar ni redefinir sus tipos o esquemas.
      Requisito: Constitución II — Desarrollo Contract-First.
      Archivos:
      - `tests/contracts/domain-import.test.ts`
      Depende de: Checkpoint A
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- tests/contracts/domain-import.test.ts`.
      - Ejecutar `pnpm typecheck` y confirmar que `@antidoto/contracts` resuelve directamente al contrato aprobado.
      Registro: el test de importación y `pnpm typecheck` pasan; el alias apunta directamente a `specs/001-trivia-mvp-flow/contracts/domain.ts` sin una copia bajo `src/`.
      Archivos modificados: `tests/contracts/domain-import.test.ts`.
      Bloqueos pendientes: ninguno.

- [ ] 2.2 T016 [P] [TESTING] Responsable: Líder QA de automatización
      Verificar esquemas Zod y consistencia entre operaciones, códigos de error y exports aprobados.
      Requisito: FR-013 | Constitución II — Desarrollo Contract-First.
      Archivos:
      - `tests/contracts/domain-schemas.test.ts`
      - `tests/fixtures/contract-samples.ts`
      - `tests/contracts/contract-consistency.test.ts`
      Depende de: T015
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- tests/contracts/domain-schemas.test.ts`.
      - Ejecutar `pnpm test -- tests/contracts/contract-consistency.test.ts`.
      - Confirmar casos válidos e inválidos para alias, estado de juego, respuesta, resultado y ranking.
      - Confirmar `RoundSizeSchema` para `1`, `5` y `10`, rechazo de `0`, `11` y decimales, y que progreso/resultado derivan el máximo exacto del total.
      - Confirmar que el ranking reutiliza `RoundScoreSchema`, cuya envolvente deriva de `ROUND_SIZE_CONTRACT`, sin un literal de máximo independiente; las pruebas SQL validan cada entrada contra el `RoundSize` persistido.
      Registro: los tests de schemas y consistencia pasan con alias normalizado, lista bloqueada por coincidencia completa, estados públicos, RoundSize `1/5/10` y rechazos `0/11/1.5`; la puntuación usa la regla contractual.
      Archivos modificados: `tests/contracts/domain-schemas.test.ts`, `tests/fixtures/contract-samples.ts`, `tests/contracts/contract-consistency.test.ts`.
      Bloqueos pendientes: ninguno.

- [ ] 2.3 T017 [SHARED] Responsable: Líder técnico
      Implementar el mapeo tipado de códigos contractuales a errores de aplicación y mensajes seguros para el usuario.
      Requisito: FR-062 | Constitución II — Desarrollo Contract-First.
      Archivos:
      - `src/features/game/application/game-error.ts`
      - `src/features/game/infrastructure/map-database-error.ts`
      - `src/features/game/infrastructure/map-database-error.test.ts`
      Depende de: T015
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/infrastructure/map-database-error.test.ts`.
      - Confirmar que todos los códigos de `contracts/errors.md` tienen salida pública y que ningún mensaje contiene SQLSTATE, tabla, función, stack o clave.
      - Confirmar que `SESSION_NOT_FOUND`, `SESSION_INVALID` y `RESULT_ACCESS_EXPIRED` conservan discriminantes internos distintos, pero proyectan exactamente el mismo mensaje y las mismas acciones públicas.
      Registro: el mapeador cubre los códigos contractuales, usa mensajes sanitizados y conserva la presentación segura idéntica para `SESSION_NOT_FOUND`, `SESSION_INVALID` y `RESULT_ACCESS_EXPIRED`; 2 tests pasan.
      Archivos modificados: `src/features/game/application/game-error.ts`, `src/features/game/infrastructure/map-database-error.ts`, `src/features/game/infrastructure/map-database-error.test.ts`.
      Bloqueos pendientes: ninguno.

- [ ] 2.4 T018 [P] [TESTING] Responsable: Líder QA de Seguridad
      Comprobar que las proyecciones públicas pendientes no admiten solución, corrección, puntos ni identificadores internos.
      Requisito: FR-020 | SC-005.
      Archivos:
      - `tests/contracts/public-projections.test.ts`
      Depende de: T015
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- tests/contracts/public-projections.test.ts`.
      - Confirmar que muestras con `correctOptionId`, `isCorrect`, `sessionId`, UUID o hash son rechazadas antes de responder.
      Registro: el test de proyección pública rechaza solución, corrección, puntos, UUID y hash mediante los schemas estrictos.
      Archivos modificados: `tests/contracts/public-projections.test.ts`.
      Bloqueos pendientes: ninguno.

- [ ] 2.5 T019 [BACKEND] Responsable: Líder backend
      Configurar el cliente de Supabase exclusivamente para servidor, usando la clave privada validada y sin exportar cliente de navegador.
      Requisito: Constitución VII — Seguridad de Supabase.
      Archivos:
      - `src/lib/supabase/server.ts`
      - `src/lib/supabase/server.test.ts`
      Depende de: T011
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/lib/supabase/server.test.ts`.
      - Confirmar selección exclusiva de una clave privada validada y ausencia de cliente/clave pública.
      Registro: el cliente server-only se crea con la clave privada validada, schema `api`, sesiones persistentes desactivadas y rechaza clave ausente o simultánea; 2 tests pasan.
      Archivos modificados: `src/lib/supabase/server.ts`, `src/lib/supabase/server.test.ts`.
      Bloqueos pendientes: ninguno.

- [ ] 2.6 T020 [P] [BACKEND] Responsable: Líder backend
      Implementar generación, validación y hash SHA-256 de la credencial anónima sin registrar el token.
      Requisito: FR-060 | Constitución IV — Privacidad mínima.
      Archivos:
      - `src/lib/security/session-token.ts`
      - `src/lib/security/session-token.test.ts`
      Depende de: T015
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- src/lib/security/session-token.test.ts`.
      - Confirmar 32 bytes obtenidos con CSPRNG, nunca `Math.random`, token Base64URL de 43 caracteres y hash hexadecimal minúsculo de 64.
      - Instrumentar logs durante éxito/error y confirmar que token y hash no se escriben.
      Registro: la prueba confirma token CSPRNG de 32 bytes/Base64URL de 43 caracteres, hash SHA-256 hex de 64 caracteres y ausencia de registro del token/hash.
      Archivos modificados: `src/lib/security/session-token.ts`, `src/lib/security/session-token.test.ts`.
      Bloqueos pendientes: ninguno.

- [ ] 2.7 T021 [US6] [P] [BACKEND] Responsable: Líder backend
      Implementar y probar la regla de puntuación versionada como lógica de dominio independiente.
      Archivos:
      - `src/features/game/domain/scoring.ts`
      - `src/features/game/domain/scoring.test.ts`
      Depende de: T015
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/domain/scoring.test.ts`.
      - Confirmar 100 puntos correcta, cero incorrecta, sin negativos/velocidad y máximo `roundSize * 100` para `1..10`.
      Registro: la lógica de dominio y sus tests confirman 100/0 puntos, sin bonificación de velocidad ni negativos, y máximos 100/500/1000 para rondas 1/5/10.
      Archivos modificados: `src/features/game/domain/scoring.ts`, `src/features/game/domain/scoring.test.ts`.
      Bloqueos pendientes: ninguno.

- [ ] 2.8 T022 [TESTING] Responsable: Líder QA de Seguridad
      Añadir una prueba de arquitectura que impida importar módulos privados, Supabase o variables secretas desde Client Components.
      Requisito: FR-062 | Constitución VII — Seguridad de Supabase.
      Archivos:
      - `tests/architecture/server-boundaries.test.ts`
      - `tests/fixtures/client-imports-supabase.tsx`
      Depende de: T018, T019
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- tests/architecture/server-boundaries.test.ts`.
      - La prueba debe cargar de forma automática los fixtures permitidos y prohibidos, recorrer sus imports y terminar con salida 0 solo cuando el permitido pasa y los imports desde `src/lib/supabase/server.ts`, `src/lib/env/server.ts` o módulos `server-only` se rechazan con diagnóstico explícito.
      - Mutar temporalmente el fixture prohibido dentro del aislamiento de la prueba y confirmar que, si el detector no lo rechaza, Vitest falla; no se ejecuta `next build` ni se incorporan fixtures al grafo real de la aplicación.
      Registro: la prueba inspecciona fixtures Client Component, permite el fixture público y falla explícitamente ante imports de `src/lib/supabase/server`, `src/lib/env/server`, `server-only` o Supabase; la mutación se mantiene en memoria.
      Archivos modificados: `tests/architecture/server-boundaries.test.ts`, `tests/fixtures/client-imports-supabase.tsx`.
      Bloqueos pendientes: ninguno.

---

## Fase 3 — Supabase y persistencia

**Objetivo**: crear la fachada PostgreSQL transaccional, las invariantes, los privilegios mínimos y el contenido de demostración antes de conectar interfaces.

Las migraciones de T023–T043 se ejecutan en orden. Aunque cada archivo sea distinto, no se marcan `[P]` porque forman una historia irreversible y varias dependen de objetos anteriores.

- [ ] 3.1 T023 [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear los esquemas `private` y `api`, extensiones aprobadas y privilegios predeterminados cerrados.
      Requisito: Constitución VII — Seguridad de Supabase.
      Archivos:
      - `supabase/migrations/<timestamp>_create_private_api_schemas.sql`
      Depende de: T014, T016, T017, T020, T021, T022
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase db reset`.
      - Consultar `information_schema.schemata` y confirmar `private` y `api`.
      - Consultar `pg_default_acl` por rol propietario y esquema; confirmar que `PUBLIC`, `anon`, `authenticated` y `service_role` no reciben privilegios predeterminados implícitos.

- [ ] 3.2 T024 [US3] [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear el catálogo privado de mecánicas con código estable y soporte exclusivo de `single_choice` para esta versión.
      Archivos:
      - `supabase/migrations/<timestamp>_create_mechanics.sql`
      Depende de: T023
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase db reset`.
      - Consultar `private.mechanics` y confirmar clave primaria por código, estado válido y RLS habilitado.

- [ ] 3.3 T025 [US4] [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear preguntas con contenido educativo, solución protegida, metadatos locales de imagen, publicación y versionado.
      Archivos:
      - `supabase/migrations/<timestamp>_create_questions.sql`
      Depende de: T024
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase db reset`.
      - Inspeccionar `private.questions` y confirmar PK UUID, `public_ref` único de 22 caracteres, FK de mecánica, campos educativos y RLS habilitado.
      - Confirmar `CHECK` de metadatos completos y `image_bytes <= 1000000`; `300000` permanece como recomendado editorial y no como un segundo máximo SQL.

- [ ] 3.4 T026 [US3] [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear opciones ordenadas y la relación compuesta diferible que obliga a que la solución pertenezca a su pregunta.
      Archivos:
      - `supabase/migrations/<timestamp>_create_question_options.sql`
      Depende de: T025
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase db reset`.
      - Confirmar `UNIQUE(question_id, position)`, `UNIQUE(question_id, id)`, `public_ref` único y la FK diferible de `correct_option_id`.
      - Intentar confirmar una solución de otra pregunta y comprobar rechazo.

- [ ] 3.5 T027 [US4] [SUPABASE] Responsable: Líder de Datos y Supabase
      Proteger integridad e inmutabilidad de preguntas publicadas mediante la familia diferible aprobada sobre preguntas y opciones.
      Archivos:
      - `supabase/migrations/<timestamp>_protect_published_questions.sql`
      Depende de: T026
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase db reset`.
      - Consultar `pg_trigger` y confirmar dos triggers `DEFERRABLE INITIALLY DEFERRED`.
      - Intentar publicar con una opción, cinco opciones, sin solución y sin retroalimentación; confirmar rollback al `COMMIT`.
      - Intentar cambiar enunciado, solución, opciones y referencias de una pregunta publicada; confirmar rechazo.

- [ ] 3.6 T028 [US2] [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear sesiones anónimas con alias, hash opaco, `RoundSize` contractual, estado, cursor, regla versionada, expiración, resultado congelable y la guarda SQL `game_session_transition_guard`.
      Archivos:
      - `supabase/migrations/<timestamp>_create_game_sessions.sql`
      Depende de: T027
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase db reset`.
      - Confirmar estados `started`, `in_progress`, `finished`, `invalidated`, `total_questions` entre 1 y 10, hash parcial único, puntuación no negativa y RLS habilitado.
      - Confirmar que el alias no tiene restricción de unicidad.
      - Intentar cambiar una sesión `finished` o `invalidated` a un estado anterior con DML directo de rol servidor y confirmar rechazo de la guarda SQL.
      - Confirmar que la única excepción permite exclusivamente a la rutina privada de retención aplicar sus cambios documentados, sin habilitar actualizaciones de juego o puntuación.

- [ ] 3.7 T029 [US3] [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear la asignación persistida de preguntas con posición, estado pendiente/respondida y unicidad por sesión.
      Archivos:
      - `supabase/migrations/<timestamp>_create_session_questions.sql`
      Depende de: T028
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase db reset`.
      - Confirmar `UNIQUE(session_id, position)`, `UNIQUE(session_id, question_id)`, FK compuesta para respuestas y RLS habilitado.
      - Intentar repetir una posición y confirmar rechazo.

- [ ] 3.8 T030 [US3] [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear respuestas del jugador con selección, corrección y puntos derivados, unicidad estricta e inmutabilidad mediante `player_answer_integrity_guard`.
      Archivos:
      - `supabase/migrations/<timestamp>_create_player_answers.sql`
      Depende de: T029
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase db reset`.
      - Confirmar `UNIQUE(session_question_id)`, FK de asignación, FK compuesta de opción/pregunta, puntos no negativos y RLS habilitado.
      - Intentar `UPDATE` o `DELETE` directo de una respuesta como rol servidor y confirmar rechazo, salvo eliminación ejecutada por la rutina privada de retención con su rol autorizado.
      - Intentar insertar `is_correct` o `points_awarded` incoherentes y confirmar que ninguna fila queda confirmada.

- [ ] 3.9 T031 [US3] [SUPABASE] Responsable: Líder de Datos y Supabase
      Añadir la familia diferible que garantiza cantidad, posiciones continuas y forma posterior a la purga de una ronda.
      Archivos:
      - `supabase/migrations/<timestamp>_add_game_session_round_guards.sql`
      Depende de: T030
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase db reset`.
      - Consultar `pg_trigger` y confirmar dos triggers `DEFERRABLE INITIALLY DEFERRED`.
      - Intentar confirmar posiciones discontinuas, ronda incompleta y sesión purgada con detalle; confirmar rollback.

- [ ] 3.10 T032 [US3] [SUPABASE] Responsable: Líder de Datos y Supabase
      Añadir las familias diferibles `session_answer_consistent` y `game_session_result_consistent` para mantener asignación/respuesta y resultado definitivo coherentes.
      Archivos:
      - `supabase/migrations/<timestamp>_add_session_answer_guards.sql`
      Depende de: T031
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase db reset`.
      - Consultar `pg_trigger` y confirmar cuatro triggers `DEFERRABLE INITIALLY DEFERRED`, uno por cada tabla origen de ambas familias.
      - Intentar confirmar una asignación pendiente con respuesta y una respondida sin respuesta; confirmar rollback.
      - Intentar confirmar `is_correct` distinto de la comparación con `correct_option_id`, puntos distintos de la regla 100/0 o una puntuación final distinta de la suma congelada; confirmar rollback.
      - Confirmar que la validación se ejecuta también con DML directo de rol servidor y que no existe un bypass general basado solo en omitir RLS.

- [ ] 3.11 T033 [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear únicamente los índices contractuales para elegibilidad, expiración, ranking, retención y claves foráneas.
      Requisito: FR-045 | FR-065 | Constitución VII — Seguridad de Supabase.
      Archivos:
      - `supabase/migrations/<timestamp>_add_contract_indexes.sql`
      Depende de: T032
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase db reset`.
      - Consultar `pg_indexes` y confirmar índices para preguntas elegibles, hash parcial, expiración, ranking, retención, asignaciones y respuestas.
      - Ejecutar `pnpm exec supabase db lint --local --fail-on error`.

- [ ] 3.12 T034 [US2] [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear `api.start_game` para validar, crear sesión y asignar el `RoundSize` configurado en una sola transacción idempotente por hash.
      Archivos:
      - `supabase/migrations/<timestamp>_create_start_game_rpc.sql`
      Depende de: T033
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase db reset`.
      - Invocar la función con `round_size` `1`, `5` y `10` y confirmar exactamente esa cantidad de posiciones continuas; Production utilizará `5`.
      - Invocar con `0`, `11` y un decimal y confirmar rechazo sin sesión parcial.
      - Repetir con el mismo hash y confirmar que no aparece otra sesión.
      - Repetir con el mismo hash de una sesión ya vencida y confirmar que primero materializa `invalidated_at = expires_at`, confirma la transacción y devuelve la salida etiquetada `SESSION_INVALID` sin crear otra sesión.

- [ ] 3.13 T035 [US5] [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear `api.get_game_state` como lectura pura con variantes pendiente, respondida, finalizada y vencida proyectada como `SESSION_INVALID`.
      Archivos:
      - `supabase/migrations/<timestamp>_create_get_game_state_rpc.sql`
      Depende de: T034
      Paralela: No
      Verificación:
      - Invocar la función en los cuatro estados y validar columnas explícitas.
      - Consultar `pg_proc` y confirmar `provolatile = 's'` (`STABLE`) para `api.get_game_state`.
      - Para una sesión con `expires_at <= now()`, confirmar `SESSION_INVALID` sin ejecutar `UPDATE`.
      - Comparar antes/después la fila completa y los conteos relacionados; confirmar que `status`, `invalidated_at`, `last_activity_at`, `expires_at` y todas las tablas permanecen idénticos.
      - Confirmar que la variante pendiente no contiene solución ni corrección.

- [ ] 3.14 T036 [US3] [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear `api.submit_answer` con bloqueo sesión-asignación, evaluación, puntos y reconciliación de concurrencia atómicas.
      Archivos:
      - `supabase/migrations/<timestamp>_create_submit_answer_rpc.sql`
      Depende de: T035
      Paralela: No
      Verificación:
      - Enviar una respuesta válida y confirmar una fila, estado `answered`, 100/0 puntos y renovación de actividad.
      - Repetir el envío y confirmar `accepted_new=false`, una sola fila y expiración persistida sin extensión.
      - Enviar sobre una sesión vencida y confirmar que se rechaza antes de aceptar la respuesta; si materializa `invalidated`, la transición y el resultado etiquetado quedan confirmados en la misma transacción, sin excepción que revierta el `UPDATE`.

- [ ] 3.15 T037 [US5] [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear `api.advance_game` para mover exactamente una posición desde retroalimentación confirmada y rechazar saltos/repeticiones.
      Archivos:
      - `supabase/migrations/<timestamp>_create_advance_game_rpc.sql`
      Depende de: T036
      Paralela: No
      Verificación:
      - Avanzar una vez y confirmar incremento de una posición.
      - Repetir y confirmar `ADVANCE_NOT_ALLOWED`, cursor estable y `expires_at` sin cambios.
      - Intentar avanzar una sesión vencida y confirmar `SESSION_INVALID`, cursor intacto y materialización atómica confirmada antes de devolver el resultado.

- [ ] 3.16 T038 [US6] [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear `api.finish_game` para calcular y congelar el resultado y su ventana individual de acceso una sola vez desde las respuestas persistidas.
      Archivos:
      - `supabase/migrations/<timestamp>_create_finish_game_rpc.sql`
      Depende de: T037
      Paralela: No
      Verificación:
      - Finalizar una ronda completa y confirmar estado, aciertos, suma 100/0, fecha y `result_access_until = finished_at + 7 días`.
      - Invocar de nuevo y confirmar valores, `finished_at` y `result_access_until` idénticos.
      - Intentar finalizar una ronda incompleta y confirmar `GAME_NOT_COMPLETE`.
      - Intentar finalizar una sesión vencida y confirmar rechazo previo; cualquier materialización de `invalidated` debe quedar confirmada atómicamente mediante salida interna etiquetada.

- [ ] 3.17 T039 [US6] [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear `api.get_game_result` como lectura pura para recuperar el resultado histórico asociado al hash únicamente durante `result_access_until`.
      Archivos:
      - `supabase/migrations/<timestamp>_create_get_game_result_rpc.sql`
      Depende de: T038
      Paralela: No
      Verificación:
      - Consultar `pg_proc` y confirmar `provolatile = 's'` (`STABLE`) para `api.get_game_result`.
      - Consultar una sesión finalizada y confirmar alias, puntuación, aciertos, total, regla y fecha.
      - Consultar una sesión activa y confirmar `RESULT_NOT_AVAILABLE`.
      - Consultar una finalizada inmediatamente, después de 24 horas y antes de siete días; confirmar el mismo resultado.
      - Superar `result_access_until` y confirmar `RESULT_ACCESS_EXPIRED` sin cambiar estado, fechas, hash ni ranking.
      - Confirmar ausencia de UUID, hash, respuestas y soluciones.
      - Consultar una sesión activa vencida y confirmar `SESSION_INVALID` sin cambiar `status`, `invalidated_at`, actividad, expiración ni ninguna fila.

- [ ] 3.18 T040 [US7] [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear `api.get_leaderboard` como consulta segura de una sola instantánea sobre sesiones finalizadas, sin tabla ni vista duplicada.
      Archivos:
      - `supabase/migrations/<timestamp>_create_get_leaderboard_rpc.sql`
      Depende de: T039
      Paralela: No
      Verificación:
      - Ejecutar con más de diez sesiones y confirmar top diez más resultado actual fuera del top cuando corresponda.
      - Confirmar orden por puntuación, `finished_at` y UUID interno sin proyectar fecha ni UUID.
      - Consultar `pg_views` y confirmar que no se creó una vista de ranking.

- [ ] 3.19 T041 [SUPABASE] Responsable: Líder de Datos y Supabase
      Habilitar RLS en las seis tablas privadas sin políticas permisivas para roles públicos.
      Requisito: Constitución VII — Seguridad de Supabase.
      Archivos:
      - `supabase/migrations/<timestamp>_enable_private_rls.sql`
      Depende de: T040
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase db reset`.
      - Consultar `pg_class.relrowsecurity` y confirmar RLS activo en las seis tablas.
      - Consultar `pg_policies` y confirmar cero políticas permisivas para `anon` o `authenticated`.

- [ ] 3.20 T042 [SUPABASE] Responsable: Líder de Datos y Supabase
      Configurar grants explícitos y privilegios predeterminados para roles públicos, servidor y propietario/Cron.
      Requisito: Constitución VII — Seguridad de Supabase.
      Archivos:
      - `supabase/migrations/<timestamp>_configure_explicit_grants.sql`
      Depende de: T041
      Paralela: No
      Verificación:
      - Como `anon` y `authenticated`, intentar CRUD en las seis tablas y `EXECUTE` de las siete RPC; confirmar acceso denegado.
      - Consultar `pg_proc` y confirmar `SECURITY INVOKER`, `search_path` vacío y ausencia de grant a `PUBLIC`.
      - Usar `has_schema_privilege`, `has_table_privilege` y `has_function_privilege` para confirmar la ACL exacta.
      - Confirmar que `service_role` recibe solo fachada/privilegios subyacentes mínimos y no puede ejecutar la limpieza.

- [ ] 3.21 T043 [US2] [SUPABASE] Responsable: Líder de Datos y Supabase
      Crear la limpieza privada idempotente, separar purga de detalle y credencial de resultado, y programar Supabase Cron cada seis horas con privilegios exclusivos del propietario.
      Archivos:
      - `supabase/migrations/<timestamp>_create_retention_cron.sql`
      Depende de: T042
      Paralela: No
      Verificación:
      - Ejecutar la función con datos vencidos controlados y confirmar cascadas, purga de detalle y conservación/retiro del resultado según plazo.
      - Consultar `cron.job` y confirmar periodicidad de seis horas.
      - Intentar ejecutarla como `anon`, `authenticated` y `service_role`; confirmar acceso denegado.
      - Confirmar `SECURITY INVOKER`, `search_path` vacío, nombres calificados y `EXECUTE` exclusivo del propietario/Cron.
      - Confirmar que una sesión abandonada se materializa como `invalidated` con `invalidated_at` igual al `expires_at` vencido, y que purga/retención se calculan desde ese instante aunque Cron se ejecute después.
      - Confirmar que una finalizada conserva el hash hasta `result_access_until`, deja de autorizar exactamente en ese instante y lo elimina en el siguiente ciclo sin retirar el ranking.

- [ ] 3.22 T044 [US4] [SUPABASE] Responsable: Líder de Datos y Supabase
      Coordinar la formalización de la evidencia editorial y, solo después de la decisión `approved`, materializar el conjunto educativo en un seed idempotente para local/Preview y una migración de datos versionada para Production.
      Requisito: FR-028 | FR-031 | SC-004 | Constitución I — Educación antes que competencia | Constitución XI — Verificación antes de completar.
      Archivos:
      - `specs/001-trivia-mvp-flow/evidence/content/educational-content-approval.md`
      - `supabase/seed.sql`
      - `supabase/migrations/<timestamp>_insert_approved_educational_content.sql`
      - `public/images/questions/contexto-fuera-de-campo.webp`
      - `public/images/questions/deepfake-iluminacion.webp`
      Depende de: T043
      Paralela: No
      Entrada bloqueante:
      - La revisión educativa completa debe estar registrada por el rol revisor definido en estas convenciones y la decisión final vigente debe ser `approved`, emitida por el rol aprobador aquí definido.
      - Si la evidencia falta, está incompleta, no coincide con la versión del catálogo o de sus recursos, está desactualizada o registra `draft`, `in_review`, `changes_requested`, `rejected` o `retired`, no se escribe ni se aplica SQL de publicación y la tarea permanece pendiente o bloqueada.
      Verificación:
      - Ejecutar primero `pnpm exec supabase migration new insert_approved_educational_content` y usar exactamente el nombre generado.
      - Antes de escribir SQL, formalizar en el archivo de evidencia la revisión y decisión emitidas por los roles definidos en estas convenciones; la coordinación y el archivo pertenecen a T044, pero las decisiones conservan su separación y autoridad.
      - Validar en la evidencia `approvalSchemaVersion`, `approvalRevision`, `catalogVersion`, identificadores y versiones de contenido y recursos, rol e iniciales de revisor y aprobador, fecha, decisión final y, cuando corresponda, reemplazo o retiro. `approvalRevision` debe ser el entero de revisión independiente de `catalogVersion`.
      - Generar la proyección canónica ordenada por `public_ref`, calcular su `SHA-256` hexadecimal en minúsculas y registrar `catalogDigestAlgorithm` y `catalogDigest` en la evidencia y en estas tres claves, una sola vez antes de la primera sentencia, de `supabase/seed.sql` y de la migración: `-- antidoto-catalog-version:`, `-- antidoto-catalog-digest-algorithm: SHA-256` y `-- antidoto-catalog-digest:` con exactamente 64 caracteres hexadecimales; fallar ante cualquier diferencia.
      - Confirmar un resultado `pass` o `fail` justificado para cada criterio de la rúbrica: exactitud; coherencia entre pregunta, respuesta y explicación; relevancia de señales; claridad y utilidad de la recomendación; calidad, vigencia y trazabilidad de fuentes; ausencia de afirmaciones no sustentadas; lenguaje comprensible; ausencia de sesgos o generalizaciones engañosas; licencia, permiso o procedencia de recursos; privacidad y minimización. Si existe una discrepancia de rol, revisión, pregunta, fuente, recurso, huella, licencia o procedencia, T044 debe fallar y permanecer pendiente.
      - Confirmar para cada fuente `consultedAt`, `stableLocator`, `verifiedPassage`, `sourceFingerprintType` (`sha256` o `stable_revision`) y `sourceFingerprint`; aplicar las definiciones de vigencia y cambio material de `spec.md`, documentar los cambios inmateriales y mantener pendiente cualquier afirmación que no pueda volver a verificarse.
      - Confirmar que las fuentes verificadas, los permisos o licencias, las huellas de los dos recursos materializados y las observaciones permiten reproducir la decisión, y que no existe ningún criterio fallido en una versión aprobada.
      - Probar fixtures editoriales para `draft`, `in_review`, `changes_requested`, `rejected` y `retired`; confirmar que ninguno puede materializarse como `published`. Confirmar que solo `approved` habilita la publicación.
      - Cambiar de forma controlada una pregunta, fuente o recurso aprobado y confirmar que la aprobación queda desactualizada, la publicación falla y se exige una nueva versión y revisión.
      - Ejecutar `pnpm exec supabase db reset`.
      - Confirmar al menos diez preguntas publicadas, todas incluidas exactamente en la versión de catálogo aprobada, con 2–4 opciones, una solución propia, explicación coherente, señales relevantes y recomendación accionable.
      - Confirmar preguntas de texto y al menos una con imagen local, alt, dimensiones, formato, reporte frente al recomendado de `300000` bytes y peso nunca superior al máximo de `1000000` bytes.
      - Comparar claves estables, versiones y contenido entre la evidencia, `seed.sql` y la migración de Production; confirmar que representan exactamente el mismo conjunto educativo aprobado.
      - Aplicar migración y seed en secuencia dos veces sobre una base controlada; confirmar cero duplicados mediante referencias estables y escrituras idempotentes.
      - Registrar resultado esperado, verificación realizada, resultado obtenido, archivos modificados y bloqueos pendientes sin marcar la tarea como completada mientras falte una puerta o evidencia.
      Registro histórico: reset local y smoke test transaccional pasan. Se verificaron esquemas, seis tablas privadas con RLS, diez preguntas publicadas, veinte opciones, dos WebP locales bajo 1 MB, siete RPC y digest SHA-256 `e03d507305c6a407ba77c8d0ee81f8b1de964e48b6b6ec4c13e7aadc0bd32344` idéntico en evidencia, seed y migración. Este registro no habilita completitud mientras Checkpoint 0 y las verificaciones pendientes sigan abiertos.
      Archivos modificados: `supabase/migrations/20260730192013_create_private_api_schemas.sql`, `supabase/migrations/20260730192015_create_mechanics.sql`, `supabase/migrations/20260730192017_create_questions.sql`, `supabase/migrations/20260730192019_create_question_options.sql`, `supabase/migrations/20260730192021_protect_published_questions.sql`, `supabase/migrations/20260730192022_create_game_sessions.sql`, `supabase/migrations/20260730192024_create_session_questions.sql`, `supabase/migrations/20260730192026_create_player_answers.sql`, `supabase/migrations/20260730192028_add_game_session_round_guards.sql`, `supabase/migrations/20260730192030_add_session_answer_guards.sql`, `supabase/migrations/20260730192032_add_contract_indexes.sql`, `supabase/migrations/20260730192034_create_start_game_rpc.sql`, `supabase/migrations/20260730192036_create_get_game_state_rpc.sql`, `supabase/migrations/20260730192038_create_submit_answer_rpc.sql`, `supabase/migrations/20260730192040_create_advance_game_rpc.sql`, `supabase/migrations/20260730192042_create_finish_game_rpc.sql`, `supabase/migrations/20260730192044_create_get_game_result_rpc.sql`, `supabase/migrations/20260730192046_create_get_leaderboard_rpc.sql`, `supabase/migrations/20260730192048_enable_private_rls.sql`, `supabase/migrations/20260730192050_configure_explicit_grants.sql`, `supabase/migrations/20260730192052_create_retention_cron.sql`, `supabase/migrations/20260730192054_insert_approved_educational_content.sql`, `supabase/seed.sql`, `specs/001-trivia-mvp-flow/evidence/content/educational-content-approval.md`, `public/images/questions/contexto-fuera-de-campo.webp`, `public/images/questions/deepfake-iluminacion.webp`.
      Bloqueos pendientes: `supabase db lint --local --fail-on error`, Cron real y pruebas de reloj/concurrencia. T044 permanece pendiente hasta que cada bloqueo tenga evidencia reproducible y salida 0; el reset y el corte vertical local no sustituyen estas verificaciones.

- [ ] 3.23 T045 [TESTING] Responsable: Líder QA de Datos
      Crear el fixture aislado de Supabase local y probar un restablecimiento completo del esquema.
      Requisito: Constitución XI — Verificación antes de completar.
      Archivos:
      - `tests/fixtures/supabase-local.ts`
      - `tests/integration/database/migration-smoke.test.ts`
      Depende de: T044
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase db reset`.
      - Ejecutar `pnpm test:integration -- tests/integration/database/migration-smoke.test.ts`.
      - Ejecutar `pnpm exec supabase db lint --local --fail-on error`.
      - Confirmar que el fixture usa credenciales locales de servidor, datos identificables por prueba y limpieza determinista.

- [ ] 3.24 T046 [US4] [TESTING] Responsable: Líder QA de Datos
      Probar publicación, inmutabilidad y sincronización del conjunto educativo entre seed y migración de Production.
      Archivos:
      - `tests/integration/database/question-publication.test.ts`
      Depende de: T044, T045
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/database/question-publication.test.ts`.
      - Confirmar casos permitidos de borrador y rechazos DB-DENY-009/010.
      - La prueba debe ejecutar `supabase db reset --no-seed`, capturar el checksum normalizado del catálogo, ejecutar `supabase db reset`, capturarlo otra vez y exigir igualdad.
      - Reaplicar el seed dentro del fixture y confirmar el mismo checksum, cardinalidades idénticas y cero duplicados.

- [ ] 3.25 T047 [US2] [P] [TESTING] Responsable: Líder QA de Datos
      Probar inicio atómico con `RoundSize`, orden persistido, insuficiencia de preguntas y reintento con el mismo hash.
      Archivos:
      - `tests/integration/database/start-game-rpc.test.ts`
      Depende de: T034, T044, T045, T046
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/database/start-game-rpc.test.ts`.
      - Confirmar tamaños `1`, `5` y `10`, rechazo de tamaños fuera de rango y que ningún fallo deja una sesión o ronda parcial.
      - Reintentar un hash vencido y confirmar una sola sesión, estado `invalidated`, `invalidated_at` igual al `expires_at` previo y salida etiquetada posterior al commit.

- [ ] 3.26 T048 [US5] [P] [TESTING] Responsable: Líder QA de Datos
      Probar las variantes de estado, incluida expiración lógica, la recuperación estrictamente sin escritura y la ausencia de soluciones futuras.
      Archivos:
      - `tests/integration/database/get-game-state-rpc.test.ts`
      Depende de: T035, T044, T045, T046
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/database/get-game-state-rpc.test.ts`.
      - Confirmar DB-ALLOW-002 y que una lectura normal o vencida conserva byte a byte `status`, `invalidated_at`, actividad, expiración y conteos de todas las tablas.
      - Confirmar que una vencida devuelve `SESSION_INVALID` sin `UPDATE`, trigger ni efecto lateral.

- [ ] 3.27 T049 [US3] [P] [TESTING] Responsable: Líder QA de Datos
      Probar atomicidad de respuesta, pertenencia de opción, sesión cruzada y carrera concurrente.
      Archivos:
      - `tests/integration/database/submit-answer-rpc.test.ts`
      Depende de: T036, T044, T045, T046
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/database/submit-answer-rpc.test.ts`.
      - Confirmar DB-ALLOW-003/004 y DB-DENY-004/005/006/007/008.
      - Enviar sobre una sesión vencida y confirmar cero respuestas nuevas, invalidación atómica anclada al `expires_at` previo y salida `SESSION_INVALID` posterior al commit.

- [ ] 3.28 T050 [US6] [P] [TESTING] Responsable: Líder QA de Datos
      Probar cálculo 100/0, límites, ventana de resultado e idempotencia transaccional de finalización.
      Archivos:
      - `tests/integration/database/finish-game-rpc.test.ts`
      Depende de: T038, T044, T045, T046
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/database/finish-game-rpc.test.ts`.
      - Confirmar una sola transición terminal, `finished_at` estable, `result_access_until` exacto y rechazo de modificación posterior.
      - Intentar finalizar una sesión vencida y confirmar ausencia de resultado/ranking, invalidación atómica anclada y `SESSION_INVALID`.

- [ ] 3.29 T051 [US7] [P] [TESTING] Responsable: Líder QA de Datos
      Probar ranking vacío, límite, elegibilidad, orden, ausencia de duplicados y resultado actual fuera del top.
      Archivos:
      - `tests/integration/database/leaderboard-rpc.test.ts`
      Depende de: T040, T044, T045, T046
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/database/leaderboard-rpc.test.ts`.
      - Confirmar DB-ALLOW-007/008 y que una finalización concurrente no mezcla instantáneas.

- [ ] 3.30 T052 [US3] [P] [TESTING] Responsable: Líder QA de Seguridad
      Probar accesos permitidos/rechazados, guardas SQL con DML servidor y ausencia de respuestas correctas o datos privados en salidas públicas.
      Archivos:
      - `tests/integration/database/access-control.test.ts`
      - `tests/integration/database/correct-answer-exposure.test.ts`
      Depende de: T035, T040, T041, T042, T044, T045, T046
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/database/access-control.test.ts`.
      - Ejecutar `pnpm test:integration -- tests/integration/database/correct-answer-exposure.test.ts`.
      - Confirmar DB-DENY-001/002/003/014/015, un acceso permitido con rol servidor y ACL exactas mediante `has_*_privilege`.
      - Confirmar ausencia de privilegios sobrantes y que `service_role` no ejecuta limpieza.
      - Buscar recursivamente `correct_option_id`, `is_correct` y UUID internos en salidas previas al envío; confirmar cero coincidencias.
      - Con rol servidor, intentar retroceder una sesión terminal, actualizar/eliminar una respuesta, insertar corrección o puntos falsos y fijar una puntuación final inconsistente; confirmar rechazo SQL y cero cambios.
      - Confirmar por nombre las guardas `game_session_transition_guard` y `player_answer_integrity_guard`, las cuatro familias y sus ocho constraint triggers; demostrar que ninguna se omite por usar `service_role`.
      - Ejecutar la rutina privada con su rol propietario y confirmar que solo su excepción documentada de retención puede purgar detalle o materializar invalidación abandonada.

- [ ] 3.31 T053 [US2] [P] [TESTING] Responsable: Líder QA de Seguridad
      Probar expiración activa, acceso temporal al resultado, purga, retiro, idempotencia y estado operativo del Cron.
      Requisito: SC-013 | Constitución XI — Verificación antes de completar.
      Archivos:
      - `tests/integration/database/retention-cron.test.ts`
      Depende de: T043, T044, T045, T046
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/database/retention-cron.test.ts`.
      - Ejecutar limpieza dos veces y confirmar idempotencia y recuperación de trabajo vencido omitido por un ciclo.
      - Confirmar eliminación de invalidada, purga de detalle finalizado, hash conservado hasta `result_access_until`, eliminación posterior del hash y eliminación del mínimo al vencer retiro.
      - Confirmar que Cron fija `invalidated_at=expires_at` para abandonadas y calcula el vencimiento de retención desde esa fecha original, no desde la hora tardía de ejecución.
      - Ejecutar los cortes de 24 horas, `result_access_until` y retiro con instantáneas UTC controladas según la convención del backlog; registrar el valor fijado, el límite inclusivo y el resultado observado.
      - Consultar `cron.job_run_details` y confirmar una ejecución satisfactoria de los datos controlados.

### Checkpoint B — Persistencia

No iniciar interfaces conectadas hasta registrar:

1. `pnpm exec supabase db reset`, `pnpm exec supabase db lint --local --fail-on error` y T044–T053 con salida 0; cada tarea T044–T053 debe conservar su propio registro de evidencia, resultado observado, archivos y bloqueos resueltos antes de cerrar esta puerta.
2. `pnpm exec supabase migration list --local` muestra todas las migraciones generadas por CLI en orden y sin divergencias.
3. Las siete funciones críticas disponibles y atómicas.
4. RLS, grants y privilegios predeterminados cerrados.
5. Cero acceso público a respuestas correctas, respuestas privadas o puntuaciones arbitrarias.
6. Seed exclusivo de local/Preview con al menos diez preguntas publicadas, sincronizado y sin duplicados respecto de la migración de datos de Production.

---

## Fase 4 — Inicio de partida

**Objetivo**: permitir comprender Antídoto, validar un alias, crear una sesión completa y recuperar su estado mediante una cookie opaca.

- [ ] 4.1 T054 [US2] [P] [BACKEND] Responsable: Líder backend
      Implementar normalización y validación del alias con NFC, trim, 3–20 grafemas visibles, caracteres permitidos y lista bloqueada exacta.
      Archivos:
      - `src/features/game/domain/alias.ts`
      - `src/features/game/domain/alias.test.ts`
      - `src/features/game/content/blocked-aliases.v1.json`
      - `specs/001-trivia-mvp-flow/evidence/blocked-aliases-review.md`
      Depende de: Checkpoint B
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/domain/alias.test.ts`.
      - Confirmar alias vacío, espacios, 2/3/20/21 grafemas, Unicode normalizable, caracteres inválidos, guiones y guion bajo.
      - Confirmar como mínimo `admin`, `ADMIN`, ` admin ` y `Antídoto` como bloqueados; confirmar un alias permitido y coincidencias parciales permitidas.
      - Confirmar que ruta, esquema, versión, contenido, normalización y gobierno reproducen exactamente el fixture canónico de `spec.md`, incluida la ausencia de consultas a servicios externos o bases remotas.
      - Registrar la aprobación del Líder técnico como Responsable de Contenido y Moderación; si cambió normalización o formato, registrar también la revisión técnica del Líder backend. Sin esas aprobaciones T054 permanece pendiente.

- [ ] 4.2 T055 [US2] [P] [BACKEND] Responsable: Líder backend
      Implementar una política única de creación y expiración de `antidoto_session` para juego activo y resultado final, sin extender los cortes fijados por PostgreSQL.
      Archivos:
      - `src/lib/security/session-cookie.ts`
      - `src/lib/security/session-cookie.test.ts`
      Depende de: T020, Checkpoint B
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- src/lib/security/session-cookie.test.ts`.
      - Confirmar que las funciones de escritura y expiración comparten nombre `antidoto_session`, `httpOnly`, `sameSite=lax`, `path=/` y `secure` fuera de HTTP local.
      - Confirmar `expires === session_expires_at` y `maxAge=floor(clamp(segundos_restantes, 0, 86400))`.
      - Confirmar que la variante final usa `result_access_until` y `maxAge=floor(clamp(segundos_restantes, 0, 604800))`.
      - Confirmar que la variante de expiración usa `Max-Age=0` y fecha pasada sin aceptar nombre, path ni atributos externos.

- [ ] 4.3 T056 [US2] [P] [BACKEND] Responsable: Líder backend
      Incorporar `api.start_game` al gateway central y validar su salida antes de mapearla al contrato público.
      Archivos:
      - `src/features/game/infrastructure/supabase-game-gateway.ts`
      - `src/features/game/infrastructure/supabase-game-gateway.start.test.ts`
      Depende de: T017, T019, T034, Checkpoint B
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/infrastructure/supabase-game-gateway.start.test.ts`.
      - Confirmar que no salen hash, UUID, lista completa de preguntas ni `session_expires_at` dentro del resultado público.

- [ ] 4.4 T057 [US2] [BACKEND] Responsable: Líder backend
      Implementar el caso de uso de inicio con alias validado, token no predecible, hash y `RoundSize` validado desde el entorno.
      Archivos:
      - `src/features/game/application/start-game.ts`
      - `src/features/game/application/start-game.test.ts`
      Depende de: T011, T020, T054, T056
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/application/start-game.test.ts`.
      - Confirmar que el caso de uso no acepta puntuación, estado, sesión, tamaño de ronda ni preguntas desde el formulario.
      - Confirmar que el único tamaño enviado a la RPC procede de `RoundSizeSchema`; probar `1`, `5`, `10` y Production con `5`.

- [ ] 4.5 T058 [US2] [BACKEND] Responsable: Líder backend
      Implementar la Server Action de inicio, escribir la cookie tras confirmar la ronda y devolver el `nextPath` contractual sin navegar.
      Archivos:
      - `src/features/game/actions/start-game.action.ts`
      - `src/features/game/actions/start-game.action.test.ts`
      Depende de: T055, T057
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/actions/start-game.action.test.ts`.
      - Confirmar que el éxito escribe cookie y devuelve `nextPath="/play"` sin ejecutar redirect.
      - Confirmar que cada error conserva alias permitido y no emite `Set-Cookie`.

- [ ] 4.6 T059 [US5] [BACKEND] Responsable: Líder backend
      Incorporar la lectura pura `api.get_game_state` al gateway central con variantes pendiente, respondida, finalizada y vencida.
      Archivos:
      - `src/features/game/infrastructure/supabase-game-gateway.ts`
      - `src/features/game/infrastructure/supabase-game-gateway.state.test.ts`
      Depende de: T035, T056
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/infrastructure/supabase-game-gateway.state.test.ts`.
      - Confirmar validación Zod de las variantes recuperables y mapeo de vencida a `SESSION_INVALID`, con ausencia de solución en la variante pendiente.
      - Confirmar mediante mocks que el gateway ejecuta una sola RPC de lectura y no emite `insert`, `update`, `delete` ni otra RPC de mutación.

- [ ] 4.7 T060 [US5] [BACKEND] Responsable: Líder backend
      Implementar la recuperación pura desde cookie y la salida irrecuperable mediante `clearInvalidSession`, sin aceptar ID ni mutar la sesión.
      Archivos:
      - `src/features/game/domain/session-state.ts`
      - `src/features/game/domain/session-state.test.ts`
      - `src/features/game/application/get-game-state.ts`
      - `src/features/game/application/get-game-state.test.ts`
      - `src/features/game/actions/clear-invalid-session.action.ts`
      Depende de: T020, T055, T059
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/domain/session-state.test.ts`.
      - Ejecutar `pnpm test -- src/features/game/application/get-game-state.test.ts`.
      - Confirmar transiciones `started → in_progress → finished`, invalidación permitida y que estados terminales nunca retroceden.
      - Confirmar token ausente/malformado, sesión pendiente/respondida/finalizada e inválida.
      - Confirmar que ninguna lectura cambia `status`, `invalidated_at`, `last_activity_at`, `expires_at` ni escribe en tablas.
      - Confirmar que cookie ausente, cookie presente desconocida/malformada, sesión invalidada y resultado vencido proyectan el mismo mensaje y las mismas acciones públicas, sin confundir sus códigos internos.
      - Confirmar que la cookie ausente produce enlaces normales sin `Set-Cookie`; solo una cookie presente que deba retirarse habilita `clearInvalidSession`.
      - Invocar `clearInvalidSession` con cookie presente, ausente y ya expirada; confirmar `Max-Age=0`, `expires` pasado, `httpOnly`, `sameSite=lax`, `path=/`, política `secure` compartida y `redirect("/")`.
      - Confirmar por imports/mocks que la acción no acepta argumentos, no invoca Supabase/gateway, no crea/finaliza partidas y solo afecta `antidoto_session`.

- [ ] 4.8 T061 [US2] [FRONTEND] Responsable: Líder frontend
      Crear la estructura semántica del formulario de alias con etiqueta, ayuda, aviso de ranking público y acción accesible.
      Archivos:
      - `src/components/game/alias-form.tsx`
      - `src/components/game/alias-form.test.tsx`
      Depende de: T012, T058
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/components/game/alias-form.test.tsx`.
      - Confirmar campo etiquetado, ayuda de 3–20 caracteres, aviso de que alias/puntuación pueden aparecer en ranking y botón alcanzable con teclado.

- [ ] 4.9 T062 [US2] [FRONTEND] Responsable: Líder frontend
      Añadir errores asociados, conservación del valor y devolución de foco al campo cuando el alias falla.
      Archivos:
      - `src/components/game/alias-form.tsx`
      - `src/components/game/alias-form.test.tsx`
      Depende de: T061
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/components/game/alias-form.test.tsx`.
      - Enviar alias vacío e inválido; confirmar `aria-describedby`, mensaje claro, valor conservado y foco en el campo.

- [ ] 4.10 T063 [US2] [FRONTEND] Responsable: Líder frontend
      Conectar el formulario con la Server Action, mostrar estado pendiente y bloquear envíos duplicados.
      Archivos:
      - `src/components/game/alias-form.tsx`
      - `src/components/game/alias-form.test.tsx`
      Depende de: T058, T062
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/components/game/alias-form.test.tsx`.
      - Simular una promesa pendiente y confirmar `aria-busy`, botón deshabilitado y una sola invocación ante doble clic.
      - Confirmar que el componente navega a `nextPath` solo después de recibir éxito de T058.

- [ ] 4.11 T064 [US1] [FRONTEND] Responsable: Líder frontend
      Construir la página inicial con propósito educativo claro, instrucciones breves, formulario y enlace público al ranking.
      Archivos:
      - `src/app/page.tsx`
      Depende de: T063
      Paralela: No
      Verificación:
      - Ejecutar `pnpm build`.
      - Abrir `/` a `320x800`, recorrerla solo con teclado y confirmar propósito, aviso de ranking público, acción principal y enlace a `/leaderboard` sin scroll horizontal.

- [ ] 4.12 T065 [US2] [TESTING] Responsable: Líder QA de automatización
      Probar la página inicial montada con alias válido, errores accesibles, aviso público, estado pendiente y navegación posterior.
      Archivos:
      - `tests/components/start-page.test.tsx`
      Depende de: T063, T064
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- tests/components/start-page.test.tsx`.
      - Confirmar uso de teclado, una sola llamada, mensajes por código, aviso alias/puntuación y navegación al `nextPath` devuelto.

- [ ] 4.13 T066 [US2] [P] [TESTING] Responsable: Líder QA de automatización
      Probar que un inicio válido con `RoundSize=5` crea una sesión, cinco asignaciones y una cookie con la expiración devuelta.
      Archivos:
      - `tests/integration/start-game-success.test.ts`
      Depende de: T058, T064
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/start-game-success.test.ts`.
      - Confirmar una sesión, posiciones `1..5`, orden estable y cookie sin UUID/hash visible.

- [ ] 4.14 T067 [US2] [P] [TESTING] Responsable: Líder QA de automatización
      Probar que escasez de preguntas o fallo transaccional no deja sesión, asignación ni cookie utilizable.
      Archivos:
      - `tests/integration/start-game-rollback.test.ts`
      Depende de: T058, T064
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/start-game-rollback.test.ts`.
      - Contar sesiones/asignaciones antes y después de cada fallo y confirmar igualdad.

- [ ] 4.15 T068 [US5] [P] [TESTING] Responsable: Líder QA de automatización
      Probar recuperación de la sesión iniciada por hash de cookie, orden persistido y lectura completamente libre de escrituras.
      Archivos:
      - `tests/integration/get-game-state.test.ts`
      Depende de: T060, T066
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/get-game-state.test.ts`.
      - Recargar el estado dos veces y confirmar misma pregunta, mismo orden y fila completa sin cambios.
      - Vencer una sesión controlada y confirmar `SESSION_INVALID` sin cambios en `status`, `invalidated_at`, actividad, expiración ni conteos relacionados.

---

## Fase 5 — Flujo de juego

**Objetivo**: mostrar una pregunta por vez, aceptar una sola respuesta autoritativa, enseñar mediante retroalimentación y recuperar el progreso confirmado.

- [ ] 5.1 T069 [US3] [BACKEND] Responsable: Líder backend
      Mapear el estado pendiente a `PublicQuestion` y `RoundProgress`, eliminando cualquier campo no permitido antes de cruzar la frontera de presentación.
      Archivos:
      - `src/features/game/application/get-game-state.ts`
      - `src/features/game/application/get-game-state.test.ts`
      Depende de: T060
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/application/get-game-state.test.ts`.
      - Inyectar una fila interna con solución, UUID y hash; confirmar que la salida pendiente contiene solo referencia pública, mecánica, enunciado, imagen opcional, opciones y progreso.

- [ ] 5.2 T070 [US5] [P] [FRONTEND] Responsable: Líder frontend
      Crear el indicador “Pregunta X de Y” con texto redundante y barra visual accesible.
      Archivos:
      - `src/components/game/round-progress.tsx`
      - `src/components/game/round-progress.test.tsx`
      Depende de: T012, T069
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- src/components/game/round-progress.test.tsx`.
      - Confirmar texto perceptible, valores `1/5` y `5/5`, y ausencia de información transmitida solo por color.

- [ ] 5.3 T071 [US3] [P] [FRONTEND] Responsable: Líder frontend
      Crear la imagen de pregunta con `next/image`, dimensiones estables, alternativa informativa y fallback que no impida responder.
      Archivos:
      - `src/components/game/question-image.tsx`
      - `src/components/game/question-image.test.tsx`
      Depende de: T004, T069
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- src/components/game/question-image.test.tsx`.
      - Confirmar `alt`, `width`, `height`, `sizes` y alternativa/reintento visible ante error.
      - Reservar la medición real de cambio de layout para T127.

- [ ] 5.4 T072 [US3] [P] [FRONTEND] Responsable: Líder frontend
      Crear el formulario de selección única con `fieldset`, `legend`, 2–4 radios nativos y etiqueta táctil completa.
      Archivos:
      - `src/components/game/question-form.tsx`
      - `src/components/game/question-form.test.tsx`
      Depende de: T012, T069
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- src/components/game/question-form.test.tsx`.
      - Confirmar una sola opción seleccionable, nombre accesible y etiqueta completa activable.
      - Confirmar clases/estilos de objetivo táctil; reservar la medición real de `44x44` para T127/T130.

- [ ] 5.5 T073 [US3] [FRONTEND] Responsable: Líder frontend
      Implementar navegación de radios con flechas/Espacio y error asociado al intentar enviar sin selección.
      Archivos:
      - `src/components/game/question-form.tsx`
      - `src/components/game/question-form.test.tsx`
      Depende de: T072
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/components/game/question-form.test.tsx`.
      - Usar `userEvent.keyboard` sin clics; confirmar cambio de selección y foco en el primer radio tras envío vacío.

- [ ] 5.6 T074 [US3] [FRONTEND] Responsable: Líder frontend
      Añadir estado “Comprobando…”, `aria-busy`, selección conservada y bloqueo de doble envío.
      Archivos:
      - `src/components/game/question-form.tsx`
      - `src/components/game/question-form.test.tsx`
      Depende de: T073
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/components/game/question-form.test.tsx`.
      - Resolver una acción diferida y confirmar botón estable/deshabilitado, una invocación ante doble activación y selección visible.

- [ ] 5.7 T075 [US3] [BACKEND] Responsable: Líder backend
      Incorporar `api.submit_answer` al gateway central, reconciliar reintentos, rechazar sesiones vencidas y retirar metadatos internos del resultado público.
      Archivos:
      - `src/features/game/infrastructure/supabase-game-gateway.ts`
      - `src/features/game/infrastructure/supabase-game-gateway.submit.test.ts`
      Depende de: T036, T059
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/infrastructure/supabase-game-gateway.submit.test.ts`.
      - Confirmar que `accepted_new` y `session_expires_at` se usan internamente pero no aparecen en `AnswerResult`.
      - Simular `expires_at <= now()` y confirmar `SESSION_INVALID`; si la RPC materializa `invalidated`, exigir el resultado interno etiquetado y verificar que la transacción quedó confirmada antes de mapearlo.

- [ ] 5.8 T076 [US3] [BACKEND] Responsable: Líder backend
      Implementar el caso de uso de respuesta con validación Zod de referencias y asociación exclusiva a la sesión resuelta.
      Archivos:
      - `src/features/game/application/submit-answer.ts`
      - `src/features/game/application/submit-answer.test.ts`
      Depende de: T017, T075
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/application/submit-answer.test.ts`.
      - Confirmar rechazo de selección ausente, referencia malformada y campos extra de puntuación/corrección.
      - Confirmar que una sesión vencida se rechaza antes de registrar la respuesta y que nunca se devuelve una transición de invalidación no confirmada.

- [ ] 5.9 T077 [US3] [BACKEND] Responsable: Líder backend
      Implementar la Server Action de respuesta usando solo la cookie; reemitirla únicamente durante el reintento idempotente de `submitAnswer`, con la expiración ya confirmada.
      Archivos:
      - `src/features/game/actions/submit-answer.action.ts`
      - `src/features/game/actions/submit-answer.action.test.ts`
      Depende de: T055, T076
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/actions/submit-answer.action.test.ts`.
      - Confirmar primera aceptación, reintento canónico, error recuperable con selección conservable y ausencia de IDs de sesión aceptados desde `FormData`.
      - Confirmar que la primera aceptación emite la cookie actualizada y únicamente el replay idempotente la reemite hasta exactamente el mismo `session_expires_at`, sin ampliarlo; ningún GET ni otra lectura reemite la cookie.

- [ ] 5.10 T078 [US4] [P] [FRONTEND] Responsable: Líder frontend
      Crear el panel con resultado textual e iconográfico, explicación, señales, recomendación y solución solo cuando el contrato la permite.
      Archivos:
      - `src/components/game/feedback-panel.tsx`
      - `src/components/game/feedback-panel.test.tsx`
      Depende de: T012, T016, T077
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- src/components/game/feedback-panel.test.tsx`.
      - Confirmar variantes correcta/incorrecta, una o más señales, recomendación y que el significado permanece en escala de grises.

- [ ] 5.11 T079 [US4] [FRONTEND] Responsable: Líder frontend
      Integrar la respuesta aceptada en la misma vista, congelar opciones y conservar selección ante un fallo recuperable.
      Archivos:
      - `src/components/game/question-form.tsx`
      - `src/components/game/question-form.test.tsx`
      Depende de: T074, T077, T078
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/components/game/question-form.test.tsx`.
      - Confirmar que una respuesta aceptada no puede cambiarse y que un error ofrece “Reintentar” sin perder selección.

- [ ] 5.12 T080 [US4] [FRONTEND] Responsable: Líder frontend
      Añadir una región preexistente `role=status`, anuncio único y conservación de foco al revelar retroalimentación.
      Archivos:
      - `src/components/game/feedback-panel.tsx`
      - `src/components/game/feedback-panel.test.tsx`
      Depende de: T078, T079
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/components/game/feedback-panel.test.tsx`.
      - Confirmar `aria-live=polite`, `aria-atomic=true`, anuncio de resultado/explicación/señal/recomendación una vez y foco sin salto a la región.

- [ ] 5.13 T081 [US5] [BACKEND] Responsable: Líder backend
      Incorporar `api.advance_game` al gateway central, rechazar sesiones vencidas y validar la siguiente pregunta pública sin renovar actividad.
      Archivos:
      - `src/features/game/infrastructure/supabase-game-gateway.ts`
      - `src/features/game/infrastructure/supabase-game-gateway.advance.test.ts`
      Depende de: T037, T075
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/infrastructure/supabase-game-gateway.advance.test.ts`.
      - Confirmar avance único y mapeo de repetición/última posición a `ADVANCE_NOT_ALLOWED`.
      - Confirmar `SESSION_INVALID` para una sesión vencida antes de avanzar; si se materializa `invalidated`, verificar resultado etiquetado y transacción confirmada.

- [ ] 5.14 T082 [US5] [BACKEND] Responsable: Líder backend
      Implementar el caso de uso de avance sin recibir posición ni pregunta desde el cliente.
      Archivos:
      - `src/features/game/application/advance-game.ts`
      - `src/features/game/application/advance-game.test.ts`
      Depende de: T081
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/application/advance-game.test.ts`.
      - Confirmar que solo el hash de cookie llega al gateway y que ningún camino renueva la sesión.
      - Confirmar que el caso de uso no acepta como exitoso un avance ni una invalidación no confirmados.

- [ ] 5.15 T083 [US5] [BACKEND] Responsable: Líder backend
      Implementar la Server Action de avance asociada exclusivamente a la cookie.
      Archivos:
      - `src/features/game/actions/advance-game.action.ts`
      - `src/features/game/actions/advance-game.action.test.ts`
      Depende de: T055, T082
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/actions/advance-game.action.test.ts`.
      - Confirmar salida para siguiente pregunta, sesión inválida, sesión finalizada y avance no permitido.
      - Confirmar que una sesión vencida no avanza y que la acción no fabrica ni revierte su estado.

- [ ] 5.16 T084 [US5] [FRONTEND] Responsable: Líder frontend
      Conectar “Continuar”, impedir saltos y mover el foco al encabezado de la nueva pregunta.
      Archivos:
      - `src/components/game/question-form.tsx`
      - `src/components/game/question-form.test.tsx`
      Depende de: T079, T080, T083
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/components/game/question-form.test.tsx`.
      - Confirmar una sola invocación, progreso actualizado y foco en un encabezado con `tabIndex=-1`.

- [ ] 5.17 T085 [US5] [P] [FRONTEND] Responsable: Líder frontend
      Crear el estado visible y accesible de carga de `/play`.
      Archivos:
      - `src/app/play/loading.tsx`
      Depende de: T012, T069
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm build`.
      - Simular navegación lenta a `/play` y confirmar texto de carga perceptible sin bloquear navegación global.

- [ ] 5.18 T086 [US3] [FRONTEND] Responsable: Líder frontend
      Integrar `/play` como Server Component dinámico para estados pendiente/respondido/finalizado y presentar la vista segura común cuando no haya una partida recuperable.
      Archivos:
      - `src/app/play/page.tsx`
      Depende de: T060, T070, T071, T084, T085
      Paralela: No
      Verificación:
      - Ejecutar `pnpm build`.
      - Abrir fixtures de los cuatro estados; confirmar pregunta o feedback correctos, redirección terminal a `/results` y regreso al inicio para sesión irrecuperable.
      - Confirmar que el GET y el Server Component no emiten `Set-Cookie` ni escriben en Supabase y que la vista segura muestra el mensaje canónico, “Consultar ranking” e “Iniciar otra partida”.
      - Sin cookie, confirmar enlaces normales y cero escrituras. Con cookie presente desconocida, malformada o invalidada, activar “Iniciar otra partida” mediante `clearInvalidSession` y confirmar `Set-Cookie` para `antidoto_session` con `Max-Age=0`, seguido de redirección a `/`.

- [ ] 5.19 T087 [US3] [TESTING] Responsable: Líder QA de automatización
      Probar la composición de `/play`, el orden de lectura y los estados recuperable/no recuperable.
      Archivos:
      - `tests/components/play-page.test.tsx`
      Depende de: T086
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- tests/components/play-page.test.tsx`.
      - Confirmar encabezado/progreso antes de opciones, error seguro con acción concreta y ausencia de solución pendiente.

- [ ] 5.20 T088 [US5] [P] [TESTING] Responsable: Líder QA de automatización
      Probar recuperación de estado pendiente, respondido y vencido sin autoavance ni escritura alguna.
      Archivos:
      - `tests/integration/game-state-recovery.test.ts`
      Depende de: T077, T083, T086
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/game-state-recovery.test.ts`.
      - Comparar antes/después filas completas, conteos relacionados y marcas de tiempo; confirmar que `status`, `invalidated_at`, actividad, expiración, cursor y respuestas no cambian.
      - Para `expires_at <= now()`, confirmar proyección `SESSION_INVALID` con idénticos datos persistidos.

- [ ] 5.21 T089 [US3] [P] [TESTING] Responsable: Líder QA de automatización
      Probar una respuesta correcta con 100 puntos y retroalimentación completa.
      Archivos:
      - `tests/integration/submit-correct-answer.test.ts`
      Depende de: T077, T086
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/submit-correct-answer.test.ts`.
      - Confirmar una fila, `outcome="correct"`, `pointsAwarded=100` y ausencia de `isCorrect`/`correctOptionRef`.

- [ ] 5.22 T090 [US3] [P] [TESTING] Responsable: Líder QA de automatización
      Probar una respuesta incorrecta con cero puntos y solución revelada solo después de aceptar.
      Archivos:
      - `tests/integration/submit-incorrect-answer.test.ts`
      Depende de: T077, T086
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/submit-incorrect-answer.test.ts`.
      - Confirmar `outcome="incorrect"`, `pointsAwarded=0` y `correctOptionRef` solo después de aceptar.
      - Comparar salida antes/después para demostrar que la opción correcta no estaba anticipada.

- [ ] 5.23 T091 [US3] [P] [TESTING] Responsable: Líder QA de automatización
      Probar rechazo de pregunta no asignada o fuera del cursor sin modificar la sesión.
      Archivos:
      - `tests/integration/reject-unassigned-question.test.ts`
      Depende de: T077
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/reject-unassigned-question.test.ts`.
      - Confirmar `QUESTION_NOT_ASSIGNED`, cero respuestas nuevas y cursor estable.

- [ ] 5.24 T092 [US3] [P] [TESTING] Responsable: Líder QA de automatización
      Probar rechazo de opción inexistente o perteneciente a otra pregunta.
      Archivos:
      - `tests/integration/reject-foreign-option.test.ts`
      Depende de: T077
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/reject-foreign-option.test.ts`.
      - Confirmar `OPTION_NOT_ALLOWED`, cero escrituras y ningún dato sobre la solución.

- [ ] 5.25 T093 [US3] [P] [TESTING] Responsable: Líder QA de automatización
      Probar doble envío y carrera concurrente con una sola respuesta y una única puntuación.
      Requisito: SC-006 | Constitución XI — Verificación antes de completar.
      Archivos:
      - `tests/integration/submit-answer-concurrency.test.ts`
      Depende de: T077
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/submit-answer-concurrency.test.ts`.
      - Confirmar una fila, primer resultado canónico y reintento sin extensión adicional.

- [ ] 5.26 T094 [US5] [P] [TESTING] Responsable: Líder QA de automatización
      Probar avance válido, repetido, pendiente y desde la quinta retroalimentación.
      Archivos:
      - `tests/integration/advance-game.test.ts`
      Depende de: T083
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/advance-game.test.ts`.
      - Confirmar incremento máximo de una posición, sin saltos y sin renovación de expiración.
      - Vencer la sesión antes de avanzar y confirmar cursor/respuestas intactos, invalidación atómica confirmada y `SESSION_INVALID`.

- [ ] 5.27 T095 [US5] [P] [TESTING] Responsable: Líder QA de automatización
      Probar acceso directo y `clearInvalidSession()` con cookie ausente/malformada, sesión inexistente, invalidada o ya finalizada.
      Archivos:
      - `tests/integration/play-session-errors.test.ts`
      Depende de: T060, T086
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/play-session-errors.test.ts`.
      - Confirmar regreso seguro al inicio o a resultados, sin detalles internos ni reapertura de sesión.
      - Para `SESSION_NOT_FOUND`, `SESSION_INVALID` y `RESULT_ACCESS_EXPIRED`, confirmar códigos internos distintos y exactamente el mismo mensaje y acciones públicas.
      - Con cookie ausente, confirmar enlaces normales, ausencia de formulario y cero `Set-Cookie`. Con cookie presente desconocida/malformada o sesión invalidada, confirmar que el formulario no envía identificador alguno y que la acción expira solo `antidoto_session` con los atributos contractuales antes de redirigir a `/`.
      - Repetir la acción de higiene después de retirar la cookie y confirmar salida idempotente; comparar Supabase antes/después para demostrar cero escrituras, creación o finalización.
      - Para una sesión finalizada, confirmar redirección a `/results`, conservación de la cookie y ausencia de la acción de limpieza.

- [ ] 5.28 T096 [US4] [TESTING] Responsable: Líder QA de automatización
      Probar el corte completo hasta retroalimentación y avance antes de habilitar resultados.
      Archivos:
      - `tests/e2e/game-feedback.spec.ts`
      Depende de: T087, T088, T089, T090, T093, T094
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec playwright test tests/e2e/game-feedback.spec.ts`.
      - Iniciar, responder, oír/leer feedback, continuar y confirmar que no existe doble respuesta.

### Checkpoint C — Juego

No iniciar resultados hasta registrar:

1. Inicio válido con cinco preguntas.
2. Una respuesta correcta y una incorrecta validadas por servidor.
3. Rechazo de pregunta, opción y respuesta duplicada sin escrituras parciales.
4. Retroalimentación educativa completa, anunciada una vez y visible en la misma página.
5. Avance de una sola posición; todas las lecturas y recargas, incluida la proyección de una sesión vencida como `SESSION_INVALID`, dejan sin cambios `status`, `invalidated_at`, actividad, expiración y todas las tablas.
6. `pnpm exec playwright test tests/e2e/game-feedback.spec.ts` con salida 0.
7. T060, T086 y T095 verificadas: la vista segura usa enlaces normales cuando no hay
   cookie; con cookie desconocida/malformada o invalidada, “Iniciar otra partida”
   puede usar `clearInvalidSession`, que expira solo `antidoto_session` y redirige a
   `/` sin aceptar identificadores ni cambiar datos en Supabase.
8. `submit_answer` y `advance_game` rechazan primero las sesiones vencidas; cualquier materialización de `invalidated` queda confirmada atómicamente antes de devolver el resultado.

---

## Fase 6 — Resultados y ranking

**Objetivo**: congelar el resultado autoritativo, mostrarlo y consultar una clasificación pública consistente sin duplicar datos.

### 6.1 Finalización de partida

- [ ] 6.1.1 T097 [US6] [BACKEND] Responsable: Líder backend
      Incorporar `api.finish_game` al gateway central, rechazar sesiones activas vencidas y validar que una repetición devuelve el resultado histórico y el mismo `result_access_until`.
      Archivos:
      - `src/features/game/infrastructure/supabase-game-gateway.ts`
      - `src/features/game/infrastructure/supabase-game-gateway.finish.test.ts`
      Depende de: T038, T081, Checkpoint C
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/infrastructure/supabase-game-gateway.finish.test.ts`.
      - Confirmar que alias, puntuación, aciertos, total, regla, fecha interna y `result_access_until` permanecen idénticos en dos respuestas.
      - Confirmar que `result_access_until` permanece como metadato interno y no entra en `FinalResult`.
      - Confirmar que una sesión vencida devuelve `SESSION_INVALID` antes del cálculo; si se materializa `invalidated`, verificar que la transición se confirmó en la misma transacción.

- [ ] 6.1.2 T098 [US6] [BACKEND] Responsable: Líder backend
      Implementar el caso de uso de finalización sin aceptar puntuación, aciertos, fecha ni ID de sesión desde el cliente.
      Archivos:
      - `src/features/game/application/finish-game.ts`
      - `src/features/game/application/finish-game.test.ts`
      Depende de: T017, T097
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/application/finish-game.test.ts`.
      - Confirmar cálculo de `maxScore` desde el `RoundSize` persistido y la regla guardada, sin un máximo fijo separado, y mensaje educativo contractual.
      - Probar cálculo final con cero, combinación parcial y todas correctas, sin recalcular desde contenido mutable.

- [ ] 6.1.3 T099 [US6] [BACKEND] Responsable: Líder backend
      Implementar la Server Action de finalización asociada solo a la cookie, sincronizarla con `result_access_until` y preparar la navegación a `/results`.
      Archivos:
      - `src/features/game/actions/finish-game.action.ts`
      - `src/features/game/actions/finish-game.action.test.ts`
      Depende de: T055, T098
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/actions/finish-game.action.test.ts`.
      - Confirmar éxito repetido, sesión incompleta, inválida y ausente sin aceptar campos de resultado.
      - Confirmar `Set-Cookie` hasta el mismo `result_access_until` en éxito y replay idempotente, con máximo 604800 y sin prolongación.
      - Simular `GAME_FINISH_FAILED` y confirmar error recuperable sin perder respuestas ni fabricar resultado.

- [ ] 6.1.4 T100 [US6] [FRONTEND] Responsable: Líder frontend
      Conectar “Ver resultados” únicamente en la quinta retroalimentación, mantenerla visible durante el envío y admitir reintento idempotente.
      Archivos:
      - `src/components/game/question-form.tsx`
      - `src/components/game/question-form.test.tsx`
      Depende de: T084, T099
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/components/game/question-form.test.tsx`.
      - Confirmar que preguntas 1–4 muestran “Continuar”, la quinta muestra “Ver resultados” y el doble envío no duplica finalización.
      - Simular `GAME_FINISH_FAILED`; confirmar feedback conservado, mensaje accesible y acción “Reintentar” que acepta el resultado canónico posterior.

### 6.2 Resultado final

- [ ] 6.2.1 T101 [US6] [BACKEND] Responsable: Líder backend
      Incorporar la lectura pura `api.get_game_result` al gateway central, respetar `result_access_until` y proyectar el mismo `FinalResult` sin renovar ni modificar la sesión.
      Archivos:
      - `src/features/game/infrastructure/supabase-game-gateway.ts`
      - `src/features/game/infrastructure/supabase-game-gateway.result.test.ts`
      Depende de: T039, T097
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/infrastructure/supabase-game-gateway.result.test.ts`.
      - Confirmar ausencia de fecha, UUID, hash, respuestas y soluciones en `FinalResult`.
      - Comparar la base completa antes/después para una sesión activa vencida; confirmar `SESSION_INVALID` y cero cambios.
      - Superar `result_access_until` en una finalizada; confirmar `RESULT_ACCESS_EXPIRED`, estado `finished` y cero cambios de fechas, hash o tablas.

- [ ] 6.2.2 T102 [US6] [BACKEND] Responsable: Líder backend
      Implementar la consulta pura del resultado por cookie, distinguir ronda incompleta, acceso al resultado vencido y sesión irrecuperable, y mantenerla libre de mutaciones de cookie y Supabase.
      Archivos:
      - `src/features/game/application/get-game-result.ts`
      - `src/features/game/application/get-game-result.test.ts`
      Depende de: T017, T055, T101
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/application/get-game-result.test.ts`.
      - Confirmar resultado final, regreso a `/play` para sesión activa y estado terminal seguro con ranking/nueva partida para `RESULT_ACCESS_EXPIRED`.
      - Confirmar que `SESSION_NOT_FOUND`, `SESSION_INVALID` y `RESULT_ACCESS_EXPIRED` conservan códigos internos distintos, pero producen el mismo mensaje y las mismas acciones públicas.
      - Confirmar que la cookie ausente no habilita `clearInvalidSession` ni emite `Set-Cookie`; una cookie presente desconocida/malformada o invalidada sí permite retirar únicamente `antidoto_session` mediante la acción explícita.
      - Inyectar una sesión vencida y confirmar que el caso de uso no invoca ningún método de escritura.

### 6.3 Pantalla de resultados

- [ ] 6.3.1 T103 [US6] [P] [FRONTEND] Responsable: Líder frontend
      Crear `/results` como Server Component dinámico con resultado accesible y vista segura común cuando no haya una partida recuperable; usar `clearInvalidSession` únicamente si existe una cookie inválida que retirar.
      Archivos:
      - `src/app/results/page.tsx`
      Depende de: T060, T102
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm build`.
      - Abrir un fixture finalizado y confirmar los seis datos, foco en el encabezado y ausencia de detalles de respuestas.
      - Abrir fixtures `SESSION_NOT_FOUND`, `SESSION_INVALID` y `RESULT_ACCESS_EXPIRED`; confirmar el mismo mensaje y las mismas acciones a ranking/nueva partida, sin mutación de cookie en GET.
      - Abrir sin cookie; confirmar enlaces normales y ausencia de `clearInvalidSession`. Repetir con cookie presente inválida; confirmar que “Iniciar otra partida” puede retirar solo `antidoto_session`.

- [ ] 6.3.2 T104 [US6] [FRONTEND] Responsable: Líder frontend
      Añadir acceso al ranking y reutilizar `AliasForm` con el alias actual precargado para confirmar o editar antes de crear una nueva sesión.
      Archivos:
      - `src/app/results/page.tsx`
      - `src/components/game/alias-form.tsx`
      - `src/components/game/alias-form.test.tsx`
      Depende de: T103
      Paralela: No
      Verificación:
      - Activar el ranking y el formulario solo con teclado; confirmar que el alias actual aparece como texto editable sin entrar en URL ni almacenamiento cliente.
      - Confirmar el alias sin cambios y editarlo en casos separados; ambos envíos crean token/sesión diferentes y no reabren la finalizada.

- [ ] 6.3.3 T105 [US6] [TESTING] Responsable: Líder QA de automatización
      Probar contenido, foco, replay con alias, acceso vencido y salida irrecuperable de la pantalla de resultados.
      Archivos:
      - `tests/components/results-page.test.tsx`
      Depende de: T104
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- tests/components/results-page.test.tsx`.
      - Confirmar alias como texto, resumen completo, cierre, ranking y formulario precargado para confirmar o editar.
      - Confirmar que `SESSION_NOT_FOUND`, `SESSION_INVALID` y `RESULT_ACCESS_EXPIRED` conservan códigos internos distintos y presentan exactamente el mismo mensaje y acciones públicas.
      - Confirmar que la cookie ausente usa enlaces normales sin `clearInvalidSession`; solo una cookie presente desconocida/malformada o invalidada permite la acción de higiene. Un resultado finalizado vigente conserva la cookie y no la muestra.

### 6.4 Consulta del ranking

- [ ] 6.4.1 T106 [US7] [BACKEND] Responsable: Líder backend
      Incorporar `api.get_leaderboard` al gateway central y validar una instantánea sin UUID, fechas ni datos educativos privados.
      Archivos:
      - `src/features/game/infrastructure/supabase-game-gateway.ts`
      - `src/features/game/infrastructure/supabase-game-gateway.leaderboard.test.ts`
      Depende de: T040, T101
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/infrastructure/supabase-game-gateway.leaderboard.test.ts`.
      - Confirmar máximo diez entradas, resultado actual opcional y rechazo de una salida que contenga UUID/fecha.
      - Confirmar que la validación no impone un máximo fijo de puntuación: la coherencia pertenece al `RoundSize` y regla persistidos y a las guardas SQL.

- [ ] 6.4.2 T107 [US7] [BACKEND] Responsable: Líder backend
      Implementar la consulta pública del ranking, usando cookie opcional solo para identificar la partida actual.
      Archivos:
      - `src/features/game/application/get-leaderboard.ts`
      - `src/features/game/application/get-leaderboard.test.ts`
      Depende de: T017, T055, T106
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/features/game/application/get-leaderboard.test.ts`.
      - Confirmar lista sin cookie, resultado actual válido, hash desconocido no bloqueante y `RANKING_UNAVAILABLE` seguro.

### 6.5 Vista del ranking

- [ ] 6.5.1 T108 [US7] [P] [FRONTEND] Responsable: Líder frontend
      Crear la lista semántica de hasta diez entradas con posición, alias como texto y puntuación.
      Archivos:
      - `src/components/leaderboard/leaderboard-list.tsx`
      - `src/components/leaderboard/leaderboard-list.test.tsx`
      Depende de: T012, T016, Checkpoint C
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- src/components/leaderboard/leaderboard-list.test.tsx`.
      - Renderizar un alias `<img onerror=...>` y confirmar que aparece como texto sin ejecutar contenido.

- [ ] 6.5.2 T109 [US7] [FRONTEND] Responsable: Líder frontend
      Identificar “Tu resultado” dentro del top o en un bloque separado fuera del top sin duplicarlo.
      Archivos:
      - `src/components/leaderboard/leaderboard-list.tsx`
      - `src/components/leaderboard/leaderboard-list.test.tsx`
      Depende de: T108
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/components/leaderboard/leaderboard-list.test.tsx`.
      - Renderizar fixtures en posición 3 y 14; confirmar una sola marca textual y que el orden de foco no cambia por el resaltado.

- [ ] 6.5.3 T110 [US7] [FRONTEND] Responsable: Líder frontend
      Añadir un estado vacío que indique que todavía no hay resultados y ofrezca una acción para iniciar una partida.
      Archivos:
      - `src/components/leaderboard/leaderboard-list.tsx`
      - `src/components/leaderboard/leaderboard-list.test.tsx`
      Depende de: T109
      Paralela: No
      Verificación:
      - Ejecutar `pnpm test -- src/components/leaderboard/leaderboard-list.test.tsx`.
      - Renderizar `entries=[]` y confirmar texto de estado vacío y enlace accesible a `/`.

- [ ] 6.5.4 T111 [US7] [P] [FRONTEND] Responsable: Líder frontend
      Crear el estado visible de carga de `/leaderboard`.
      Archivos:
      - `src/app/leaderboard/loading.tsx`
      Depende de: T012, Checkpoint C
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm build`.
      - Simular navegación lenta y confirmar un mensaje de carga perceptible.

- [ ] 6.5.5 T112 [US7] [FRONTEND] Responsable: Líder frontend
      Crear `/leaderboard` como Server Component dinámico/no-store con lista, resultado actual y enlaces de retorno.
      Archivos:
      - `src/app/leaderboard/page.tsx`
      Depende de: T107, T110, T111
      Paralela: No
      Verificación:
      - Ejecutar `pnpm build`.
      - Abrir sin cookie y con cookie finalizada; confirmar acceso público y representación contractual.
      - Confirmar que la respuesta personalizada no se almacena ni reutiliza entre cookies distintas.

- [ ] 6.5.6 T113 [US7] [FRONTEND] Responsable: Líder frontend
      Presentar `RANKING_UNAVAILABLE` como error no bloqueante con reintento, acción para jugar y regreso a resultados.
      Archivos:
      - `src/app/leaderboard/page.tsx`
      Depende de: T112
      Paralela: No
      Verificación:
      - Simular el fallo, confirmar `role=alert` y activar por teclado los enlaces a `/leaderboard`, `/` y `/results`.
      - Confirmar que el fallo no altera una sesión de juego activa.

### 6.6 Pruebas de resultados y ranking

- [ ] 6.6.1 T114 [US6] [P] [TESTING] Responsable: Líder QA de automatización
      Probar que una sesión incompleta no finaliza ni entra al ranking.
      Archivos:
      - `tests/integration/finish-incomplete-game.test.ts`
      Depende de: T099, T107
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/finish-incomplete-game.test.ts`.
      - Confirmar `GAME_NOT_COMPLETE`, estado sin cambio y ausencia en ranking.

- [ ] 6.6.2 T115 [US6] [P] [TESTING] Responsable: Líder QA de automatización
      Probar regla 100/0, puntuación derivada de `RoundSize` y dos finalizaciones con resultado, fecha y corte de acceso idénticos.
      Requisito: SC-007 | Constitución XI — Verificación antes de completar.
      Archivos:
      - `tests/integration/finish-game-idempotency.test.ts`
      Depende de: T099
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/finish-game-idempotency.test.ts`.
      - Confirmar puntuación máxima derivada para tamaños 1, 5 y 10; Production usa 5 y produce 500, sin otra constante de máximo, y una sola transición terminal.

- [ ] 6.6.3 T116 [US6] [P] [TESTING] Responsable: Líder QA de automatización
      Probar recuperación del resultado durante siete días y rechazo posterior sin ejecutar ninguna escritura.
      Archivos:
      - `tests/integration/get-game-result.test.ts`
      Depende de: T102, T115
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/get-game-result.test.ts`.
      - Comparar filas completas, conteos y marcas temporales antes/después de lecturas inmediatas, después de 24 horas y antes de siete días; confirmar el mismo resultado.
      - Superar `result_access_until` y confirmar `RESULT_ACCESS_EXPIRED`, estado `finished`, ranking intacto y cero cambios en hash, fechas o tablas.

- [ ] 6.6.4 T117 [US7] [P] [TESTING] Responsable: Líder QA de automatización
      Probar máximo diez y orden por puntuación descendente, finalización ascendente y UUID interno como último desempate.
      Requisito: SC-008 | Constitución XI — Verificación antes de completar.
      Archivos:
      - `tests/integration/leaderboard-ordering.test.ts`
      Depende de: T107, T115
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/leaderboard-ordering.test.ts`.
      - Confirmar orden estable y que fecha/UUID no aparecen en la salida.

- [ ] 6.6.5 T118 [US7] [P] [TESTING] Responsable: Líder QA de automatización
      Probar exclusión de sesiones iniciadas, en progreso e invalidadas y ausencia de duplicados.
      Archivos:
      - `tests/integration/leaderboard-eligibility.test.ts`
      Depende de: T107, T115
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/leaderboard-eligibility.test.ts`.
      - Confirmar una fila por sesión finalizada y cero filas de otros estados.

- [ ] 6.6.6 T119 [US7] [P] [TESTING] Responsable: Líder QA de automatización
      Probar identificación de la partida actual dentro y fuera del top diez.
      Archivos:
      - `tests/integration/leaderboard-current-player.test.ts`
      Depende de: T107, T115
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test:integration -- tests/integration/leaderboard-current-player.test.ts`.
      - Consultar con dos cookies finalizadas distintas y sin cookie; confirmar que cada respuesta marca solo su sesión y el visitante ninguna.
      - Confirmar una sola marca dentro del top o un único bloque fuera de él, nunca ambos.

- [ ] 6.6.7 T120 [US6] [P] [TESTING] Responsable: Líder QA de automatización
      Probar finalización, resultados, recarga, replay con alias, acceso vencido y limpieza de sesión irrecuperable desde la interfaz.
      Archivos:
      - `tests/e2e/results.spec.ts`
      Depende de: T104, T115, T116
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm exec playwright test tests/e2e/results.spec.ts`.
      - Confirmar resumen y recarga estable; confirmar y editar el alias en ejecuciones separadas y verificar token/sesión distintos.
      - Simular `SESSION_NOT_FOUND`, `SESSION_INVALID` y `RESULT_ACCESS_EXPIRED`; confirmar códigos internos distintos y exactamente el mismo mensaje y acciones públicas.
      - Para `RESULT_ACCESS_EXPIRED`, confirmar ranking/nueva partida sin transformar la sesión finalizada en inválida ni limpiar la cookie durante GET.
      - Forzar fallo recuperable en la primera finalización, reintentar y confirmar respuestas intactas, una sola puntuación y resultado canónico.
      - Abrir `/results` sin cookie y confirmar enlaces normales y cero `Set-Cookie`; repetir con cookie desconocida/malformada o sesión invalidada, activar “Iniciar otra partida” y confirmar que solo `antidoto_session` expira, la navegación termina en `/` y Supabase permanece sin cambios.

- [ ] 6.6.8 T121 [US7] [P] [TESTING] Responsable: Líder QA de automatización
      Probar ranking con datos, vacío, resultado fuera del top y fallo no bloqueante.
      Archivos:
      - `tests/e2e/leaderboard-states.spec.ts`
      Depende de: T113, T117, T118, T119
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm exec playwright test tests/e2e/leaderboard-states.spec.ts`.
      - Confirmar acceso sin sesión y que el fallo del ranking no impide comenzar una partida.
      - Usar dos contextos de navegador y un tercero sin cookie; confirmar que `isCurrentPlayer` no se filtra entre contextos.

---

## Fase 7 — Calidad, seguridad y despliegue

**Objetivo**: demostrar el flujo crítico, cerrar riesgos de accesibilidad/datos y promover exactamente los artefactos verificados a Preview y Production.

### 7.1 Flujo crítico end-to-end

- [ ] 7.1 T122 [US6] [P] [TESTING] Responsable: Líder QA de Release
      Probar el flujo completo de cinco preguntas desde inicio hasta resultado, ranking y nueva partida confirmando o editando el alias.
      Archivos:
      - `tests/e2e/game-flow.spec.ts`
      Depende de: T120, T121
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm exec playwright test tests/e2e/game-flow.spec.ts`.
      - Confirmar cinco respuestas, cinco retroalimentaciones, puntuación servidor, resultado visible, ranking consultable, alias precargado y sesión nueva al repetir.

- [ ] 7.2 T123 [US1] [P] [TESTING] Responsable: Líder QA de Accesibilidad e Investigación UX
      Completar el flujo crítico únicamente con teclado, sin APIs de puntero.
      Requisito: SC-003 | Constitución V — Accesibilidad obligatoria | Constitución XI — Verificación antes de completar.
      Archivos:
      - `tests/e2e/keyboard-flow.spec.ts`
      Depende de: T120, T121
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm exec playwright test tests/e2e/keyboard-flow.spec.ts`.
      - Confirmar orden lógico, radios operables con teclado, foco tras errores/avance/resultados y ausencia de trampas.

- [ ] 7.3 T124 [US5] [P] [TESTING] Responsable: Líder QA de automatización
      Probar recarga durante pregunta pendiente y durante retroalimentación.
      Archivos:
      - `tests/e2e/reload-game.spec.ts`
      Depende de: T120
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm exec playwright test tests/e2e/reload-game.spec.ts`.
      - Confirmar misma pregunta/selección canónica, progreso estable y una sola respuesta tras cada recarga.

- [ ] 7.4 T125 [US3] [P] [TESTING] Responsable: Líder QA de Seguridad
      Probar doble clic, doble activación de teclado y reintento tras respuesta HTTP incierta.
      Requisito: SC-006 | Constitución XI — Verificación antes de completar.
      Archivos:
      - `tests/e2e/double-submit.spec.ts`
      Depende de: T120
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm exec playwright test tests/e2e/double-submit.spec.ts`.
      - Confirmar un solo registro, una retroalimentación y una puntuación por pregunta.
      - Enviar una mutación con origen cruzado y confirmar rechazo; `allowedOrigins` permanece sin ampliar y `SameSite=Lax` actúa como segunda barrera.

- [ ] 7.5 T126 [US2] [P] [TESTING] Responsable: Líder QA de automatización
      Probar alias vacío, corto, largo, inválido y bloqueado desde la interfaz real.
      Archivos:
      - `tests/e2e/invalid-alias.spec.ts`
      Depende de: T065, T122
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm exec playwright test tests/e2e/invalid-alias.spec.ts`.
      - Confirmar error asociado, `aria-invalid`, foco en alias, valor conservado y cero cookies/sesiones nuevas para cada caso.
      - Confirmar que cada mensaje indica qué debe corregirse y la acción siguiente según `contracts/accessibility.md`.
      - Confirmar que el mensaje de `BLOCKED_ALIAS` es neutral, no revela el término bloqueado ni expone normalización, fixture o diagnóstico técnico.

### 7.2 Accesibilidad y experiencia móvil

- [ ] 7.6 T127 [US3] [P] [TESTING] Responsable: Líder QA de Accesibilidad e Investigación UX
      Verificar reflow de todo el flujo principal desde `320x640` sin desplazamiento horizontal.
      Archivos:
      - `tests/e2e/mobile-320.spec.ts`
      Depende de: T122
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm exec playwright test tests/e2e/mobile-320.spec.ts`.
      - En inicio, partida, feedback, resultados y ranking confirmar `scrollWidth <= clientWidth`, texto sin recorte y acción principal visible.
      - Retrasar la carga de una imagen de pregunta y comparar las posiciones de opciones/acción antes y después; confirmar que sus dimensiones reservadas evitan desplazamiento de layout.

- [ ] 7.7 T128 [US3] [P] [TESTING] Responsable: Líder QA de Accesibilidad e Investigación UX
      Verificar manualmente zoom del 200 % en cada pantalla y registrar evidencia.
      Archivos:
      - `specs/001-trivia-mvp-flow/evidence/accessibility/zoom-200.md`
      Depende de: T122
      Paralela: Sí
      Verificación:
      - En Chromium de escritorio aplicar zoom 200 % en `/`, pregunta, feedback, `/results` y `/leaderboard`.
      - Registrar viewport, navegador y capturas; confirmar sin scroll horizontal, superposición, pérdida de texto, foco oculto ni acción inaccesible.

- [ ] 7.8 T129 [US4] [P] [TESTING] Responsable: Líder QA de Accesibilidad e Investigación UX
      Verificar `prefers-reduced-motion` y ausencia de animaciones esenciales.
      Archivos:
      - `tests/e2e/reduced-motion.spec.ts`
      Depende de: T122
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm exec playwright test tests/e2e/reduced-motion.spec.ts`.
      - Emular `reducedMotion: reduce` y confirmar que progreso, feedback y navegación siguen siendo comprensibles sin transición.

- [ ] 7.9 T130 [US3] [P] [TESTING] Responsable: Líder QA de Accesibilidad e Investigación UX
      Verificar manualmente tamaños táctiles y finalización con una sola mano en un teléfono habitual.
      Requisito: SC-012 | Constitución V — Accesibilidad obligatoria | Constitución VI — Mobile-First y rendimiento | Constitución XI — Verificación antes de completar.
      Archivos:
      - `specs/001-trivia-mvp-flow/evidence/accessibility/one-hand-mobile.md`
      Depende de: T122
      Paralela: Sí
      Verificación:
      - En un teléfono físico cuyo viewport esté entre `360–430` CSS px completar cinco preguntas sosteniéndolo con una mano.
      - Registrar dispositivo; confirmar objetivos de al menos `44x44` CSS px, opción completa pulsable y ausencia de activaciones vecinas.

- [ ] 7.10 T131 [US4] [P] [TESTING] Responsable: Líder QA de Accesibilidad e Investigación UX
      Ejecutar la revisión manual de lector de pantalla, alto contraste, anuncios y foco.
      Archivos:
      - `specs/001-trivia-mvp-flow/evidence/accessibility/assistive-technology.md`
      Depende de: T123
      Paralela: Sí
      Verificación:
      - Con las versiones estables más recientes disponibles de NVDA y Chrome en Windows de escritorio recorrer alias, pregunta, error, feedback, resultados y ranking, según el perfil canónico de `contracts/accessibility.md`.
      - En modo de alto contraste confirmar foco visible e información no dependiente del color.
      - Registrar fecha y versiones de NVDA, Chrome y Windows; confirmar que feedback se anuncia una vez y el foco cumple `contracts/accessibility.md`.

### 7.3 Medios, seguridad y rendimiento

- [ ] 7.11 T132 [US3] [P] [TESTING] Responsable: Líder QA de Medios y Rendimiento
      Crear y probar un validador de activos locales para formato, peso recomendado/máximo, dimensiones, metadatos y utilizabilidad de imagen.
      Archivos:
      - `scripts/validate-question-media.mjs`
      - `tests/media/question-assets.test.ts`
      Depende de: T044, T071
      Paralela: Sí
      Verificación:
      - Ejecutar `node scripts/validate-question-media.mjs`.
      - Ejecutar `pnpm test -- tests/media/question-assets.test.ts`.
      - Confirmar solo AVIF/WebP/JPEG/PNG, aviso por superar el recomendado de `300000` bytes, rechazo al superar el máximo de `1000000` bytes y alternativa obligatoria para imágenes informativas.
      - Confirmar que cada activo decodifica, conserva relación de aspecto/dimensiones declaradas, tiene alternativa coherente y dispone de fallback que mantiene enunciado, opciones y acción utilizables.

- [ ] 7.12 T133 [US3] [P] [TESTING] Responsable: Líder QA de Medios y Rendimiento
      Auditar que toda imagen de pregunta use `next/image`, `sizes`, dimensiones y fallback contractual.
      Archivos:
      - `tests/media/next-image-usage.test.ts`
      Depende de: T132
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- tests/media/next-image-usage.test.ts`.
      - Buscar rutas de pregunta renderizadas con `<img>` directo o URL remota y confirmar cero hallazgos.

- [ ] 7.13 T134 [P] [TESTING] Responsable: Líder QA de Seguridad
      Auditar archivos fuente y bundle cliente para impedir exposición de secretos de Supabase.
      Requisito: FR-062 | Constitución VII — Seguridad de Supabase.
      Archivos:
      - `scripts/audit-client-secrets.mjs`
      - `tests/security/client-secrets.test.ts`
      Depende de: T122
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm build`.
      - Ejecutar `node scripts/audit-client-secrets.mjs .next`.
      - Ejecutar `pnpm test -- tests/security/client-secrets.test.ts` y confirmar cero claves, hashes o variables privadas en chunks/RSC públicos.

- [ ] 7.14 T135 [US3] [P] [TESTING] Responsable: Líder QA de Seguridad
      Auditar todas las preguntas publicadas y elegibles, sus proyecciones públicas y las respuestas HTML, RSC y JavaScript de todas las lecturas previas al envío para demostrar que no contienen soluciones.
      Archivos:
      - `tests/security/client-answer-exposure.test.ts`
      Depende de: T122
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- tests/security/client-answer-exposure.test.ts`.
      - Enumerar el conjunto completo publicado/elegible, forzar cada pregunta como activa y capturar cada proyección/lectura previa al envío; buscar referencias correctas, `correct_option_id`, `is_correct`, explicaciones futuras y patrones del contenido sincronizado, y confirmar cero exposiciones sin muestreo.

- [ ] 7.15 T136 [US5] [P] [TESTING] Responsable: Líder QA de Medios y Rendimiento
      Verificar carga progresiva y usabilidad bajo una conexión móvil moderada sin descargar la ronda completa.
      Requisito: SC-009 | Constitución VI — Mobile-First y rendimiento | Constitución XI — Verificación antes de completar.
      Archivos:
      - `tests/e2e/mobile-network.spec.ts`
      Depende de: T122
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm exec playwright test tests/e2e/mobile-network.spec.ts`.
      - Con caché fría emular `1.6 Mbps` descarga, `750 Kbps` carga y `150 ms` latencia.
      - Confirmar en `<=3 s` las cinco condiciones simultáneas de `contracts/media.md`: contenido principal comprensible; control principal renderizado, habilitado, enfocable y con nombre accesible; ningún estado de carga bloqueante; fallback equivalente si una imagen sigue pendiente/falla; y ausencia de scroll horizontal que oculte contenido o acciones.
      - Confirmar además transferencia inicial total `<=1000000` bytes, una sola pregunta en payload y estado de carga anunciado únicamente como estado intermedio, nunca como criterio de éxito ni como permiso para repetir un envío.

- [ ] 7.16 T137 [P] [TESTING] Responsable: Líder QA de Seguridad
      Crear y verificar la matriz exhaustiva de evidencia para todos los casos de error y recuperación de SC-011.
      Requisito: SC-011 | Constitución XI — Verificación antes de completar.
      Archivos:
      - `tests/traceability/error-recovery-matrix.test.ts`
      - `specs/001-trivia-mvp-flow/evidence/error-recovery-matrix.md`
      Depende de: T017, T067, T071, T087, T095, T105, T113, T120, T121, T126
      Paralela: Sí
      Verificación:
      - Ejecutar `pnpm test -- tests/traceability/error-recovery-matrix.test.ts`.
      - Enumerar las 23 filas de la matriz de `spec.md` y exigir para cada una una prueba automática o evidencia manual enlazada.
      - Confirmar por fila acción disponible, información conservada, posibilidad de continuar y necesidad de nueva sesión; fallar ante ausencia, duplicación o divergencia.

- [ ] 7.17 T138 [DEVOPS] Responsable: Líder DevOps y Release
      Configurar la puerta de calidad de pull requests con tipado, lint, pruebas, Supabase local, build y E2E críticos.
      Requisito: Constitución XI — Verificación antes de completar.
      Archivos:
      - `.github/workflows/ci.yml`
      Depende de: T122, T123, T124, T125, T126, T127, T129, T132, T134, T135, T136, T137
      Paralela: No
      Verificación:
      - Ejecutar el workflow en una pull request de prueba.
      - Confirmar pasos con salida 0 para `pnpm typecheck`, `pnpm lint`, `pnpm test`, reset/lint de Supabase, `pnpm test:integration`, `pnpm build` y E2E críticos.
      - Confirmar pasos explícitos para `node scripts/audit-client-secrets.mjs .next` y `pnpm test -- tests/security/client-answer-exposure.test.ts`.

### 7.4 Preparación de Preview

- [ ] 7.18 T139 [SUPABASE] Responsable: Líder de Datos y Supabase
      Ejecutar desde cero todas las migraciones, seed y pruebas de acceso en Supabase local y registrar la evidencia.
      Requisito: Constitución VII — Seguridad de Supabase.
      Archivos:
      - `specs/001-trivia-mvp-flow/evidence/deploy/local-database.md`
      Depende de: T138
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase db reset`, `pnpm exec supabase db lint --local --fail-on error` y `pnpm test:integration`.
      - Registrar comandos, fecha, salida y confirmar siete RPC, seis tablas privadas y cero grants públicos.

- [ ] 7.19 T140 [SUPABASE] Responsable: Líder de Datos y Supabase
      Aplicar las migraciones versionadas y el seed idempotente, reservado a local/Preview, al proyecto Supabase de Preview.
      Requisito: Constitución VII — Seguridad de Supabase.
      Archivos:
      - `specs/001-trivia-mvp-flow/evidence/deploy/preview-database.md`
      Depende de: T139
      Paralela: No
      Verificación:
      - Ejecutar `pnpm exec supabase link --project-ref <PREVIEW_PROJECT_REF>`.
      - Ejecutar `pnpm exec supabase db push --dry-run` y revisar que solo enumera las migraciones aprobadas.
      - Ejecutar `pnpm exec supabase db push --include-seed`.
      - Registrar la referencia no secreta; comparar claves estables y contenido con la migración de datos de Production, confirmar al menos diez preguntas publicadas y cero duplicados tras reaplicar el seed.

- [ ] 7.20 T141 [SUPABASE] Responsable: Líder de Datos y Supabase
      Verificar en Preview RLS, grants, proyecciones, retención y programación de Cron.
      Requisito: FR-062 | FR-066 | Constitución VII — Seguridad de Supabase.
      Archivos:
      - `specs/001-trivia-mvp-flow/evidence/deploy/preview-security.md`
      Depende de: T140
      Paralela: No
      Verificación:
      - Ejecutar la matriz DB-ALLOW/DB-DENY contra Preview con credenciales autorizadas.
      - Consultar `cron.job` y `cron.job_run_details`; confirmar trabajo habilitado cada seis horas y una ejecución controlada satisfactoria.
      - Confirmar que `anon`/`authenticated` no leen tablas ni ejecutan RPC.
      - Inspeccionar Data API remota: `api` expuesto, `private` ausente y fachada ejecutable solo por el rol servidor.

- [ ] 7.21 T142 [DEVOPS] Responsable: Líder DevOps y Release
      Crear o conectar el proyecto de Vercel con el repositorio de GitHub y registrar la vinculación sin secretos.
      Requisito: Constitución XI — Verificación antes de completar.
      Archivos:
      - `specs/001-trivia-mvp-flow/evidence/deploy/vercel-project-link.md`
      Depende de: T138
      Paralela: No
      Verificación:
      - En Vercel crear o seleccionar el proyecto, importar el repositorio y confirmar rama principal y directorio raíz correctos.
      - Registrar repositorio, proyecto y configuración no secreta; confirmar que Vercel reconoce el framework Next.js.

- [ ] 7.22 T143 [DEVOPS] Responsable: Líder DevOps y Release
      Configurar las variables de Preview y verificar una Preview generada por pull request.
      Requisito: FR-062 | Constitución VII — Seguridad de Supabase.
      Archivos:
      - `specs/001-trivia-mvp-flow/evidence/deploy/vercel-preview-env.md`
      - `specs/001-trivia-mvp-flow/evidence/deploy/vercel-pr-preview.md`
      Depende de: T140, T142
      Paralela: No
      Verificación:
      - En Vercel → Project Settings → Environment Variables añadir `SUPABASE_URL`, exactamente una de `SUPABASE_SECRET_KEY`/`SUPABASE_SERVICE_ROLE_KEY` y `GAME_ROUND_SIZE=5` solo para Preview.
      - Registrar solo nombres/ámbitos y confirmar que ninguna variable Supabase es `NEXT_PUBLIC_*`.
      - Abrir una pull request de prueba y confirmar que CI pasa y Vercel publica una URL Preview asociada al commit.
      - Registrar commit, URL y estados sin copiar tokens.

- [ ] 7.23 T144 [TESTING] Responsable: Líder QA de Release
      Ejecutar el smoke funcional, móvil, multimedia y de ranking contra la Preview desplegada.
      Requisito: SC-002 | SC-005 | Constitución XI — Verificación antes de completar.
      Archivos:
      - `specs/001-trivia-mvp-flow/evidence/deploy/preview-smoke.md`
      Depende de: T141, T143
      Paralela: No
      Verificación:
      - En la URL Preview completar cinco preguntas a `320x800`, abrir resultados/ranking y volver a jugar.
      - Confirmar imágenes, estado vacío/error controlado, puntuación servidor y ausencia de claves privadas, hash/UUID interno o soluciones en Network/HTML/JS.
      - Confirmar que el token opaco solo aparece en `Set-Cookie` HttpOnly y nunca en HTML, JavaScript o `document.cookie`.
      - Registrar navegador, fecha, commit y resultado de cada paso.

- [ ] 7.24 T145 [TESTING] Responsable: Líder QA de Accesibilidad e Investigación UX
      Registrar la aprobación de la puerta previa a Production con evidencia trazable y revalidar la vigencia del contenido educativo promovido.
      Requisito: FR-031 | SC-001 | SC-004 | SC-010 | Constitución I — Educación antes que competencia | Constitución XI — Verificación antes de completar.
      Archivos:
      - `specs/001-trivia-mvp-flow/evidence/checkpoint-d.md`
      - `specs/001-trivia-mvp-flow/evidence/usability-study.md`
      Depende de: T044, T128, T130, T131, T133, T134, T135, T138, T141, T144
      Paralela: No
      Verificación:
      - Ejecutar con códigos P01–P10 la Cohorte MVP definida exclusivamente en `spec.md`; auditar por separado cada cuota de edad, idioma, nivel digital, dispositivo y SO, y fallar la puerta ante cualquier incumplimiento.
      - Aplicar las definiciones de traducción asistida, teléfono, computador, tableta y equipo híbrido de `spec.md`, sin reclasificar una sesión para completar una cuota.
      - Seguir el `Protocolo de usabilidad y consentimiento` de `quickstart.md`. Si participa una persona de 15–17 años, comprobar consentimiento del representante y asentimiento; si falta cualquiera, excluir la sesión y mantener T145 bloqueada.
      - Registrar únicamente los campos permitidos por `spec.md` y el protocolo; comprobar que el repositorio no contiene datos, firmas, autorizaciones ni grabaciones prohibidas.
      - Confirmar que al menos 90 % identifica el propósito e inicia una partida válida en menos de 60 segundos sin cuenta.
      - Tras la ronda, confirmar que al menos 80 % menciona una señal aprendida o recomendación aplicable.
      - Leer `specs/001-trivia-mvp-flow/evidence/content/educational-content-approval.md` y confirmar que la decisión vigente es `approved`, que ningún criterio registra `fail` y que `approvalSchemaVersion`, `approvalRevision` y `catalogVersion` están presentes.
      - Comparar identificadores y versiones de preguntas y recursos contra el catálogo desplegado en Preview, la migración de Production todavía no aplicada, `seed.sql` y los recursos locales; exigir coincidencia exacta.
      - Recalcular el digest de la proyección canónica en cada comparación y confirmar que coincide con `catalogDigest` y `catalogVersion` de la evidencia y de los metadatos internos del seed y de la migración pendiente.
      - Volver a comprobar, usando las definiciones de `spec.md`, que ninguna fuente perdió vigencia, cambió materialmente o dejó de estar disponible y que ningún recurso cambió de archivo, procedencia, licencia o permiso desde T044; conservar fecha, localizador, pasaje y huella de cada revalidación.
      - Si existe cualquiera de esos cambios, mantener T145 pendiente, devolver el elemento afectado a `draft` y exigir una nueva versión, revisión y verificación de T044 antes de continuar.
      - Enlazar en `checkpoint-d.md` la evidencia educativa, de flujo completo, accesibilidad, seguridad, ranking y Preview.
      - Confirmar que no queda verificación crítica pendiente o bloqueada.

### Checkpoint D — Despliegue

No aplicar cambios ni desplegar a Production hasta completar T145 y confirmar:

1. Flujo completo, teclado, recarga y doble envío aprobados.
2. No existen secretos ni respuestas correctas anticipadas en el cliente.
3. Ranking limitado a sesiones finalizadas, ordenado y sin duplicados.
4. La evidencia educativa conserva decisión `approved` vigente; sus versiones, preguntas, fuentes, licencias y recursos coinciden exactamente con Preview, `seed.sql` y la migración de Production. Migraciones, RLS, grants y Cron están verificados en Preview.
5. Responsive desde 320 px, zoom 200 %, reducción de movimiento e imágenes aprobados.
6. Prueba moderada cumple SC-001 y SC-010 con todas las cuotas de la Cohorte MVP de usabilidad.

### 7.5 Production y demostración

- [ ] 7.25 T146 [SUPABASE] Responsable: Líder de Datos y Supabase
      Aplicar en Production exclusivamente las migraciones versionadas, incluida la migración idempotente del contenido educativo aprobado; no ejecutar `seed.sql`.
      Requisito: Constitución VII — Seguridad de Supabase.
      Archivos:
      - `specs/001-trivia-mvp-flow/evidence/deploy/production-database.md`
      Depende de: T145, Checkpoint D
      Paralela: No
      Verificación:
      - Vincular el proyecto Production autorizado.
      - Leer la aprobación registrada por T145 y confirmar que el `catalogVersion`, las versiones de contenido y los recursos de la migración coinciden exactamente con la evidencia educativa vigente; ante cualquier diferencia, no ejecutar Production.
      - Recalcular en Production la proyección canónica y confirmar coincidencia exacta de `catalogVersion`, algoritmo y digest con la evidencia, el seed de referencia y la migración aplicada; ante cualquier diferencia, no continuar y conservar T146 pendiente.
      - Ejecutar `pnpm exec supabase db push --dry-run` contra el proyecto vinculado y comparar con Preview.
      - Ejecutar `pnpm exec supabase db push` sin `--include-seed` y registrar el comando exacto.
      - Comparar historial de migraciones con Preview y confirmar que la migración creada mediante `supabase migration new <nombre>` dejó el mismo conjunto educativo aprobado, al menos diez preguntas, cero duplicados, siete RPC y Cron cada seis horas.
      - Confirmar en la evidencia que `supabase/seed.sql` no se ejecutó contra Production.
      - Repetir la verificación Data API: `api` expuesto, `private` ausente, rol servidor permitido y `anon`/`authenticated` denegados.

- [ ] 7.26 T147 [DEVOPS] Responsable: Líder DevOps y Release
      Configurar las variables privadas de Production en Vercel sin exponer valores.
      Requisito: FR-062 | Constitución VII — Seguridad de Supabase.
      Archivos:
      - `specs/001-trivia-mvp-flow/evidence/deploy/vercel-production-env.md`
      Depende de: T146
      Paralela: No
      Verificación:
      - En Vercel configurar `SUPABASE_URL`, exactamente una clave privada y `GAME_ROUND_SIZE=5` solo para Production.
      - Registrar nombres/ámbitos y confirmar que los valores no aparecen en logs, repositorio ni variables `NEXT_PUBLIC_*`.

- [ ] 7.27 T148 [DEVOPS] Responsable: Líder DevOps y Release
      Desplegar a Production desde la rama principal después de aprobar Preview.
      Requisito: Constitución XI — Verificación antes de completar.
      Archivos:
      - `specs/001-trivia-mvp-flow/evidence/deploy/production-release.md`
      Depende de: T147
      Paralela: No
      Verificación:
      - Promover el commit exacto aprobado y registrar commit, deployment y URL.
      - Confirmar estado Ready y que el bundle publicado corresponde al commit de T144.
      - Inspeccionar artefactos/rutas publicados y confirmar que el prototipo estático legado documentado en T002 quedó fuera del build Next.js.

- [ ] 7.28 T149 [DEVOPS] Responsable: Líder DevOps y Release
      Crear y ejecutar el runbook previo a la demostración para base, preguntas, ranking, imágenes, secretos y salud de Cron.
      Requisito: SC-002 | Constitución XI — Verificación antes de completar.
      Archivos:
      - `docs/operations/demo-runbook.md`
      - `specs/001-trivia-mvp-flow/evidence/deploy/production-health.md`
      Depende de: T148
      Paralela: No
      Verificación:
      - En Production completar una partida móvil, consultar ranking e inspeccionar imágenes/bundle.
      - Definir responsable y revisión recurrente de `cron.job_run_details` con intervalo máximo de seis horas mientras el MVP esté público.
      - Si no existe éxito en menos de seis horas, ejecutar la función idempotente como propietario, corregir programación y volver a comprobar sin ampliar plazos.

- [ ] 7.29 T150 [TESTING] Responsable: Líder QA de Release
      Ejecutar y registrar la lista final de comprobación de la demostración.
      Requisito: SC-002 | SC-005 | Constitución XI — Verificación antes de completar.
      Archivos:
      - `specs/001-trivia-mvp-flow/checklists/demo.md`
      - `specs/001-trivia-mvp-flow/evidence/demo-readiness.md`
      Depende de: T149
      Paralela: No
      Verificación:
      - Comprobar en Production base accesible, diez preguntas, partida completa, feedback, resultados, ranking, imágenes, flujo `320x800` y teclado.
      - Confirmar ausencia de claves privadas, hash/UUID interno y soluciones anticipadas; aceptar el token opaco únicamente en `Set-Cookie` HttpOnly.
      - Registrar resultado esperado/obtenido, archivos/versiones, responsable ejecutor y cualquier bloqueo; dejar pendiente cualquier ítem no ejecutado.

---

## Resumen cuantitativo

| Fase | Rango | Tareas | Candidatas `[P]` |
|---|---:|---:|---:|
| 1. Fundación del proyecto | T001–T014 | 14 | 8 |
| 2. Contratos y configuración compartida | T015–T022 | 8 | 4 |
| 3. Supabase y persistencia | T023–T053 | 31 | 7 |
| 4. Inicio de partida | T054–T068 | 15 | 6 |
| 5. Flujo de juego | T069–T096 | 28 | 13 |
| 6. Resultados y ranking | T097–T121 | 25 | 11 |
| 7. Calidad, seguridad y despliegue | T122–T150 | 29 | 16 |
| **Total** | **T001–T150** | **150** | **65** |

### Trazabilidad cuantitativa por historia

| Historia | Tareas primarias |
|---|---:|
| US1 — Comprender el propósito | 2 |
| US2 — Iniciar con alias temporal | 17 |
| US3 — Responder la ronda | 31 |
| US4 — Recibir retroalimentación | 10 |
| US5 — Consultar/recuperar progreso | 17 |
| US6 — Finalizar y consultar resultado | 18 |
| US7 — Consultar ranking | 14 |
| Sin etiqueta de historia — transversal con `Requisito:` explícito | 41 |

### Matriz FR/SC complementaria

Cada grupo de IDs siguiente se aplica a cada tarea indicada y completa la referencia
directa cuando su cabecera todavía no contiene una línea `Requisito:`. Las líneas
`Requisito:` existentes siguen siendo autoritativas; esta matriz no renumera tareas ni
crea una segunda fuente de responsables.

| Tareas | Requisitos funcionales y criterios de éxito |
|---|---|
| T001–T014 | FR-051–059, SC-003, SC-009, Constitución II, V, VI, IX y XI |
| T015–T020 | FR-018–020, FR-051–052, FR-060–062, SC-006, SC-011, Constitución II, III, VII, IX y XI |
| T021 | FR-037–040, SC-007 |
| T024–T027 | FR-013, FR-015, FR-018–020, FR-028, FR-031, FR-036 |
| T028–T032 | FR-004–024, FR-033–040, FR-060–061, FR-065 |
| T034–T040 | FR-004–013, FR-018–024, FR-032–043, FR-060–065 |
| T041–T042 | FR-020, FR-031, FR-061–062, SC-011, Constitución VII |
| T043 | FR-065–066, SC-013 |
| T046–T053 | FR-013–050, FR-061, FR-063, FR-065–066, SC-004, SC-013 |
| T054–T060 | FR-004–012, FR-034–036, FR-060–062, FR-065 |
| T061–T068 | FR-001–012, FR-034–035, FR-051–052, SC-001, SC-011–012 |
| T069–T077 | FR-013–025, FR-032–036, FR-061–062, SC-006, SC-008, SC-011 |
| T078–T086 | FR-026–036, FR-051–059, SC-003, SC-006, SC-008–009 |
| T087–T096 | FR-017–036, FR-051–062, SC-003, SC-006, SC-008–011 |
| T097–T105 | FR-036–043, FR-060–065, SC-006–007, SC-011–012 |
| T106–T121 | FR-044–050, FR-062–063, SC-007, SC-011 |
| T122–T137 | FR-017, FR-025, FR-051–059, FR-061–062, SC-002–003, SC-005–006, SC-009, SC-011 |
| T138–T145 | FR-031, FR-051–063, FR-065–066, SC-001–005, SC-009–013 |
| T146–T150 | FR-031, FR-044–050, FR-060–066, SC-002, SC-004–005, SC-007, SC-009, SC-013 |

La cobertura declarada permanece 79/79: los requisitos con referencia local o en esta
matriz cuentan como cobertura inferida; una cobertura solo es auditable cuando la
verificación de la tarea registra el requisito concreto, el resultado y su evidencia.

## Tareas que pueden ejecutarse en paralelo

- Fase 1: T004, T005, T006, T007, T009, T010, T013 y T014.
- Fase 2: T016, T018, T020 y T021.
- Fase 3: T046 se ejecuta sola después de T045 por sus resets globales; después T047–T053 pueden avanzar en paralelo.
- Fase 4: T054, T055 y T056; después T066/T067 y, una vez T066 termine, T068.
- Fase 5: T070–T072, T078 y T085; después T088–T095.
- Fase 6: T103, T108 y T111; después T114–T121.
- Fase 7: T122–T137, respetando T122 → T127, T123 → T131 y T132 → T133.

Una marca `[P]` no elimina sus prerrequisitos: indica paralelismo únicamente después de que estos estén completados.

## Archivos compartidos o sensibles con riesgo de conflicto

| Archivo o área | Tareas serializadas | Riesgo |
|---|---|---|
| `package.json`, `pnpm-lock.yaml` | T001 | Versiones, scripts y resolución de dependencias. |
| `tsconfig.json` | T003 → T015 | Modo estricto y alias del contrato canónico. |
| `vitest.config.ts` | T007 → T008 | Entornos Node/jsdom y archivos de setup. |
| `src/app/globals.css` | T002 → T005 | Base de estilos, foco y responsive. |
| `src/app/page.tsx` | T002 → T064 | Esqueleto y página inicial funcional. |
| `.env.example`, `src/lib/env/server.ts` | T010 → T011 | Frontera entre variables públicas y privadas. |
| `src/lib/security/session-cookie.ts` | T055 → T099 | Política exacta de credencial activa y acceso al resultado. |
| `src/lib/supabase/server.ts` | T019 | Único cliente con clave privada. |
| `src/features/game/infrastructure/supabase-game-gateway.ts` | T056 → T059 → T075 → T081 → T097 → T101 → T106 | Fachada central; nunca editar en paralelo. |
| `src/components/game/alias-form.tsx` | T061 → T062 → T063 → T104 | Semántica, errores, envío y reutilización segura en resultados. |
| `src/components/game/question-form.tsx` | T072 → T073 → T074 → T079 → T084 → T100 | Selección, envío, feedback, avance y finalización. |
| `src/components/game/feedback-panel.tsx` | T078 → T080 | Contenido educativo y anuncios. |
| `src/app/results/page.tsx` | T103 → T104 | Resumen y acciones posteriores. |
| `src/components/leaderboard/leaderboard-list.tsx` | T108 → T109 → T110 | Lista, jugador actual y estado vacío. |
| `src/app/leaderboard/page.tsx` | T112 → T113 | Lectura y error no bloqueante. |
| `supabase/migrations/` | T023–T044 | Orden irreversible, objetos dependientes, grants y migración idempotente de contenido para Production. |
| `supabase/seed.sql` | T044 | Contenido estructurado sincronizado, reservado a local/Preview. |
| `tests/fixtures/supabase-local.ts` | T045 → T046–T053 y pruebas posteriores | Aislamiento de datos y roles de integración. |
| `.github/workflows/ci.yml` | T138 | Puerta compartida de integración. |
| `specs/001-trivia-mvp-flow/contracts/` | Solo lectura | Requiere especificación y aprobación antes de cualquier cambio. |

## Estrategia de entrega

1. Completar Checkpoint A antes de cualquier esquema o interfaz conectada.
2. Completar contratos integrados y Checkpoint B antes de repartir frontend, servidor y pruebas de historia.
3. Entregar primero US1+US2 como inicio demostrable; después US3+US4+US5 como juego recuperable.
4. Aprobar Checkpoint C antes de implementar US6+US7.
5. Considerar como MVP funcional T001–T121 más T122–T137; Preview, Production y demostración requieren además T138–T150.
6. No habilitar otras mecánicas, cuentas, administración, tiempo real ni IA generativa; Production usa cinco preguntas aunque el contrato conserve el rango configurable `1..10`.
