# Contrato de media del arcade

## Alcance

La media es contenido público versionado, no una fuente de autoridad. El
servidor decide qué asset pertenece a cada item y el cliente solo presenta la
proyección permitida.

## Requisitos por asset

Cada imagen informativa debe declarar:

- id y versión;
- src permitido;
- ancho y alto;
- formato optimizado;
- peso máximo de 1 MB y objetivo recomendado de 300 KB;
- alt textual útil;
- estado decorativo solo cuando no aporte información;
- comportamiento responsive;
- fallback textual;
- derechos o fuente editorial;
- estado de aprobación.

El componente futuro debe usar next/image salvo una excepción documentada y
debe mostrar fallback si la descarga falla, el asset falta o excede el límite.

## ¿Real o IA?

La imagen es parte del desafío. El alt no debe revelar la solución ni describir
la pista decisiva antes de responder. La descripción equivalente puede explicar
la escena y el contexto; después de aceptar, el feedback revela las pistas
educativas.

Mientras haya imágenes provisionales, el contenido debe identificarlas como
provisional en la revisión editorial. La sustitución por imágenes reales o
definitivas incrementa la versión del contenido y exige revalidar derechos,
alt, peso y feedback.

## Otros juegos

- El Grupo puede usar avatar o ilustración decorativa; el mensaje textual es
  obligatorio.
- Clickbait Swipe y Radar de Fuentes deben conservar el titular, URL y señales
  como texto, aunque usen decoración.
- Feed 60” no puede esconder el post o sus señales esenciales dentro de una
  imagen.
- Mente Maestra representa publicaciones y comentarios con HTML/texto
  estructurado; no crea contenido externo.

## Estados de error

La ausencia o fallo de media no debe borrar el item ni impedir recibir
feedback. Se presenta fallback textual, se registra el fallo de contenido y se
ofrece reintento cuando sea recuperable.
