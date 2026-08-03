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
  it("registra ocho assets provisionales con alt, fallback y derechos", () => {
    expect(mediaIndex.schemaVersion).toBe(1);
    expect(mediaIndex.gameCode).toBe("real-o-ia");
    expect(mediaIndex.entries).toHaveLength(8);

    for (const entry of mediaIndex.entries) {
      expect(entry.provisional).toBe(true);
      expect(entry.alt.length).toBeGreaterThan(0);
      expect(VERDICT_VOCABULARY.test(entry.alt)).toBe(false);
      expect(entry.fallbackText.length).toBeGreaterThan(0);
      expect(entry.rights.provenanceType).toBe("provisional_placeholder");
      expect(entry.rights.locator).toMatch(/^public\/media\/real-o-ia\//);
      expect(entry.width).toBe(640);
      expect(entry.height).toBe(432);
      expect(entry.bytes).toBeLessThanOrEqual(1_048_576);

      const asset = getMediaAsset(entry.assetId, entry.assetVersion);
      expect(asset).not.toBeNull();
      if (!asset) return;
      expect(asset.gameCode).toBe("real-o-ia");
      expect(asset.provisional).toBe(true);
      expect(asset.editorialStatus).toBe("draft");
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

    expect(listMediaAssets({ gameCode: "real-o-ia" })).toHaveLength(8);
  });

  it("alinea src/alt/fallback del índice con el pack editorial y los archivos locales", () => {
    const byItemId = new Map(
      mediaIndex.entries.map((entry) => [entry.itemId, entry]),
    );

    expect(contentPack).toHaveLength(8);
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
