import {
  PublicQuestionSchema,
  RoundSizeSchema,
  ValidatedAliasSchema,
} from "@antidoto/contracts";
import {
  GameActionSchema,
  GameResultSchema,
  GameStateSchema,
  LeaderboardSchema,
  PublicItemSchema,
} from "../../src/features/game/domain/schemas";

export const publicRef = "A1b2C3d4E5f6G7h8I9j0K1";

// Transitional sample kept until T024 removes the single_choice surface.
export const validQuestion = {
  ref: publicRef,
  mechanic: "single_choice" as const,
  prompt: "¿Qué ayuda a verificar una afirmación?",
  image: null,
  options: [
    { ref: "B1b2C3d4E5f6G7h8I9j0K2", label: "La fuente", position: 1 },
    { ref: "C1b2C3d4E5f6G7h8I9j0K3", label: "El rumor", position: 2 },
  ],
};

const publicMedia = {
  kind: "image" as const,
  src: "/media/real-o-ia/item-1.webp",
  alt: "Escena urbana con señales visuales observables.",
  decorative: false,
  width: 640,
  height: 480,
  fallbackText: "La imagen no está disponible.",
};

export const publicItems = [
  PublicItemSchema.parse({
    gameCode: "real-o-ia",
    mechanic: "image_verdict",
    itemId: "item-real-1",
    prompt: "¿La imagen parece real o generada por IA?",
    context: "Observa la iluminación, los bordes y los detalles pequeños.",
    media: publicMedia,
    choices: ["real", "ai"],
  }),
  PublicItemSchema.parse({
    gameCode: "grupo",
    mechanic: "group_decision",
    itemId: "item-grupo-1",
    prompt: "¿Qué harías antes de compartir este mensaje?",
    messages: [
      { sender: "Marta", text: "Miren esta alerta urgente.", timeLabel: "09:10" },
      { sender: "Luis", text: "¿Alguien verificó la fuente?", timeLabel: "09:11" },
    ],
    actions: ["forward", "verify", "pause"],
  }),
  PublicItemSchema.parse({
    gameCode: "clickbait-swipe",
    mechanic: "headline_classification",
    itemId: "item-headline-1",
    prompt: "Clasifica el titular.",
    headline: "Lo que este detalle revela sobre la noticia",
    sourceLabel: "Boletín local",
    actions: ["journalism", "clickbait"],
    keyboardEquivalent: true,
  }),
  PublicItemSchema.parse({
    gameCode: "radar-de-fuentes",
    mechanic: "source_classification",
    itemId: "item-source-1",
    prompt: "Clasifica esta fuente según sus señales observables.",
    sourceName: "Observatorio de Medios",
    urlLabel: "observatorio.example.org",
    description: "Publica autoría, fecha y enlaces a documentos verificables.",
    categories: ["reliable", "doubtful", "fraudulent"],
  }),
  PublicItemSchema.parse({
    gameCode: "feed-60",
    mechanic: "timed_feed",
    itemId: "item-feed-1",
    prompt: "Decide qué hacer con esta publicación.",
    post: "Una publicación viral afirma que una medida entra en vigor hoy.",
    sourceLabel: "Cuenta pública",
    actions: ["verify", "share", "discard"],
    remainingSeconds: 60,
    verificationAvailable: true,
  }),
  PublicItemSchema.parse({
    gameCode: "mente-maestra",
    mechanic: "guided_autopsy",
    itemId: "item-autopsy-1",
    step: "objective",
    prompt: "¿Qué objetivo intenta provocar este contenido?",
    options: [
      {
        optionId: "objective-1",
        label: "Obtener una reacción",
        description: "Busca que la persona actúe antes de comprobar.",
      },
      {
        optionId: "objective-2",
        label: "Informar con contexto",
        description: "Presenta evidencia y límites verificables.",
      },
    ],
  }),
] as const;

export const discriminatedActions = [
  GameActionSchema.parse({
    gameCode: "real-o-ia",
    itemId: "item-real-1",
    input: { kind: "verdict", value: "real" },
  }),
  GameActionSchema.parse({
    gameCode: "grupo",
    itemId: "item-grupo-1",
    input: { kind: "group_action", value: "verify" },
  }),
  GameActionSchema.parse({
    gameCode: "clickbait-swipe",
    itemId: "item-headline-1",
    input: {
      kind: "headline_classification",
      value: "clickbait",
      source: "keyboard",
    },
  }),
  GameActionSchema.parse({
    gameCode: "radar-de-fuentes",
    itemId: "item-source-1",
    input: { kind: "source_classification", value: "reliable" },
  }),
  GameActionSchema.parse({
    gameCode: "feed-60",
    itemId: "item-feed-1",
    input: { kind: "feed_action", value: "verify" },
  }),
  GameActionSchema.parse({
    gameCode: "mente-maestra",
    itemId: "item-autopsy-1",
    input: {
      kind: "autopsy_choice",
      step: "objective",
      optionId: "objective-1",
    },
  }),
] as const;

export const arcadeContractSamples = {
  publicItems,
  state: GameStateSchema.parse({
    sessionId: "session-real-1",
    gameCode: "real-o-ia",
    mechanic: "image_verdict",
    status: "active",
    alias: "Ana",
    position: 0,
    total: 8,
    item: publicItems[0],
    feedback: null,
    provisionalScore: null,
    nextAction: "submit",
  }),
  result: GameResultSchema.parse({
    sessionId: "session-real-1",
    gameCode: "real-o-ia",
    alias: "Ana",
    status: "finished",
    answered: 8,
    total: 8,
    learningSummary: "Observaste señales antes de decidir.",
    score: {
      points: 80,
      maxPoints: 80,
      correct: 8,
      errors: 0,
      bonusPoints: 0,
      penaltyPoints: 0,
      timeLimitSeconds: null,
      timeUsedSeconds: null,
    },
    simulatedReach: null,
    itemDigests: null,
  }),
  leaderboard: LeaderboardSchema.parse({
    scope: "global",
    entries: [
      {
        rank: 1,
        gameCode: "real-o-ia",
        alias: "Ana",
        points: 80,
        maxPoints: 80,
        rankingScore: 100,
        completedAt: "2026-08-01T12:00:00Z",
      },
    ],
    limit: 10,
  }),
} as const;

export const contractSamples = {
  alias: ValidatedAliasSchema.parse("Ana"),
  roundSize: RoundSizeSchema.parse(5),
  question: PublicQuestionSchema.parse(validQuestion),
  arcade: arcadeContractSamples,
};
