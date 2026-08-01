# Propuesta de puntuación del arcade Antídoto

**Estado**: aprobada provisionalmente el 2026-07-31.
**Decisión registrada**: se conserva la fórmula propuesta por juego hasta una
revisión posterior; la puntuación debe apoyar el aprendizaje y no dominar la
experiencia.

## Línea base observada en el prototipo

| Juego | Acciones actuales | Aciertos y errores actuales | Bonos/tiempo | Límite actual |
|---|---|---|---|---|
| ¿Real o IA? | Elegir Real o Generada por IA | +1 por acierto; 0 por error | Sin bono ni temporizador | 8 imágenes; máximo 8 |
| El Grupo | Elegir reenviar, verificar o frenar | 2, 1 o 0 según la opción | Sin bono ni temporizador | 6 escenas; máximo 12 |
| Clickbait Swipe | Clasificar titular | +1 por acierto; 0 por error | Racha visual sin puntos | 12 titulares; máximo 12 |
| Radar de Fuentes | Asignar una categoría | +1 por colocación correcta; error sin consumo | Sin bono ni temporizador | 9 fuentes; máximo 9 |
| Feed 60” | Verificar, compartir o descartar | Valores variables, positivos y negativos | Verificar consume 4 s y puede dar +4 | 60 s y hasta 10 publicaciones |
| Mente Maestra | Elegir cuatro piezas | Sin acierto/error; viralidad distinta por opción | Sin bono ni temporizador | 4 pasos; viralidad 65–95 |

## Fórmula aprobada

La puntuación educativa es independiente por juego. Las escalas nativas no se
comparan entre juegos porque representan habilidades distintas.

| Juego | Acción evaluada | Acierto | Error | Bono/penalización | Tiempo | Límite y rango |
|---|---|---:|---:|---|---|---|
| ¿Real o IA? | Veredicto sobre cada imagen | +10 | 0 | Ninguno | No aplica | 8 imágenes, 0–80 |
| El Grupo | Reenviar, verificar o frenar | +2 si protege y verifica; +1 si frena parcialmente; 0 si amplifica o actúa sin comprobar | 0 | Ninguno | No aplica | 6 escenas, 0–12 |
| Clickbait Swipe | Clasificación izquierda/derecha o botones | +1 | 0 | +1 por cada racha completa de 3 aciertos, máximo +4 | No aplica | 12 titulares, 0–16 |
| Radar de Fuentes | Clasificación en tres categorías | +1 | 0 | Ninguno | No aplica | 9 fuentes, 0–9 |
| Feed 60” | Compartir o descartar; verificar es proceso | +2 si la decisión es adecuada | -1 si amplifica o descarta de forma inadecuada | +1 por decisión adecuada después de verificar; piso 0 | 60 s; verificar consume 4 s | Hasta 10 publicaciones, 0–30 |
| Mente Maestra | Completar objetivo, emoción, titular y prueba | +1 por paso completado | 0 | Ninguno; viralidad separada de puntos | No aplica | 4 pasos, 0–4; viralidad simulada 65–95 |

## Métrica separada para el ranking global

Para conservar el ranking global de la línea base sin alterar las escalas
educativas, el servidor puede calcular rankingScore como
round(points / maxPoints * 100). Esta métrica solo ordena la lectura global de
hasta diez resultados elegibles; no se muestra como la puntuación principal, no
modifica GameScore y no se usa para decidir si una respuesta enseña o no.

El ranking se ofrece después del resultado o desde navegación secundaria, nunca
como tarjeta del landing ni como llamada competitiva.

Regla operativa aprobada: el servidor calcula `rankingScore` como
`clamp(round(points / maxPoints * 100), 0, 100)` solo después de comprobar
`maxPoints > 0`. Si el denominador es cero o negativo, el resultado queda fuera
del ranking y no se fabrica un porcentaje. La elegibilidad exige resultado
`finished`, todos los items respondidos, alias permitido, score acotado y
ausencia de marcas de abuso o invalidez; los resultados expirados o incompletos
se excluyen.

## Resultado educativo

- ¿Real o IA? muestra pistas de manos, texto, sombras, anatomía y textura.
- El Grupo muestra consecuencias, fuentes oficiales, contexto y cuidado
  comunitario.
- Clickbait Swipe muestra urgencia, vaguedad, emoción y curiosity gap.
- Radar muestra dominio, autoría, fecha, referencias, sátira y phishing.
- Feed 60” resume señales SIFT, contexto, fuente, fecha y gráficos manipulados.
- Mente Maestra muestra la autopsia de las técnicas elegidas; la viralidad
  simulada no es un premio por producir daño.

## Decisión registrada

La persona responsable indicó: “Déjalo así por el momento”. Por tanto:

- la escala distinta por juego queda aprobada;
- se conserva el bono de racha de Clickbait Swipe;
- Feed 60” conserva penalización, piso 0, límite de 60 s y coste de 4 s;
- Mente Maestra mide finalización educativa y mantiene viralidad separada;
- los contratos y el modelo ya pueden incorporar estos valores;
- una revisión futura puede cambiar la fórmula mediante una actualización
  contractual explícita.
