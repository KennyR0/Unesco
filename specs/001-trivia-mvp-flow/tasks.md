---

description: "Backlog ejecutable para Antídoto Arcade MIL"

---

# Tasks: Antídoto Arcade MIL

**Input**: plan.md, spec.md, research.md, data-model.md, quickstart.md,
scoring-proposal.md, supabase-reconciliation.md y contracts/

**Tests**: se incluyen tareas de contrato, integración, componentes y E2E porque
la especificación, la constitución y el plan exigen verificación antes de
completar historias.

**Boundary**: las tareas de Supabase están explícitamente condicionadas a la
reconciliación del modelo físico. No ejecutar db push, reset, seed, lint ni
publicar migraciones como parte de la fase documental actual.

**Path conventions**: aplicación Next.js en src/, pruebas en tests/ y cambios
físicos futuros en supabase/migrations/.

## Phase 1: Setup

**Purpose**: preparar la estructura Next.js y las herramientas compartidas sin
implementar todavía una mecánica concreta.

- [X] T001 [P] Crear la estructura de carpetas arcade en src/app/games/[gameCode]/, src/components/arcade/, src/components/games/ y src/features/game/domain/mechanics/.
- [X] T002 [P] Alinear Vitest, Playwright y los fixtures de servidor con el flujo arcade en vitest.config.ts, vitest.integration.config.ts, playwright.config.ts y tests/setup/.
- [X] T003 [P] Completar las variables de entorno documentadas para Next.js y Supabase server-only en .env.example y src/lib/env/server.ts.
- [X] T004 [P] Configurar los límites de imágenes y dominios permitidos para media educativa en next.config.ts.

---

## Phase 2: Foundational

**Purpose**: contratos, validación, sesiones lógicas, contenido, shell y
fixtures compartidos. La persistencia física permanece como una línea
condicionada y no bloquea las historias que usan gateways server-only.

**Critical**: T005–T016 y T020 son la fundación común; T017–T019 solo son
obligatorias para habilitar la persistencia real y quedan sujetas a la puerta de
Supabase.

- [X] T005 Actualizar los tipos compartidos de seis GameCode, seis Mechanic, acciones discriminadas, GameScore y Leaderboard en specs/001-trivia-mvp-flow/contracts/domain.ts.
- [X] T006 Implementar validadores Zod para catálogo, payloads de entrada, estados, resultados y rankingScore en src/features/game/domain/schemas.ts.
- [X] T007 [P] Añadir pruebas de validación y rechazo de campos de autoridad en tests/contracts/domain-schemas.test.ts y tests/contracts/public-projections.test.ts.
- [X] T008 Construir el catálogo versionado de los seis juegos y su repositorio server-only en src/features/game/content/arcade-catalog.v1.json y src/features/game/content/catalog.ts.
- [X] T009 Implementar el registro de mecánicas y el mapeo gameCode-mechanic en src/features/game/application/mechanic-registry.ts y src/features/game/domain/mechanic.ts.
- [X] T010 Definir el gateway de operaciones, envelopes de error y límites server-only para startGame, getGameState, submitGameAction, advanceGame, getGameResult y getLeaderboard en src/features/game/infrastructure/game-gateway.ts y src/features/game/application/game-operations.ts.
- [X] T011 Implementar alias, cookie opaca, expiración, idempotencia y estado de sesión independiente en src/features/game/domain/session.ts, src/features/game/domain/alias.ts y src/lib/security/session-cookie.ts.
- [X] T012 Implementar las fórmulas aprobadas por juego y rankingScore normalizado sin aceptar valores del cliente; cubrir clamp a 0–100, maxPoints <= 0, resultados incompletos/expirados y desempate estable en src/features/game/domain/scoring.ts y src/features/game/domain/scoring.test.ts.
- [X] T013 Implementar la capa de contenido estructurado, versionado editorial y feedback en src/features/game/content/content-repository.ts y src/features/game/content/content-validation.ts.
- [X] T014 Implementar el manifiesto de media, alt, fallback, dimensiones y límites de peso en src/features/game/content/media-manifest.v1.json y src/lib/media/manifest.ts.
- [X] T015 Construir el shell compartido con progreso, estados, live region, errores y feedback inline en src/components/game/game-shell.tsx, src/components/game/feedback-panel.tsx y src/app/globals.css.
- [X] T016 Implementar el transporte server-only de acciones y recuperación de estado en src/app/actions/game.ts, src/features/game/application/server-operations.ts y src/features/game/application/submit-game-action.ts.
- [X]  T017 Crear la migración física arcade solo después de aprobar supabase-reconciliation.md, con sesiones, items, respuestas, resultados, score, rankingScore, elegibilidad, retención de 24/30 días, RLS, grants, índices de purga y protección `security_invoker` si se elige una vista expuesta en supabase/migrations/20260801051613_arcade_schema.sql.
- [X]  T018 Crear el seed estructurado del catálogo y el registro de contenido estructuralmente válido (solo tras puerta editorial cuando aplique), sin publicar Supabase, en supabase/seed.sql, src/features/game/content/arcade-catalog.v1.json y src/features/game/content/content-manifest.v1.json.
- [X]  T019 Ejecutar las pruebas locales de migración, RLS, proyecciones públicas y ausencia de solución antes de habilitar persistencia en tests/integration/database/migration-smoke.test.ts, tests/integration/database/access-control.test.ts y tests/integration/database/correct-answer-exposure.test.ts.
- [X] T020 Actualizar los fixtures compartidos de contratos, Supabase local y respuestas discriminadas en tests/fixtures/contract-samples.ts, tests/fixtures/supabase-local.ts y tests/contracts/contract-consistency.test.ts.

