/**
 * Compatibilidad temporal para el corte single-choice anterior.
 *
 * El contrato Arcade vive en domain.ts. Estos tipos se mantienen aislados
 * mientras T021-T024 reemplazan las rutas y consumidores heredados.
 */
import { z } from "zod";

const countGraphemes = (value: string): number =>
  Array.from(
    new Intl.Segmenter("es", { granularity: "grapheme" }).segment(value),
  ).length;

const ALIAS_ALLOWED_CHARACTERS = /^[\p{L}\p{M}\p{N} _-]+$/u;

export const ALIAS_VALIDATION_MESSAGES = {
  required: "Escribe un alias para comenzar.",
  too_short: "El alias debe tener al menos 3 caracteres visibles.",
  too_long: "El alias debe tener como máximo 20 caracteres visibles.",
  invalid_characters:
    "Usa solo letras, números, espacios internos, guiones y guiones bajos.",
} as const;

export const BLOCKED_ALIAS_MESSAGE = "Ese alias no está permitido. Elige otro.";

export const ValidatedAliasSchema = z
  .string()
  .superRefine((value, context) => {
    if (value !== value.trim() || value !== value.normalize("NFC")) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El alias debe estar en su representación canónica.",
      });
      return;
    }

    const visibleLength = countGraphemes(value);
    if (visibleLength === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: ALIAS_VALIDATION_MESSAGES.required,
        params: { aliasIssue: "required" },
      });
      return;
    }
    if (visibleLength < 3) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: ALIAS_VALIDATION_MESSAGES.too_short,
        params: { aliasIssue: "too_short" },
      });
      return;
    }
    if (visibleLength > 20) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: ALIAS_VALIDATION_MESSAGES.too_long,
        params: { aliasIssue: "too_long" },
      });
      return;
    }
    if (!ALIAS_ALLOWED_CHARACTERS.test(value)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: ALIAS_VALIDATION_MESSAGES.invalid_characters,
        params: { aliasIssue: "invalid_characters" },
      });
    }
  })
  .brand<"ValidatedAlias">();

export type ValidatedAlias = z.infer<typeof ValidatedAliasSchema>;

export const createAliasSubmissionSchema = (
  blockedAliases: ReadonlySet<string>,
) => {
  const normalizedBlocklist = new Set(
    Array.from(blockedAliases, (blockedAlias) =>
      blockedAlias.trim().normalize("NFC").toLocaleLowerCase("es"),
    ),
  );

  return z
    .object({
      alias: z
        .string()
        .transform((value) => value.trim().normalize("NFC"))
        .pipe(ValidatedAliasSchema)
        .superRefine((value, context) => {
          if (normalizedBlocklist.has(value.toLocaleLowerCase("es"))) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: BLOCKED_ALIAS_MESSAGE,
              params: { contractCode: "BLOCKED_ALIAS" },
            });
          }
        }),
    })
    .strict();
};

export type AliasSubmission = z.infer<
  ReturnType<typeof createAliasSubmissionSchema>
>;

export const StartGameInputSchema = z
  .object({ alias: z.string() })
  .strict();
export type StartGameInput = z.infer<typeof StartGameInputSchema>;

export const StartGameResultSchema = z
  .object({ nextPath: z.literal("/play") })
  .strict();
export type StartGameResult = z.infer<typeof StartGameResultSchema>;

export const QuestionRefSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{22}$/)
  .brand<"QuestionRef">();
export type QuestionRef = z.infer<typeof QuestionRefSchema>;

export const OptionRefSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{22}$/)
  .brand<"OptionRef">();
export type OptionRef = z.infer<typeof OptionRefSchema>;

export const SubmitAnswerInputSchema = z
  .object({
    questionRef: QuestionRefSchema,
    optionRef: z.union([OptionRefSchema, z.literal("")]).optional(),
  })
  .strict();
export type SubmitAnswerInput = z.infer<typeof SubmitAnswerInputSchema>;

