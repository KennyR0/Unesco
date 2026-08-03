import { z } from "zod";

import {
  GAME_CODE_TO_MECHANIC,
  GAME_CODES,
  LEADERBOARD_LIMIT,
  MECHANICS,
} from "@antidoto/contracts";

const IdentifierSchema = z
  .string()
  .min(1)
  .max(128)
  .refine((value) => value.trim().length > 0, "El identificador no puede estar vacío.");

const TextSchema = z
  .string()
  .min(1)
  .max(2_000)
  .refine((value) => value.trim().length > 0, "El texto no puede estar vacío.");

const ShortTextSchema = z
  .string()
  .min(1)
  .max(500)
  .refine((value) => value.trim().length > 0, "El texto no puede estar vacío.");

const NonNegativeIntegerSchema = z.number().int().nonnegative();
const PositiveIntegerSchema = z.number().int().positive();
const FiniteNumberSchema = z.number().finite();

export const GameCodeSchema = z.enum(GAME_CODES);
export const MechanicSchema = z.enum(MECHANICS);

export const SessionStatusSchema = z.enum([
  "intro",
  "active",
  "processing",
  "feedback",
  "expired",
  "finished",
  "invalid",
]);

export const GameCatalogEntrySchema = z
  .object({
    gameCode: GameCodeSchema,
    mechanic: MechanicSchema,
    name: ShortTextSchema,
    objective: TextSchema,
    route: z.string().regex(/^\/games\/[a-z0-9-]+$/),
    contentVersion: IdentifierSchema,
    available: z.boolean(),
  })
  .strict()
  .superRefine((entry, context) => {
    if (GAME_CODE_TO_MECHANIC[entry.gameCode] !== entry.mechanic) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mechanic"],
        message: "La mecánica no coincide con el gameCode.",
      });
    }
  });

export const GameCatalogSchema = z
  .array(GameCatalogEntrySchema)
  .length(GAME_CODES.length)
  .superRefine((catalog, context) => {
    const codes = new Set(catalog.map((entry) => entry.gameCode));
    for (const gameCode of GAME_CODES) {
      if (!codes.has(gameCode)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gameCode"],
          message: `Falta el juego requerido ${gameCode}.`,
        });
      }
    }
    if (codes.size !== catalog.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gameCode"],
        message: "El catálogo no puede repetir gameCode.",
      });
    }
  });

const MediaDimensionSchema = PositiveIntegerSchema.max(4_096).nullable();

const MediaSrcSetSchema = z
  .object({
    "480": z.string().min(1).max(2_048).optional(),
    "768": z.string().min(1).max(2_048).optional(),
    "1280": z.string().min(1).max(2_048).optional(),
  })
  .strict()
  .nullable()
  .optional();

export const PublicMediaSchema = z
  .object({
    kind: z.enum(["image", "illustration", "audio", "none"]),
    src: z.string().min(1).max(2_048).nullable(),
    alt: ShortTextSchema.nullable(),
    decorative: z.boolean(),
    width: MediaDimensionSchema,
    height: MediaDimensionSchema,
    fallbackText: ShortTextSchema.nullable(),
    srcSet: MediaSrcSetSchema,
  })
  .strict()
  .superRefine((media, context) => {
    if (media.decorative && media.alt !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["alt"],
        message: "La media decorativa no debe declarar alt informativo.",
      });
    }

    if (!media.decorative && media.alt === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["alt"],
        message: "La media informativa debe declarar texto alternativo.",
      });
    }

    if (media.kind === "none") {
      for (const field of ["src", "width", "height"] as const) {
        if (media[field] !== null) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: "La media none no puede declarar un recurso o dimensiones.",
          });
        }
      }
      if (media.fallbackText === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fallbackText"],
          message: "La media none debe conservar un fallback textual.",
        });
      }
    }

    if (media.kind === "image" || media.kind === "illustration") {
      if (media.src === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["src"],
          message: "La imagen debe declarar src.",
        });
      }
      if (media.width === null || media.height === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["width"],
          message: "La imagen debe declarar ancho y alto.",
        });
      }
    }
  });

export const PublicFeedbackSchema = z
  .object({
    status: z.enum(["correct", "incorrect", "instructive", "expired"]),
    explanation: TextSchema,
    signals: z.array(ShortTextSchema).min(1).max(20),
    recommendation: TextSchema,
    revealedAnswer: ShortTextSchema.nullable(),
  })
  .strict();

