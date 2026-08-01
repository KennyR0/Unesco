import { describe, expect, it } from "vitest";

import { createContentRepository } from "../content-repository";
import { validateContentCollection } from "../content-validation";
import contentPack from "./real-o-ia.v1.json";

const VERDICT_VOCABULARY =
  /\b(real|ia|generada|generado|sintética|sintético|auténtica|auténtico|falsa|falso)\b/i;

function readVerdict(solutionPrivate: Record<string, unknown>): string {
  const verdict = solutionPrivate["verdict"];
  if (typeof verdict !== "string") {
    throw new Error("solutionPrivate debe declarar un veredicto textual.");
  }
  return verdict;
}

describe("pack editorial real-o-ia.v1 (T040)", () => {
  const items = validateContentCollection(contentPack);

  it("pasa la revisión estructural con exactamente ocho items", () => {
    expect(items).toHaveLength(8);
  });

  it("declara los ocho items aprobados en la versión registrada del manifiesto", () => {
    for (const item of items) {
      expect(item.editorialStatus).toBe("approved");
      expect(item.contentVersion).toBe("2026-07-30.1");
      expect(item.gameCode).toBe("real-o-ia");
      expect(item.mechanic).toBe("image_verdict");
    }
    expect(items.map((item) => item.sequence)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it("equilibra cuatro reales y cuatro generadas, con respuesta revelable coherente", () => {
    const verdicts = items.map((item) => readVerdict(item.solutionPrivate));
    expect(verdicts.filter((verdict) => verdict === "real")).toHaveLength(4);
    expect(verdicts.filter((verdict) => verdict === "ai")).toHaveLength(4);

    for (const item of items) {
      const verdict = readVerdict(item.solutionPrivate);
      expect(item.feedback.revealedAnswer).toBe(
        verdict === "ai" ? "Generada por IA" : "Real",
      );
      expect(item.feedback.signals.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("mantiene media informativa sin revelar el veredicto ni las pistas en el alt", () => {
    for (const item of items) {
      const publicItem = item.publicItem;
      if (publicItem.gameCode !== "real-o-ia") {
        throw new Error("El pack solo debe contener items de real-o-ia.");
      }
      const media = publicItem.media;
      expect(media.kind).toBe("image");
      expect(media.decorative).toBe(false);
      expect(media.alt).not.toBeNull();
      expect(media.src).toMatch(/^\/media\/real-o-ia\/.+\.webp$/);
      expect(media.fallbackText).not.toBeNull();

      const alt = media.alt ?? "";
      expect(VERDICT_VOCABULARY.test(alt)).toBe(false);
      const revealed = item.feedback.revealedAnswer ?? "";
      expect(alt.toLowerCase()).not.toContain(revealed.toLowerCase());
      for (const signal of item.feedback.signals) {
        expect(alt).not.toContain(signal);
      }
    }
  });

  it("publica los ocho items en orden y nunca expone la solución privada", () => {
    const repository = createContentRepository(contentPack);

    expect(repository.activeVersion).toBe("2026-07-30.1");
    const published = repository.listPublishedItems("real-o-ia");
    expect(published.map((item) => item.itemId)).toEqual([
      "real-o-ia-001",
      "real-o-ia-002",
      "real-o-ia-003",
      "real-o-ia-004",
      "real-o-ia-005",
      "real-o-ia-006",
      "real-o-ia-007",
      "real-o-ia-008",
    ]);

    for (const item of published) {
      const publicItem = repository.getPublicItem("real-o-ia", item.itemId);
      expect(publicItem).not.toBeNull();
      expect(publicItem && "solutionPrivate" in publicItem).toBe(false);
      expect(publicItem && "feedback" in publicItem).toBe(false);
      expect(
        repository.getFeedback("real-o-ia", item.itemId)?.revealedAnswer,
      ).not.toBeNull();
    }
  });
});
