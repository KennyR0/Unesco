# Comparación del prototipo y la propuesta arcade

**Fecha**: 2026-07-31
**Estado**: matriz normativa de adaptación para la convergencia visual.

“Referencia, no dependencia” conserva la intención y el sistema visual aunque
el nuevo build no importe el HTML, CSS o JavaScript histórico.

## Se conserva, se mejora y se descarta

| Se conserva | Se mejora | Se descarta |
|---|---|---|
| Energía ciber-brutalista, masas negras y papel cálido | Contraste, foco, jerarquía y lectura educativa | Copia literal de `div`, textos, posiciones o tamaños |
| Ácido, magenta, cian, ámbar y verde | Valores accesibles y acentos estables por `gameCode` | Pasteles, tarjetas SaaS, bento y glassmorphism |
| Bordes, sombras rígidas, stickers, rejilla y marquee | Responsive desde 320 px, zoom 200 % y composición estática | Movimiento obligatorio o información comunicada solo por efectos |
| Seis identidades y mecánicas distintas | Shell, feedback y estados comunes coherentes | Homogeneizar los juegos como una trivia genérica |
| Urgencia, provocación y lectura inmediata | Zonas de cuerpo calmadas y decisiones más claras | Minimalismo editorial silencioso |

| Área | Prototipo actual | Propuesta nueva |
|---|---|---|
| Dirección visual | Papel cálido, tinta, colores fuertes, bordes, sombras, stickers y marquee | Se conservan esos tokens con contraste, responsive, reduced motion y estados accesibles |
| Portada | index.html con seis tarjetas y enlaces a documentos HTML | Portada Next.js dominante con catálogo estructurado, gameCode y rutas dinámicas |
| Navegación | Enlaces entre archivos; cada juego apunta al siguiente HTML | Cada juego se abre en games/[gameCode]; volver al arcade no mezcla sesiones |
| Inicio de juego | Overlay local de misión y botón Empezar | Shell compartido con instrucciones, foco gestionado y estado de sesión |
| Estado | Variables de módulo y localStorage para sellos de progreso | Sesión de servidor independiente por juego; el cliente no es autoridad |
| Mecánicas | Seis scripts especializados con gestos, botones, chat, bins, timer y pasos | Seis componentes especializados que consumen payloads discriminados y mantienen equivalentes accesibles |
| Feedback | Toasts, mensajes dentro del DOM y overlay final; puede desaparecer o depender de tiempo | Feedback inline con explicación, señales, recomendación, live region y avance bloqueado hasta aceptar |
| ¿Real o IA? | Ocho SVG/ilustraciones de prueba y veredicto binario | Media estructurada, alt/fallback y sustitución editorial posterior por imágenes reales o definitivas |
| El Grupo | Seis escenas, consecuencias narrativas y opciones 0/1/2 | Decisión de cuidado, consecuencia segura, feedback y resultado por sesión |
| Clickbait Swipe | Arrastre con botones y flechas; racha visual sin bono | Gesto cancelable, botones y teclado como contrato equivalente; racha con bono aprobado y limitado |
| Radar de Fuentes | Nueve tarjetas, selección y tres bins; error no consume tarjeta | Selección y clasificación autoritativas, una aceptación por fuente y feedback persistente |
| Feed 60” | Temporizador local, verificar resta 4 s, valores variables por tipo | Reloj autoritativo, tiempo textual, expiración de servidor y penalización aprobada con piso 0 |
| Mente Maestra | Cuatro elecciones, viralidad simulada y autopsia en overlay | Cuatro pasos, alcance ficticio claramente separado y autopsia inline; no premia daño |
| Resultado | Rangos locales y botón hacia el siguiente juego | Resultado propio con resumen educativo y score aprobado; ranking global opcional después del resultado |
| Persistencia | localStorage de sellos, sin servidor de sesión | Persistencia server-only futura, con RLS, grants, retención y migraciones aprobadas |
| Ranking | No forma parte del flujo principal del prototipo actual | Ranking global secundario, máximo diez, fuera del landing, con métrica normalizada y copia no competitiva |
| Calidad | Interacción visual funcional, pero con riesgos de foco, color, motion y hardware | Criterios desde 320 px, teclado, lector, zoom, reduced motion, touch y fallback |

## Principios de adaptación

- Mantener la personalidad visual y la lectura rápida del prototipo.
- Mantener la identidad de cada juego; no sustituir seis mecánicas por una
  pregunta genérica.
- Convertir decisiones locales en entradas validadas por servidor.
- Mantener explicación y consecuencia en la misma vista.
- Corregir defectos de accesibilidad sin borrar el carácter arcade.
- Tratar contenido, media y fórmulas como contratos revisables.
