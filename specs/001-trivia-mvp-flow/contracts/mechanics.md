# Contrato de mecánicas del arcade

**Estado**: contrato de interacción, feedback y puntuación aprobado el
2026-07-31.

## Reglas comunes

Cada mecánica declara gameCode, mechanic, itemId, prompt, contenido público,
entrada permitida, estado de feedback y siguiente acción. El servidor resuelve
la sesión y no acepta un campo adicional para corregir, puntuar, finalizar o
saltar un item.

La respuesta pública previa a la acción no puede contener:

- solución o etiqueta correcta;
- puntos por opción, bono, penalización o rango;
- clave, índice o expresión de evaluación;
- item siguiente no autorizado;
- reloj enviado por el cliente;
- resultado final.

Después de una acción aceptada, el servidor puede revelar la solución del item
y debe devolver explicación, señales y recomendación. El feedback aparece en la
misma vista antes de advance.

La puntuación sale del servidor según scoring-proposal.md. El cliente nunca
envía puntos ni ranking.

## ¿Real o IA?

- Entrada: verdict con valor real o ai.
- Presentación: una imagen, contexto y dos botones equivalentes.
- Resultado: veredicto, pistas de autenticidad o artefactos sintéticos,
  explicación y recomendación de búsqueda inversa.
- Puntuación: +10 por acierto, 0 por error, máximo 80 en 8 imágenes.

## El Grupo

- Entrada: group_action con forward, verify o pause.
- Presentación: mensajes ordenados, remitente, contexto temporal y acciones
  visibles.
- Resultado: consecuencia narrativa segura, evaluación de la decisión y
  siguiente escena.
- Seguridad educativa: una alerta oficial verificada también puede ser correcta.
- Puntuación: +2 si protege y verifica, +1 si frena parcialmente, 0 si
  amplifica o actúa sin comprobar; máximo 12 en 6 escenas.

## Clickbait Swipe

- Entrada: headline_classification con journalism o clickbait y origen swipe,
  button o keyboard.
- Presentación: tarjeta arrastrable con umbral cancelable, dos botones y
  flechas.
- Resultado: clasificación, señales textuales y racha informativa.
- Accesibilidad: el gesto no es requisito; botón y teclado tienen el mismo
  resultado.
- Interacción: un pointerup por debajo del umbral cancela y no envía.
- Puntuación: +1 por acierto y +1 por cada racha completa de 3 aciertos,
  máximo 4 puntos de bono; máximo 16 en 12 titulares.

## Radar de Fuentes

- Entrada: source_classification con reliable, doubtful o fraudulent.
- Presentación: una fuente seleccionable y tres categorías.
- Resultado: categoría aceptada, razones y progreso.
- Integridad: una fuente solo puede aceptarse una vez y una fuente ajena a la
  sesión se rechaza.
- Puntuación: +1 por clasificación correcta, 0 por error; máximo 9 en 9
  fuentes.

## Feed 60”

- Entrada: feed_action con verify, share o discard.
- Flujo: verify es una acción previa opcional que revela pistas; share o
  discard es la decisión final del item.
- Tiempo: el servidor mantiene el instante de expiración; verificar consume 4
  segundos y el cliente nunca puede extender el límite de 60 segundos.
- Expiración: una carrera entre verify, decisión final y expiración se resuelve
  una sola vez en servidor.
- Puntuación: +2 por decisión adecuada, -1 por decisión inadecuada, +1 si la
  decisión adecuada ocurre después de verificar; piso 0 y máximo 30 en hasta
  10 publicaciones.

## Mente Maestra

- Entrada: autopsy_choice para objective, emotion, headline y evidence.
- Presentación: cuatro pasos, uno por vez, con opción seleccionada persistida
  solo en la sesión del juego.
- Resultado: alcance simulado, comentarios ficticios y autopsia de las técnicas.
- Seguridad educativa: no publica, comparte ni genera una cuenta real; la
  viralidad simulada no es un premio.
- Puntuación: +1 por paso completado, 0 por error, máximo 4. La viralidad
  simulada se mantiene separada y acotada a 65–95.

## Ranking global secundario

El ranking conserva la capacidad global de la línea base, pero no forma parte de
la portada ni del flujo educativo principal. Después de finalizar, el jugador
puede abrirlo desde el resultado o la navegación secundaria.

La puntuación educativa mantiene la escala independiente de cada juego. Para la
lectura global, el servidor calcula rankingScore como el porcentaje normalizado
de points sobre maxPoints, limita la respuesta a diez resultados elegibles y
mantiene gameCode como contexto. Esta métrica no cambia el feedback, el
resultado propio ni el aprendizaje, y la interfaz no debe presentarla como
competencia central.

## Salida común

Una acción válida devuelve:

1. estado de aceptación;
2. feedback específico del item;
3. contadores de progreso y resultado provisional autorizado;
4. siguiente acción autorizada;
5. error recuperable si el cliente debe reintentar.

El resultado final devuelve GameScore. Una acción inválida no revela la solución
ni cambia la sesión.