export const GroupChatMessageSchema = z
  .object({
    sender: ShortTextSchema,
    text: TextSchema,
    timeLabel: ShortTextSchema.nullable(),
  })
  .strict();

const RealOrAiPublicItemSchema = z
  .object({
    gameCode: z.literal("real-o-ia"),
    mechanic: z.literal("image_verdict"),
    itemId: IdentifierSchema,
    prompt: TextSchema,
    context: TextSchema,
    media: PublicMediaSchema,
    choices: z.tuple([z.literal("real"), z.literal("ai")]),
  })
  .strict();

const GroupPublicItemSchema = z
  .object({
    gameCode: z.literal("grupo"),
    mechanic: z.literal("group_decision"),
    itemId: IdentifierSchema,
    prompt: TextSchema,
    messages: z.array(GroupChatMessageSchema).min(1).max(100),
    actions: z.array(z.enum(["forward", "verify", "pause"])).min(1),
  })
  .strict();

const HeadlinePublicItemSchema = z
  .object({
    gameCode: z.literal("clickbait-swipe"),
    mechanic: z.literal("headline_classification"),
    itemId: IdentifierSchema,
    prompt: TextSchema,
    headline: TextSchema,
    sourceLabel: ShortTextSchema,
    actions: z.tuple([z.literal("journalism"), z.literal("clickbait")]),
    keyboardEquivalent: z.literal(true),
  })
  .strict();

const SourcePublicItemSchema = z
  .object({
    gameCode: z.literal("radar-de-fuentes"),
    mechanic: z.literal("source_classification"),
    itemId: IdentifierSchema,
    prompt: TextSchema,
    sourceName: ShortTextSchema,
    urlLabel: ShortTextSchema,
    description: TextSchema,
    categories: z.tuple([
      z.literal("reliable"),
      z.literal("doubtful"),
      z.literal("fraudulent"),
    ]),
  })
  .strict();

const FeedPublicItemSchema = z
  .object({
    gameCode: z.literal("feed-60"),
    mechanic: z.literal("timed_feed"),
    itemId: IdentifierSchema,
    prompt: TextSchema,
    post: TextSchema,
    sourceLabel: ShortTextSchema,
    actions: z.tuple([
      z.literal("verify"),
      z.literal("share"),
      z.literal("discard"),
    ]),
    remainingSeconds: z.number().int().min(0).max(60),
    verificationAvailable: z.boolean(),
  })
  .strict();

const AutopsyPublicItemSchema = z
  .object({
    gameCode: z.literal("mente-maestra"),
    mechanic: z.literal("guided_autopsy"),
    itemId: IdentifierSchema,
    step: z.enum(["objective", "emotion", "headline", "evidence"]),
    prompt: TextSchema,
    options: z
      .array(
        z
          .object({
            optionId: IdentifierSchema,
            label: ShortTextSchema,
            description: TextSchema,
          })
          .strict(),
      )
      .min(1)
      .max(20),
  })
  .strict();

export const PublicItemSchema = z.discriminatedUnion("gameCode", [
  RealOrAiPublicItemSchema,
  GroupPublicItemSchema,
  HeadlinePublicItemSchema,
  SourcePublicItemSchema,
  FeedPublicItemSchema,
  AutopsyPublicItemSchema,
]);

const RealOrAiActionSchema = z
  .object({
    gameCode: z.literal("real-o-ia"),
    itemId: IdentifierSchema,
    input: z
      .object({ kind: z.literal("verdict"), value: z.enum(["real", "ai"]) })
      .strict(),
  })
  .strict();

const GroupActionSchema = z
  .object({
    gameCode: z.literal("grupo"),
    itemId: IdentifierSchema,
    input: z
      .object({
        kind: z.literal("group_action"),
        value: z.enum(["forward", "verify", "pause"]),
      })
      .strict(),
  })
  .strict();

const HeadlineActionSchema = z
  .object({
    gameCode: z.literal("clickbait-swipe"),
    itemId: IdentifierSchema,
    input: z
      .object({
        kind: z.literal("headline_classification"),
        value: z.enum(["journalism", "clickbait"]),
        source: z.enum(["swipe", "button", "keyboard"]),
      })
      .strict(),
  })
  .strict();

