import { describe, expect, it } from "vitest";

import {
  GameActionSchema,
  GameCatalogSchema,
  GameCatalogEntrySchema,
  GameResultSchema,
  GameStateSchema,
  LeaderboardSchema,
  PublicItemSchema,
  RankingScoreSchema,
} from "./schemas";

const realItem = {
  gameCode: "real-o-ia" as const,
  mechanic: "image_verdict" as const,
  itemId: "item-real-1",
  prompt: "Observa la imagen.",
  context: "Una escena urbana para analizar.",
  media: {
    kind: "image" as const,
    src: "/images/questions/contexto-fuera-de-campo.webp",
    alt: "Escena urbana con varios elementos visibles.",
    decorative: false,
    width: 640,
    height: 480,
    fallbackText: "La imagen no está disponible.",
  },
  choices: ["real", "ai"] as const,
};

const baseScore = {
  points: 10,
  maxPoints: 80,
  correct: 1,
  errors: 0,
  bonusPoints: 0,
  penaltyPoints: 0,
  timeLimitSeconds: null,
  timeUsedSeconds: null,
};

describe("schemas del dominio arcade", () => {
  it("valida el catálogo y exige el mapeo gameCode-mecánica", () => {
    expect(
      GameCatalogEntrySchema.safeParse({
        gameCode: "real-o-ia",
        mechanic: "image_verdict",
        name: "¿Real o IA?",
        objective: "Reconocer señales visuales.",
        route: "/games/real-o-ia",
        contentVersion: "v1",
        available: true,
        siftFocus: ["investigate"],
      }).success,
    ).toBe(true);

    expect(
      GameCatalogEntrySchema.safeParse({
        gameCode: "real-o-ia",
        mechanic: "timed_feed",
        name: "¿Real o IA?",
        objective: "Reconocer señales visuales.",
        route: "/games/real-o-ia",
        contentVersion: "v1",
        available: true,
        siftFocus: ["investigate"],
      }).success,
    ).toBe(false);

    const catalog = [
      ["real-o-ia", "image_verdict", ["investigate"]],
      ["grupo", "group_decision", ["stop", "investigate"]],
      ["clickbait-swipe", "headline_classification", ["stop", "investigate"]],
      ["radar-de-fuentes", "source_classification", ["investigate", "trace"]],
      ["feed-60", "timed_feed", ["find", "trace"]],
      ["mente-maestra", "guided_autopsy", ["investigate", "trace"]],
    ].map(([gameCode, mechanic, siftFocus]) => ({
      gameCode,
      mechanic,
      name: "Juego educativo",
      objective: "Practicar alfabetización mediática.",
      route: `/games/${gameCode}`,
      contentVersion: "v1",
      available: true,
      siftFocus,
    }));
    expect(GameCatalogSchema.safeParse(catalog).success).toBe(true);
  });

  it("valida los seis discriminantes de acciones", () => {
    const actions = [
      { gameCode: "real-o-ia", itemId: "item-1", input: { kind: "verdict", value: "real" } },
      { gameCode: "grupo", itemId: "item-1", input: { kind: "group_action", value: "verify" } },
      {
        gameCode: "clickbait-swipe",
        itemId: "item-1",
        input: { kind: "headline_classification", value: "clickbait", source: "button" },
      },
      {
        gameCode: "radar-de-fuentes",
        itemId: "item-1",
        input: { kind: "source_classification", value: "reliable" },
      },
      { gameCode: "feed-60", itemId: "item-1", input: { kind: "feed_action", value: "discard" } },
      {
        gameCode: "mente-maestra",
        itemId: "item-1",
        input: { kind: "autopsy_choice", step: "evidence", optionId: "option-1" },
      },
    ];

    expect(actions.every((action) => GameActionSchema.safeParse(action).success)).toBe(true);
  });

  it("valida item público y estado consistente de una sesión", () => {
    expect(PublicItemSchema.safeParse(realItem).success).toBe(true);
    expect(
      GameStateSchema.safeParse({
        sessionId: "session-1",
        gameCode: "real-o-ia",
        mechanic: "image_verdict",
        status: "active",
        alias: "Ana",
        position: 0,
        total: 8,
        item: realItem,
        feedback: null,
        provisionalScore: null,
        nextAction: "submit",
      }).success,
    ).toBe(true);
    expect(
      GameStateSchema.safeParse({
        sessionId: "session-1",
        gameCode: "real-o-ia",
        mechanic: "timed_feed",
        status: "active",
        alias: "Ana",
        position: 0,
        total: 8,
        item: realItem,
        feedback: null,
        provisionalScore: null,
        nextAction: "submit",
      }).success,
    ).toBe(false);
  });

  it("valida resultados terminales, rankingScore y límite global", () => {
    expect(RankingScoreSchema.safeParse(100).success).toBe(true);
    expect(RankingScoreSchema.safeParse(101).success).toBe(false);
    expect(
      GameResultSchema.safeParse({
        sessionId: "session-1",
        gameCode: "real-o-ia",
        alias: "Ana",
        status: "finished",
        answered: 8,
        total: 8,
        learningSummary: "Observaste señales antes de decidir.",
        score: { ...baseScore, points: 80 },
        simulatedReach: null,
        itemDigests: null,
      }).success,
    ).toBe(true);
    expect(
      GameResultSchema.safeParse({
        sessionId: "session-1",
        gameCode: "real-o-ia",
        alias: "Ana",
        status: "finished",
        answered: 7,
        total: 8,
        learningSummary: "Observaste señales antes de decidir.",
        score: baseScore,
        simulatedReach: null,
        itemDigests: null,
      }).success,
    ).toBe(false);
    expect(
      LeaderboardSchema.safeParse({ scope: "global", entries: [], limit: 10 }).success,
    ).toBe(true);
    expect(
      LeaderboardSchema.safeParse({
        scope: "global",
        entries: [
          {
            rank: 1,
            gameCode: "real-o-ia",
            alias: "Ana",
            points: 40,
            maxPoints: 80,
            rankingScore: 40,
            completedAt: "2026-08-01T12:00:00Z",
          },
        ],
        limit: 10,
      }).success,
    ).toBe(false);
  });
});
