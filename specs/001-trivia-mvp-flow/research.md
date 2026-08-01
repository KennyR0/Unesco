# Investigación técnica y de producto: Antídoto Arcade

**Fecha**: 2026-07-31
**Estado**: decisiones documentales; no autoriza implementación.

## Resultado

El prototipo ya contiene las seis experiencias que necesita la redefinición:
real-o-ia, grupo, titulares, radar, feed y mente-maestra. La nueva feature debe
reutilizar sus intenciones y contenido inicial, pero no importar su motor
estático, localStorage, overlays ni fórmulas como contratos.

## Decisiones

### 1. Mantener una sola feature

Se continúa en specs/001-trivia-mvp-flow. Crear una 002 dividiría la historia
documental y ocultaría que la ronda single_choice anterior está siendo
reemplazada.

### 2. Mantener Next.js como tecnología nueva

El checkout ya contiene una base Next.js. La arquitectura futura usa App Router,
Server Components por defecto, Client Components acotados, TypeScript estricto,
Tailwind y Supabase server-only. El prototipo queda fuera del build.

### 3. Usar rutas dinámicas y un shell compartido

La portada dirige a games/[gameCode]. El shell mantiene introducción,
progreso, feedback y resultado; cada mecánica tiene un componente especializado.
Esto conserva la navegación arcade sin forzar todos los juegos a la misma
pregunta.

### 4. Separar acciones por discriminante

Las seis entradas son distintas: verdict, group_action,
headline_classification, source_classification, feed_action y autopsy_choice.
El contrato común valida gameCode, mechanic e itemId, pero no comparte una
forma de solución o puntuación.

### 5. Mantener el feedback inline

El prototipo usa toasts y overlays. La nueva experiencia debe conservar el
ritmo visual, pero la explicación, señales y recomendación deben permanecer en
la misma vista y ser anunciables.

### 6. Sesión independiente por juego

Cada gameCode crea y recupera su propia sesión. El cliente no puede cambiar
gameCode, itemId, solución, puntos ni finalización.

### 7. Mantener el ranking global, pero secundario

El ranking se conserva como estaba, pero queda subordinado al aprendizaje:
es global, muestra como máximo diez resultados elegibles, aparece después del
resultado o desde navegación secundaria y no forma parte del landing principal.
La métrica global se normaliza desde la puntuación propia de cada juego solo para
ordenar la lectura; no se presenta como objetivo competitivo. Esta decisión es
compatible con la constitución 1.0.0 y mantiene su alcance.

### 8. Tratar la puntuación como decisión aprobada

El prototipo tiene fórmulas incompatibles entre sí y Mente Maestra no evalúa
aciertos. scoring-proposal.md registra la línea base y la propuesta aprobada
provisionalmente el 2026-07-31. Los contratos pueden incorporar esos campos;
la implementación sigue pendiente del backlog regenerado.

### 9. Tratar Supabase como auditoría local

Hay 22 migraciones y un seed locales no versionados, con modelo single_choice.
Se conserva su intención de seguridad, sesiones y auditoría, pero no se
consideran definitivos ni se modifican, aplican o publican en esta revisión.

## Riesgos abiertos

| Riesgo | Mitigación documental |
|---|---|
| La nueva mecánica se reduzca a una pregunta única | payloads discriminados y matriz de mecánicas |
| Puntuación desigual premie velocidad o daño | escalas por juego, límites explícitos y feedback educativo |
| Ranking global gane protagonismo competitivo | ruta posterior al resultado, máximo diez entradas, ausencia en el landing y copia neutral |
| Supabase viejo se trate como esquema final | puerta de reconciliación antes de migrar |
| El gesto Swipe excluya teclado | botones, flechas y cancelación como contrato |
| Feed 60” sea inaccesible | tiempo textual, aviso y expiración autoritativa |
| Imágenes provisionales parezcan definitivas | versión editorial, alt, derechos y sustitución explícita |

## Alternativas descartadas

- Crear una segunda feature: descartado por continuidad de la revisión.
- Mantener cinco preguntas y añadir un sexto modo encima: descartado porque
  perpetúa el contrato single_choice.
- Copiar el prototipo al nuevo build: descartado para evitar deuda técnica y
  defectos de accesibilidad.
- Usar la puntuación normalizada como si fuera la puntuación educativa:
  descartado; cada juego conserva su escala aprobada y el porcentaje solo ordena
  la lectura global secundaria.