const SourceActionSchema = z
  .object({
    gameCode: z.literal("radar-de-fuentes"),
    itemId: IdentifierSchema,
    input: z
      .object({
        kind: z.literal("source_classification"),
        value: z.enum(["reliable", "doubtful", "fraudulent"]),
      })
      .strict(),
  })
  .strict();

const FeedActionSchema = z
  .object({
    gameCode: z.literal("feed-60"),
    itemId: IdentifierSchema,
    input: z
      .object({
        kind: z.literal("feed_action"),
        value: z.enum(["verify", "share", "discard"]),
      })
      .strict(),
  })
  .strict();

const AutopsyActionSchema = z
  .object({
    gameCode: z.literal("mente-maestra"),
    itemId: IdentifierSchema,
    input: z
      .object({
        kind: z.literal("autopsy_choice"),
        step: z.enum(["objective", "emotion", "headline", "evidence"]),
        optionId: IdentifierSchema,
      })
      .strict(),
  })
  .strict();

const GameActionBranches = [
  RealOrAiActionSchema,
  GroupActionSchema,
  HeadlineActionSchema,
  SourceActionSchema,
  FeedActionSchema,
  AutopsyActionSchema,
] as const;

export const GameActionSchema = z.discriminatedUnion(
  "gameCode",
  GameActionBranches,
);

const SessionIdSchema = IdentifierSchema;

export const StartGameCommandSchema = z
  .object({
    alias: z
      .string()
      .min(1)
      .max(64)
      .refine((value) => value.trim().length > 0, "El alias no puede estar vacío."),
    gameCode: GameCodeSchema,
  })
  .strict();

export const AdvanceGameCommandSchema = z
  .object({
    sessionId: SessionIdSchema,
    itemId: IdentifierSchema,
  })
  .strict();

export const SubmitGameActionCommandSchema = z.discriminatedUnion("gameCode", [
  RealOrAiActionSchema.extend({ sessionId: SessionIdSchema }),
  GroupActionSchema.extend({ sessionId: SessionIdSchema }),
  HeadlineActionSchema.extend({ sessionId: SessionIdSchema }),
  SourceActionSchema.extend({ sessionId: SessionIdSchema }),
  FeedActionSchema.extend({ sessionId: SessionIdSchema }),
  AutopsyActionSchema.extend({ sessionId: SessionIdSchema }),
]);

export const RankingScoreSchema = z.number().int().min(0).max(100);

export const GameScoreSchema = z
  .object({
    points: FiniteNumberSchema.nonnegative(),
    maxPoints: FiniteNumberSchema.nonnegative(),
    correct: NonNegativeIntegerSchema.nullable(),
    errors: NonNegativeIntegerSchema,
    bonusPoints: FiniteNumberSchema.nonnegative(),
    penaltyPoints: FiniteNumberSchema.nonnegative(),
    timeLimitSeconds: FiniteNumberSchema.nonnegative().nullable(),
    timeUsedSeconds: FiniteNumberSchema.nonnegative().nullable(),
  })
  .strict()
  .superRefine((score, context) => {
    if (score.points > score.maxPoints) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["points"],
        message: "Los puntos no pueden superar maxPoints.",
      });
    }
    if (
      score.timeLimitSeconds !== null &&
      score.timeUsedSeconds !== null &&
      score.timeUsedSeconds > score.timeLimitSeconds
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["timeUsedSeconds"],
        message: "El tiempo usado no puede superar el límite.",
      });
    }
  });

export const GameStateSchema = z
  .object({
    sessionId: SessionIdSchema,
    gameCode: GameCodeSchema,
    mechanic: MechanicSchema,
    status: SessionStatusSchema,
    alias: ShortTextSchema,
    position: NonNegativeIntegerSchema,
    total: PositiveIntegerSchema,
    item: PublicItemSchema.nullable(),
    feedback: PublicFeedbackSchema.nullable(),
    provisionalScore: GameScoreSchema.nullable(),
    nextAction: z.enum(["submit", "advance", "result", "retry", "arcade"]),
  })
  .strict()
  .superRefine((state, context) => {
    if (state.position > state.total) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["position"],
        message: "La posición no puede superar el total.",
      });
    }
    if (GAME_CODE_TO_MECHANIC[state.gameCode] !== state.mechanic) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mechanic"],
        message: "La mecánica no coincide con el gameCode.",
      });
    }
    if (state.item !== null) {
      if (state.item.gameCode !== state.gameCode) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["item", "gameCode"],
          message: "El item no pertenece al juego de la sesión.",
        });
      }
      if (state.item.mechanic !== state.mechanic) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["item", "mechanic"],
          message: "El item no coincide con la mecánica de la sesión.",
        });
      }
    }
  });