export const MechanicTypeSchema = z.literal("single_choice");
export type MechanicType = z.infer<typeof MechanicTypeSchema>;

export const ROUND_SIZE_CONTRACT = {
  minimum: 1,
  maximum: 10,
  production: 5,
} as const;

export const RoundSizeSchema = z
  .number()
  .int()
  .min(ROUND_SIZE_CONTRACT.minimum)
  .max(ROUND_SIZE_CONTRACT.maximum)
  .brand<"RoundSize">();
export type RoundSize = z.infer<typeof RoundSizeSchema>;

export const PublicOptionSchema = z
  .object({
    ref: OptionRefSchema,
    label: z.string().min(1),
    position: z.number().int().min(1).max(4),
  })
  .strict();
export type PublicOption = z.infer<typeof PublicOptionSchema>;

export const PublicQuestionImageSchema = z
  .object({
    kind: z.literal("image"),
    src: z.string().regex(/^\/images\/questions\/[A-Za-z0-9\/_-]+\.(avif|webp|jpe?g|png)$/i),
    alt: z.string().min(1),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  })
  .strict();
export type PublicQuestionImage = z.infer<typeof PublicQuestionImageSchema>;

export const PublicQuestionSchema = z
  .object({
    ref: QuestionRefSchema,
    mechanic: MechanicTypeSchema,
    prompt: z.string().min(1),
    image: PublicQuestionImageSchema.nullable(),
    options: z.array(PublicOptionSchema).min(2).max(4),
  })
  .strict()
  .superRefine((question, context) => {
    const optionRefs = new Set(question.options.map((option) => option.ref));
    const positions = new Set(question.options.map((option) => option.position));
    if (optionRefs.size !== question.options.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "Las referencias públicas de opción deben ser únicas.",
      });
    }
    if (positions.size !== question.options.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "Las posiciones de opción deben ser únicas.",
      });
    }
  });
export type PublicQuestion = z.infer<typeof PublicQuestionSchema>;

export const RoundProgressSchema = z
  .object({
    currentQuestion: z.number().int().min(ROUND_SIZE_CONTRACT.minimum).max(ROUND_SIZE_CONTRACT.maximum),
    totalQuestions: RoundSizeSchema,
    answeredQuestions: z.number().int().nonnegative().max(ROUND_SIZE_CONTRACT.maximum),
  })
  .strict()
  .superRefine((progress, context) => {
    if (progress.currentQuestion > progress.totalQuestions) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentQuestion"],
        message: "La posición actual no puede superar el total.",
      });
    }
    if (progress.answeredQuestions > progress.totalQuestions) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answeredQuestions"],
        message: "Las respuestas aceptadas no pueden superar el total.",
      });
    }
  });
export type RoundProgress = z.infer<typeof RoundProgressSchema>;

export const EducationalFeedbackSchema = z
  .object({
    explanation: z.string().min(1),
    signals: z.array(z.string().min(1)).min(1),
    recommendation: z.string().min(1),
  })
  .strict();
export type EducationalFeedback = z.infer<typeof EducationalFeedbackSchema>;

export const SCORING_RULE_CONTRACT = {
  version: "single-choice-100-v1",
  pointsPerCorrectAnswer: 100,
  pointsPerIncorrectAnswer: 0,
  speedBonus: false,
} as const;

const AcceptedAnswerBase = {
  questionRef: QuestionRefSchema,
  selectedOptionRef: OptionRefSchema,
  feedback: EducationalFeedbackSchema,
  progress: RoundProgressSchema,
};

export const CorrectAnswerResultSchema = z
  .object({
    ...AcceptedAnswerBase,
    outcome: z.literal("correct"),
    pointsAwarded: z.literal(SCORING_RULE_CONTRACT.pointsPerCorrectAnswer),
  })
  .strict();

