/**
 * Contrato documental del dominio Arcade MIL.
 *
 * Las fórmulas aprobadas viven en scoring-proposal.md y se materializan aquí
 * como datos de resultado; el cliente nunca puede enviarlas como autoridad.
 */

export const GAME_CODES = [
  'real-o-ia',
  'grupo',
  'clickbait-swipe',
  'radar-de-fuentes',
  'feed-60',
  'mente-maestra',
] as const;

export type GameCode = (typeof GAME_CODES)[number];

export const MECHANICS = [
  'image_verdict',
  'group_decision',
  'headline_classification',
  'source_classification',
  'timed_feed',
  'guided_autopsy',
] as const;

export type Mechanic = (typeof MECHANICS)[number];

/** Mapeo estable gameCode → mechanic; una sola mecánica por juego. */
export const GAME_CODE_TO_MECHANIC = {
  'real-o-ia': 'image_verdict',
  grupo: 'group_decision',
  'clickbait-swipe': 'headline_classification',
  'radar-de-fuentes': 'source_classification',
  'feed-60': 'timed_feed',
  'mente-maestra': 'guided_autopsy',
} as const satisfies Record<GameCode, Mechanic>;

export const LEADERBOARD_LIMIT = 10;

/** Pasos del método SIFT que un juego puede practicar de forma explícita. */
export const SIFT_STEPS = [
  'stop',
  'investigate',
  'find',
  'trace',
] as const;

export type SiftStep = (typeof SIFT_STEPS)[number];

/** Campos de autoridad que el cliente no puede enviar ni imponer. */
export const CLIENT_FORBIDDEN_AUTHORITY_FIELDS = [
  'score',
  'points',
  'maxPoints',
  'bonusPoints',
  'penaltyPoints',
  'rankingScore',
  'correct',
  'errors',
  'solution',
  'solutionPrivate',
  'nextItem',
  'completed',
  'status',
  'remainingSeconds',
  'leaderboardEligible',
] as const;

export type ClientForbiddenAuthorityField =
  (typeof CLIENT_FORBIDDEN_AUTHORITY_FIELDS)[number];

export type SessionStatus =
  | 'intro'
  | 'active'
  | 'processing'
  | 'feedback'
  | 'expired'
  | 'finished'
  | 'invalid';

export interface GameCatalogEntry {
  gameCode: GameCode;
  mechanic: Mechanic;
  name: string;
  objective: string;
  route: string;
  contentVersion: string;
  available: boolean;
  /** 1–2 pasos SIFT que el juego enseña de forma prioritaria. */
  siftFocus: readonly SiftStep[];
}

export interface PublicMedia {
  kind: 'image' | 'illustration' | 'audio' | 'none';
  src: string | null;
  alt: string | null;
  decorative: boolean;
  width: number | null;
  height: number | null;
  fallbackText: string | null;
  /** Variantes responsive opcionales (anchos en px → ruta local). */
  srcSet?: Readonly<Partial<Record<'480' | '768' | '1280', string>>> | null;
}

export interface PublicFeedback {
  status: 'correct' | 'incorrect' | 'instructive' | 'expired';
  explanation: string;
  signals: string[];
  recommendation: string;
  revealedAnswer: string | null;
}

/** Mensaje público de El Grupo: orden, remitente y marca temporal visible. */
export interface GroupChatMessage {
  sender: string;
  text: string;
  timeLabel: string | null;
  /** Adjunto opcional (foto o fotograma de clip) cuando la escena lo requiere. */
  media?: PublicMedia;
  /** Cómo presentar el adjunto en el chat; por defecto foto si hay media. */
  attachmentPresentation?: 'photo' | 'video_clip';
}