export const GameResultSchema = z
  .object({
    sessionId: SessionIdSchema,
    gameCode: GameCodeSchema,
    alias: ShortTextSchema,
    status: z.enum(["finished", "expired"]),
    answered: NonNegativeIntegerSchema,
    total: PositiveIntegerSchema,
    learningSummary: TextSchema,
    score: GameScoreSchema,
    simulatedReach: z.number().int().min(65).max(95).nullable(),
  })
  .strict()
  .superRefine((result, context) => {
    if (result.answered > result.total) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answered"],
        message: "Las respuestas no pueden superar el total.",
      });
    }
    if (result.status === "finished" && result.answered !== result.total) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answered"],
        message: "Un resultado finished debe estar completo.",
      });
    }
    if (result.score.maxPoints <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["score", "maxPoints"],
        message: "Un resultado debe tener maxPoints positivo.",
      });
    }
    if (result.gameCode === "mente-maestra" && result.simulatedReach === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["simulatedReach"],
        message: "Mente Maestra debe conservar su alcance simulado.",
      });
    }
    if (result.gameCode !== "mente-maestra" && result.simulatedReach !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["simulatedReach"],
        message: "Solo Mente Maestra puede declarar alcance simulado.",
      });
    }
  });

export const LeaderboardEntrySchema = z
  .object({
    rank: PositiveIntegerSchema.max(LEADERBOARD_LIMIT),
    gameCode: GameCodeSchema,
    alias: ShortTextSchema,
    points: FiniteNumberSchema.nonnegative(),
    maxPoints: FiniteNumberSchema.positive(),
    rankingScore: RankingScoreSchema,
    completedAt: z.string().datetime({ offset: true }),
  })
  .strict()
  .superRefine((entry, context) => {
    if (entry.points > entry.maxPoints) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["points"],
        message: "Los puntos no pueden superar maxPoints.",
      });
    }
    const expectedRankingScore = Math.min(
      100,
      Math.max(0, Math.round((entry.points / entry.maxPoints) * 100)),
    );
    if (entry.rankingScore !== expectedRankingScore) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rankingScore"],
        message: "rankingScore debe corresponder al porcentaje normalizado.",
      });
    }
  });

export const LeaderboardSchema = z
  .object({
    scope: z.literal("global"),
    entries: z.array(LeaderboardEntrySchema).max(LEADERBOARD_LIMIT),
    limit: z.literal(LEADERBOARD_LIMIT),
  })
  .strict()
  .superRefine((leaderboard, context) => {
    if (leaderboard.entries.length > leaderboard.limit) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["entries"],
        message: "El ranking no puede superar su límite declarado.",
      });
    }
  });

export const ArcadePublicErrorCodeSchema = z.enum([
  "INVALID_GAME",
  "INVALID_ALIAS",
  "SESSION_NOT_FOUND",
  "SESSION_INVALID",
  "GAME_MISMATCH",
  "ITEM_NOT_FOUND",
  "ITEM_NOT_IN_SESSION",
  "INVALID_ACTION",
  "ANSWER_ALREADY_ACCEPTED",
  "SESSION_EXPIRED",
  "RESULT_NOT_AVAILABLE",
  "RESULT_ACCESS_EXPIRED",
  "LEADERBOARD_UNAVAILABLE",
  "LEADERBOARD_EMPTY",
  "CONFLICT",
  "CONTENT_UNAVAILABLE",
  "INTERNAL_ERROR",
]);

export const PublicErrorSchema = z
  .object({
    code: ArcadePublicErrorCodeSchema,
    message: ShortTextSchema,
    retryable: z.boolean(),
  })
  .strict();

export const GetGameStateCommandSchema = z
  .object({
    sessionId: IdentifierSchema,
    gameCode: GameCodeSchema.optional(),
  })
  .strict();

export const GetGameResultCommandSchema = z
  .object({
    sessionId: IdentifierSchema,
  })
  .strict();
