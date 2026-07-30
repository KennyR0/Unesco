# Checklist de calidad documental: Trivia educativa MVP

**Purpose**: Evaluar la completitud, claridad, consistencia y mensurabilidad de los
requisitos corregidos sobre recuperación segura, moderación básica de alias, cohorte
MVP de usabilidad, aprobación educativa, fuente única de responsables y línea base
documental antes de implementar.
**Created**: 2026-07-30
**Feature**: [spec.md](../spec.md)
**Depth**: Formal
**Audience**: Revisión previa a implementación

**Note**: Esta lista evalúa la calidad de los requisitos escritos; no comprueba el
comportamiento de una implementación.

## Completitud de requisitos

- [x] CHK001 ¿La presentación pública común está definida para todos los estados sin partida recuperable, incluidos `SESSION_NOT_FOUND`, `SESSION_INVALID` y `RESULT_ACCESS_EXPIRED`? [Completeness, Spec §Error and Recovery Matrix, Contracts §errors]
- [x] CHK002 ¿El mensaje canónico y las dos acciones públicas están especificados literalmente una sola vez o mediante una fuente inequívoca compartida? [Completeness, Contracts §errors, Contracts §game-api]
- [x] CHK003 ¿Los requisitos distinguen de forma completa cookie ausente, cookie presente desconocida, cookie malformada, sesión invalidada y resultado vencido? [Completeness, Plan §Estados transversales, Tasks §T060/T095/T105/T120]
- [x] CHK004 ¿Está documentada la prohibición de cookie auxiliar, `localStorage`, query parameter y cualquier marcador persistente de “sesión anterior”? [Completeness, Contracts §game-api, Contracts §errors]
- [x] CHK005 ¿`spec.md` define como fuente única la ruta, esquema, versión, normalización y contenido inicial completo del fixture? [Completeness, Spec §FR-008/Assumptions, Plan §Configuración de moderación básica de alias]
- [x] CHK006 ¿El proceso canónico de actualización documenta incremento de versión, cambio incompatible de esquema, justificación, pruebas y revisores obligatorios sin una segunda definición? [Completeness, Spec §Assumptions, Plan §Configuración de moderación básica de alias]
- [x] CHK007 ¿La Cohorte MVP de usabilidad incluye todas las cuotas de edad, idioma, experiencia digital, dispositivo y sistema operativo? [Completeness, Spec §Cohorte MVP de usabilidad]
- [x] CHK008 ¿Los niveles digitales básico, intermedio y avanzado están definidos de forma exhaustiva y mutuamente interpretable? [Completeness, Spec §Cohorte MVP de usabilidad]
- [x] CHK009 ¿La evidencia de usabilidad especifica tanto los campos mínimos permitidos como todos los datos prohibidos? [Completeness, Spec §Cohorte MVP de usabilidad, Tasks §T145]
- [x] CHK010 ¿El `Protocolo de usabilidad y consentimiento` está identificado por nombre, ubicación, autoridad responsable y evidencia mínima admisible? [Completeness, Quickstart §Protocolo de usabilidad y consentimiento, Spec §Cohorte MVP de usabilidad, Tasks §T145]

## Claridad de requisitos

- [x] CHK011 ¿El orden `trim → NFC → minúsculas de locale español → comparación exacta` está expresado sin permitir una secuencia alternativa? [Clarity, Spec §FR-008]
- [x] CHK012 ¿Está claro que no se colapsan espacios internos y que las coincidencias parciales permanecen permitidas? [Clarity, Spec §FR-008, Tasks §T054]
- [x] CHK013 ¿La diferencia entre `schemaVersion` y `listVersion` permite determinar objetivamente cuándo incrementar cada valor? [Clarity, Spec §Assumptions]
- [x] CHK014 ¿“Las mismas acciones públicas” conserva un significado inequívoco aunque “Iniciar otra partida” sea enlace normal sin cookie y pueda ejecutar higiene con cookie inválida? [Clarity, Contracts §errors/game-api, Tasks §T095/T105/T120]
- [x] CHK015 ¿La expresión “sin traducción asistida” delimita suficientemente qué apoyo lingüístico está permitido durante la prueba? [Clarity, Spec §Cohorte MVP de usabilidad]
- [x] CHK016 ¿Las categorías “teléfono” y “computador portátil o de escritorio” evitan solapamientos con tabletas u otros dispositivos no contemplados? [Clarity, Spec §Cohorte MVP de usabilidad]