**Checkpoint**: los contratos, validadores, contenido lógico, shell, fixtures,
límites de seguridad del core y la línea física local de Supabase (T017–T019)
están listos. La persistencia real ya no bloquea US2+; T070 sigue siendo
verificación/reconciliación de cierre en Polish.

---

## Phase 3: User Story 1 - Descubrir el arcade (Priority: P1) MVP

**Goal**: mostrar los seis juegos, sus objetivos y rutas dinámicas sin hacer del
ranking una llamada principal.

**Independent Test**: desde 320 px, una persona identifica los seis juegos,
abre una ruta válida con teclado y recibe estado seguro para un gameCode
desconocido; el landing no contiene CTA de ranking.

- [X] T021 [US1] Implementar la portada dominante del arcade con los seis juegos y objetivos en src/app/page.tsx y src/components/arcade/arcade-home.tsx.
- [X] T022 [P] [US1] Implementar las tarjetas accesibles, estados de disponibilidad y enlaces dinámicos en src/components/arcade/game-card.tsx y src/components/arcade/game-card.test.tsx.
- [X] T023 [US1] Implementar la ruta dinámica de juego, carga y not-found seguro en src/app/games/[gameCode]/page.tsx, src/app/games/[gameCode]/loading.tsx y src/app/games/[gameCode]/not-found.tsx.
- [X] T024 [US1] Retirar el formulario single_choice y el enlace de ranking del landing en src/components/game/start-game-form.tsx y src/app/page.tsx.
- [X] T025 [US1] Verificar portada, seis rutas, teclado, 320 px, zoom, ausencia de ranking principal y apertura de un juego en menos de 30 segundos durante una prueba moderada en tests/components/start-page.test.tsx y tests/e2e/foundation.spec.ts.

**Checkpoint**: la portada y el descubrimiento de los seis juegos funcionan sin
depender de una sesión ya creada ni del ranking.

---

## Phase 4: User Story 2 - Jugar con una sesión independiente (Priority: P1)

**Goal**: iniciar y recuperar una sesión anónima por juego, con alias validado,
estado autoritativo, expiración e idempotencia.

**Independent Test**: dos sesiones en juegos distintos no comparten estado,
un alias inválido se rechaza, una entrada repetida no duplica respuesta y una
sesión no puede cambiar de gameCode.

- [X] T026 [P] [US2] Implementar validación y moderación del alias temporal en src/features/game/domain/alias.ts, src/features/game/content/blocked-aliases.v1.json y src/features/game/domain/alias.test.ts.
- [X] T027 [US2] Implementar startGame y la vinculación de cookie opaca a gameCode en src/features/game/application/start-game.ts y src/app/actions/game.ts.
- [ ] T028 [US2] Implementar las transiciones intro-active-processing-feedback-expired-finished y la pertenencia de item en src/features/game/application/game-operations.ts y src/features/game/infrastructure/game-gateway.ts.
- [ ] T029 [US2] Implementar recuperación segura de estado, expiración y sesión inválida en src/features/game/application/server-operations.ts y src/components/game/secure-state-view.tsx.
- [ ] T030 [US2] Cubrir alias, startGame, idempotencia y estados terminales con fixtures server-only; las pruebas RPC quedan como verificación condicionada a la puerta de Supabase en src/features/game/application/start-game.test.ts, tests/integration/database/start-game-rpc.test.ts y tests/integration/database/get-game-state-rpc.test.ts.
- [ ] T031 [US2] Verificar aislamiento de sesiones y recuperación tras recarga en tests/e2e/foundation.spec.ts y tests/e2e/session-isolation.spec.ts.

**Checkpoint**: una sesión independiente puede comenzar, recuperarse, expirar y
terminar sin que el cliente controle estado o identidad.

---

## Phase 5: User Story 3 - Responder y aprender en la misma vista (Priority: P1)

**Goal**: aceptar una acción discriminada, mostrar feedback educativo inline,
materializar resultado y ofrecer el ranking global solo como acción secundaria.

**Independent Test**: una acción válida muestra resultado, explicación, señales
y recomendación antes de avanzar; un reintento es idempotente; el resultado
incluye GameScore y el ranking global no bloquea el flujo.

