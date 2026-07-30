/**
 * Contratos públicos del corte vertical de Antídoto.
 *
 * Este archivo es la fuente contractual TypeScript/Zod; no implementa persistencia
 * ni autoriza operaciones. Todo dato que cruce formulario, cookie, Server Action,
 * Server Component o Supabase debe validarse en tiempo de ejecución.
 *
 * Referencias principales: FR-004–FR-050, FR-060–FR-063; BR-001–BR-013.
 */
import { z } from "zod";

const countGraphemes = (value: string): number =>
  Array.from(
    new Intl.Segmenter("es", { granularity: "grapheme" }).segment(value),
  ).length;

// `\p{M}` permite las marcas combinantes que forman letras visibles en diversos
// sistemas de escritura después de normalizar a NFC.
const ALIAS_ALLOWED_CHARACTERS = /^[\p{L}\p{M}\p{N} _-]+$/u;

/**
 * Mensajes canónicos de validación del alias. `errors.md` documenta estos mismos
 * valores; la frontera de aplicación mapea `aliasIssue` o `BLOCKED_ALIAS` a estas
 * constantes y nunca expone el texto técnico de una excepción.
 */
export const ALIAS_VALIDATION_MESSAGES = {
  required: "Escribe un alias para comenzar.",
  too_short: "El alias debe tener al menos 3 caracteres visibles.",
  too_long: "El alias debe tener como máximo 20 caracteres visibles.",
  invalid_characters:
    "Usa solo letras, números, espacios internos, guiones y guiones bajos.",
} as const;

export const BLOCKED_ALIAS_MESSAGE =
  "Ese alias no está permitido. Elige otro.";

/**
 * Valida un alias que ya fue normalizado. La moderación se aplica al recibir el
 * formulario mediante `createAliasSubmissionSchema`.
 */
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

/**
 * Contrato del formulario de inicio. Normaliza espacios externos y Unicode NFC
 * antes de contar grafemas y compara el alias completo, sin distinguir
 * mayúsculas, contra una lista ya controlada por el equipo.
 *
 * La lista bloqueada no se expone al navegador ni forma parte del error.
 */
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

/** Entrada externa mínima de `startGame`; todavía no es un alias confiable. */
export const StartGameInputSchema = z
  .object({
    alias: z.string(),
  })
  .strict();
export type StartGameInput = z.infer<typeof StartGameInputSchema>;

/** Confirmación mínima para que el cliente navegue después de crear la cookie. */
export const StartGameResultSchema = z
  .object({
    nextPath: z.literal("/play"),
  })
  .strict();
export type StartGameResult = z.infer<typeof StartGameResultSchema>;

/**
 * Referencias públicas opacas y acotadas a la experiencia. No son claves primarias,
 * UUID de tablas, hash ni token de sesión. El servidor debe resolverlas dentro de
 * la sesión obtenida de la cookie y nunca confiar en ellas como autorización.
 */
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

/**
 * Entrada externa de `submitAnswer`. La ausencia o cadena vacía se conserva en el
 * contrato para traducirla a `OPTION_NOT_SELECTED`; cualquier otra referencia debe
 * validar su forma antes de comprobar pertenencia en servidor.
 */
export const SubmitAnswerInputSchema = z
  .object({
    questionRef: QuestionRefSchema,
    optionRef: z.union([OptionRefSchema, z.literal("")]).optional(),
  })
  .strict();
export type SubmitAnswerInput = z.infer<typeof SubmitAnswerInputSchema>;

export const MechanicTypeSchema = z.literal("single_choice");
export type MechanicType = z.infer<typeof MechanicTypeSchema>;

/**
 * Fuente contractual única del tamaño de ronda. TypeScript y Zod consumen este
 * objeto directamente; SQL y las firmas RPC deben aplicar el mismo intervalo, y
 * la configuración de Production debe resolver exactamente a `production`.
 */
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

export const GameSessionStatusSchema = z.enum([
  "started",
  "in_progress",
  "finished",
  "invalidated",
]);
export type GameSessionStatus = z.infer<typeof GameSessionStatusSchema>;