## Consistencia entre artefactos

- [x] CHK017 ¿FR-034 y FR-065 mantienen en todos los artefactos la misma precedencia: FR-065 gobierna invalidación y FR-034 complementa recuperación? [Consistency, Spec §FR-034/FR-065, Plan §Estrategia de pruebas basada en riesgos]
- [x] CHK018 ¿`RESULT_NOT_AVAILABLE` queda reservado a sesiones válidas no finalizadas y `RESULT_ACCESS_EXPIRED` a sesiones finalizadas fuera de `result_access_until`? [Consistency, Research §Decisión 4, Data Model §Transiciones, Contracts §getGameResult]
- [x] CHK019 ¿La presentación pública común conserva códigos internos distintos de forma consistente en dominio, logs, contratos y tareas? [Consistency, Contracts §errors, Tasks §T017/T102/T105/T120]
- [x] CHK020 ¿La rama sin cookie permanece libre de escritura en research, plan, contratos y tareas, sin referencias residuales a `clearInvalidSession` obligatorio? [Consistency, Research §Subdecisión 3A, Plan §Recuperación y pregunta, Tasks §T060/T086/T095]
- [x] CHK021 ¿`spec.md` conserva la única definición completa del fixture y `plan.md`/T054 la consumen por referencia sin redefinirla? [Consistency, Spec §Assumptions, Plan §Configuración de moderación básica de alias, Tasks §T054]
- [x] CHK022 ¿SC-001 y SC-010 remiten a una única cohorte y T145 exige fallar ante cualquier cuota incompleta? [Consistency, Spec §SC-001/SC-010, Tasks §T145]
- [x] CHK023 ¿Las referencias normativas de T134, T141, T143 y T147 corresponden a FR-062, y T141 incorpora además FR-066, sin desplazar la cobertura de FR-060 en T020? [Traceability, Tasks §T020/T134/T141/T143/T147]

## Calidad de criterios de aceptación

- [x] CHK024 ¿Los casos mínimos cubren mayúsculas, espacios exteriores, NFC, coincidencia parcial y un mensaje neutral con acción correctiva sin diagnóstico técnico? [Acceptance Criteria, Spec §AC-US2-03/FR-009, Tasks §T054/T126]
- [x] CHK025 ¿La igualdad de mensaje y acciones públicas puede medirse de forma exacta sin exigir igualdad de los códigos internos? [Measurability, Tasks §T017/T095/T105/T120]
- [x] CHK026 ¿Cada cuota de la Cohorte MVP puede auditarse con P01–P10 y producir un resultado binario de aprobación o bloqueo? [Measurability, Spec §Cohorte MVP de usabilidad, Tasks §T145]
- [x] CHK027 ¿Los umbrales de 90 %, 80 % y 60 segundos se aplican explícitamente a la misma cohorte y al mismo protocolo de observación? [Acceptance Criteria, Spec §SC-001/SC-010]
- [x] CHK028 ¿La minimización de evidencia permite demostrar cumplimiento sin recopilar datos prohibidos ni identificadores persistentes? [Acceptance Criteria, Spec §Cohorte MVP de usabilidad, Quickstart §Protocolo, Tasks §T145]

## Cobertura de escenarios y casos límite

- [x] CHK029 ¿Los requisitos cubren el acceso directo sin cookie sin inferir una sesión previa y sin crear estado local nuevo? [Coverage, Spec §Error and Recovery Matrix, Contracts §errors]
- [x] CHK030 ¿Los requisitos cubren una cookie presente pero desconocida o malformada sin confiar en identificadores aportados por cliente? [Coverage, Contracts §clearInvalidSession, Tasks §T060/T095]
- [x] CHK031 ¿Los requisitos cubren una sesión invalidada por 24 horas con la misma presentación pública y con diagnóstico interno conservado? [Coverage, Spec §FR-065, Contracts §errors]
- [x] CHK032 ¿Los requisitos cubren un resultado vencido sin invalidar la sesión, alterar ranking, modificar fechas o limpiar la cookie durante la lectura? [Coverage, Data Model §Transiciones, Contracts §getGameResult, Tasks §T101/T116/T120]
- [x] CHK033 ¿Los requisitos cubren una sesión activa todavía no finalizada y evitan confundir `RESULT_NOT_AVAILABLE` con la vista pública de acceso vencido? [Coverage, Contracts §getGameResult, Tasks §T039/T102]
- [x] CHK034 ¿Los requisitos de moderación contemplan equivalencia canónica, mayúsculas, espacios exteriores, alias permitido y coincidencia parcial permitida sin prometer moderación exhaustiva? [Coverage, Spec §FR-008, Tasks §T054/T126]

