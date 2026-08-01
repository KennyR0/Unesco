import { z } from "zod";

import {
  GAME_CODES,
  type GameCode,
  type PublicMedia,
} from "@antidoto/contracts";

import mediaManifestDocument from "../../features/game/content/media-manifest.v1.json";

/** 1 MB máximo por asset (contracts/media.md). */
export const MEDIA_MAX_BYTES_PER_ASSET = 1_048_576;

/** 300 KB recomendados por imagen. */
export const MEDIA_RECOMMENDED_BYTES_PER_ASSET = 307_200;

/** 1.5 MB visibles en la primera vista. */
export const MEDIA_MAX_VISIBLE_FIRST_VIEW_BYTES = 1_572_864;

const IdentifierSchema = z
  .string()
  .min(1)
  .max(128)
  .refine((value) => value.trim().length > 0, "El id no puede estar vacío.");

const ShortTextSchema = z
  .string()
  .min(1)
  .max(500)
  .refine((value) => value.trim().length > 0, "El texto no puede estar vacío.");

const LocalMediaPathSchema = z
  .string()
  .regex(/^\/[A-Za-z0-9._\-/]+$/, "La ruta de media debe ser local y absoluta.");

export const MediaManifestLimitsSchema = z
  .object({
    maxBytesPerAsset: z.literal(MEDIA_MAX_BYTES_PER_ASSET),
    recommendedBytesPerAsset: z.literal(MEDIA_RECOMMENDED_BYTES_PER_ASSET),
    maxVisibleFirstViewBytes: z.literal(MEDIA_MAX_VISIBLE_FIRST_VIEW_BYTES),
  })
  .strict();

export const MediaAssetRightsSchema = z
  .object({
    provenanceType: ShortTextSchema,
    license: ShortTextSchema,
    locator: ShortTextSchema,
  })
  .strict();

export const MediaAssetFingerprintSchema = z
  .object({
    type: z.literal("sha256"),
    value: z
      .string()
      .regex(/^[A-Fa-f0-9]{64}$/, "La huella debe ser SHA-256 hexadecimal."),
  })
  .strict();

export const MediaAssetSchema = z
  .object({
    id: IdentifierSchema,
    version: IdentifierSchema.max(64),
    gameCode: z.enum(GAME_CODES).nullable(),
    kind: z.enum(["image", "illustration", "audio", "none"]),
    src: LocalMediaPathSchema.nullable(),
    width: z.number().int().positive().max(4_096).nullable(),
    height: z.number().int().positive().max(4_096).nullable(),
    format: z.enum(["webp", "avif", "png", "jpg", "svg", "none"]),
    bytes: z.number().int().nonnegative().max(MEDIA_MAX_BYTES_PER_ASSET),
    alt: ShortTextSchema.nullable(),
    decorative: z.boolean(),
    fallbackText: ShortTextSchema,
    responsive: z.boolean(),
    provisional: z.boolean(),
    editorialStatus: z.enum(["draft", "approved", "archived"]),
    rights: MediaAssetRightsSchema,
    fingerprint: MediaAssetFingerprintSchema.nullable(),
  })
  .strict()
  .superRefine((asset, context) => {
    if (asset.decorative && asset.alt !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["alt"],
        message: "La media decorativa no debe declarar alt informativo.",
      });
    }

    if (!asset.decorative && asset.kind !== "none" && asset.alt === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["alt"],
        message: "La media informativa debe declarar texto alternativo.",
      });
    }

    if (asset.kind === "none") {
      if (asset.src !== null || asset.width !== null || asset.height !== null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["src"],
          message: "La media none no declara recurso ni dimensiones.",
        });
      }
      if (asset.format !== "none") {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["format"],
          message: "La media none usa formato none.",
        });
      }
    }

    if (asset.kind === "image" || asset.kind === "illustration") {
      if (asset.src === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["src"],
          message: "La imagen debe declarar src.",
        });
      }
      if (asset.width === null || asset.height === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["width"],
          message: "La imagen debe declarar ancho y alto.",
        });
      }
      if (asset.format === "none") {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["format"],
          message: "La imagen debe declarar un formato optimizado.",
        });
      }
    }

    if (asset.bytes > MEDIA_MAX_BYTES_PER_ASSET) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bytes"],
        message: "El asset supera el máximo de 1 MB.",
      });
    }

    if (
      asset.editorialStatus === "approved" &&
      asset.kind !== "none" &&
      asset.fingerprint === null
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fingerprint"],
        message: "Un asset aprobado debe declarar huella reproducible.",
      });
    }
  });