- [ ] T032 [US3] Implementar submitGameAction y advanceGame con rechazo de solution, score, nextItem y completed enviados por el cliente en src/features/game/application/submit-game-action.ts y src/app/actions/game.ts.
- [ ] T033 [US3] Integrar feedback persistente, anuncio accesible y avance bloqueado hasta aceptar en src/components/game/feedback-panel.tsx, src/components/game/feedback-card.tsx y src/components/game/game-shell.tsx.
- [ ] T034 [US3] Implementar la proyección post-partida por gameCode (aprendizaje, GameScore y enlace discreto al ranking) sin mover el feedback educativo fuera del shell, en src/app/games/[gameCode]/result/page.tsx y src/components/game/result-card.tsx.
- [ ] T035 [US3] Implementar la lectura global de leaderboard con máximo diez entradas, elegibilidad server-only, rankingScore normalizado, exclusión de incompletos/expirados y copia neutral en src/features/game/application/leaderboard.ts y src/features/game/infrastructure/supabase-game-gateway.ts.
- [ ] T036 [US3] Implementar la página secundaria /leaderboard y su tabla accesible sin añadirla al landing en src/app/leaderboard/page.tsx y src/components/game/leaderboard-table.tsx.
- [ ] T037 [US3] Actualizar el mapeo de errores de resultado y ranking, incluyendo estado vacío y fallo retryable, en src/features/game/application/game-error.ts y src/features/game/infrastructure/map-database-error.ts.
- [ ] T038 [P] [US3] Cubrir feedback inline, resultado, idempotencia y proyección sin solución en tests/components/feedback-panel.test.tsx, tests/e2e/game-feedback.spec.ts y tests/contracts/public-projections.test.ts.
- [ ] T039 [US3] Cubrir ranking global, límite de diez, elegibilidad de finished completo, exclusión de expirados/incompletos, maxPoints <= 0, clamp, rankingScore, alias seguro, desempate por completedAt/resultId y fallo independiente en tests/components/leaderboard-table.test.tsx, tests/integration/database/leaderboard-rpc.test.ts y tests/e2e/arcade-leaderboard.spec.ts.

**Checkpoint**: una respuesta completa educa y produce resultado sin convertir
el ranking en requisito para jugar.

---

## Phase 6: User Story 4 - Detectar imágenes sintéticas (Priority: P1)

**Goal**: jugar ¿Real o IA? con media estructurada, verdict, pistas y feedback.

**Status note**: contenido/evaluador/UI pueden cerrarse con fixtures
server-only (“estructuralmente válidos”). La historia no es jugable de punta
a punta hasta T027–T033. La aprobación editorial definitiva es puerta aparte.

**Independent Test**: se puede responder Real/IA con botones y teclado, se
revela la solución solo después de aceptar y la media tiene alt o fallback.

- [X] T040 [P] [US4] Crear el contenido estructuralmente válido de ocho imágenes y sus feedbacks en src/features/game/content/game-items/real-o-ia.v1.json.
- [X] T041 [US4] Implementar la evaluación image_verdict con pistas de autenticidad y puntuación +10/0 en src/features/game/domain/mechanics/image-verdict.ts.
- [X] T042 [US4] Implementar el componente de imagen, contexto y controles Real/IA en src/components/games/real-o-ia-game.tsx.
- [X] T043 [US4] Registrar media real/provisional, alt, fallback y derechos en public/media/real-o-ia/media-index.v1.json y src/features/game/content/media-manifest.v1.json.
- [X] T044 [US4] Cubrir los ocho items, proyección privada, teclado, fallback y score máximo 80 en tests/components/real-o-ia-game.test.tsx y tests/integration/database/real-o-ia-flow.test.ts.

**Checkpoint**: Real o IA funciona como historia aislada dentro del shell.

---

## Phase 7: User Story 5 - Decidir dentro de El Grupo (Priority: P1)

**Goal**: resolver seis escenas de grupo con forward, verify y pause, consecuencias
seguras y score 0–12.

**Status note**: mismo criterio fixtures-only que US4 hasta cerrar US2–US3.

**Independent Test**: los mensajes conservan orden, cada acción produce una
consecuencia educativa y una alerta oficial verificada no se penaliza por defecto.

- [X] T045 [P] [US5] Crear las seis escenas, acciones y feedback editorial de El Grupo en src/features/game/content/game-items/grupo.v1.json.
- [X] T046 [US5] Implementar la evaluación group_action, consecuencia segura y score +2/+1/0 en src/features/game/domain/mechanics/group-decision.ts.
- [X] T047 [US5] Implementar el chat narrativo, acciones de cuidado y live region en src/components/games/group-game.tsx.
- [ ] T048 [US5] Cubrir orden de lectura, acciones forward/verify/pause, consecuencias y límites de score en tests/components/group-game.test.tsx y tests/integration/database/group-flow.test.ts.

**Checkpoint**: El Grupo funciona de forma independiente y mantiene el feedback
en la misma vista.

---

## Phase 8: User Story 6 - Separar periodismo de clickbait (Priority: P1)

