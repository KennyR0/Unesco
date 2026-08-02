# Quickstart de Antídoto Arcade

**Estado**: la convergencia visual de las superficies existentes está
autorizada. Este flujo no aplica, resetea, seed-ea, lint-a ni publica Supabase.

## 1. Verificar Spec Kit y el alcance

Desde la raíz del checkout:

    powershell.exe -NoProfile -ExecutionPolicy Bypass -File .specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks

La salida debe resolver `FEATURE_DIR` en `specs/001-trivia-mvp-flow`. Antes de
editar, las listas de `checklists/` deben tener cero requisitos incompletos.

La convergencia actual comprende portada, rutas introductorias, shell,
feedback, estados comunes y los componentes ya existentes de ¿Real o IA?, El
Grupo, Clickbait Swipe y Radar de Fuentes. No comprende lógica nueva de Feed
60, Mente Maestra, sesiones, puntuación ni Supabase.

## 2. Instalar y ejecutar

La base requiere Node.js 24.x y pnpm 11.8.0:

    corepack pnpm install --frozen-lockfile
    corepack pnpm dev

Abrir `http://localhost:3000`. El prototipo en `prototipo/` sirve como referencia
de intención, experiencia y sistema visual; no forma parte del build.

## 3. Contratos que deben coincidir

- `spec.md` contiene FR-020/FR-021 y SC-011/SC-012.
- `contracts/visual-system.md` fija tokens, tipografías, firma por superficie,
  temas por `gameCode` y movimiento.
- `contracts/accessibility.md` exige pausa global, contraste y equivalencia
  estática.
- `prototype-comparison.md` distingue qué se conserva, mejora y descarta.
- `tasks.md` registra la convergencia de forma append-only en T074–T081.

“Referencia, no dependencia” significa conservar la intención visual sin copiar
cada `div`, texto, posición o tamaño del HTML histórico.

## 4. Verificación automática

    corepack pnpm typecheck
    corepack pnpm lint
    corepack pnpm test
    corepack pnpm test:components
    corepack pnpm test:e2e
    corepack pnpm build

La suite de portada previa no es evidencia suficiente por sí sola. Las pruebas
contractuales deben validar tokens, fuentes, `data-game-code`, `data-motion` y
la estructura visual obligatoria. La regresión visual se captura con movimiento
pausado para evitar diferencias cinéticas.

## 5. Revisión visual y accesible

Revisar al menos:

- portada a 1440×900 y 390×844;
- portada y shell a 320 px, sin scroll horizontal;
- zoom 200 %, navegación de teclado y foco visible;
- shell de ¿Real o IA? en escritorio y móvil;
- feedback, carga, error, sesión inválida y 404;
- pausa/reactivación, persistencia `antidoto:motion:v1` y preferencia del
  sistema sin valor guardado;
- composición estática completa de marquee, glitch, scanlines y flotación;
- consola sin errores de hidratación, tipografía ni Tailwind.

La primera pantalla pasa cuando comunica inmediatamente “arcade contra la
desinformación” y se siente heredera del prototipo sin replicar su HTML.

## 6. Límite de persistencia

La reconciliación documental de las 22 migraciones continúa siendo obligatoria
solo para T017–T019 y T070. Ningún comando de este quickstart modifica
`supabase/`, y la convergencia visual no renueva esa autorización.
