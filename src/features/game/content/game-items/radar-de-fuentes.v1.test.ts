import { describe, expect, it } from "vitest";

import { createContentRepository } from "../content-repository";
import { validateContentCollection } from "../content-validation";
import contentPack from "./radar-de-fuentes.v1.json";

const CLASSIFICATIONS = ["reliable", "doubtful", "fraudulent"] as const;
type Classification = (typeof CLASSIFICATIONS)[number];

const REVEALED_ANSWERS: Record<Classification, string> = {
  reliable: "Confiable",
  doubtful: "Dudosa",
  fraudulent: "Fraudulenta",
};

const CATEGORY_LABELS = Object.values(REVEALED_ANSWERS);

function readClassification(
  solutionPrivate: Record<string, unknown>,
): Classification {
  const classification = solutionPrivate["classification"];
  if (
    typeof classification !== "string" ||
    !CLASSIFICATIONS.includes(classification as Classification)
  ) {
    throw new Error(
      "solutionPrivate debe declarar classification reliable, doubtful o fraudulent.",
    );
  }
  return classification as Classification;
}

describe("pack editorial radar-de-fuentes.v1 (T053)", () => {
  const items = validateContentCollection(contentPack);

  it("pasa la revisión estructural con exactamente nueve fuentes", () => {
    expect(items).toHaveLength(9);
  });

  it("declara los nueve items aprobados en la versión registrada del manifiesto", () => {
    for (const item of items) {
      expect(item.editorialStatus).toBe("approved");
      expect(item.contentVersion).toBe("2026-07-30.1");
      expect(item.gameCode).toBe("radar-de-fuentes");
      expect(item.mechanic).toBe("source_classification");
    }
    expect(items.map((item) => item.sequence)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });

  it("equilibra tres confiables, tres dudosas y tres fraudulentas", () => {
    const classifications = items.map((item) =>
      readClassification(item.solutionPrivate),
    );
    expect(
      classifications.filter((value) => value === "reliable"),
    ).toHaveLength(3);
    expect(
      classifications.filter((value) => value === "doubtful"),
    ).toHaveLength(3);
    expect(
      classifications.filter((value) => value === "fraudulent"),
    ).toHaveLength(3);

    for (const item of items) {
      const classification = readClassification(item.solutionPrivate);
      expect(item.feedback.revealedAnswer).toBe(
        REVEALED_ANSWERS[classification],
      );
      expect(item.feedback.signals.length).toBeGreaterThanOrEqual(1);
      expect(item.feedback.recommendation.trim().length).toBeGreaterThan(0);
      expect(item.feedback.explanation.trim().length).toBeGreaterThan(0);
    }
  });

  it("intercala categorías en orden pedagógico (sin bloques de tres iguales)", () => {
    const classifications = items.map((item) =>
      readClassification(item.solutionPrivate),
    );

    // Round-robin: confiable → dudosa → fraudulenta, tres vueltas.
    expect(classifications).toEqual([
      "reliable",
      "doubtful",
      "fraudulent",
      "reliable",
      "doubtful",
      "fraudulent",
      "reliable",
      "doubtful",
      "fraudulent",
    ]);

    for (let index = 0; index < classifications.length - 2; index += 1) {
      const window = classifications.slice(index, index + 3);
      expect(new Set(window).size).toBeGreaterThan(1);
    }
  });

  it("publica nombre, URL visible y descripción sin revelar la categoría privada", () => {
    for (const item of items) {
      const publicItem = item.publicItem;
      if (publicItem.gameCode !== "radar-de-fuentes") {
        throw new Error(
          "El pack solo debe contener items de radar-de-fuentes.",
        );
      }

      expect(publicItem.sourceName.trim().length).toBeGreaterThan(0);
      expect(publicItem.urlLabel.trim().length).toBeGreaterThan(0);
      expect(publicItem.urlLabel).toMatch(/^https:\/\//);
      expect(publicItem.description.trim().length).toBeGreaterThan(0);
      expect(publicItem.categories).toEqual([
        "reliable",
        "doubtful",
        "fraudulent",
      ]);

      for (const label of CATEGORY_LABELS) {
        expect(publicItem.sourceName).not.toContain(label);
        expect(publicItem.urlLabel).not.toContain(label);
        expect(publicItem.description).not.toContain(label);
        expect(publicItem.prompt).not.toContain(label);
      }

      expect(publicItem.description).not.toContain(
        item.feedback.revealedAnswer ?? "",
      );
      for (const signal of item.feedback.signals) {
        expect(publicItem.description).not.toContain(signal);
      }

      const signals = item.solutionPrivate["evaluationSignals"];
      expect(Array.isArray(signals)).toBe(true);
      expect((signals as unknown[]).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("publica las nueve fuentes en orden pedagógico y nunca expone la solución privada", () => {
    const repository = createContentRepository(contentPack);

    expect(repository.activeVersion).toBe("2026-07-30.1");
    const published = repository.listPublishedItems("radar-de-fuentes");
    // Intercalado confiable/dudosa/fraudulenta con dificultad creciente.
    expect(published.map((item) => item.itemId)).toEqual([
      "radar-de-fuentes-001",
      "radar-de-fuentes-004",
      "radar-de-fuentes-007",
      "radar-de-fuentes-002",
      "radar-de-fuentes-005",
      "radar-de-fuentes-008",
      "radar-de-fuentes-003",
      "radar-de-fuentes-006",
      "radar-de-fuentes-009",
    ]);

    for (const item of published) {
      const publicItem = repository.getPublicItem(
        "radar-de-fuentes",
        item.itemId,
      );
      expect(publicItem).not.toBeNull();
      expect(publicItem && "solutionPrivate" in publicItem).toBe(false);
      expect(publicItem && "feedback" in publicItem).toBe(false);
      expect(
        repository.getFeedback("radar-de-fuentes", item.itemId)
          ?.revealedAnswer,
      ).not.toBeNull();
    }
  });
});