**Goal**: clasificar doce titulares mediante swipe cancelable, botones o teclado,
con racha limitada y score 0–16.

**Status note**: mismo criterio fixtures-only que US4 hasta cerrar US2–US3.

**Independent Test**: un gesto bajo el umbral cancela sin enviar, botones y
teclado producen la misma entrada y la racha solo bonifica grupos de tres aciertos.

- [X] T049 [P] [US6] Crear los doce titulares, fuentes, categorías y feedback editorial en src/features/game/content/game-items/clickbait-swipe.v1.json.
- [X] T050 [US6] Implementar la evaluación headline_classification, racha de tres y score +1 con bono máximo +4 en src/features/game/domain/mechanics/headline-classification.ts.
- [X] T051 [US6] Implementar swipe cancelable, botones, flechas, teclado y foco posterior en src/components/games/clickbait-swipe-game.tsx.
- [ ] T052 [US6] Cubrir gesto, cancelación, teclado, equivalencia de controles, racha y score máximo 16 en tests/components/clickbait-swipe-game.test.tsx y tests/e2e/clickbait-swipe.spec.ts.

**Checkpoint**: Clickbait Swipe es utilizable sin gesto y no expone la regla
privada antes de responder.

---

## Phase 9: User Story 7 - Calibrar Radar de Fuentes (Priority: P1)

**Goal**: clasificar nueve fuentes en reliable, doubtful o fraudulent con una
aceptación por fuente y score 0–9.

**Status note**: mismo criterio fixtures-only que US4 hasta cerrar US2–US3.

**Independent Test**: una tarjeta no asignada a la sesión se rechaza, una fuente
solo se acepta una vez y la categoría seleccionada queda anunciada.

- [X] T053 [P] [US7] Crear las nueve fuentes, URLs visibles, categorías, razones y feedback en src/features/game/content/game-items/radar-de-fuentes.v1.json.
- [X] T054 [US7] Implementar la evaluación source_classification y la regla de una aceptación por fuente en src/features/game/domain/mechanics/source-classification.ts.
- [X] T055 [US7] Implementar tarjetas seleccionables, tres categorías, estado anunciado y feedback en src/components/games/source-radar-game.tsx.
- [ ] T056 [US7] Cubrir selección, categoría textual, fuente ajena, duplicado, feedback y score máximo 9 en tests/components/source-radar-game.test.tsx y tests/integration/database/source-radar-flow.test.ts.

**Checkpoint**: Radar de Fuentes mantiene integridad de pertenencia y una
interacción accesible equivalente.

---

## Phase 10: User Story 8 - Priorizar en Feed 60” (Priority: P1)

**Goal**: decidir verify, share o discard con reloj autoritativo, coste de cuatro
segundos y score con piso 0 hasta 30.

**Independent Test**: el reloj se comunica en texto, verify consume cuatro
segundos en servidor, la expiración gana carreras correctamente y el cliente no
puede extender el límite.

- [ ] T057 [P] [US8] Crear hasta diez publicaciones, fuentes, señales SIFT y feedback en src/features/game/content/game-items/feed-60.v1.json.
- [ ] T058 [US8] Implementar el reloj autoritativo, expiración, verify de cuatro segundos y resolución de carreras en src/features/game/domain/mechanics/timed-feed.ts y src/features/game/application/game-operations.ts.
- [ ] T059 [US8] Implementar verify/share/discard, pausa visual sin detener el reloj autoritativo, recuperación de foco, reloj textual, aviso anticipado y estado expirado en src/components/games/feed-60-game.tsx.
- [ ] T060 [US8] Implementar la fórmula +2/-1/+1, piso 0 y máximo 30 en src/features/game/domain/mechanics/feed-scoring.ts.
- [ ] T061 [US8] Cubrir timer, verify, pausa visual sin extensión de tiempo, recuperación de foco, carreras, teclado, expiración y score en tests/components/feed-60-game.test.tsx, tests/integration/database/feed-expiration.test.ts y tests/e2e/feed-60.spec.ts.

**Checkpoint**: Feed 60” conserva autoridad temporal y una alternativa accesible
para cada decisión.

---

## Phase 11: User Story 9 - Desmontar una fake news (Priority: P1)

**Goal**: completar cuatro pasos de Mente Maestra, separar alcance simulado de
daño real y mantener score 0–4.

**Independent Test**: objective, emotion, headline y evidence se completan en
orden, la viralidad permanece simulada y la autopsia aparece inline.

- [ ] T062 [P] [US9] Crear los cuatro pasos, opciones, autopsia y feedback editorial en src/features/game/content/game-items/mente-maestra.v1.json.
- [ ] T063 [US9] Implementar la evaluación guided_autopsy, score +1 por paso y viralidad separada 65–95 en src/features/game/domain/mechanics/guided-autopsy.ts.
- [ ] T064 [US9] Implementar pasos, selección persistida en sesión, alcance simulado y autopsia inline en src/components/games/misinformation-autopsy-game.tsx.
- [ ] T065 [US9] Cubrir orden de pasos, autopsia, separación de viralidad, no publicación externa y score máximo 4 en tests/components/misinformation-autopsy-game.test.tsx y tests/integration/database/mente-maestra-flow.test.ts.