export const IncorrectAnswerResultSchema = z
  .object({
    ...AcceptedAnswerBase,
    outcome: z.literal("incorrect"),
    pointsAwarded: z.literal(SCORING_RULE_CONTRACT.pointsPerIncorrectAnswer),
    correctOptionRef: OptionRefSchema,
  })
  .strict();

export const AnswerResultSchema = z.discriminatedUnion("outcome", [
  CorrectAnswerResultSchema,
  IncorrectAnswerResultSchema,
]);
export type AnswerResult = z.infer<typeof AnswerResultSchema>;

export const AppliedScoringRuleSchema = z
  .object({
    version: z.literal(SCORING_RULE_CONTRACT.version),
    pointsPerCorrectAnswer: z.literal(SCORING_RULE_CONTRACT.pointsPerCorrectAnswer),
    pointsPerIncorrectAnswer: z.literal(SCORING_RULE_CONTRACT.pointsPerIncorrectAnswer),
    speedBonus: z.literal(SCORING_RULE_CONTRACT.speedBonus),
  })
  .strict();
export type AppliedScoringRule = z.infer<typeof AppliedScoringRuleSchema>;

export const RoundScoreSchema = z
  .number()
  .int()
  .nonnegative()
  .max(ROUND_SIZE_CONTRACT.maximum * SCORING_RULE_CONTRACT.pointsPerCorrectAnswer)
  .multipleOf(SCORING_RULE_CONTRACT.pointsPerCorrectAnswer);
export type RoundScore = z.infer<typeof RoundScoreSchema>;

export const MVP_EDUCATIONAL_CLOSING_MESSAGE =
  "Antes de compartir, verifica la fuente, la evidencia y el contexto.";

export const FinalResultSchema = z
  .object({
    alias: ValidatedAliasSchema,
    score: RoundScoreSchema,
    correctAnswers: z.number().int().nonnegative().max(ROUND_SIZE_CONTRACT.maximum),
    totalQuestions: RoundSizeSchema,
    maxScore: RoundScoreSchema,
    scoringRule: AppliedScoringRuleSchema,
    educationalClosingMessage: z.literal(MVP_EDUCATIONAL_CLOSING_MESSAGE),
  })
  .strict()
  .superRefine((result, context) => {
    if (result.correctAnswers > result.totalQuestions) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["correctAnswers"],
        message: "Los aciertos no pueden superar el total.",
      });
    }
    if (result.score !== result.correctAnswers * SCORING_RULE_CONTRACT.pointsPerCorrectAnswer) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["score"],
        message: "La puntuación no coincide con la regla aplicada.",
      });
    }
    if (result.maxScore !== result.totalQuestions * SCORING_RULE_CONTRACT.pointsPerCorrectAnswer) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxScore"],
        message: "La puntuación máxima no coincide con el total.",
      });
    }
  });
export type FinalResult = z.infer<typeof FinalResultSchema>;

export const LegacyLeaderboardEntrySchema = z
  .object({
    position: z.number().int().positive(),
    alias: ValidatedAliasSchema,
    score: RoundScoreSchema,
    isCurrentPlayer: z.boolean(),
  })
  .strict();
export type LegacyLeaderboardEntry = z.infer<typeof LegacyLeaderboardEntrySchema>;

export const LeaderboardSnapshotSchema = z
  .object({
    entries: z.array(LegacyLeaderboardEntrySchema).max(10),
    currentPlayerEntry: LegacyLeaderboardEntrySchema.nullable(),
  })
  .strict();
export type LeaderboardSnapshot = z.infer<typeof LeaderboardSnapshotSchema>;

export const QuestionGameStateSchema = z
  .object({
    view: z.literal("question"),
    sessionStatus: z.enum(["started", "in_progress"]),
    alias: ValidatedAliasSchema,
    questionStatus: z.literal("pending"),
    progress: RoundProgressSchema,
    question: PublicQuestionSchema,
  })
  .strict();
export type QuestionGameState = z.infer<typeof QuestionGameStateSchema>;