export const SessionQuestionStatusSchema = z.enum(["pending", "answered"]);
export type SessionQuestionStatus = z.infer<
  typeof SessionQuestionStatusSchema
>;

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
    src: z.string().regex(/^\/images\/questions\/[A-Za-z0-9/_-]+\.(avif|webp|jpe?g|png)$/i),
    alt: z.string().min(1),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  })
  .strict();
export type PublicQuestionImage = z.infer<
  typeof PublicQuestionImageSchema
>;

/**
 * Proyección previa a responder. Por construcción no admite `correctOptionRef`,
 * `isCorrect`, puntos, explicación, señales, recomendación ni reglas privadas.
 */
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
    currentQuestion: z
      .number()
      .int()
      .min(ROUND_SIZE_CONTRACT.minimum)
      .max(ROUND_SIZE_CONTRACT.maximum),
    totalQuestions: RoundSizeSchema,
    answeredQuestions: z
      .number()
      .int()
      .nonnegative()
      .max(ROUND_SIZE_CONTRACT.maximum),
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
export type EducationalFeedback = z.infer<
  typeof EducationalFeedbackSchema
>;

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

/**
 * Solo se emite después de que el servidor aceptó o recuperó la respuesta canónica.
 */
export const AnswerResultSchema = z.discriminatedUnion("outcome", [
  CorrectAnswerResultSchema,
  IncorrectAnswerResultSchema,
]);
export type AnswerResult = z.infer<typeof AnswerResultSchema>;

export const AppliedScoringRuleSchema = z
  .object({
    version: z.literal(SCORING_RULE_CONTRACT.version),
    pointsPerCorrectAnswer: z.literal(
      SCORING_RULE_CONTRACT.pointsPerCorrectAnswer,
    ),
    pointsPerIncorrectAnswer: z.literal(
      SCORING_RULE_CONTRACT.pointsPerIncorrectAnswer,
    ),
    speedBonus: z.literal(SCORING_RULE_CONTRACT.speedBonus),
  })
  .strict();
export type AppliedScoringRule = z.infer<
  typeof AppliedScoringRuleSchema
>;

/**
 * Envolvente pública derivada del rango contractual, no un máximo independiente del
 * ranking. `FinalResultSchema` comprueba el máximo exacto contra `totalQuestions`; el
 * ranking no expone ese campo por alcance y PostgreSQL garantiza cada puntuación
 * contra el `RoundSize` persistido de su sesión.
 */
export const RoundScoreSchema = z
  .number()
  .int()
  .nonnegative()
  .max(
    ROUND_SIZE_CONTRACT.maximum *
      SCORING_RULE_CONTRACT.pointsPerCorrectAnswer,
  )
  .multipleOf(SCORING_RULE_CONTRACT.pointsPerCorrectAnswer);
export type RoundScore = z.infer<typeof RoundScoreSchema>;

export const MVP_EDUCATIONAL_CLOSING_MESSAGE =
  "Antes de compartir, verifica la fuente, la evidencia y el contexto.";

export const FinalResultSchema = z
  .object({
    alias: ValidatedAliasSchema,
    score: RoundScoreSchema,
    correctAnswers: z
      .number()
      .int()
      .nonnegative()
      .max(ROUND_SIZE_CONTRACT.maximum),
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
    if (
      result.score !==
      result.correctAnswers * SCORING_RULE_CONTRACT.pointsPerCorrectAnswer
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["score"],
        message: "La puntuación no coincide con la regla aplicada.",
      });
    }
    if (
      result.maxScore !==
      result.totalQuestions * SCORING_RULE_CONTRACT.pointsPerCorrectAnswer
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxScore"],
        message: "La puntuación máxima no coincide con el total.",
      });
    }
  });
export type FinalResult = z.infer<typeof FinalResultSchema>;

export const LeaderboardEntrySchema = z
  .object({
    position: z.number().int().positive(),
    alias: ValidatedAliasSchema,
    score: RoundScoreSchema,
    isCurrentPlayer: z.boolean(),
  })
  .strict();
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