**Checkpoint**: Mente Maestra enseña las técnicas elegidas sin premiar ni
producir daño real.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: retirar la línea single_choice, verificar calidad transversal y
cerrar la entrega.

- [ ] T066 Retirar las rutas y componentes single_choice obsoletos después de que las nuevas rutas pasen sus pruebas en src/app/play/page.tsx, src/app/results/page.tsx, src/app/ranking/page.tsx y src/components/game/question-card.tsx.
- [ ] T067 [P] Implementar verificación de teclado, foco, live regions, zoom 200 %, reduced motion y 320 px en tests/e2e/arcade-accessibility.spec.ts y src/app/globals.css.
- [ ] T068 [P] Implementar pruebas de media, dimensiones, fallback, peso y responsive en tests/contracts/media-contract.test.ts y tests/e2e/arcade-media.spec.ts.
- [ ] T069 [P] Añadir pruebas de frontera de servidor, Zod, secretos, cookies, URL, item ajeno y score enviado por cliente en tests/architecture/server-boundaries.test.ts, tests/contracts/domain-import.test.ts y tests/contracts/contract-consistency.test.ts.
- [ ] T070 Ejecutar la reconciliación física local y las pruebas RLS solo con autorización renovada, sin db push, incluyendo elegibilidad del ranking, protección `security_invoker` si aplica y división segura en supabase/migrations/20260801051613_arcade_schema.sql, tests/integration/database/migration-smoke.test.ts y tests/integration/database/access-control.test.ts.
- [ ] T071 [P] Medir límites de 180/200 KB de JS, 350 KB de transferencia inicial, 16 KB por acción, 50 KB de dependencias nuevas, 300 KB/1 MB de media y 1.5 MB visible, además de estados de carga/error en tests/e2e/arcade-performance.spec.ts y next.config.ts.
- [ ] T072 Registrar la revisión manual de contenido, accesibilidad, ranking secundario, prueba moderada de portada menor de 30 segundos y flujo completo en specs/001-trivia-mvp-flow/evidence/arcade-implementation-review.md.
- [ ] T073 Ejecutar typecheck, lint, pruebas unitarias, integración, E2E y quickstart, registrando resultados en specs/001-trivia-mvp-flow/evidence/arcade-implementation-review.md.

---

## Phase 13: Visual Identity Convergence (append-only)

**Purpose**: corregir la entrega parcial o contradictoria de T015, T021, T022 y
T025 frente a la intención visual aprobada, sin reescribir su historia ni abrir
alcance de dominio, sesiones o Supabase.

- [X] T074 Formalizar la identidad como contrato verificable en specs/001-trivia-mvp-flow/spec.md, plan.md, contracts/visual-system.md, contracts/accessibility.md, prototype-comparison.md, quickstart.md y README.md.
- [X] T075 Implementar tipografías `next/font`, tokens semánticos, configuración Tailwind y control global de movimiento con inicialización previa a hidratación en src/app/layout.tsx, src/app/arcade-visual.css, src/components/arcade/motion-toggle.tsx y tailwind.config.ts.
- [X] T076 Rediseñar cabecera, hero, collage, CTA, marquee, manifiesto y método SIFT sin añadir assets externos en src/components/arcade/arcade-home.tsx y src/components/arcade/arcade-header.tsx.
- [X] T077 Aplicar catálogo de seis misiones con acentos estables por `gameCode`, tensión legible y rejilla 3×2/2×1 en src/components/arcade/game-card.tsx y src/app/arcade-visual.css.
- [X] T078 Extender la presentación de GameShell con `gameCode` y aplicar el sistema a rutas introductorias, carga, error, sesión inválida y 404 en src/components/game/game-shell.tsx y src/app/.
- [X] T079 Restilizar feedback y los componentes existentes de ¿Real o IA?, El Grupo, Clickbait Swipe y Radar de Fuentes sin alterar eventos, payloads ni evaluación en src/components/game/feedback-panel.tsx y src/components/games/.
- [X] T080 Añadir pruebas contractuales, de componentes, movimiento, accesibilidad y regresión visual estable para portada, shell y estados en tests/contracts/, tests/e2e/ y src/components/arcade/.
- [X] T081 Ejecutar typecheck, lint, unitarias, componentes, E2E, build y revisión visual a 1440×900, 390×844, 320 px y zoom 200 %, registrando capturas, consola y límites honestos en specs/001-trivia-mvp-flow/evidence/arcade-visual-convergence.md.

---

## Requirement and story traceability

Cada bloque conserva una relación explícita con los requisitos funcionales
(`FR`), criterios de éxito (`SC`) e historia de usuario (`US`) que verifica.
El antiguo bloque amplio de implementación queda reemplazado por T001–T073 y
la convergencia visual se registra sin reescribir esa historia en T074–T081:
ninguna tarea supera cuatro rutas principales y cada tarea tiene una verificación
localizable. Esta tabla es la puerta de trazabilidad para evitar que una tarea
grande vuelva a ocultar contratos o historias distintas.

