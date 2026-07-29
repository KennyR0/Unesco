# ANTÍDOTO — Arcade contra la desinformación

Prototipo web para la **Hackathon UNESCO 2026 — Alfabetización Mediática e Informacional (MIL)**
Público objetivo: jóvenes de 15 a 29 años.

## Cómo abrirlo
1. Descomprime el ZIP.
2. Abre `index.html` en cualquier navegador moderno (doble clic).
3. No requiere servidor ni instalación. (Las tipografías se cargan de Google Fonts; sin internet, el sitio funciona con fuentes de respaldo.)

## Estilo visual: CIBER-BRUTALISMO
Combinación de **Neo-brutalismo** (bordes gruesos, sombras duras, papel crudo = la verdad sin maquillaje)
con **Glitch art** (cortes RGB, ruido, scanlines = la información rota/manipulada).

## Estructura
- `index.html` — Landing: hero glitch, estadísticas, manifiesto, arcade de juegos, método SIFT.
- `juegos/` — Las 6 misiones:
  1. `real-o-ia.html` — Detector de imágenes generadas por IA.
  2. `grupo.html` — Simulador de chat familiar (compartir sin verificar).
  3. `titulares.html` — Clickbait Swipe (titulares amarillistas).
  4. `radar.html` — Radar de fuentes (confiabilidad).
  5. `feed.html` — Feed 60" (infoxicación / verificación rápida).
  6. `mente-maestra.html` — Inoculación: construye y diseca una fake news.
- `css/style.css` — Sistema de diseño completo.
- `js/ui.js` — Motor compartido (overlays, puntaje, rangos, progreso).
- `js/main.js` — Lógica de la landing.
- `js/games/` — Motor de cada juego.

## Notas
- El progreso se guarda en `localStorage` (sellos "✓" en el arcade).
- Todo el contenido es ficticio y con fines educativos.
- El juego 06 aplica la **teoría de inoculación** (Roozenbeek & van der Linden, Cambridge).