export const LeaderboardSnapshotSchema = z
  .object({
    entries: z.array(LeaderboardEntrySchema).max(10),
    currentPlayerEntry: LeaderboardEntrySchema.nullable(),
  })
  .strict()
  .superRefine((snapshot, context) => {
    const positions = snapshot.entries.map((entry) => entry.position);
    const uniquePositions = new Set(positions);
    const markedEntries = snapshot.entries.filter(
      (entry) => entry.isCurrentPlayer,
    );

    if (uniquePositions.size !== positions.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["entries"],
        message: "Las posiciones del ranking deben ser únicas.",
      });
    }

    snapshot.entries.forEach((entry, index) => {
      if (entry.position !== index + 1) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entries", index, "position"],
          message: "El top debe conservar posiciones consecutivas desde 1.",
        });
      }
      const previousEntry = snapshot.entries[index - 1];
      if (previousEntry && entry.score > previousEntry.score) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entries", index, "score"],
          message: "El ranking debe mantener puntuación descendente.",
        });
      }
    });

    if (markedEntries.length > 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["entries"],
        message: "Solo una entrada puede representar la sesión actual.",
      });
    }

    if (snapshot.currentPlayerEntry !== null) {
      if (markedEntries.length !== 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["entries"],
          message: "El resultado actual no puede aparecer dentro y fuera del top.",
        });
      }
      if (!snapshot.currentPlayerEntry.isCurrentPlayer) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["currentPlayerEntry", "isCurrentPlayer"],
          message: "El resultado separado debe pertenecer a la sesión actual.",
        });
      }
      if (uniquePositions.has(snapshot.currentPlayerEntry.position)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["currentPlayerEntry", "position"],
          message: "El resultado actual no debe duplicar una entrada del top.",
        });
      }
      if (
        snapshot.entries.length !== 10 ||
        snapshot.currentPlayerEntry.position <= 10
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["currentPlayerEntry", "position"],
          message: "El resultado separado solo existe fuera de un top diez completo.",
        });
      }
    }
  });
export type LeaderboardSnapshot = z.infer<
  typeof LeaderboardSnapshotSchema
>;

export const QuestionGameStateSchema = z
  .object({
    view: z.literal("question"),
    sessionStatus: z.enum(["started", "in_progress"]),
    alias: ValidatedAliasSchema,
    questionStatus: z.literal("pending"),
    progress: RoundProgressSchema,
    question: PublicQuestionSchema,
  })
  .strict()
  .superRefine((state, context) => {
    if (state.progress.answeredQuestions !== state.progress.currentQuestion - 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["progress", "answeredQuestions"],
        message: "Una pregunta pendiente debe seguir a las respuestas confirmadas.",
      });
    }
    if (
      state.sessionStatus === "started" &&
      (state.progress.currentQuestion !== 1 ||
        state.progress.answeredQuestions !== 0)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sessionStatus"],
        message: "Una sesión iniciada debe mostrar su primera pregunta sin respuestas.",
      });
    }
    if (
      state.sessionStatus === "in_progress" &&
      state.progress.currentQuestion === 1
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sessionStatus"],
        message: "Una pregunta pendiente en progreso debe seguir a una respuesta.",
      });
    }
  });
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
  .strict()
  .superRefine((state, context) => {
    const optionRefs = new Set(
      state.question.options.map((option) => option.ref),
    );

    if (state.answer.questionRef !== state.question.ref) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answer", "questionRef"],
        message: "La respuesta debe corresponder a la pregunta mostrada.",
      });
    }
    if (
      state.answer.progress.currentQuestion !==
        state.progress.currentQuestion ||
      state.answer.progress.totalQuestions !==
        state.progress.totalQuestions ||
      state.answer.progress.answeredQuestions !==
        state.progress.answeredQuestions
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answer", "progress"],
        message: "La respuesta y la vista deben compartir el mismo progreso.",
      });
    }
    if (!optionRefs.has(state.answer.selectedOptionRef)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answer", "selectedOptionRef"],
        message: "La selección aceptada debe pertenecer a la pregunta.",
      });
    }
    if (
      state.answer.outcome === "incorrect" &&
      (!optionRefs.has(state.answer.correctOptionRef) ||
        state.answer.correctOptionRef === state.answer.selectedOptionRef)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["answer", "correctOptionRef"],
        message: "La solución revelada debe ser otra opción de la pregunta.",
      });
    }
    if (state.progress.answeredQuestions !== state.progress.currentQuestion) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["progress", "answeredQuestions"],
        message: "La retroalimentación requiere la respuesta actual confirmada.",
      });
    }

    const expectedNextAction =
      state.progress.currentQuestion === state.progress.totalQuestions
        ? "finish"
        : "advance";
    if (state.nextAction !== expectedNextAction) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nextAction"],
        message: "La acción siguiente no coincide con el progreso.",
      });
    }
  });