| Tareas | Cubre requisitos y criterios | Historia |
|---|---|---|
| T001–T004 | FR-013, FR-014, FR-015, FR-016, FR-018 | Fundación |
| T005–T007 | FR-004, FR-005, FR-006, FR-018; SC-005 | Fundación |
| T008–T010 | FR-001, FR-002, FR-004, FR-005, FR-013; SC-001, SC-005 | Fundación |
| T011–T012 | FR-003, FR-005, FR-009, FR-010, FR-017; SC-006, SC-007 | Fundación |
| T013–T016 | FR-007, FR-008, FR-013, FR-015, FR-016, FR-018; SC-003, SC-004, SC-009 | Fundación |
| T017–T020 | FR-017, FR-018, FR-019; SC-005, SC-010 | Fundación / puerta Supabase |
| T021–T025 | FR-001, FR-002, FR-010, FR-015, FR-016; SC-001, SC-002, SC-003, SC-010 | US1 |
| T026–T031 | FR-003, FR-005, FR-017, FR-018; SC-006, SC-007 | US2 |
| T032–T039 | FR-006, FR-007, FR-008, FR-009, FR-010, FR-018; SC-004, SC-005, SC-007, SC-010 | US3 |
| T040–T044 | FR-004, FR-006, FR-008, FR-009, FR-013, FR-014; SC-003, SC-004, SC-009 | US4 |
| T045–T048 | FR-004, FR-005, FR-008, FR-009; SC-003, SC-004, SC-009 | US5 |
| T049–T052 | FR-004, FR-005, FR-008, FR-009, FR-015; SC-003, SC-004, SC-009 | US6 |
| T053–T056 | FR-004, FR-005, FR-008, FR-009, FR-015; SC-003, SC-004, SC-009 | US7 |
| T057–T061 | FR-004, FR-005, FR-007, FR-008, FR-009, FR-011, FR-015; SC-003, SC-004, SC-008, SC-009 | US8 |
| T062–T065 | FR-004, FR-005, FR-007, FR-008, FR-009, FR-012; SC-003, SC-004, SC-009 | US9 |
| T066–T073 | FR-006, FR-010, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019; SC-002, SC-003, SC-005, SC-010 | Transversal |
| T074–T081 | FR-015, FR-016, FR-020, FR-021; SC-001, SC-002, SC-003, SC-011, SC-012 | Convergencia visual |

---

## Task execution metadata

La línea de cada tarea contiene su objetivo y archivos afectados; la tabla
completa la responsabilidad, la dependencia mínima y la verificación. Las
dependencias de la línea de persistencia (`T017–T019` y `T070`) son
condicionadas y no bloquean las tareas de dominio, componentes o fixtures.
`Equipo ...` identifica el responsable de trabajo, no requiere asignar una
persona antes de comenzar.