export type PublicItem =
  | {
      gameCode: 'real-o-ia';
      mechanic: 'image_verdict';
      itemId: string;
      prompt: string;
      context: string;
      media: PublicMedia;
      choices: readonly ['real', 'ai'];
    }
  | {
      gameCode: 'grupo';
      mechanic: 'group_decision';
      itemId: string;
      prompt: string;
      messages: readonly GroupChatMessage[];
      actions: readonly ('forward' | 'verify' | 'pause')[];
    }
  | {
      gameCode: 'clickbait-swipe';
      mechanic: 'headline_classification';
      itemId: string;
      prompt: string;
      headline: string;
      sourceLabel: string;
      actions: readonly ['journalism', 'clickbait'];
      keyboardEquivalent: true;
    }
  | {
      gameCode: 'radar-de-fuentes';
      mechanic: 'source_classification';
      itemId: string;
      prompt: string;
      sourceName: string;
      urlLabel: string;
      description: string;
      categories: readonly ['reliable', 'doubtful', 'fraudulent'];
    }
  | {
      gameCode: 'feed-60';
      mechanic: 'timed_feed';
      itemId: string;
      prompt: string;
      post: string;
      sourceLabel: string;
      media?: PublicMedia;
      actions: readonly ['verify', 'share', 'discard'];
      remainingSeconds: number;
      verificationAvailable: boolean;
    }
  | {
      gameCode: 'mente-maestra';
      mechanic: 'guided_autopsy';
      itemId: string;
      step:
        | 'objective'
        | 'emotion'
        | 'headline'
        | 'evidence';
      prompt: string;
      options: readonly {
        optionId: string;
        label: string;
        description: string;
      }[];
    };

export type GameAction =
  | {
      gameCode: 'real-o-ia';
      itemId: string;
      input: { kind: 'verdict'; value: 'real' | 'ai' };
    }
  | {
      gameCode: 'grupo';
      itemId: string;
      input: { kind: 'group_action'; value: 'forward' | 'verify' | 'pause' };
    }
  | {
      gameCode: 'clickbait-swipe';
      itemId: string;
      input: {
        kind: 'headline_classification';
        value: 'journalism' | 'clickbait';
        source: 'swipe' | 'button' | 'keyboard';
      };
    }
  | {
      gameCode: 'radar-de-fuentes';
      itemId: string;
      input: {
        kind: 'source_classification';
        value: 'reliable' | 'doubtful' | 'fraudulent';
      };
    }
  | {
      gameCode: 'feed-60';
      itemId: string;
      input: { kind: 'feed_action'; value: 'verify' | 'share' | 'discard' };
    }
  | {
      gameCode: 'mente-maestra';
      itemId: string;
      input: {
        kind: 'autopsy_choice';
        step: 'objective' | 'emotion' | 'headline' | 'evidence';
        optionId: string;
      };
    };

export interface GameScore {
  points: number;
  maxPoints: number;
  correct: number | null;
  errors: number;
  bonusPoints: number;
  penaltyPoints: number;
  timeLimitSeconds: number | null;
  timeUsedSeconds: number | null;
}

export interface GameState {
  sessionId: string;
  gameCode: GameCode;
  mechanic: Mechanic;
  status: SessionStatus;
  alias: string;
  position: number;
  total: number;
  item: PublicItem | null;
  feedback: PublicFeedback | null;
  /** Score parcial solo cuando el servidor lo autoriza tras una aceptación. */
  provisionalScore: GameScore | null;
  nextAction: 'submit' | 'advance' | 'result' | 'retry' | 'arcade';
}

/** Digest educativo por publicación en Feed 60” (detalle diferido al resultado). */
export interface FeedItemDigest {
  itemId: string;
  prompt: string;
  decisionCorrect: boolean;
  keySignal: string;
  explanation: string;
  recommendation: string;
  revealedAnswer: string | null;
}

export interface GameResult {
  sessionId: string;
  gameCode: GameCode;
  alias: string;
  status: 'finished' | 'expired';
  answered: number;
  total: number;
  learningSummary: string;
  score: GameScore;
  /**
   * Alcance simulado de Mente Maestra (65–95). Null en el resto de juegos.
   * Nunca forma parte de GameScore ni del ranking.
   */
  simulatedReach: number | null;
  /**
   * Revisión por publicación en Feed 60”. Null en el resto de juegos.
   */
  itemDigests: readonly FeedItemDigest[] | null;
}

