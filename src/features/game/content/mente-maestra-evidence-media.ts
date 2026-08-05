/**
 * Ilustraciones del paso evidence (espejo de public/media/mente-maestra/media-index).
 */
export type EvidenceMedia = Readonly<{
  kind: "image";
  src: string;
  alt: string;
  decorative: boolean;
  width: number;
  height: number;
  fallbackText: string;
  srcSet: Readonly<Partial<Record<"480" | "768", string>>>;
}>;

const FALLBACK =
  "La imagen ilustrativa no está disponible. La lección de la autopsia se conserva en el texto.";

export const EVIDENCE_MEDIA_BY_OPTION_ID: Readonly<
  Record<string, EvidenceMedia>
> = {
  "evidence-recycled-photo": {
    kind: "image",
    src: "/media/mente-maestra/foto-reciclada-768.webp",
    alt: "Calle inundada usada como ejemplo de foto real reciclada fuera de contexto.",
    decorative: false,
    width: 768,
    height: 511,
    fallbackText: FALLBACK,
    srcSet: {
      "480": "/media/mente-maestra/foto-reciclada-480.webp",
      "768": "/media/mente-maestra/foto-reciclada-768.webp",
    },
  },
  "evidence-ai-image": {
    kind: "image",
    src: "/media/mente-maestra/imagen-ia-768.webp",
    alt: "Paisaje hiperestilizado usado como ejemplo de imagen sintética a inspeccionar.",
    decorative: false,
    width: 768,
    height: 512,
    fallbackText: FALLBACK,
    srcSet: {
      "480": "/media/mente-maestra/imagen-ia-480.webp",
      "768": "/media/mente-maestra/imagen-ia-768.webp",
    },
  },
  "evidence-fake-expert": {
    kind: "image",
    src: "/media/mente-maestra/experto-falso-768.webp",
    alt: "Persona con bata blanca usada como ejemplo de «experto» sin identidad verificable.",
    decorative: false,
    width: 768,
    height: 1152,
    fallbackText: FALLBACK,
    srcSet: {
      "480": "/media/mente-maestra/experto-falso-480.webp",
      "768": "/media/mente-maestra/experto-falso-768.webp",
    },
  },
  "evidence-truncated-axis": {
    kind: "image",
    src: "/media/mente-maestra/eje-truncado-768.webp",
    alt: "Gráfico de barras usado como ejemplo de visualización que conviene revisar en los ejes.",
    decorative: false,
    width: 768,
    height: 509,
    fallbackText: FALLBACK,
    srcSet: {
      "480": "/media/mente-maestra/eje-truncado-480.webp",
      "768": "/media/mente-maestra/eje-truncado-768.webp",
    },
  },
};
