# Contrato visual de Antídoto Arcade MIL

**Estado**: normativo para toda interfaz existente de la feature 001.

## Intención de producto

Antídoto debe sentirse de inmediato como un arcade contra la desinformación:
urgente, expresivo, provocador y reconocible. El prototipo es la referencia de
intención y sistema visual, no una plantilla de HTML. Se conserva su energía y
se mejora su legibilidad, accesibilidad, adaptación y coherencia.

Copiar no significa reproducir cada `div`, texto, posición o tamaño. Cumplir
significa conservar contraste, geometría, lenguaje arcade, tensión compositiva
y animaciones con propósito en una implementación nueva y verificable.

## Tokens normativos

| Token | Valor | Uso principal |
|---|---:|---|
| `--color-ink` | `#0A0A0A` | tinta, marcos y fondos de alto impacto |
| `--color-paper` | `#F2EFE4` | fondo general |
| `--color-surface` | `#FFFDF5` | zonas de lectura |
| `--color-acid` | `#D6FF00` | CTA y énfasis principal |
| `--color-magenta` | `#FF2D6F` | alerta expresiva y clickbait |
| `--color-cyan` | `#20DFF2` | verificación y Real o IA |
| `--color-amber` | `#FFB400` | atención y Radar de Fuentes |
| `--color-green` | `#00A968` | frenar, cuidado y El Grupo |
| `--color-danger-text` | `#C90048` | error legible sobre superficie clara |
| `--color-success-text` | `#007A4A` | éxito legible sobre superficie clara |
| `--color-info-text` | `#006D78` | información legible sobre superficie clara |

El texto normal debe alcanzar 4.5:1 y los límites o componentes significativos
3:1. Los acentos brillantes se usan como fondo con tinta negra; para texto de
estado sobre papel se usan las variantes accesibles.

## Tipografía

- Titulares: Anton, cargada con `next/font`.
- Cuerpo: Archivo, cargada con `next/font`.
- Metadatos, etiquetas y contadores: Space Mono, cargada con `next/font`.
- Arial, Helvetica o una `sans-serif` genérica no pueden ser la fuente principal.

## Material, geometría y textura

- bordes negros de 3 px;
- sombras rígidas de 5–7 px, sin blur atmosférico;
- esquinas predominantemente rectas y redondeos pequeños solo por ergonomía;
- stickers, estampas, barras, ruido, rejilla y scanlines construidos con CSS/SVG;
- contraste de masas negras contra papel y superficies claras;
- foco visible de alto contraste, separado al menos 2 px del componente;
- zonas educativas más calmadas: cuerpo legible, ancho controlado y efectos
  concentrados en títulos, decisiones, consecuencias y estados.

Quedan prohibidos como dirección principal: paletas pastel, tarjetas SaaS,
`bento grids`, glassmorphism, degradados morados, iconografía genérica y
minimalismo editorial silencioso.

## Firma obligatoria por superficie

### Portada

1. Cabecera de marca con Arcade, Manifiesto, Método y control de movimiento.
2. Hero negro con rejilla/scanlines, el mensaje “La mentira es viral. La verdad
   se entrena.” y la invitación “Juega a detectar lo que intenta engañarte”.
3. Collage reinterpretado de señales falsas/verificadas, CTA ácido y contador
   de seis misiones.
4. Marquee cinético con equivalente estático.
5. Catálogo 3×2 en escritorio, dos columnas en tablet y una en móvil, con
   números grandes, acentos estables y tensión que no perjudica la lectura.
6. Manifiesto compacto y método SIFT visible en la misma página.

### Shell y estados

1. Marca y regreso al arcade.
2. `data-game-code`, título display, sticker de misión y progreso textual.
3. Escenario de juego con marco brutalista y área educativa calmada.
4. Feedback inline con estado expresado mediante texto o símbolo, nunca color
   exclusivamente.
5. Carga, error, sesión inválida y 404 con la misma firma visual y una salida
   clara.

## Mapa estable de acentos

| `gameCode` | Acento | Estado |
|---|---|---|
| `real-o-ia` | cian | implementado |
| `grupo` | verde con ácido | implementado |
| `clickbait-swipe` | magenta | implementado |
| `radar-de-fuentes` | ámbar | implementado |
| `feed-60` | ácido con magenta | futuro; tema documentado, sin componente nuevo |
| `mente-maestra` | magenta con cian | futuro; tema documentado, sin componente nuevo |

Reordenar el catálogo no puede cambiar estos acentos.

## Contrato de movimiento

- El documento usa `data-motion="active|paused"`.
- El control global expone `Pausar animación` / `Activar animación`, estado con
  `aria-pressed` y foco visible.
- La preferencia mínima se persiste como `antidoto:motion:v1`; un fallo de
  almacenamiento no bloquea la interfaz.
- La inicialización ocurre antes de la hidratación para evitar parpadeo.
- Sin preferencia guardada, se adopta `prefers-reduced-motion` del sistema.
- Pausar detiene marquee, glitch, scanlines móviles y flotación, y deja una
  composición estática completa y legible.
- El movimiento decorativo nunca esconde texto, impide interacción o comunica
  información exclusiva. La lógica y los temporizadores de juego no cambian.

## Aceptación y evidencia

La revisión visual mínima cubre portada en 1440×900 y 390×844; portada y shell
desde 320 px; zoom 200 %; shell de ¿Real o IA? en escritorio y móvil; feedback,
error y 404. Las capturas automatizadas se toman con movimiento pausado y se
complementan con teclado, foco, consola y revisión manual.
