import { describe, expect, it } from "vitest";

import { createContentRepository } from "../content-repository";
import { validateContentCollection } from "../content-validation";
import contentPack from "./clickbait-swipe.v1.json";

const CLASSIFICATIONS = ["journalism", "clickbait"] as const;
type Classification = (typeof CLASSIFICATIONS)[number];

const CLASSIFICATION_VOCABULARY =
  /\b(periodismo|clickbait|amarillista|trampa|cebo)\b/i;

function readClassification(
  solutionPrivate: Record<string, unknown>,
): Classification {
  const classification = solutionPrivate["classification"];
  if (
    typeof classification !== "string" ||
    !CLASSIFICATIONS.includes(classification as Classification)
  ) {
    throw new Error(
      "solutionPrivate debe declarar classification journalism o clickbait.",
    );
  }
  return classification as Classification;
}

describe("pack editorial clickbait-swipe.v1 (T049)", () => {
  const items = validateContentCollection(contentPack);

  it("pasa la revisión estructural con exactamente doce titulares", () => {
    expect(items).toHaveLength(12);
  });

  it("declara los doce items aprobados en la versión registrada del manifiesto", () => {
    for (const item of items) {
      expect(item.editorialStatus).toBe("approved");
      expect(item.contentVersion).toBe("2026-07-30.1");
      expect(item.gameCode).toBe("clickbait-swipe");
      expect(item.mechanic).toBe("headline_classification");
    }
    expect(items.map((item) => item.sequence)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
  });

  it("equilibra seis periodismo y seis clickbait, con respuesta revelable coherente", () => {
    const classifications = items.map((item) =>
      readClassification(item.solutionPrivate),
    );
    expect(
      classifications.filter((value) => value === "journalism"),
    ).toHaveLength(6);
    expect(
      classifications.filter((value) => value === "clickbait"),
    ).toHaveLength(6);

    for (const item of items) {
      const classification = readClassification(item.solutionPrivate);
      expect(item.feedback.revealedAnswer).toBe(
        classification === "clickbait" ? "Clickbait" : "Periodismo",
      );
      expect(item.feedback.signals.length).toBeGreaterThanOrEqual(1);
      expect(item.feedback.recommendation.trim().length).toBeGreaterThan(0);
    }
  });

  it("publica titular, fuente y teclado sin revelar la categoría privada", () => {
    for (const item of items) {
      const publicItem = item.publicItem;
      if (publicItem.gameCode !== "clickbait-swipe") {
        throw new Error("El pack solo debe contener items de clickbait-swipe.");
      }

      expect(publicItem.headline.trim().length).toBeGreaterThan(0);
      expect(publicItem.sourceLabel.trim().length).toBeGreaterThan(0);
      expect(publicItem.actions).toEqual(["journalism", "clickbait"]);
      expect(publicItem.keyboardEquivalent).toBe(true);

      expect(CLASSIFICATION_VOCABULARY.test(publicItem.headline)).toBe(false);
      expect(publicItem.headline).not.toContain(
        item.feedback.revealedAnswer ?? "",
      );
      for (const signal of item.feedback.signals) {
        expect(publicItem.headline).not.toContain(signal);
      }

      const signals = item.solutionPrivate["evaluationSignals"];
      expect(Array.isArray(signals)).toBe(true);
      expect((signals as unknown[]).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("publica los doce items en orden y nunca expone la solución privada", () => {
    const repository = createContentRepository(contentPack);

    expect(repository.activeVersion).toBe("2026-07-30.1");
    const published = repository.listPublishedItems("clickbait-swipe");
    expect(published.map((item) => item.itemId)).toEqual([
      "clickbait-swipe-001",
      "clickbait-swipe-002",
      "clickbait-swipe-003",
      "clickbait-swipe-004",
      "clickbait-swipe-005",
      "clickbait-swipe-006",
      "clickbait-swipe-007",
      "clickbait-swipe-008",
      "clickbait-swipe-009",
      "clickbait-swipe-010",
      "clickbait-swipe-011",
      "clickbait-swipe-012",
    ]);

    for (const item of published) {
      const publicItem = repository.getPublicItem(
        "clickbait-swipe",
        item.itemId,
      );
      expect(publicItem).not.toBeNull();
      expect(publicItem && "solutionPrivate" in publicItem).toBe(false);
      expect(publicItem && "feedback" in publicItem).toBe(false);
      expect(
        repository.getFeedback("clickbait-swipe", item.itemId)?.revealedAnswer,
      ).not.toBeNull();
    }
  });
});
