import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import mediaManifestDocument from "../../src/features/game/content/media-manifest.v1.json";
import {
  MEDIA_MAX_BYTES_PER_ASSET,
  MEDIA_MAX_VISIBLE_FIRST_VIEW_BYTES,
  MEDIA_RECOMMENDED_BYTES_PER_ASSET,
  MediaManifestSchema,
  getMediaManifest,
  resolvePublicMediaOrFallback,
  toPublicMedia,
  validateMediaManifestDocument,
} from "../../src/lib/media/manifest";

const PUBLIC_ROOT = join(process.cwd(), "public");

describe("contrato de media pública del arcade", () => {
  it("declara dimensiones, formato, alt, fallback, responsive y peso reproducible", () => {
    const manifest = validateMediaManifestDocument(mediaManifestDocument);
    const seen = new Set<string>();

    expect(manifest.limits).toEqual({
      maxBytesPerAsset: MEDIA_MAX_BYTES_PER_ASSET,
      recommendedBytesPerAsset: MEDIA_RECOMMENDED_BYTES_PER_ASSET,
      maxVisibleFirstViewBytes: MEDIA_MAX_VISIBLE_FIRST_VIEW_BYTES,
    });

    for (const asset of manifest.assets) {
      const key = `${asset.id}@${asset.version}`;
      expect(seen.has(key), key).toBe(false);
      seen.add(key);
      expect(asset.fallbackText.length).toBeGreaterThan(0);
      expect(asset.bytes).toBeLessThanOrEqual(MEDIA_MAX_BYTES_PER_ASSET);

      if (asset.kind === "image" || asset.kind === "illustration") {
        expect(asset.src).not.toBeNull();
        expect(asset.width).toBeGreaterThan(0);
        expect(asset.height).toBeGreaterThan(0);
        expect(asset.format).not.toBe("none");
        expect(asset.alt).toBeTruthy();
        expect(asset.responsive).toBe(true);

        const filePath = join(PUBLIC_ROOT, asset.src!.slice(1));
        expect(existsSync(filePath), filePath).toBe(true);
        expect(readFileSync(filePath).byteLength).toBe(asset.bytes);
        expect(asset.src).toMatch(new RegExp(`\\.${asset.format}$`));
      }

      if (asset.editorialStatus === "approved" && asset.kind !== "none") {
        expect(asset.fingerprint).not.toBeNull();
      }
    }

    const visibleApproved = manifest.assets.filter(
      (asset) =>
        asset.editorialStatus === "approved" &&
        asset.kind !== "none" &&
        !asset.decorative,
    );
    const sharedBytes = visibleApproved
      .filter((asset) => asset.gameCode === null)
      .reduce((total, asset) => total + asset.bytes, 0);
    const heaviestByGame = new Map<string, number>();
    for (const asset of visibleApproved) {
      if (asset.gameCode === null) continue;
      const previous = heaviestByGame.get(asset.gameCode) ?? 0;
      if (asset.bytes > previous) {
        heaviestByGame.set(asset.gameCode, asset.bytes);
      }
    }
    const firstViewBytes =
      sharedBytes + Math.max(0, ...heaviestByGame.values());
    expect(firstViewBytes).toBeLessThanOrEqual(
      MEDIA_MAX_VISIBLE_FIRST_VIEW_BYTES,
    );
  });

  it("rechaza rutas, dimensiones y pesos inválidos", () => {
    const manifest = getMediaManifest();
    const asset = manifest.assets[0];

    expect(() =>
      MediaManifestSchema.parse({
        ...manifest,
        assets: [
          {
            ...asset,
            src: "/private/secret.webp",
          },
        ],
      }),
    ).toThrow();

    expect(() =>
      MediaManifestSchema.parse({
        ...manifest,
        assets: [
          {
            ...asset,
            width: null,
          },
        ],
      }),
    ).toThrow();

    expect(() =>
      MediaManifestSchema.parse({
        ...manifest,
        assets: [
          {
            ...asset,
            bytes: MEDIA_MAX_BYTES_PER_ASSET + 1,
          },
        ],
      }),
    ).toThrow();
  });

  it("mantiene fallback y proyección pública sin revelar reglas privadas", () => {
    const fallback = resolvePublicMediaOrFallback("missing-media-id");
    expect(fallback.kind).toBe("none");
    expect(fallback.src).toBeNull();
    expect(fallback.fallbackText).toMatch(/no está disponible/i);

    const asset = getMediaManifest().assets.find(
      (candidate) => candidate.kind === "image",
    );
    expect(asset).toBeDefined();
    if (!asset) return;

    const publicMedia = toPublicMedia(asset);
    expect(publicMedia.src).toBe(asset.src);
    expect(publicMedia.width).toBe(asset.width);
    expect(publicMedia.height).toBe(asset.height);
    expect(publicMedia.alt).toBe(asset.alt);
    expect(JSON.stringify(publicMedia)).not.toContain("fingerprint");
    expect(JSON.stringify(publicMedia)).not.toContain("bytes");
  });
});