| ID | Responsable | Depende de | Verificación mínima |
|---|---|---|---|
| T001 | Equipo de plataforma | — | estructura creada y typecheck base |
| T002 | Equipo de plataforma | T001 | runners cargan sin errores |
| T003 | Equipo de plataforma | T001 | esquema de entorno rechaza secretos públicos |
| T004 | Equipo de plataforma | T001 | configuración de media valida dominios y límites |
| T005 | Equipo de contratos | T001 | typecheck y tipos discriminados |
| T006 | Equipo de contratos | T005 | pruebas de esquemas Zod |
| T007 | Equipo de contratos | T005–T006 | rechazo de campos de autoridad |
| T008 | Equipo de contenido | T005 | catálogo de seis juegos validado |
| T009 | Equipo de contratos | T005–T006 | registro y mapeo cubiertos por prueba |
| T010 | Equipo de aplicación | T005–T006 | contrato de operaciones y errores validado |
| T011 | Equipo de seguridad | T005–T006 | alias, cookie, expiración e idempotencia probados |
| T012 | Equipo de dominio | T005–T006 | fórmulas y límites de score probados |
| T013 | Equipo de contenido | T005–T006 | contenido y feedback pasan validación |
| T014 | Equipo de contenido | T008, T013 | manifiesto de media validado |
| T015 | Equipo de interfaz | T005–T006, T013 | shell y estados pasan prueba de accesibilidad |
| T016 | Equipo de aplicación | T010–T011 | frontera server-only probada |
| T017 | Equipo de persistencia | T005–T016 y aprobación de reconciliación | revisión SQL local, sin push |
| T018 | Equipo de contenido | T008, T013–T014 | seed valida estructura sin publicar Supabase |
| T019 | Equipo de persistencia | T017 y autorización renovada | smoke/RLS local; si no hay autorización queda pendiente |
| T020 | Equipo de contratos | T005–T016 | fixtures pasan consistencia contractual |
| T021 | Equipo US1 | T008–T009, T015 | portada pasa prueba de componentes |
| T022 | Equipo US1 | T008, T015 | tarjetas pasan teclado y foco |
| T023 | Equipo US1 | T009, T015 | rutas válida y desconocida pasan E2E |
| T024 | Equipo US1 | T021–T023 | no quedan formulario ni CTA principal obsoletos |
| T025 | Equipo US1 | T021–T024 | E2E, 320 px y prueba moderada menor de 30 s |
| T026 | Equipo US2 | T005–T006 | alias permitido y bloqueado cubiertos |
| T027 | Equipo US2 | T011, T016, T026 | startGame y cookie opaca probados |
| T028 | Equipo US2 | T010–T011, T016 | máquina de estados y pertenencia probadas |
| T029 | Equipo US2 | T028 | recuperación, expiración e invalidación probadas |
| T030 | Equipo US2 | T026–T029 | pruebas de aplicación siempre; RPC solo con puerta física |
| T031 | Equipo US2 | T027–T030 | E2E de aislamiento y recarga |
| T032 | Equipo US3 | T010, T012, T016, T028 | solución, score y finalización del cliente rechazados |
| T033 | Equipo US3 | T015, T032 | feedback inline y live region probados |
| T034 | Equipo US3 | T012, T032–T033 | resultado propio y aprendizaje probados |
| T035 | Equipo US3 | T012, T016, T034 | elegibilidad y ranking server-only probados |
| T036 | Equipo US3 | T034–T035 | página secundaria accesible |
| T037 | Equipo US3 | T034–T035 | estados vacío y retryable cubiertos |
| T038 | Equipo US3 | T032–T037 | feedback, idempotencia y proyección probados |
| T039 | Equipo US3 | T035–T037 | límite, clamp, expirados y empates probados |
| T040 | Equipo US4 | T008, T013 | ocho items pasan revisión estructural |
| T041 | Equipo US4 | T005–T006, T012, T040 | evaluador image_verdict probado |
| T042 | Equipo US4 | T015, T040–T041 | componente y teclado probados |
| T043 | Equipo US4 | T014, T040 | media, alt y fallback probados |
| T044 | Equipo US4 | T041–T043 | flujo completo y score máximo 80 |
| T045 | Equipo US5 | T008, T013 | seis escenas pasan revisión estructural |
| T046 | Equipo US5 | T005–T006, T012, T045 | evaluador group_action probado |
| T047 | Equipo US5 | T015, T045–T046 | chat, acciones y live region probados |
| T048 | Equipo US5 | T046–T047 | orden, consecuencias y score probados |
| T049 | Equipo US6 | T008, T013 | doce titulares pasan revisión estructural |
| T050 | Equipo US6 | T005–T006, T012, T049 | evaluador y bono de racha probados |
| T051 | Equipo US6 | T015, T049–T050 | swipe cancelable y controles equivalentes probados |
| T052 | Equipo US6 | T050–T051 | gesto, teclado y score máximo 16 |
| T053 | Equipo US7 | T008, T013 | nueve fuentes pasan revisión estructural |
| T054 | Equipo US7 | T005–T006, T012, T053 | evaluador y duplicado probados |
| T055 | Equipo US7 | T015, T053–T054 | tarjetas, categorías y anuncios probados |
| T056 | Equipo US7 | T054–T055 | fuente ajena, feedback y score máximo 9 |
| T057 | Equipo US8 | T008, T013 | publicaciones y señales SIFT validadas |
| T058 | Equipo US8 | T005–T006, T012, T016, T057 | reloj, expiración y carreras probados |
| T059 | Equipo US8 | T015, T057–T058 | pausa visual, foco y reloj autoritativo probados |
| T060 | Equipo US8 | T012, T057 | fórmula, piso 0 y máximo 30 |
| T061 | Equipo US8 | T058–T060 | timer, pausa, teclado y expiración probados |
| T062 | Equipo US9 | T008, T013 | cuatro pasos y autopsia validados |
| T063 | Equipo US9 | T005–T006, T012, T062 | evaluador y viralidad separada probados |
| T064 | Equipo US9 | T015, T062–T063 | flujo inline y no publicación externa probados |
| T065 | Equipo US9 | T063–T064 | orden, autopsia y score máximo 4 |
| T066 | Equipo transversal | T021–T065 | rutas antiguas retiradas tras pruebas nuevas |
| T067 | Equipo transversal | T015, T021–T065 | E2E de accesibilidad y revisión manual |
| T068 | Equipo transversal | T014, T040, T043, T045, T049, T053, T057, T062 | contrato de media y responsive |
| T069 | Equipo transversal | T006, T010, T016, T032, T035, T058, T063 | fronteras de servidor sin secretos |
| T070 | Equipo de persistencia | T017, T019 y autorización renovada | RLS local y purga revisadas; sin push |
| T071 | Equipo transversal | T021–T065 | presupuestos numéricos y estados medidos |
| T072 | Equipo transversal | T040–T071 | revisión manual y prueba de 30 s registradas |
| T073 | Equipo transversal | T001–T072 | comandos ejecutados y bloqueos documentados |
| T074 | Equipo visual | Decisión de convergencia aprobada | contratos y documentación coinciden |
| T075 | Equipo visual | T074 | fuentes, tokens, Tailwind y movimiento probados |
| T076 | Equipo visual | T075 | firma de portada visible en desktop y móvil |
| T077 | Equipo visual | T075–T076 | seis acentos estables y rejilla responsive |
| T078 | Equipo visual | T075 | shell y estados comparten identidad |
| T079 | Equipo visual | T075, T078 | componentes existentes conservan contratos |
| T080 | Equipo de calidad | T075–T079 | contratos, componentes y snapshots pasan |
| T081 | Equipo transversal | T074–T080 | evidencia y puertas finales registradas |

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup T001–T004: puede ejecutarse inmediatamente.
- Core Foundational T005–T016 y T020: depende de Setup y desbloquea el dominio,
  shell, fixtures y las historias. T017–T019 forman una línea de persistencia
  condicionada y no bloquean el trabajo que use gateways o fixtures server-only.