export const FeedbackGameStateSchema = z
  .object({
    view: z.literal("feedback"),
    sessionStatus: z.literal("in_progress"),
    alias: ValidatedAliasSchema,
    questionStatus: z.literal("answered"),
    progress: RoundProgressSchema,
    question: PublicQuestionSchema,
    answer: AnswerResultSchema,
    nextAction: z.enum(["advance", "finish"]),
  })
  .strict();
export type FeedbackGameState = z.infer<typeof FeedbackGameStateSchema>;

export const FinishedGameStateSchema = z
  .object({
    view: z.literal("finished"),
    sessionStatus: z.literal("finished"),
    result: FinalResultSchema,
  })
  .strict();
export type FinishedGameState = z.infer<typeof FinishedGameStateSchema>;

export const GameStateSchema = z.union([
  QuestionGameStateSchema,
  FeedbackGameStateSchema,
  FinishedGameStateSchema,
]);
export type LegacyGameState = z.infer<typeof GameStateSchema>;

export const AliasValidationIssueSchema = z.enum([
  "required",
  "too_short",
  "too_long",
  "invalid_characters",
]);
export type AliasValidationIssue = z.infer<typeof AliasValidationIssueSchema>;

export const GameErrorCodeSchema = z.enum([
  "INVALID_ALIAS",
  "BLOCKED_ALIAS",
  "SESSION_NOT_FOUND",
  "SESSION_FINISHED",
  "SESSION_INVALID",
  "QUESTIONS_UNAVAILABLE",
  "QUESTION_NOT_ASSIGNED",
  "QUESTION_ALREADY_ANSWERED",
  "OPTION_NOT_SELECTED",
  "OPTION_NOT_ALLOWED",
  "ANSWER_SAVE_FAILED",
  "GAME_START_FAILED",
  "ADVANCE_NOT_ALLOWED",
  "GAME_NOT_COMPLETE",
  "GAME_FINISH_FAILED",
  "RESULT_NOT_AVAILABLE",
  "RESULT_ACCESS_EXPIRED",
  "RANKING_UNAVAILABLE",
  "UNEXPECTED_ERROR",
]);
export type GameErrorCode = z.infer<typeof GameErrorCodeSchema>;

export const GameErrorSchema = z.union([
  z.object({
    code: z.literal("INVALID_ALIAS"),
    message: z.string().min(1),
    recoverable: z.literal(true),
    field: z.literal("alias"),
    issue: AliasValidationIssueSchema,
  }).strict(),
  z.object({
    code: z.literal("BLOCKED_ALIAS"),
    message: z.string().min(1),
    recoverable: z.literal(true),
    field: z.literal("alias"),
  }).strict(),
  z.object({
    code: z.literal("OPTION_NOT_SELECTED"),
    message: z.string().min(1),
    recoverable: z.literal(true),
    field: z.literal("option"),
  }).strict(),
  z.object({
    code: GameErrorCodeSchema.exclude([
      "INVALID_ALIAS",
      "BLOCKED_ALIAS",
      "OPTION_NOT_SELECTED",
      "SESSION_NOT_FOUND",
      "SESSION_FINISHED",
      "SESSION_INVALID",
      "RESULT_ACCESS_EXPIRED",
    ]),
    message: z.string().min(1),
    recoverable: z.literal(true),
  }).strict(),
  z.object({
    code: z.enum([
      "SESSION_NOT_FOUND",
      "SESSION_FINISHED",
      "SESSION_INVALID",
      "RESULT_ACCESS_EXPIRED",
    ]),
    message: z.string().min(1),
    recoverable: z.literal(false),
  }).strict(),
]);
export type GameError = z.infer<typeof GameErrorSchema>;

export const ErrorEnvelopeSchema = z
  .object({ ok: z.literal(false), error: GameErrorSchema })
  .strict();
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

export type OperationResult<T> =
  | Readonly<{ ok: true; data: T }>
  | ErrorEnvelope;
