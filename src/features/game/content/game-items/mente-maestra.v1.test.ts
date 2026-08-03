import { describe, expect, it } from "vitest";

import { createContentRepository } from "../content-repository";
import { validateContentCollection } from "../content-validation";
import contentPack from "./mente-maestra.v1.json";

const STEPS = ["objective", "emotion", "headline", "evidence"] as const;
type AutopsyStep = (typeof STEPS)[number];

type OptionEvaluation = {
  reachWeight: number;
  techniqueId: string;
  autopsyTitle: string;
  autopsyTip: string;
  includeInAutopsy: boolean;
};

function readStep(solutionPrivate: Record<string, unknown>): AutopsyStep {
  const step = solutionPrivate["step"];
  if (typeof step !== "string" || !STEPS.includes(step as AutopsyStep)) {
    throw new Error(
      "solutionPrivate debe declarar step objective, emotion, headline o evidence.",
    );
  }
  return step as AutopsyStep;
}

function readOptionEvaluations(
  solutionPrivate: Record<string, unknown>,
): Record<string, OptionEvaluation> {
  const optionEvaluations = solutionPrivate["optionEvaluations"];
  if (
    optionEvaluations === null ||
    typeof optionEvaluations !== "object" ||
    Array.isArray(optionEvaluations)
  ) {
    throw new Error(
      "solutionPrivate debe declarar optionEvaluations por optionId.",
    );
  }
  return optionEvaluations as Record<string, OptionEvaluation>;
}

describe("pack editorial mente-maestra.v1 (T062)", () => {
  const items = validateContentCollection(contentPack);

  it("declara exactamente cuatro pasos aprobados, versionados y contiguos", () => {
    expect(items).toHaveLength(4);
    expect(items.every((item) => item.editorialStatus === "approved")).toBe(
      true,
    );
    expect(items.every((item) => item.contentVersion === "2026-07-30.1")).toBe(
      true,
    );
    expect(items.every((item) => item.gameCode === "mente-maestra")).toBe(true);
    expect(items.every((item) => item.mechanic === "guided_autopsy")).toBe(
      true,
    );
    expect(items.map((item) => item.sequence)).toEqual([1, 2, 3, 4]);
  });

  it("publica objective, emotion, headline y evidence con opciones sin viralidad como premio", () => {
    const publicSteps = items.map((item) => {
      if (item.publicItem.gameCode !== "mente-maestra") {
        throw new Error("El pack solo debe contener items de mente-maestra.");
      }
      return item.publicItem.step;
    });
    expect(publicSteps).toEqual([...STEPS]);

    for (const item of items) {
      if (item.publicItem.gameCode !== "mente-maestra") {
        throw new Error("El pack solo debe contener items de mente-maestra.");
      }

      expect(item.publicItem.options.length).toBeGreaterThanOrEqual(3);
      for (const option of item.publicItem.options) {
        expect(option.optionId.trim().length).toBeGreaterThan(0);
        expect(option.label.trim().length).toBeGreaterThan(0);
        expect(option.description.trim().length).toBeGreaterThan(0);
        expect(option.label.toLowerCase()).not.toContain("viralidad");
        expect(option.description.toLowerCase()).not.toContain("viralidad");
        expect(option.label).not.toMatch(/\+\d+/);
        expect(option.description).not.toMatch(/\+\d+/);
      }

      expect(item.publicItem.prompt.toLowerCase()).not.toContain("premio");
      expect(JSON.stringify(item.publicItem)).not.toContain("reachWeight");
    }
  });

  it("incluye autopsia, feedback editorial y reachWeight privado acotado a 65–95", () => {
    let minimumReach = 0;
    let maximumReach = 0;

    for (const item of items) {
      const step = readStep(item.solutionPrivate);
      const evaluations = readOptionEvaluations(item.solutionPrivate);
      const publicOptionIds =
        item.publicItem.gameCode === "mente-maestra"
          ? item.publicItem.options.map((option) => option.optionId)
          : [];

      expect(step).toBe(
        item.publicItem.gameCode === "mente-maestra"
          ? item.publicItem.step
          : step,
      );
      expect(Object.keys(evaluations).sort()).toEqual(
        [...publicOptionIds].sort(),
      );

      const weights = Object.values(evaluations).map(
        (evaluation) => evaluation.reachWeight,
      );
      expect(weights.every((weight) => Number.isInteger(weight))).toBe(true);
      expect(weights.every((weight) => weight > 0)).toBe(true);

      for (const evaluation of Object.values(evaluations)) {
        expect(evaluation.techniqueId.trim().length).toBeGreaterThan(0);
        expect(evaluation.autopsyTitle.trim().length).toBeGreaterThan(0);
        expect(evaluation.autopsyTip.trim().length).toBeGreaterThan(0);
        expect(evaluation.includeInAutopsy).toBe(true);
      }

      minimumReach += Math.min(...weights);
      maximumReach += Math.max(...weights);

      expect(item.feedback.status).toBe("instructive");
      expect(item.feedback.explanation.trim().length).toBeGreaterThan(0);
      expect(item.feedback.signals.length).toBeGreaterThanOrEqual(3);
      expect(item.feedback.recommendation.trim().length).toBeGreaterThan(0);
      expect(item.feedback.revealedAnswer).not.toBeNull();
      expect(item.feedback.revealedAnswer?.trim().length).toBeGreaterThan(0);
    }

    expect(minimumReach).toBe(65);
    expect(maximumReach).toBe(95);

    const evidence = items.find((item) => item.sequence === 4);
    expect(evidence).toBeDefined();
    const simulationAssets = evidence!.solutionPrivate["simulationAssets"];
    expect(simulationAssets).toEqual(
      expect.objectContaining({
        educationalDisclaimer: expect.stringMatching(/simulación educativa/i),
        fictionalComments: expect.any(Array),
      }),
    );
    const comments = (
      simulationAssets as { fictionalComments: unknown[] }
    ).fictionalComments;
    expect(comments.length).toBeGreaterThanOrEqual(3);
    expect(
      comments.every(
        (comment) => typeof comment === "string" && comment.trim().length > 0,
      ),
    ).toBe(true);
  });

  it("cubre miedo, autoridad falsa, formato oficial, imagen reciclada o IA y eje truncado", () => {
    const techniqueIds = items.flatMap((item) =>
      Object.values(readOptionEvaluations(item.solutionPrivate)).map(
        (evaluation) => evaluation.techniqueId,
      ),
    );

    expect(techniqueIds).toEqual(
      expect.arrayContaining([
        "fear",
        "vague_experts",
        "fake_official_format",
        "recycled_photo",
        "ai_image",
        "truncated_axis",
      ]),
    );
  });

  it("publica los cuatro pasos en orden sin exponer solución ni feedback", () => {
    const repository = createContentRepository(contentPack);
    const published = repository.listPublishedItems("mente-maestra");

    expect(repository.activeVersion).toBe("2026-07-30.1");
    expect(published.map((item) => item.itemId)).toEqual([
      "mente-maestra-001",
      "mente-maestra-002",
      "mente-maestra-003",
      "mente-maestra-004",
    ]);

    for (const item of published) {
      const publicItem = repository.getPublicItem("mente-maestra", item.itemId);
      expect(publicItem).not.toBeNull();
      expect(publicItem && "solutionPrivate" in publicItem).toBe(false);
      expect(publicItem && "feedback" in publicItem).toBe(false);
      expect(
        repository.getFeedback("mente-maestra", item.itemId)?.revealedAnswer,
      ).not.toBeNull();
    }
  });
});
