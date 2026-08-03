import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import contentPack from "../../features/game/content/game-items/real-o-ia.v1.json";
import mediaIndex from "../../../public/media/real-o-ia/media-index.v1.json";
import {
  getMediaAsset,
  listMediaAssets,
  resolvePublicMediaOrFallback,
} from "./manifest";

const VERDICT_VOCABULARY =
  /\b(real|ia|generada|generado|sintética|sintético|auténtica|auténtico|falsa|falso)\b/i;

describe("índice y manifiesto de media real-o-ia (T043)", () => {
  it("registra veinte assets Pexels con alt, fallback y derechos", () => {
    expect(mediaIndex.schemaVersion).toBe(1);
    expect(mediaIndex.gameCode).toBe("real-o-ia");
    expect(mediaIndex.entries).toHaveLength(20);
    expect(mediaIndex.notes.toLowerCase()).toContain("pexels");

    for (const entry of mediaIndex.entries) {
      expect(entry.provisional).toBe(false);
      expect(entry.alt.length).toBeGreaterThan(0);
      expect(VERDICT_VOCABULARY.test(entry.alt)).toBe(false);
      expect(entry.fallbackText.length).toBeGreaterThan(0);
      expect(entry.rights.provenanceType).toBe("pexels");
      expect(entry.rights.license).toBe("Pexels License");
      expect(entry.rights.locator).toBe("https://www.pexels.com/");
      expect(entry.width).toBeGreaterThan(0);
      expect(entry.height).toBeGreaterThan(0);
      expect(entry.bytes).toBeLessThanOrEqual(1_048_576);

      const asset = getMediaAsset(entry.assetId, entry.assetVersion);
      expect(asset).not.toBeNull();
      if (!asset) return;
      expect(asset.gameCode).toBe("real-o-ia");
      expect(asset.provisional).toBe(false);
      expect(asset.editorialStatus).toBe("approved");
      expect(asset.alt).toBe(entry.alt);
      expect(asset.fallbackText).toBe(entry.fallbackText);
      expect(asset.src).toBe(entry.src);
      expect(asset.rights).toEqual(entry.rights);

      const publicMedia = resolvePublicMediaOrFallback(
        entry.assetId,
        entry.assetVersion,
      );
      expect(publicMedia.kind).toBe("image");
      expect(publicMedia.alt).toBe(entry.alt);
      expect(publicMedia.fallbackText).toBe(entry.fallbackText);
    }

    expect(listMediaAssets({ gameCode: "real-o-ia" })).toHaveLength(20);
  });

  it("alinea src/alt/fallback del índice con el pack editorial y los archivos locales", () => {
    const byItemId = new Map(
      mediaIndex.entries.map((entry) => [entry.itemId, entry]),
    );

    expect(contentPack).toHaveLength(20);
    for (const item of contentPack) {
      const entry = byItemId.get(item.itemId);
      expect(entry).toBeDefined();
      if (!entry) return;

      const media = item.publicItem.media;
      expect(media.src).toBe(entry.src);
      expect(media.alt).toBe(entry.alt);
      expect(media.fallbackText).toBe(entry.fallbackText);
      expect(media.width).toBe(entry.width);
      expect(media.height).toBe(entry.height);

      const absolute = join(process.cwd(), "public", entry.src.slice(1));
      const bytes = readFileSync(absolute);
      expect(bytes.byteLength).toBe(entry.bytes);
    }
  });
});
