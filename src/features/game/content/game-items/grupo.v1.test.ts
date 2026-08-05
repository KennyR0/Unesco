import { describe, expect, it } from "vitest";

import { createContentRepository } from "../content-repository";
import { validateContentCollection } from "../content-validation";
import contentPack from "./grupo.v1.json";

const ACTIONS = ["forward", "verify", "pause"] as const;
type GroupAction = (typeof ACTIONS)[number];

type ActionEvaluation = {
  score: number;
  narrativeResult: string;
  consequences: string[];
  feedback: string;
};

function readActionEvaluations(
  solutionPrivate: Record<string, unknown>,
): Record<GroupAction, ActionEvaluation> {
  const actionEvaluations = solutionPrivate["actionEvaluations"];
  if (
    actionEvaluations === null ||
    typeof actionEvaluations !== "object" ||
    Array.isArray(actionEvaluations)
  ) {
    throw new Error("solutionPrivate debe declarar actionEvaluations por acción.");
  }

  return actionEvaluations as Record<GroupAction, ActionEvaluation>;
}

describe("pack editorial grupo.v1 (T045)", () => {
  const items = validateContentCollection(contentPack);

  it("declara exactamente seis escenas aprobadas, versionadas y contiguas", () => {
    expect(items).toHaveLength(6);
    expect(items.every((item) => item.editorialStatus === "approved")).toBe(true);
    expect(items.every((item) => item.contentVersion === "2026-07-30.1")).toBe(
      true,
    );
    expect(items.every((item) => item.gameCode === "grupo")).toBe(true);
    expect(items.every((item) => item.mechanic === "group_decision")).toBe(true);
    expect(items.map((item) => item.sequence)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("conserva mensajes ordenados, no vacíos y las tres acciones canónicas", () => {
    for (const item of items) {
      if (item.publicItem.gameCode !== "grupo") {
        throw new Error("El pack solo debe contener items de grupo.");
      }

      expect(item.publicItem.messages.length).toBeGreaterThan(0);
      for (const message of item.publicItem.messages) {
        expect(message.sender.trim().length).toBeGreaterThan(0);
        expect(message.text.trim().length).toBeGreaterThan(0);
        expect(message.timeLabel?.trim().length).toBeGreaterThan(0);
      }
      expect(item.publicItem.actions).toEqual(ACTIONS);
    }
  });

  it("adjunta media real en las escenas de foto y clip político", () => {
    const river = items.find((item) => item.itemId === "grupo-002");
    const clip = items.find((item) => item.itemId === "grupo-004");
    expect(river?.publicItem.gameCode).toBe("grupo");
    expect(clip?.publicItem.gameCode).toBe("grupo");
    if (river?.publicItem.gameCode !== "grupo" || clip?.publicItem.gameCode !== "grupo") {
      throw new Error("Items de grupo esperados.");
    }
    const riverMedia = river.publicItem.messages[0]?.media;
    const clipMedia = clip.publicItem.messages[0]?.media;
    expect(riverMedia?.src).toMatch(/^\/media\/grupo\/rio-inundacion/);
    expect(clipMedia?.src).toMatch(/^\/media\/grupo\/clip-politico/);
    expect(river.publicItem.messages[0]?.attachmentPresentation).toBe("photo");
    expect(clip.publicItem.messages[0]?.attachmentPresentation).toBe("video_clip");
  });

  it("evalúa cada acción en privado con score, consecuencia y feedback específicos", () => {
    for (const item of items) {
      const evaluations = readActionEvaluations(item.solutionPrivate);

      for (const action of ACTIONS) {
        const evaluation = evaluations[action];
        expect(evaluation).toBeDefined();
        expect([0, 1, 2]).toContain(evaluation.score);
        expect(evaluation.narrativeResult.trim().length).toBeGreaterThan(0);
        expect(evaluation.consequences.length).toBeGreaterThan(0);
        expect(
          evaluation.consequences.every((consequence) => consequence.trim().length > 0),
        ).toBe(true);
        expect(evaluation.feedback.trim().length).toBeGreaterThan(0);
      }

      expect(item.feedback.explanation.trim().length).toBeGreaterThan(0);
      expect(item.feedback.signals.length).toBeGreaterThan(0);
      expect(item.feedback.recommendation.trim().length).toBeGreaterThan(0);
      expect(item.feedback.revealedAnswer).not.toBeNull();
    }
  });

  it("permite reenviar la alerta oficial verificada como decisión protectora", () => {
    const officialAlert = items.find((item) => item.sequence === 5);
    expect(officialAlert).toBeDefined();

    const evaluations = readActionEvaluations(officialAlert!.solutionPrivate);
    expect(evaluations.forward.score).toBe(2);
    expect(evaluations.forward.feedback.toLowerCase()).toContain("protectora");
  });

  it("mantiene un máximo de 6 escenas × 2 puntos = 12", () => {
    const maximumScore = items.reduce((total, item) => {
      const evaluations = readActionEvaluations(item.solutionPrivate);
      const sceneMaximum = Math.max(...ACTIONS.map((action) => evaluations[action].score));
      return total + sceneMaximum;
    }, 0);

    expect(maximumScore).toBe(6 * 2);
  });

  it("publica las seis escenas en orden sin exponer solución ni feedback", () => {
    const repository = createContentRepository(contentPack);
    const published = repository.listPublishedItems("grupo");

    expect(repository.activeVersion).toBe("2026-07-30.1");
    expect(published.map((item) => item.itemId)).toEqual([
      "grupo-001",
      "grupo-002",
      "grupo-003",
      "grupo-004",
      "grupo-005",
      "grupo-006",
    ]);

    for (const item of published) {
      const publicItem = repository.getPublicItem("grupo", item.itemId);
      expect(publicItem).not.toBeNull();
      expect(publicItem && "solutionPrivate" in publicItem).toBe(false);
      expect(publicItem && "feedback" in publicItem).toBe(false);
      expect(repository.getFeedback("grupo", item.itemId)?.revealedAnswer).not.toBeNull();
    }
  });
});
