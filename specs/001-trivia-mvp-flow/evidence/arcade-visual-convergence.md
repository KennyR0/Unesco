# Evidencia de convergencia visual de Antídoto

**Fecha**: 2026-08-01  
**Alcance**: T074–T081; interfaz existente únicamente.  
**Resultado**: PASS.

## Comparación antes / después

| Antes | Después |
|---|---|
| Portada editorial silenciosa, fondo papel y acento terracota | Hero negro, rejilla, scanlines, ácido, magenta y cian con mensaje inmediato |
| Arial como fuente principal | Anton para impacto, Archivo para lectura y Space Mono para sistema |
| Colores dependientes del orden de las tarjetas | Acento estable por `gameCode` en tarjeta y shell |
| Shell plano y estados desconectados de la portada | Cabecera de marca, sticker de misión, título display, progreso textual y escenario brutalista |
| Reduced motion sin control visible | Pausa global, preferencia persistida, adopción del sistema y composición estática |
| La suite de portada aceptaba 5/5 aun con la identidad equivocada | Contrato visual, componentes, movimiento, zoom, consola y cinco referencias visuales |

La revisión manual confirmó que la primera pantalla comunica “arcade contra la
desinformación” sin copiar la estructura, posiciones o tamaños del prototipo.
El impacto se concentra en cabecera, hero, catálogo, decisiones y estados; las
explicaciones mantienen una zona de lectura más calmada.

## Superficies verificadas

- portada 1440×900 y 390×844;
- portada y shell de ¿Real o IA? a 320 px y zoom textual 200 %, sin overflow;
- shell de ¿Real o IA? 1440×900 y 390×844;
- carga, error, juego inválido y 404 con salida clara;
- feedback inline con explicación, señales, recomendación y siguiente acción;
- ¿Real o IA?, El Grupo, Clickbait Swipe y Radar de Fuentes mediante pruebas de
  componentes, sin cambios de eventos, payloads o evaluación;
- movimiento activo, pausa, recarga persistida, almacenamiento deshabilitado y
  `prefers-reduced-motion`;
- navegación por teclado hasta la primera misión y foco visible;
- portada y shell sin errores de consola en los proyectos desktop y mobile.

## Referencias de regresión visual

Las capturas se producen con `data-motion="paused"` y fuentes cargadas:

- `tests/e2e/arcade-visual.spec.ts-snapshots/arcade-home-1440-desktop-win32.png`
- `tests/e2e/arcade-visual.spec.ts-snapshots/arcade-home-390-desktop-win32.png`
- `tests/e2e/arcade-visual.spec.ts-snapshots/real-o-ia-shell-1440-desktop-win32.png`
- `tests/e2e/arcade-visual.spec.ts-snapshots/real-o-ia-shell-390-desktop-win32.png`
- `tests/e2e/arcade-visual.spec.ts-snapshots/not-found-390-desktop-win32.png`

## Comandos y resultados

| Comando | Resultado |
|---|---|
| `corepack pnpm typecheck` | PASS, TypeScript sin errores |
| `corepack pnpm lint` | PASS, ESLint sin hallazgos |
| `corepack pnpm test:components` | PASS, 17 archivos / 37 pruebas |
| `corepack pnpm test` | PASS, 55 archivos / 163 pruebas |
| `corepack pnpm test:e2e` | PASS, 24 pruebas; 4 omisiones intencionales del proyecto mobile porque las capturas canónicas 1440/390 se ejecutan una sola vez en desktop |
| `corepack pnpm build` | PASS, compilación de producción y 9 páginas estáticas generadas |

## Incidencias encontradas durante QA

1. El estado del shell heredaba fondo claro y texto claro. Se corrigió con una
   estampa de estado contrastada y texto negro.
2. En móvil el control de movimiento perdía su nombre al ocultar la etiqueta
   visible. Se añadió `aria-label` dinámico además de `aria-pressed`.
3. A zoom 200 % el método SIFT y el CTA del shell expandían el documento. Se
   limitaron las columnas intrínsecas, tamaños display y botones sin reducir el
   comportamiento del zoom real.
4. La ejecución E2E completa saturaba el servidor de desarrollo con ocho
   workers. Se fijaron cuatro workers locales, dos en CI y 60 s por prueba; la
   suite completa quedó estable.

## Límites honestos

El navegador integrado no estuvo disponible (`No browser is available`), por
lo que la revisión usó Chromium local mediante Playwright y capturas inspeccionadas.
No se añadió una ruta artificial para feedback: su estructura y contenido se
verifican con pruebas de componente porque la lógica de sesión necesaria para
mostrarlo en E2E está fuera de este alcance. No se verificó hardware ni se tocó
Supabase, migraciones, seed, scoring, sesiones o APIs. La semántica, el foco y
los anuncios se probaron automáticamente, pero no se ejecutó una sesión manual
con lector de pantalla real.