export type FeedbackGameState = z.infer<typeof FeedbackGameStateSchema>;

export const FinishedGameStateSchema = z
  .object({
    view: z.literal("finished"),
    sessionStatus: z.literal("finished"),
    result: FinalResultSchema,
  })
  .strict();
export type FinishedGameState = z.infer<typeof FinishedGameStateSchema>;

/**
 * Estado recuperable discriminado. Una sesión invalidada/no encontrada se expresa
 * como error y nunca como una vista jugable.
 */
export const GameStateSchema = z.union([
  QuestionGameStateSchema,
  FeedbackGameStateSchema,
  FinishedGameStateSchema,
]);
export type GameState = z.infer<typeof GameStateSchema>;

export const AliasValidationIssueSchema = z.enum([
  "required",
  "too_short",
  "too_long",
  "invalid_characters",
]);
export type AliasValidationIssue = z.infer<
  typeof AliasValidationIssueSchema
>;

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

const RecoverableGameErrorFields = {
  message: z.string().min(1),
  recoverable: z.literal(true),
};

const NonRecoverableGameErrorFields = {
  message: z.string().min(1),
  recoverable: z.literal(false),
};

export const InvalidAliasErrorSchema = z
  .object({
    ...RecoverableGameErrorFields,
    code: z.literal("INVALID_ALIAS"),
    field: z.literal("alias"),
    issue: AliasValidationIssueSchema,
  })
  .strict();

export const BlockedAliasErrorSchema = z
  .object({
    ...RecoverableGameErrorFields,
    code: z.literal("BLOCKED_ALIAS"),
    field: z.literal("alias"),
  })
  .strict();

export const MissingOptionErrorSchema = z
  .object({
    ...RecoverableGameErrorFields,
    code: z.literal("OPTION_NOT_SELECTED"),
    field: z.literal("option"),
  })
  .strict();

const NonRecoverableErrorCodeSchema = z.enum([
  "SESSION_NOT_FOUND",
  "SESSION_FINISHED",
  "SESSION_INVALID",
  "RESULT_ACCESS_EXPIRED",
]);

const RecoverableNonFieldErrorCodeSchema = GameErrorCodeSchema.exclude([
  "INVALID_ALIAS",
  "BLOCKED_ALIAS",
  "SESSION_NOT_FOUND",
  "SESSION_FINISHED",
  "SESSION_INVALID",
  "RESULT_ACCESS_EXPIRED",
  "OPTION_NOT_SELECTED",
]);

export const RecoverableNonFieldGameErrorSchema = z
  .object({
    ...RecoverableGameErrorFields,
    code: RecoverableNonFieldErrorCodeSchema,
  })
  .strict();

export const NonRecoverableGameErrorSchema = z
  .object({
    ...NonRecoverableGameErrorFields,
    code: NonRecoverableErrorCodeSchema,
  })
  .strict();

export const GameErrorSchema = z.union([
  InvalidAliasErrorSchema,
  BlockedAliasErrorSchema,
  MissingOptionErrorSchema,
  RecoverableNonFieldGameErrorSchema,
  NonRecoverableGameErrorSchema,
]);
export type GameError = z.infer<typeof GameErrorSchema>;

export const ErrorEnvelopeSchema = z
  .object({
    ok: z.literal(false),
    error: GameErrorSchema,
  })
  .strict();
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

export type OperationResult<T> =
  | Readonly<{ ok: true; data: T }>
  | ErrorEnvelope;
