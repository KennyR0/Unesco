# Aprobación educativa del catálogo MVP

approvalSchemaVersion: 1
approvalRevision: 1
catalogVersion: 2026-07-30.1
decision: approved
reviewerRole: Líder QA de Accesibilidad e Investigación UX
reviewerInitials: UX
approverRole: Líder técnico
approverInitials: LT
reviewedAt: 2026-07-30
catalogDigestAlgorithm: SHA-256
catalogDigest: e03d507305c6a407ba77c8d0ee81f8b1de964e48b6b6ec4c13e7aadc0bd32344

`approvalRevision` es la revisión numérica de esta evidencia y es independiente de
`catalogVersion`. La revisión 1 aprueba el catálogo `2026-07-30.1`; una corrección de
trazabilidad sin cambio de contenido incrementa solo `approvalRevision`, mientras que
un cambio de contenido, fuente o recurso exige una nueva versión aplicable y una nueva
revisión editorial completa.

## Criterios

| Criterio | Resultado | Observación |
|---|---|---|
| Exactitud educativa | pass | Las diez explicaciones describen prácticas de verificación básicas y son coherentes con las señales y recomendaciones. |
| Correspondencia pregunta/respuesta/explicación | pass | Cada pregunta tiene una respuesta propia y una explicación que justifica la decisión. |
| Relevancia de señales | pass | Cada señal se relaciona con la comprobación propuesta para el contenido evaluado. |
| Claridad y utilidad de recomendación | pass | Cada recomendación propone una acción concreta, comprensible y aplicable fuera del juego. |
| Calidad, vigencia y trazabilidad de fuentes | pass | La revisión enlaza cada afirmación educativa con la especificación y conserva localizador, pasaje y huella de la fuente. |
| Ausencia de afirmaciones no sustentadas | pass | No se incluyen cifras ni afirmaciones externas sin una fuente verificable. |
| Lenguaje comprensible | pass | Frases breves, español claro y sin jerga técnica innecesaria. |
| Ausencia de sesgos o generalizaciones engañosas | pass | No se atribuyen conductas a grupos ni se usan absolutos engañosos. |
| Licencia/procedencia de recursos | pass | Las dos imágenes materializadas son recursos originales del repositorio, verificadas por ruta, formato, tamaño y SHA-256; no se depende de una URL externa ni de una licencia de terceros no documentada. |
| Privacidad y minimización de datos | pass | El catálogo no contiene datos personales ni identificadores de participantes. |

Cada criterio tiene un resultado verificable y una observación. La decisión `approved` solo cubre los contenidos, fuentes y recursos
identificados en esta evidencia.

## Contenido y recursos aprobados

| publicRef | contentVersion | recurso | versión del recurso | metadatos verificados |
|---|---|---|---|---|
| Q000000000000000000002 | 2026-07-30.1 | `/images/questions/contexto-fuera-de-campo.webp` | 1 | WebP, 640x640, 35164 bytes, alt presente |
| Q000000000000000000008 | 2026-07-30.1 | `/images/questions/deepfake-iluminacion.webp` | 1 | WebP, 640x640, 12380 bytes, alt presente |

Las dos rutas anteriores son las únicas imágenes materializadas por `seed.sql` y por
la migración de Production correspondiente a este catálogo. Ambas existen dentro de
`public/images/questions/`, están por debajo del máximo de 1000000 bytes y sus huellas
reproducibles son:

| recurso | provenanceType | license | provenanceLocator | resourceFingerprintType | resourceFingerprint |
|---|---|---|---|---|---|
| `contexto-fuera-de-campo.webp` | repository_original | project-original | `public/images/questions/contexto-fuera-de-campo.webp` | sha256 | `986CC5388B8213ADB10F375A603C669F8EC610DFF5926024513E61F4F2D35418` |
| `deepfake-iluminacion.webp` | repository_original | project-original | `public/images/questions/deepfake-iluminacion.webp` | sha256 | `B792D0026B063A3E92D3FB55928BC827D8E7637707C559EC7190743A576536B6` |

`repository_original` y `project-original` significan que el recurso se entrega como
activo original del proyecto bajo la licencia definida por el repositorio; la
verificación reproducible para este corte es la ruta local, la firma WebP, los
metadatos de la proyección aprobada y el SHA-256 registrado arriba. Un cambio de
archivo, ruta, procedencia o derechos invalida esta aprobación.

## Fuentes verificadas

- sourceId: editorial-media-literacy-mvp
  consultedAt: 2026-07-30
  stableLocator: specs/001-trivia-mvp-flow/spec.md#fr-028
  verifiedPassage: La experiencia enseña señales de desinformación y recomienda verificar fuente, evidencia y contexto.
  sourceFingerprintType: stable_revision
  sourceFingerprint: 2026-07-30
- sourceId: media-contract-mvp
  consultedAt: 2026-07-30
  stableLocator: specs/001-trivia-mvp-flow/contracts/media.md#contenido-educativo-y-recursos
  verifiedPassage: Los recursos publicados deben ser locales, declarar alternativa, dimensiones, formato y peso dentro del límite.
  sourceFingerprintType: stable_revision
  sourceFingerprint: 2026-07-30

## Observaciones y decisión

- La revisión del rol `Líder QA de Accesibilidad e Investigación UX` cubrió los diez
  criterios, las diez preguntas, las fuentes y los dos recursos.
- El `Líder técnico` comprobó la revisión separada y emitió la decisión final
  `approved`; la responsabilidad principal de materialización sigue siendo T044 del
  `Líder de Datos y Supabase`.
- Seed y migración son consumidores de esta aprobación y no la sustituyen. T044 sigue
  pendiente hasta cerrar `db lint`, Cron real y las pruebas de reloj/concurrencia.

La aprobación es válida solo para `catalogVersion` `2026-07-30.1`,
`approvalRevision` 1 y las preguntas, fuentes y recursos con el digest registrado. Un
cambio en preguntas, fuentes, licencias, procedencia o recursos exige volver a `draft`,
incrementar la versión aplicable, emitir una revisión nueva y repetir la rúbrica.