## Dependencias, supuestos y gobernanza

- [ ] CHK035 ¿`tasks.md` es la única fuente normativa de responsables y `spec.md`/`plan.md` se limitan a referenciarla sin repetir asignaciones concretas? [Dependency, Plan §Gobernanza documental, Tasks §Convenciones de ejecución]
- [ ] CHK036 ¿Las revisiones obligatorias de contenido y del fixture están asignadas una sola vez en `tasks.md`, acotadas por propósito y descritas como puertas que no crean corresponsabilidad? [Clarity, Tasks §Convenciones de ejecución/T044/T054]
- [x] CHK037 ¿La obligación de consentimiento para menores se alinea con la minimización de datos y evita introducir evidencia identificable? [Consistency, Spec §Cohorte MVP de usabilidad, Quickstart §Protocolo, Tasks §T145]
- [ ] CHK038 ¿Los once roles responsables usados en T001–T150 conservan exactamente un propietario principal por tarea y cualquier cambio futuro debe iniciarse en `tasks.md`? [Governance, Constitution §X, Tasks §Convenciones de ejecución]

## Aprobación educativa

- [ ] CHK039 ¿La puerta define los seis estados editoriales, todas sus transiciones permitidas y la prohibición absoluta de publicar cualquier estado distinto de `approved`? [Completeness, Spec §Puerta de aprobación educativa]
- [ ] CHK040 ¿La rúbrica cubre exactamente los diez criterios mínimos de calidad educativa, fuentes, sesgo, derechos y privacidad, con resultado verificable por criterio? [Completeness, Spec §Puerta de aprobación educativa, Tasks §T044]
- [ ] CHK041 ¿Están definidos de forma inequívoca el rol que revisa, el rol que aprueba o rechaza, la separación de decisiones y los criterios para `changes_requested` y `rejected`? [Governance, Tasks §Convenciones de ejecución, Spec §Puerta de aprobación educativa]
- [ ] CHK042 ¿La evidencia mínima permite identificar versión de catálogo, contenido y recursos, responsables, fecha, resultados, fuentes, derechos, observaciones y decisión final? [Traceability, Spec §Puerta de aprobación educativa]
- [ ] CHK043 ¿Todo cambio de contenido, fuente o recurso invalida la aprobación anterior, incrementa la versión aplicable, obliga a repetir T044 y es revalidado por T145 antes de Production, sin tratar SQL o despliegue como aprobación? [Consistency, Spec §Puerta de aprobación educativa, Plan/Research §Contenido educativo, Tasks §T044/T145/T146]
- [ ] CHK044 ¿AC-US4-03 y SC-004 miden calidad y vigencia educativa del catálogo completo, además de la presencia estructural de campos? [Acceptance Criteria, Spec §US4/Success Criteria]
- [ ] CHK045 ¿T044 falla ante evidencia ausente, incompleta, no vigente o no aprobada, valida la rúbrica completa y compara exactamente evidencia, seed, migración y recursos? [Measurability, Tasks §T044]

## Línea base documental

