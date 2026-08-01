/**
 * Contrato documental del dominio Arcade MIL.
 *
 * Las fórmulas aprobadas viven en scoring-proposal.md y se materializan aquí
 * como datos de resultado; el cliente nunca puede enviarlas como autoridad.
 */

export type GameCode =
  | 'real-o-ia'
  | 'grupo'
  | 'clickbait-swipe'
  | 'radar-de-fuentes'
  | 'feed-60'
  | 'mente-maestra';

export type Mechanic =
  | 'image_verdict'
  | 'group_decision'
  | 'headline_classification'
  | 'source_classification'
  | 'timed_feed'
  | 'guided_autopsy';

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
  available: boolean;
}

export interface PublicMedia {
  kind: 'image' | 'illustration' | 'audio' | 'none';
  src: string | null;
  alt: string | null;
  decorative: boolean;
  width: number | null;
  height: number | null;
  fallbackText: string | null;
}

export interface PublicFeedback {
  status: 'correct' | 'incorrect' | 'instructive' | 'expired';
  explanation: string;
  signals: string[];
  recommendation: string;
  revealedAnswer: string | null;
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
      messages: readonly string[];
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
  nextAction: 'submit' | 'advance' | 'result' | 'retry' | 'arcade';
}

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

export interface GameResult {
  sessionId: string;
  gameCode: GameCode;
  alias: string;
  status: 'finished' | 'expired';
  answered: number;
  total: number;
  learningSummary: string;
  score: GameScore;
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
  limit: 10;
}

export interface PublicError {
  code:
    | 'INVALID_GAME'
    | 'INVALID_ALIAS'
    | 'SESSION_NOT_FOUND'
    | 'SESSION_INVALID'
    | 'ITEM_NOT_FOUND'
    | 'ITEM_NOT_IN_SESSION'
    | 'INVALID_ACTION'
    | 'ANSWER_ALREADY_ACCEPTED'
    | 'SESSION_EXPIRED'
    | 'RESULT_NOT_AVAILABLE'
    | 'LEADERBOARD_UNAVAILABLE'
    | 'LEADERBOARD_EMPTY'
    | 'INTERNAL_ERROR';
  message: string;
  retryable: boolean;
}