- User Stories T021–T065: dependen de la fundación; cada historia debe poder
  probarse de forma aislada.
- Polish T066–T073: depende de las historias seleccionadas y de la validación
  de sus contratos.
- Convergencia visual T074–T081: corrige de forma append-only las entregas
  parciales de portada y shell; no depende de ejecutar la línea Supabase.
- T017–T019 y T070 no se ejecutan sin aprobación explícita de la reconciliación
  física de Supabase; esta restricción no autoriza push remoto.

### User Story Dependencies

- US1: depende de T005, T008, T009, T014 y T015.
- US2: depende de T005, T006, T010, T011, T016, T020 y T026.
- US3: depende de T005, T006, T010, T012, T015, T016 y T020.
- US4–US9: pueden comenzar después de T005–T016 y T020 y avanzar en paralelo si no
  comparten archivos; cada una depende de su contenido, evaluador y componente.
  Las pruebas RPC de T019 se incorporan cuando la puerta física esté aprobada,
  sin detener las pruebas de contrato, componentes o E2E con fixtures.

### Parallel Opportunities

- Setup: T001, T002, T003 y T004.
- Foundational: T007, T008, T013, T014 y T020 después de T005–T006; T017–T019
  quedan separados por la puerta de Supabase y no bloquean la línea lógica.
- US1: T021 y T022; después T023–T025.
- US2: T026 en paralelo con la fundación ya cerrada; luego T027–T029 en orden;
  T030 después de T026–T029 (no es paralela); T031 al cierre.
- US3: T033 y T035 cuando T032 esté listo; T038 y T039 después de sus
  componentes.
- US4–US9: el contenido de cada historia puede avanzar en paralelo con su
  evaluador, siempre que no se modifique el mismo archivo.
- Polish: T067, T068, T069 y T071 pueden ejecutarse en paralelo.
- Convergencia visual: T076–T079 pueden avanzar tras T075; T080 y T081 cierran
  pruebas y evidencia.

## Parallel Example: Mechanics

Después de completar T005–T016 y T020, se pueden asignar US4, US5, US6, US7, US8 y
US9 a integrantes distintos. Cada integrante modifica únicamente sus archivos
de contenido, dominio, componente y pruebas, y se integra mediante el registro
de mecánicas compartido.

## Implementation Strategy

### MVP First

1. Completar T001–T016 y T020; dejar T017–T019 en la línea de persistencia
   condicionada si la reconciliación física aún no está aprobada.
2. Completar US1, US2 y US3.
3. Completar US4 como primer juego plenamente navegable.
4. Ejecutar T044, T073 y las pruebas de seguridad aplicables.
5. Detenerse para validar el slice de ¿Real o IA? antes de añadir las demás
   mecánicas.

### Incremental Delivery

1. Entregar portada y sesión arcade.
2. Añadir feedback, resultado y ranking global secundario.
3. Añadir ¿Real o IA?.
4. Añadir El Grupo, Clickbait Swipe, Radar de Fuentes, Feed 60” y Mente Maestra
   como historias independientes.
5. Ejecutar pulido, accesibilidad, rendimiento y verificación final.

### Notes

- Cada tarea tiene checkbox, ID, ruta concreta y, en las fases de historias,
  etiqueta US.
- T017–T019 y T070 conservan la frontera de no publicar Supabase.
- T017–T019 y T070 pertenecen a la línea de persistencia condicionada; las
  historias pueden avanzar con gateways y fixtures server-only mientras esa
  línea espera aprobación.
- No se debe marcar una tarea completa solo porque existan sus archivos; debe
  pasar su verificación. En particular, la migración generada localmente no
  completa T017 hasta T019/autorización renovada.
- US4–US7 marcadas parciales con fixtures no implican flujo autoritativo
  completo; US2–US3 son prerequisito de “jugable de punta a punta”.
- Feedback educativo vive inline en el shell; T034 (`/result`) solo proyecta
  el cierre de partida.