- [ ] CHK046 ¿La línea base enumera Constitución, especificación, plan, tareas, research, modelo, quickstart, contratos, checklists y demás artefactos normativos del feature? [Completeness, Quickstart §Línea base documental]
- [ ] CHK047 ¿El procedimiento exige revisar estado, ignore, secretos y temporales antes de agregar archivos, sin imprimir valores sensibles? [Security, Quickstart §Línea base documental]
- [ ] CHK048 ¿El staging está limitado a `.gitignore`, `.specify/` y el feature aprobado, con revisión obligatoria de nombre, contenido, whitespace y ausencia de `.agents/`? [Governance, Quickstart §Línea base documental]
- [ ] CHK049 ¿La decisión sobre `.agents/` queda separada y condicionada a su naturaleza contractual, local o generada y a la política del repositorio? [Scope, Plan/Quickstart §Línea base documental]
- [ ] CHK050 ¿Checkpoint 0 aparece en los grafos de `plan.md` y `tasks.md`, bloquea el inicio de cualquier tarea T001–T150 y ninguna tarea declara una dependencia local que permita omitirlo antes de que exista el commit documental y el árbol esté limpio o explicado? [Dependency, Plan §Dependencias entre fases, Tasks §Checkpoint 0/T010, Quickstart §Línea base documental]

## Notes

- Marcar cada ítem completado con `[x]`.
- Documentar hallazgos o decisiones junto al ítem correspondiente.
- Esta checklist no autoriza cambios de implementación ni marca tareas T001–T150
  como completadas.
- Tras aplicar este parche, CHK035–CHK036 y CHK038–CHK050 permanecen abiertos hasta
  ejecutar sus verificaciones; no deben marcarse por inferencia.

## Revalidación de coherencia posterior al parche

- [x] CHK051 ¿Están documentados de forma exhaustiva los insumos y objetivos de comparación que T145 debe revalidar —decisión, criterios, `approvalSchemaVersion`, `approvalRevision`, `catalogVersion`, `catalogDigestAlgorithm`, `catalogDigest`, claves SQL, preguntas, fuentes, huellas, licencias y recursos— antes de Production? [Completeness, Spec §Puerta de aprobación educativa, Tasks §T044/T145/T146]
- [x] CHK052 ¿Es inequívoco qué cambios externos o internos vuelven obsoleta una aprobación y en qué momento debe repetirse T044 antes de continuar con T145? [Clarity, Spec §Puerta de aprobación educativa, Tasks §T044/T145]
- [x] CHK053 ¿La transferencia de T145 a T146 conserva una única evidencia educativa autoritativa, compara el digest de la proyección canónica y evita que sincronización, migración o despliegue se interpreten como aprobación? [Consistency, Plan §Estrategia de contenido educativo, Tasks §T145/T146]
- [x] CHK054 ¿El árbol documental distingue claramente artefactos normativos existentes de evidencias futuras que solo pueden aparecer al ejecutar su tarea correspondiente y enumera todas las rutas declaradas? [Clarity, Plan §Documentación de la feature]
- [ ] CHK055 ¿La política de regeneración del backlog especifica qué asignaciones, puertas y correcciones deben preservarse sin crear una fuente normativa alternativa a `tasks.md`? [Governance, Plan §Validación del backlog generado, Tasks §Convenciones de ejecución]
- [ ] CHK056 ¿Los grafos de fases, Checkpoint 0 y las dependencias locales expresan el mismo orden obligatorio sin permitir que una tarea con dependencia vacía omita la línea base documental? [Consistency, Plan §Dependencias entre fases, Tasks §Checkpoint 0/T001/T010]
- [ ] CHK057 ¿Las consecuencias de evidencia educativa ausente, incompleta, desactualizada o divergente están definidas de forma consistente para T044, T145 y T146, incluido el estado pendiente o bloqueado? [Exception Coverage, Tasks §T044/T145/T146]
- [x] CHK058 ¿Las rutas previstas bajo `evidence/` cubren los artefactos citados por las tareas sin implicar que existen, están aprobados o pueden marcar una tarea como completa antes de producirse? [Completeness, Plan §Documentación de la feature, Constitution §XI]
- [x] CHK059 ¿Cada tarea T001–T150 contiene una referencia directa a uno o más `FR-###`/`SC-###`, o existe una matriz equivalente auditable que permita reconstruir esa cobertura sin inferirla solo desde la historia? [Traceability, Tasks §Convenciones de ejecución/Resumen cuantitativo/Matriz FR/SC complementaria]
- [x] CHK060 ¿La única ruta pública `/leaderboard` y el mecanismo de reloj controlado para expiración, resultado y Cron están definidos en los requisitos y son consumidos de forma consistente por plan y tareas? [Consistency, Spec §FR-003/Mecanismo de reloj controlado, Plan §Ranking/Reloj controlado, Tasks §T040/T053/T112]