export interface LeaderboardEntry {
  rank: number;
  gameCode: GameCode;
  alias: string;
  points: number;
  maxPoints: number;
  rankingScore: number;
  completedAt: string;
}

export interface Leaderboard {
  scope: 'global';
  entries: readonly LeaderboardEntry[];
  limit: typeof LEADERBOARD_LIMIT;
}

/** Entradas de operaciones arcade descritas en game-api.md. */
export interface StartGameCommand {
  alias: string;
  gameCode: GameCode;
  /**
   * Partida sin alias de ranking. El servidor asigna una etiqueta de invitado
   * y marca la sesión como no elegible para el ranking.
   */
  guest?: boolean;
}

export interface AdvanceGameCommand {
  sessionId: string;
  itemId: string;
}

export type SubmitGameActionCommand = GameAction & {
  sessionId: string;
};

export interface PublicError {
  code:
    | 'INVALID_GAME'
    | 'INVALID_ALIAS'
    | 'SESSION_NOT_FOUND'
    | 'SESSION_INVALID'
    | 'GAME_MISMATCH'
    | 'ITEM_NOT_FOUND'
    | 'ITEM_NOT_IN_SESSION'
    | 'INVALID_ACTION'
    | 'ANSWER_ALREADY_ACCEPTED'
    | 'SESSION_EXPIRED'
    | 'RESULT_NOT_AVAILABLE'
    | 'RESULT_ACCESS_EXPIRED'
    | 'LEADERBOARD_UNAVAILABLE'
    | 'LEADERBOARD_EMPTY'
    | 'CONFLICT'
    | 'CONTENT_UNAVAILABLE'
    | 'INTERNAL_ERROR';
  message: string;
  retryable: boolean;
}

export type ArcadePublicErrorCode = PublicError['code'];

export type ArcadeOperationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: PublicError };

// Transitional exports for the previous single-choice slice. New Arcade code
// must use the contracts above; these exports disappear with T024.
export {
  ALIAS_VALIDATION_MESSAGES,
  BLOCKED_ALIAS_MESSAGE,
  AnswerResultSchema,
  AppliedScoringRuleSchema,
  AliasValidationIssueSchema,
  CorrectAnswerResultSchema,
  ErrorEnvelopeSchema,
  FeedbackGameStateSchema,
  FinalResultSchema,
  FinishedGameStateSchema,
  GameErrorCodeSchema,
  GameErrorSchema,
  GameStateSchema,
  LegacyLeaderboardEntrySchema,
  LeaderboardSnapshotSchema,
  MVP_EDUCATIONAL_CLOSING_MESSAGE,
  MechanicTypeSchema,
  OptionRefSchema,
  PublicOptionSchema,
  PublicQuestionImageSchema,
  PublicQuestionSchema,
  QuestionGameStateSchema,
  QuestionRefSchema,
  RoundProgressSchema,
  RoundScoreSchema,
  RoundSizeSchema,
  SCORING_RULE_CONTRACT,
  ROUND_SIZE_CONTRACT,
  StartGameInputSchema,
  StartGameResultSchema,
  SubmitAnswerInputSchema,
  ValidatedAliasSchema,
  createAliasSubmissionSchema,
} from './legacy-domain';

export type {
  AliasSubmission,
  AliasValidationIssue,
  AnswerResult,
  AppliedScoringRule,
  EducationalFeedback,
  ErrorEnvelope,
  FeedbackGameState,
  FinalResult,
  FinishedGameState,
  GameError,
  GameErrorCode,
  LegacyGameState,
  LegacyLeaderboardEntry,
  MechanicType,
  OptionRef,
  PublicOption,
  PublicQuestion,
  PublicQuestionImage,
  QuestionGameState,
  QuestionRef,
  RoundProgress,
  RoundScore,
  RoundSize,
  StartGameInput,
  StartGameResult,
  SubmitAnswerInput,
  ValidatedAlias,
  LeaderboardSnapshot,
  OperationResult,
} from './legacy-domain';
