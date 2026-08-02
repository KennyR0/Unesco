# Contrato de accesibilidad del arcade

## Criterios comunes

La portada, el shell y los seis juegos deben:

- funcionar desde 320 px sin desplazamiento horizontal;
- conservar contenido y controles con zoom de 200 %;
- poder usarse solo con teclado;
- mostrar foco visible con orden lógico;
- usar nombres y roles semánticos;
- anunciar feedback, errores, cambios de progreso y expiración;
- no transmitir significado solo mediante color, movimiento, sonido o posición;
- ofrecer una pausa global del movimiento decorativo y respetar
  `prefers-reduced-motion` cuando no exista preferencia guardada;
- conservar una composición estática completa, legible y operable al pausar;
- mantener contraste mínimo de 4.5:1 para texto normal y 3:1 para componentes;
- usar controles táctiles de al menos 44 por 44 CSS px;
- asociar cada error al campo o grupo que lo produjo.

## Matriz por mecánica

| Juego | Riesgo | Requisito accesible |
|---|---|---|
| ¿Real o IA? | imagen sin alternativa | alt o descripción equivalente, y feedback textual de las pistas |
| El Grupo | chat dinámico y mensajes de consecuencia | orden de lectura estable, live region moderada y botones con nombres claros |
| Clickbait Swipe | gesto obligatorio o foco perdido | botones y flechas equivalentes, cancelación bajo umbral y foco tras resolver |
| Radar de Fuentes | selección visual de tarjeta y categoría | controles semánticos, estado seleccionado anunciado y categoría textual |
| Feed 60” | tiempo y barra visual | segundos restantes en texto, aviso de expiración y foco recuperable |
| Mente Maestra | pasos y autopsia tardía | progreso textual, foco en el paso actual y autopsia en la misma vista |

## Feedback inline

La región de feedback debe tener un nombre accesible y anunciar:

1. resultado de la acción;
2. explicación;
3. señales;
4. recomendación;
5. siguiente acción disponible.

La animación puede acompañar, pero nunca sustituye estos textos.
Glitch, marquee, scanlines o flotación no pueden ocultar texto, bloquear el foco
ni comunicar información exclusiva.

## Control global de movimiento

- El botón debe indicar `Pausar animación` o `Activar animación` y exponer
  `aria-pressed`.
- La preferencia se aplica en `data-motion` antes de hidratar y se persiste con
  la clave versionada `antidoto:motion:v1` cuando el almacenamiento está
  disponible.
- Un fallo de `localStorage` no puede impedir navegar o jugar.
- Pausar movimiento decorativo no pausa ni extiende temporizadores o lógica de
  juego.
- La preferencia estática del sistema debe producir el mismo resultado visual
  que la pausa explícita cuando no haya valor guardado.

## Ranking global secundario

Cuando se ofrece el ranking global:

- debe anunciar que es opcional y secundario;
- debe usar encabezados de tabla o una estructura equivalente navegable;
- debe expresar posición, alias y puntuación con texto, nunca solo con color;
- debe mantener foco visible y devolverlo al control que lo abrió al cerrar;
- no debe aparecer antes del resultado educativo ni bloquear la continuación;
- el estado vacío y un fallo de lectura deben ser comprensibles y accionables.

## Verificación manual

Antes de completar una tarea de interfaz se debe registrar:

- recorrido de teclado en Chrome o equivalente;
- foco visible y orden;
- lectura del cambio de estado con lector de pantalla;
- zoom 200 %;
- viewport 320 px;
- reduced motion;
- pausa, reactivación y persistencia del control global de movimiento;
- equivalencia estática de marquee, glitch, scanlines y flotación;
- acción táctil en teléfono real cuando el gesto sea relevante.

La prueba automatizada no sustituye esta revisión manual.