export type MediaAsset = z.output<typeof MediaAssetSchema>;

export const MediaManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    manifestVersion: IdentifierSchema.max(64),
    limits: MediaManifestLimitsSchema,
    allowedPathPrefixes: z.array(z.string().min(1)).min(1),
    assets: z.array(MediaAssetSchema),
  })
  .strict()
  .superRefine((manifest, context) => {
    const seen = new Set<string>();
    for (const asset of manifest.assets) {
      const key = `${asset.id}@${asset.version}`;
      if (seen.has(key)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["assets"],
          message: `Asset duplicado: ${key}.`,
        });
      }
      seen.add(key);

      if (asset.src) {
        const allowed = manifest.allowedPathPrefixes.some((prefix) =>
          asset.src!.startsWith(prefix),
        );
        if (!allowed) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["assets"],
            message: `La ruta ${asset.src} no está en los prefijos permitidos.`,
          });
        }
      }
    }

    const visibleApproved = manifest.assets.filter(
      (asset) =>
        asset.editorialStatus === "approved" &&
        asset.kind !== "none" &&
        !asset.decorative,
    );
    const visibleBytes = visibleApproved.reduce(
      (total, asset) => total + asset.bytes,
      0,
    );
    if (visibleBytes > manifest.limits.maxVisibleFirstViewBytes) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["assets"],
        message: "La media visible supera el presupuesto de 1.5 MB.",
      });
    }
  });

export type MediaManifest = z.output<typeof MediaManifestSchema>;

const parsedManifest = MediaManifestSchema.parse(mediaManifestDocument);

export const MEDIA_MANIFEST_VERSION = parsedManifest.manifestVersion;

export function getMediaManifest(): MediaManifest {
  return parsedManifest;
}

export function listMediaAssets(
  filter: {
    gameCode?: GameCode | null;
    editorialStatus?: MediaAsset["editorialStatus"];
  } = {},
): readonly MediaAsset[] {
  return parsedManifest.assets.filter((asset) => {
    if (
      filter.gameCode !== undefined &&
      asset.gameCode !== filter.gameCode
    ) {
      return false;
    }
    if (
      filter.editorialStatus !== undefined &&
      asset.editorialStatus !== filter.editorialStatus
    ) {
      return false;
    }
    return true;
  });
}

export function getMediaAsset(
  id: string,
  version?: string,
): MediaAsset | null {
  const matches = parsedManifest.assets.filter((asset) => asset.id === id);
  if (matches.length === 0) return null;
  if (version) {
    return matches.find((asset) => asset.version === version) ?? null;
  }
  return matches.at(-1) ?? null;
}

export function assertAssetWithinWeightLimit(asset: MediaAsset): void {
  if (asset.bytes > parsedManifest.limits.maxBytesPerAsset) {
    throw new Error(
      `MEDIA_TOO_HEAVY: ${asset.id} supera ${parsedManifest.limits.maxBytesPerAsset} bytes.`,
    );
  }
}

export function isAssetOverRecommendedWeight(asset: MediaAsset): boolean {
  return asset.bytes > parsedManifest.limits.recommendedBytesPerAsset;
}

export function toPublicMedia(asset: MediaAsset): PublicMedia {
  assertAssetWithinWeightLimit(asset);

  if (asset.kind === "none") {
    return {
      kind: "none",
      src: null,
      alt: null,
      decorative: asset.decorative,
      width: null,
      height: null,
      fallbackText: asset.fallbackText,
    };
  }

  return {
    kind: asset.kind,
    src: asset.src,
    alt: asset.decorative ? null : asset.alt,
    decorative: asset.decorative,
    width: asset.width,
    height: asset.height,
    fallbackText: asset.fallbackText,
  };
}

export function resolvePublicMediaOrFallback(
  id: string,
  version?: string,
): PublicMedia {
  const asset = getMediaAsset(id, version);
  if (!asset || asset.editorialStatus === "archived") {
    return {
      kind: "none",
      src: null,
      alt: null,
      decorative: false,
      width: null,
      height: null,
      fallbackText:
        "La imagen educativa no está disponible. Continúa con el texto del desafío.",
    };
  }

  try {
    return toPublicMedia(asset);
  } catch {
    return {
      kind: "none",
      src: null,
      alt: null,
      decorative: false,
      width: null,
      height: null,
      fallbackText: asset.fallbackText,
    };
  }
}

export function validateMediaManifestDocument(input: unknown): MediaManifest {
  return MediaManifestSchema.parse(input);
}
