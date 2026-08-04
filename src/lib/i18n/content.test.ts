import { describe, expect, it } from "vitest";

import { listAvailableArcadeCatalog } from "../../features/game/content/catalog";
import {
  getLocalizedCatalog,
  localizeFeedback,
  localizeGameState,
  localizePublicItem,
  validateEnglishContentCoverage,
} from "./content";

describe("bilingual arcade content", () => {
  it("has an English catalog equivalent for every available mission", () => {
    const catalog = getLocalizedCatalog("en");

    expect(catalog).toHaveLength(listAvailableArcadeCatalog().length);
    expect(catalog.every((game) => game.name.length > 0 && game.objective.length > 0)).toBe(true);
  });

  it("keeps every approved item translatable without changing game identifiers", () => {
    expect(validateEnglishContentCoverage()).toEqual({ ok: true, missing: [] });
  });

  it("localizes an item and its feedback while preserving answer enums", () => {
    const item = {
      gameCode: "grupo",
      mechanic: "group_decision",
      itemId: "grupo-001",
      prompt: "En el chat familiar llega un supuesto remedio de salud.",
      messages: [
        { sender: "Tía Marta", text: "URGENTE: reenvía este mensaje.", timeLabel: "10:02" },
      ],
      actions: ["forward", "verify", "pause"],
    } as const;
    const feedback = {
      status: "instructive",
      explanation: "La cadena no tiene respaldo.",
      signals: ["No hay fuente verificable."],
      recommendation: "Comprueba la fuente antes de compartir.",
      revealedAnswer: "Hay que verificarla.",
    } as const;

    const localizedItem = localizePublicItem(item, "en");
    const localizedFeedback = localizeFeedback(feedback as unknown as Parameters<typeof localizeFeedback>[0], "en", "grupo-001");

    expect(localizedItem.itemId).toBe(item.itemId);
    expect(localizedItem.gameCode).toBe(item.gameCode);
    expect(localizedItem.actions).toEqual(item.actions);
    expect(localizedItem.prompt).not.toBe(item.prompt);
    expect(localizedFeedback.explanation).not.toBe(feedback.explanation);
  });

  it("localizes active game state without touching session or action fields", () => {
    const state = {
      sessionId: "session-1",
      gameCode: "grupo",
      mechanic: "group_decision",
      status: "active",
      alias: "Ana",
      position: 0,
      total: 6,
      item: {
        gameCode: "grupo",
        mechanic: "group_decision",
        itemId: "grupo-001",
        prompt: "En el chat familiar llega un supuesto remedio de salud.",
        messages: [{ sender: "Tía Marta", text: "URGENTE", timeLabel: "10:02" }],
        actions: ["forward", "verify", "pause"],
      },
      feedback: null,
      provisionalScore: null,
      nextAction: "submit",
    } as const;
    const localized = localizeGameState(state, "en");

    expect(localized.sessionId).toBe(state.sessionId);
    expect(localized.nextAction).toBe(state.nextAction);
    expect(localized.item?.prompt).not.toBe(state.item.prompt);
  });
});
