import { describe, expect, it } from "vitest";

import {
  MEDIA_MANIFEST_VERSION,
  MEDIA_MAX_BYTES_PER_ASSET,
  MEDIA_RECOMMENDED_BYTES_PER_ASSET,
  getMediaAsset,
  getMediaManifest,
  isAssetOverRecommendedWeight,
  listMediaAssets,
  resolvePublicMediaOrFallback,
  toPublicMedia,
  validateMediaManifestDocument,
} from "./manifest";

describe("manifiesto de media arcade", () => {
  it("valida límites contractuales, alt, fallback y dimensiones", () => {
    const manifest = getMediaManifest();
    expect(manifest.schemaVersion).toBe(1);
    expect(MEDIA_MANIFEST_VERSION).toBe(manifest.manifestVersion);
    expect(manifest.limits.maxBytesPerAsset).toBe(MEDIA_MAX_BYTES_PER_ASSET);
    expect(manifest.limits.recommendedBytesPerAsset).toBe(
      MEDIA_RECOMMENDED_BYTES_PER_ASSET,
    );
    expect(listMediaAssets({ editorialStatus: "approved" }).length).toBeGreaterThan(0);

    const asset = getMediaAsset("img-contexto-fuera-de-campo");
    expect(asset).not.toBeNull();
    if (!asset) return;

    expect(asset.width).toBe(640);
    expect(asset.height).toBe(640);
    expect(asset.alt).toBeTruthy();
    expect(asset.fallbackText.length).toBeGreaterThan(0);
    expect(asset.bytes).toBeLessThanOrEqual(MEDIA_MAX_BYTES_PER_ASSET);
    expect(isAssetOverRecommendedWeight(asset)).toBe(false);

    const publicMedia = toPublicMedia(asset);
    expect(publicMedia.kind).toBe("image");
    expect(publicMedia.src).toBe(asset.src);
    expect(publicMedia.alt).toBe(asset.alt);
    expect(publicMedia.fallbackText).toBe(asset.fallbackText);
  });

  it("rechaza assets fuera de peso o sin alt informativo y ofrece fallback", () => {
    const base = getMediaManifest();
    expect(() =>
      validateMediaManifestDocument({
        ...base,
        assets: [
          {
            ...base.assets[0],
            id: "too-heavy",
            bytes: MEDIA_MAX_BYTES_PER_ASSET + 1,
          },
        ],
      }),
    ).toThrow();

    expect(() =>
      validateMediaManifestDocument({
        ...base,
        assets: [
          {
            ...base.assets[0],
            id: "missing-alt",
            decorative: false,
            alt: null,
          },
        ],
      }),
    ).toThrow();

    const missing = resolvePublicMediaOrFallback("does-not-exist");
    expect(missing.kind).toBe("none");
    expect(missing.fallbackText).toMatch(/no está disponible/i);
  });
});
