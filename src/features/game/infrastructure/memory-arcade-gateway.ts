import "server-only";

import { randomUUID } from "node:crypto";

import type {
  AdvanceGameCommand,
  GameResult,
  GameScore,
  GameState,
  GameCode,
  Leaderboard,
  PublicFeedback,
  PublicItem,
  StartGameCommand,
  SubmitGameActionCommand,
} from "@antidoto/contracts";

import { createArcadePublicError } from "../application/game-operations";
import { getArcadeContentRepository } from "../content/arcade-content";
import type { ContentRepository } from "../content/content-repository";
import {
  FEED_TIME_LIMIT_SECONDS,
  emptyTimedFeedItemState,
  isFeedClockExpired,
  markFeedClockExpired,
  remainingFeedSeconds,
} from "../domain/mechanics/timed-feed";
import {
  buildLeaderboard,
  calculateGameScore,
  type RankingCandidate,
} from "../domain/scoring";
import {
  assertSessionGameCode,
  canTransitionSession,
  createArcadeSession,
  expireSessionIfNeeded,
  isTerminalSessionStatus,
  resolveAnswerIdempotency,
  touchSessionActivity,
  transitionSession,
  type AcceptedAnswerSnapshot,
  type ArcadeSessionRecord,
} from "../domain/session";
import type { GuidedAutopsySelection } from "../domain/mechanics/guided-autopsy";
import {
  deserializeFeedClock,
  deserializeSessionRecord,
  serializeFeedClock,
  serializeSessionRecord,
  type ArcadeSessionSnapshot,
  type SerializedAnswer,
} from "./arcade-session-snapshot";
import type {
  ArcadeGameGateway,
  ArcadeGatewayResult,
  GetGameResultCommand,
  GetGameStateCommand,
} from "./game-gateway";
import {
  evaluateClickbaitSubmit,
  type ClickbaitAnswerRecord,
} from "./memory-clickbait-runtime";
import {
  createFeed60SessionState,
  evaluateFeed60Submit,
  type Feed60AnswerRecord,
  type Feed60SessionState,
} from "./memory-feed-60-runtime";
import {
  evaluateGrupoSubmit,
  type GrupoAnswerRecord,
} from "./memory-grupo-runtime";
import {
  assembleMenteMaestraSession,
  evaluateMenteMaestraSubmit,
  type MenteMaestraAnswerRecord,
} from "./memory-mente-maestra-runtime";
import {
  evaluateRadarSubmit,
  type RadarAnswerRecord,
} from "./memory-radar-runtime";
import { parseImageVerdictSolution } from "../domain/mechanics/image-verdict";
import {
  pickRealOrIaSessionItemIds,
  REAL_O_IA_SESSION_ITEM_COUNT,
} from "../domain/real-o-ia-session-pick";
import {
  evaluateRealOrIaSubmit,
  type RealOrIaAnswerRecord,
} from "./memory-real-o-ia-runtime";
import type {
  ArcadeSessionCompanion,
  AutopsySessionCompanion,
  GameStateWithCompanion,
} from "./session-companion";

type MemoryAnswer = AcceptedAnswerSnapshot & {
  grupo?: GrupoAnswerRecord;
  realOrIa?: RealOrIaAnswerRecord;
  clickbait?: ClickbaitAnswerRecord;
  radar?: RadarAnswerRecord;
  feed60?: Feed60AnswerRecord;
  menteMaestra?: MenteMaestraAnswerRecord;
};

type MechanicAnswerRecord = Partial<
  Omit<MemoryAnswer, keyof AcceptedAnswerSnapshot>
>;

type MechanicSubmitEvaluation = Readonly<{
  feedback: PublicFeedback;
  answer: MechanicAnswerRecord;
}>;

type MemorySession = {
  tokenHash: string;
  record: ArcadeSessionRecord;
  state: GameStateWithCompanion;
  result: GameResult | null;
  answers: Map<string, MemoryAnswer>;
  assignedItemIds: readonly string[];
  feed60: Feed60SessionState | null;
};

export type MemoryArcadeGatewayOptions = Readonly<{
  /** Permite probar sesiones con más de un item sin depender de Supabase. */
  itemIdsByGameCode?: Partial<Record<GameCode, readonly string[]>>;
  /** Reloj inyectable para probar expiración y carreras de tiempo. */
  now?: () => Date;
  /** Repositorio editorial; por defecto usa el pack arcade activo. */
  contentRepository?: ContentRepository;
}>;

export type MemoryArcadeGateway = ArcadeGameGateway & {
  resolveSessionId(tokenHash: string): string | null;
  getSessionExpiresAt(sessionId: string): Date | null;
  exportSession(sessionId: string): ArcadeSessionSnapshot | null;
  importSession(snapshot: ArcadeSessionSnapshot): void;
};

const GENERIC_ACCEPT_FEEDBACK: PublicFeedback = {
  status: "instructive",
  explanation: "Respuesta aceptada por el servidor.",
  signals: ["La evaluación es autoritativa."],
  recommendation: "Revisa el feedback antes de avanzar.",
  revealedAnswer: null,
};

const LEARNING_SUMMARIES: Record<
  GameCode,
  Readonly<{ finished: string; expired: string }>
> = {
  "real-o-ia": {
    finished:
      "Practicaste distinguir señales visuales de imágenes sintéticas antes de creer y compartir.",
    expired: "La partida expiró; conserva el criterio visual que practicaste.",
  },
  grupo: {
    finished:
      "Practicaste decisiones de cuidado en el chat familiar antes de amplificar rumores.",
    expired:
      "La partida expiró; conserva el cuidado que practicaste en el chat.",
  },
  "clickbait-swipe": {
    finished:
      "Separaste periodismo de clickbait leyendo las señales del titular y su fuente.",
    expired: "La partida expiró; conserva el criterio editorial que practicaste.",
  },
  "radar-de-fuentes": {
    finished:
      "Evaluaste fuentes por sus señales verificables, no por su apariencia.",
    expired: "La partida expiró; conserva el radar crítico que practicaste.",
  },
  "feed-60": {
    finished:
      "Decidiste bajo presión qué verificar, compartir o descartar en un feed real.",
    expired:
      "El tiempo se agotó; conserva el ritmo de verificación que practicaste.",
  },
  "mente-maestra": {
    finished:
      "Desarmaste paso a paso la anatomía de una fake news en una simulación educativa.",
    expired:
      "La partida expiró; conserva las técnicas de manipulación que identificaste.",
  },
};

function failure(
  code: Parameters<typeof createArcadePublicError>[0],
): ArcadeGatewayResult<never> {
  return { ok: false, error: createArcadePublicError(code) };
}

function toPublicState(
  record: ArcadeSessionRecord,
  state: GameState,
): GameState {
  return {
    ...state,
    sessionId: record.sessionId,
    gameCode: record.gameCode,
    mechanic: record.mechanic,
    status: record.status,
    alias: record.alias,
    position: record.position,
    total: record.total,
  };
}

let sharedMemoryArcadeGateway: MemoryArcadeGateway | null = null;

/** Singleton de proceso en memoria compartido por startGame y el transporte. */
export function getSharedMemoryArcadeGateway(): MemoryArcadeGateway {
  sharedMemoryArcadeGateway ??= createMemoryArcadeGateway();
  return sharedMemoryArcadeGateway;
}

/**
 * Gateway arcade en memoria para transporte server-only y pruebas de frontera.
 * No reemplaza la persistencia Supabase (puerta T017+).
 */
export function createMemoryArcadeGateway(
  options: MemoryArcadeGatewayOptions = {},
): MemoryArcadeGateway {
  const byTokenHash = new Map<string, MemorySession>();
  const bySessionId = new Map<string, MemorySession>();
  const nextDefaultItemNumber = new Map<GameCode, number>();
  let realOrIaSessionStarts = 0;
  const now = options.now ?? (() => new Date());
  const contentRepository =
    options.contentRepository ?? getArcadeContentRepository();

  function lookupBySessionId(sessionId: string): MemorySession | null {
    return bySessionId.get(sessionId) ?? null;
  }

  function assignItems(gameCode: GameCode): readonly string[] {
    const configured = options.itemIdsByGameCode?.[gameCode];
    if (configured) {
      if (configured.length === 0) {
        throw new Error("CONTENT_UNAVAILABLE: una sesión requiere items.");
      }
      return Object.freeze([...configured]);
    }

    if (gameCode === "real-o-ia") {
      const pool = contentRepository.listPublishedItems("real-o-ia").map((item) => ({
        itemId: item.itemId,
        verdict: parseImageVerdictSolution(item.solutionPrivate).verdict,
      }));
      if (pool.length < REAL_O_IA_SESSION_ITEM_COUNT) {
        throw new Error(
          "CONTENT_UNAVAILABLE: real-o-ia requiere un pool de al menos 8 items.",
        );
      }
      const sessionStartCount = realOrIaSessionStarts;
      realOrIaSessionStarts += 1;
      return pickRealOrIaSessionItemIds({
        pool,
        sessionStartCount,
      });
    }

    const published = contentRepository
      .listPublishedItems(gameCode)
      .map((item) => item.itemId);
    if (published.length > 0) {
      return Object.freeze(published);
    }

    const nextNumber = (nextDefaultItemNumber.get(gameCode) ?? 0) + 1;
    nextDefaultItemNumber.set(gameCode, nextNumber);
    return Object.freeze([`item-${nextNumber}`]);
  }

  function currentItemId(stored: MemorySession): string | null {
    return stored.assignedItemIds[stored.record.position] ?? null;
  }

  function isCurrentItem(stored: MemorySession, itemId: string): boolean {
    return stored.assignedItemIds.includes(itemId) && currentItemId(stored) === itemId;
  }

  function currentPublicItem(stored: MemorySession): PublicItem | null {
    const itemId = currentItemId(stored);
    if (!itemId) return null;

    const item = contentRepository.getPublicItem(
      stored.record.gameCode,
      itemId,
    );
    if (!item || item.gameCode !== stored.record.gameCode) return null;

    if (item.gameCode === "feed-60" && stored.feed60) {
      return {
        ...item,
        remainingSeconds: remainingFeedSeconds(stored.feed60.clock, now()),
      };
    }
    return item;
  }

  function feedTimeUsedSeconds(stored: MemorySession): number | null {
    if (stored.record.gameCode !== "feed-60" || !stored.feed60) return null;
    const remaining = remainingFeedSeconds(stored.feed60.clock, now());
    return FEED_TIME_LIMIT_SECONDS - remaining;
  }

  function buildSessionScore(stored: MemorySession): GameScore {
    const answers = Array.from(stored.answers.values());
    const gameCode = stored.record.gameCode;

    switch (gameCode) {
      case "grupo":
        return calculateGameScore({
          gameCode,
          answers: answers.flatMap((answer) =>
            answer.grupo ? [{ outcome: answer.grupo.outcome }] : [],
          ),
        });
      case "real-o-ia":
        return calculateGameScore({
          gameCode,
          answers: answers.flatMap((answer) =>
            answer.realOrIa ? [{ correct: answer.realOrIa.correct }] : [],
          ),
        });
      case "clickbait-swipe":
        return calculateGameScore({
          gameCode,
          answers: answers.flatMap((answer) =>
            answer.clickbait ? [{ correct: answer.clickbait.correct }] : [],
          ),
        });
      case "radar-de-fuentes":
        return calculateGameScore({
          gameCode,
          answers: answers.flatMap((answer) =>
            answer.radar ? [{ correct: answer.radar.correct }] : [],
          ),
        });
      case "feed-60":
        return calculateGameScore({
          gameCode,
          answers: answers.flatMap((answer) =>
            answer.feed60
              ? [
                  {
                    decisionCorrect: answer.feed60.decisionCorrect,
                    verified: answer.feed60.verified,
                  },
                ]
              : [],
          ),
          timeUsedSeconds: feedTimeUsedSeconds(stored),
        });
      case "mente-maestra":
        return calculateGameScore({
          gameCode,
          answers: answers.flatMap((answer) =>
            answer.menteMaestra ? [{ completed: true }] : [],
          ),
        });
    }
  }

  function menteMaestraSelections(
    stored: MemorySession,
  ): GuidedAutopsySelection[] {
    return Array.from(stored.answers.values()).flatMap((answer) =>
      answer.menteMaestra
        ? [
            {
              step: answer.menteMaestra.step,
              optionId: answer.menteMaestra.optionId,
              reachWeight: answer.menteMaestra.reachWeight,
              autopsyEntry: answer.menteMaestra.autopsyEntry,
            },
          ]
        : [],
    );
  }

  function materializeResult(
    stored: MemorySession,
    status: "finished" | "expired",
  ): GameResult {
    const gameCode = stored.record.gameCode;
    const assembly =
      gameCode === "mente-maestra"
        ? assembleMenteMaestraSession({
            repository: contentRepository,
            selections: menteMaestraSelections(stored),
          })
        : null;

    return {
      sessionId: stored.record.sessionId,
      gameCode,
      alias: stored.record.alias,
      status,
      answered: stored.answers.size,
      total: stored.record.total,
      learningSummary: LEARNING_SUMMARIES[gameCode][status],
      score: buildSessionScore(stored),
      simulatedReach: assembly?.simulatedReach ?? null,
    };
  }

  function projectMenteMaestraCompanion(
    stored: MemorySession,
  ): AutopsySessionCompanion {
    const records = Array.from(stored.answers.values()).flatMap((answer) =>
      answer.menteMaestra ? [answer.menteMaestra] : [],
    );
    const itemId = currentItemId(stored);
    const currentAnswer = itemId
      ? stored.answers.get(itemId)?.menteMaestra
      : undefined;
    const terminal = isTerminalSessionStatus(stored.record.status);
    const assembly = terminal
      ? assembleMenteMaestraSession({
          repository: contentRepository,
          selections: menteMaestraSelections(stored),
        })
      : null;

    return {
      kind: "mente-maestra",
      selections: records.map(({ step, optionId, label }) => ({
        step,
        optionId,
        label,
      })),
      selectedOptionId: currentAnswer?.optionId ?? null,
      simulatedReach: assembly?.simulatedReach ?? null,
      autopsyEntries:
        assembly?.autopsyEntries ??
        records.flatMap((record) =>
          record.autopsyEntry
            ? [
                {
                  step: record.autopsyEntry.step,
                  title: record.autopsyEntry.title,
                  tip: record.autopsyEntry.tip,
                },
              ]
            : [],
        ),
      fictionalComments: assembly?.fictionalComments ?? [],
      educationalDisclaimer: assembly?.educationalDisclaimer ?? null,
    };
  }

  function projectCompanion(
    stored: MemorySession,
  ): ArcadeSessionCompanion | undefined {
    if (stored.record.gameCode === "feed-60" && stored.feed60) {
      const itemId = currentItemId(stored);
      const itemState = itemId
        ? stored.feed60.itemStates.get(itemId)
        : undefined;
      return {
        kind: "feed-60",
        verified: itemState?.verified ?? false,
        verificationHints:
          (itemId ? stored.feed60.hintsByItem.get(itemId) : undefined) ?? [],
        remainingSeconds: remainingFeedSeconds(stored.feed60.clock, now()),
      };
    }

    if (stored.record.gameCode === "mente-maestra") {
      return projectMenteMaestraCompanion(stored);
    }

    return undefined;
  }

  function projectState(
    stored: MemorySession,
    overrides: Partial<GameState> = {},
  ): GameStateWithCompanion {
    const base: GameState = {
      ...toPublicState(stored.record, stored.state),
      ...overrides,
    };
    const companion = projectCompanion(stored);
    return companion === undefined ? base : { ...base, companion };
  }

  function syncExpiration(stored: MemorySession): void {
    const previousStatus = stored.record.status;
    stored.record = expireSessionIfNeeded(stored.record, now());
    if (stored.record.status !== "expired") return;

    stored.state = projectState(stored, {
      item: null,
      feedback: null,
      nextAction: "result",
    });
    if (previousStatus !== "expired" || !stored.result) {
      stored.result = materializeResult(stored, "expired");
    }
  }

  /**
   * Expiración autoritativa del reloj de Feed 60”. Una decisión ya aceptada
   * (feedback) conserva su cierre; la partida expira al avanzar.
   */
  function syncFeedExpiration(stored: MemorySession): void {
    if (stored.record.gameCode !== "feed-60" || !stored.feed60) return;
    if (isTerminalSessionStatus(stored.record.status)) return;
    if (!isFeedClockExpired(stored.feed60.clock, now())) return;

    stored.feed60.clock = markFeedClockExpired(stored.feed60.clock);
    if (stored.record.status === "feedback") return;
    if (!canTransitionSession(stored.record.status, "expired")) return;

    stored.record = transitionSession(stored.record, "expired", now());
    stored.state = projectState(stored, {
      item: null,
      feedback: null,
      nextAction: "result",
    });
    stored.result ??= materializeResult(stored, "expired");
  }

  function clickbaitSessionContext(stored: MemorySession): {
    streakBefore: number;
    bonusPointsAwarded: number;
  } {
    let streak = 0;
    let bonusPointsAwarded = 0;
    for (const answer of stored.answers.values()) {
      const record = answer.clickbait;
      if (!record) continue;
      bonusPointsAwarded += record.bonusPoints;
      streak = record.correct ? streak + 1 : 0;
    }
    return { streakBefore: streak, bonusPointsAwarded };
  }

  function evaluateMechanicSubmit(
    stored: MemorySession,
    command: SubmitGameActionCommand,
  ): MechanicSubmitEvaluation | "unavailable" | null {
    const content = contentRepository.getContentItem(
      command.gameCode,
      command.itemId,
    );
    if (!content) return "unavailable";

    switch (command.gameCode) {
      case "grupo": {
        const evaluation = evaluateGrupoSubmit({
          repository: contentRepository,
          itemId: command.itemId,
          action: command,
        });
        return evaluation
          ? { feedback: evaluation.feedback, answer: { grupo: evaluation.answer } }
          : null;
      }
      case "real-o-ia": {
        const evaluation = evaluateRealOrIaSubmit({
          repository: contentRepository,
          itemId: command.itemId,
          action: command,
        });
        return evaluation
          ? {
              feedback: evaluation.feedback,
              answer: { realOrIa: evaluation.answer },
            }
          : null;
      }
      case "clickbait-swipe": {
        const { streakBefore, bonusPointsAwarded } =
          clickbaitSessionContext(stored);
        const evaluation = evaluateClickbaitSubmit({
          repository: contentRepository,
          itemId: command.itemId,
          action: command,
          streakBefore,
          bonusPointsAwarded,
        });
        return evaluation
          ? {
              feedback: evaluation.feedback,
              answer: { clickbait: evaluation.answer },
            }
          : null;
      }
      case "radar-de-fuentes": {
        const evaluation = evaluateRadarSubmit({
          repository: contentRepository,
          itemId: command.itemId,
          action: command,
        });
        return evaluation
          ? { feedback: evaluation.feedback, answer: { radar: evaluation.answer } }
          : null;
      }
      case "mente-maestra": {
        const evaluation = evaluateMenteMaestraSubmit({
          repository: contentRepository,
          itemId: command.itemId,
          action: command,
        });
        return evaluation
          ? {
              feedback: evaluation.feedback,
              answer: { menteMaestra: evaluation.answer },
            }
          : null;
      }
      case "feed-60":
        return "unavailable";
    }
  }

  function acceptGenericAnswer(
    stored: MemorySession,
    command: SubmitGameActionCommand,
    idempotency: Readonly<{ idempotencyKey: string; inputFingerprint: string }>,
  ): ArcadeGatewayResult<GameState> {
    stored.answers.set(command.itemId, {
      itemId: command.itemId,
      idempotencyKey: idempotency.idempotencyKey,
      inputFingerprint: idempotency.inputFingerprint,
    });
    stored.record = transitionSession(stored.record, "processing", now());
    stored.record = transitionSession(stored.record, "feedback", now());
    stored.state = projectState(stored, {
      item: currentPublicItem(stored),
      feedback: GENERIC_ACCEPT_FEEDBACK,
      provisionalScore: null,
      nextAction: "advance",
    });
    stored.record = touchSessionActivity(stored.record, now());
    return { ok: true, data: stored.state };
  }

  function submitFeed60(
    stored: MemorySession,
    command: SubmitGameActionCommand,
  ): ArcadeGatewayResult<GameState> {
    syncFeedExpiration(stored);
    if (stored.record.status === "expired") return failure("SESSION_EXPIRED");
    if (!isCurrentItem(stored, command.itemId)) {
      return failure("ITEM_NOT_IN_SESSION");
    }

    const previous = stored.answers.get(command.itemId) ?? null;
    const idempotency = resolveAnswerIdempotency({
      sessionId: command.sessionId,
      action: command,
      previous,
    });
    if (idempotency.kind === "conflict") {
      return failure("ANSWER_ALREADY_ACCEPTED");
    }
    if (idempotency.kind === "replay") {
      stored.state = projectState(stored);
      return { ok: true, data: stored.state };
    }
    if (stored.record.status !== "active") return failure("INVALID_ACTION");

    const feed = (stored.feed60 ??= createFeed60SessionState(now()));
    const resolution = evaluateFeed60Submit({
      repository: contentRepository,
      itemId: command.itemId,
      action: command,
      sessionItemIds: stored.assignedItemIds,
      clock: feed.clock,
      itemState:
        feed.itemStates.get(command.itemId) ?? emptyTimedFeedItemState(),
      now: now(),
    });

    if (resolution === null) {
      return acceptGenericAnswer(stored, command, idempotency);
    }

    switch (resolution.kind) {
      case "rejected":
        return failure(resolution.code);
      case "expired": {
        feed.clock = resolution.clock;
        syncFeedExpiration(stored);
        return failure("SESSION_EXPIRED");
      }
      case "verified": {
        feed.clock = resolution.clock;
        feed.itemStates.set(command.itemId, resolution.itemState);
        feed.hintsByItem.set(command.itemId, resolution.verificationHints);
        stored.record = touchSessionActivity(stored.record, now());
        stored.state = projectState(stored, {
          item: currentPublicItem(stored),
          feedback: null,
          nextAction: "submit",
        });
        syncFeedExpiration(stored);
        return { ok: true, data: stored.state };
      }
      case "decided": {
        feed.clock = resolution.clock;
        feed.itemStates.set(command.itemId, resolution.itemState);
        stored.answers.set(command.itemId, {
          itemId: command.itemId,
          idempotencyKey: idempotency.idempotencyKey,
          inputFingerprint: idempotency.inputFingerprint,
          feed60: {
            itemId: command.itemId,
            decisionCorrect: resolution.evaluation.decisionCorrect,
            verified: resolution.evaluation.verified,
            points: resolution.evaluation.points,
          },
        });
        stored.record = transitionSession(stored.record, "processing", now());
        stored.record = transitionSession(stored.record, "feedback", now());
        stored.state = projectState(stored, {
          item: currentPublicItem(stored),
          feedback: resolution.evaluation.feedback,
          provisionalScore: buildSessionScore(stored),
          nextAction: "advance",
        });
        stored.record = touchSessionActivity(stored.record, now());
        return { ok: true, data: stored.state };
      }
    }
  }

  function exportStored(stored: MemorySession): ArcadeSessionSnapshot {
    return {
      version: 1,
      tokenHash: stored.tokenHash,
      record: serializeSessionRecord(stored.record),
      state: stored.state,
      result: stored.result,
      answers: Array.from(stored.answers.values()) as SerializedAnswer[],
      assignedItemIds: [...stored.assignedItemIds],
      feed60: stored.feed60
        ? {
            clock: serializeFeedClock(stored.feed60.clock),
            itemStates: Array.from(stored.feed60.itemStates.entries()),
            hintsByItem: Array.from(stored.feed60.hintsByItem.entries()),
          }
        : null,
    };
  }

  const gateway: MemoryArcadeGateway = {
    resolveSessionId(tokenHash: string): string | null {
      return byTokenHash.get(tokenHash)?.record.sessionId ?? null;
    },

    getSessionExpiresAt(sessionId: string): Date | null {
      return bySessionId.get(sessionId)?.record.expiresAt ?? null;
    },

    exportSession(sessionId: string): ArcadeSessionSnapshot | null {
      const stored = lookupBySessionId(sessionId);
      return stored ? exportStored(stored) : null;
    },

    importSession(snapshot: ArcadeSessionSnapshot): void {
      const record = deserializeSessionRecord(snapshot.record);
      const answers = new Map<string, MemoryAnswer>();
      for (const answer of snapshot.answers) {
        answers.set(answer.itemId, answer as MemoryAnswer);
      }
      const feed60: Feed60SessionState | null = snapshot.feed60
        ? {
            clock: deserializeFeedClock(snapshot.feed60.clock),
            itemStates: new Map(snapshot.feed60.itemStates),
            hintsByItem: new Map(snapshot.feed60.hintsByItem),
          }
        : null;

      const stored: MemorySession = {
        tokenHash: snapshot.tokenHash,
        record,
        state: snapshot.state,
        result: snapshot.result,
        answers,
        assignedItemIds: Object.freeze([...snapshot.assignedItemIds]),
        feed60,
      };

      const previous = bySessionId.get(record.sessionId);
      if (previous && previous.tokenHash !== snapshot.tokenHash) {
        byTokenHash.delete(previous.tokenHash);
      }
      byTokenHash.set(snapshot.tokenHash, stored);
      bySessionId.set(record.sessionId, stored);
    },

    async startGame(
      command: StartGameCommand & { sessionTokenHash: string },
    ): Promise<ArcadeGatewayResult<GameState>> {
      const existing = byTokenHash.get(command.sessionTokenHash);
      if (existing) {
        syncExpiration(existing);
        syncFeedExpiration(existing);
        existing.state = projectState(existing);
        return { ok: true, data: existing.state };
      }

      const assignedItemIds = assignItems(command.gameCode);
      const record = createArcadeSession({
        alias: command.alias,
        gameCode: command.gameCode,
        total: assignedItemIds.length,
        sessionId: randomUUID(),
        now: now(),
      });
      const active = transitionSession(record, "active", now());
      const stored: MemorySession = {
        tokenHash: command.sessionTokenHash,
        record: active,
        state: {
          sessionId: active.sessionId,
          gameCode: active.gameCode,
          mechanic: active.mechanic,
          status: active.status,
          alias: active.alias,
          position: 0,
          total: active.total,
          item: null,
          feedback: null,
          provisionalScore: null,
          nextAction: "submit",
        },
        result: null,
        answers: new Map(),
        assignedItemIds,
        feed60:
          command.gameCode === "feed-60" ? createFeed60SessionState(now()) : null,
      };
      stored.state = projectState(stored, {
        item: currentPublicItem(stored),
        feedback: null,
        provisionalScore: null,
        nextAction: "submit",
      });
      byTokenHash.set(command.sessionTokenHash, stored);
      bySessionId.set(active.sessionId, stored);
      return { ok: true, data: stored.state };
    },

    async getGameState(
      command: GetGameStateCommand,
    ): Promise<ArcadeGatewayResult<GameState>> {
      const stored = lookupBySessionId(command.sessionId);
      if (!stored) return failure("SESSION_NOT_FOUND");

      if (command.gameCode) {
        const mismatch = assertSessionGameCode(stored.record, command.gameCode);
        if (mismatch !== "ok") return failure("GAME_MISMATCH");
      }

      syncExpiration(stored);
      syncFeedExpiration(stored);
      stored.state = projectState(stored);
      return { ok: true, data: stored.state };
    },

    async submitGameAction(
      command: SubmitGameActionCommand,
    ): Promise<ArcadeGatewayResult<GameState>> {
      const stored = lookupBySessionId(command.sessionId);
      if (!stored) return failure("SESSION_NOT_FOUND");

      const mismatch = assertSessionGameCode(stored.record, command.gameCode);
      if (mismatch !== "ok") return failure("GAME_MISMATCH");

      syncExpiration(stored);
      if (stored.record.status === "expired") {
        return failure("SESSION_EXPIRED");
      }

      if (command.gameCode === "feed-60") {
        return submitFeed60(stored, command);
      }

      if (!isCurrentItem(stored, command.itemId)) {
        return failure("ITEM_NOT_IN_SESSION");
      }

      const previous = stored.answers.get(command.itemId) ?? null;
      const idempotency = resolveAnswerIdempotency({
        sessionId: command.sessionId,
        action: command,
        previous,
      });
      if (idempotency.kind === "conflict") {
        return failure("ANSWER_ALREADY_ACCEPTED");
      }

      if (idempotency.kind === "replay") {
        stored.state = projectState(stored);
        return { ok: true, data: stored.state };
      }

      if (stored.record.status !== "active") {
        return failure("INVALID_ACTION");
      }

      const evaluation = evaluateMechanicSubmit(stored, command);
      if (evaluation === null) return failure("INVALID_ACTION");
      if (evaluation === "unavailable") {
        return acceptGenericAnswer(stored, command, idempotency);
      }

      stored.answers.set(command.itemId, {
        itemId: command.itemId,
        idempotencyKey: idempotency.idempotencyKey,
        inputFingerprint: idempotency.inputFingerprint,
        ...evaluation.answer,
      });
      stored.record = transitionSession(stored.record, "processing", now());
      stored.record = transitionSession(stored.record, "feedback", now());
      stored.state = projectState(stored, {
        item: currentPublicItem(stored),
        feedback: evaluation.feedback,
        provisionalScore: buildSessionScore(stored),
        nextAction: "advance",
      });
      stored.record = touchSessionActivity(stored.record, now());
      return { ok: true, data: stored.state };
    },

    async advanceGame(
      command: AdvanceGameCommand,
    ): Promise<ArcadeGatewayResult<GameState>> {
      const stored = lookupBySessionId(command.sessionId);
      if (!stored) return failure("SESSION_NOT_FOUND");
      syncExpiration(stored);
      if (stored.record.status === "expired") return failure("SESSION_EXPIRED");
      if (!isCurrentItem(stored, command.itemId)) {
        return failure("ITEM_NOT_IN_SESSION");
      }
      if (stored.record.status !== "feedback") return failure("INVALID_ACTION");
      if (!stored.answers.has(command.itemId)) return failure("INVALID_ACTION");

      stored.record = {
        ...stored.record,
        position: Math.min(stored.record.position + 1, stored.record.total),
      };
      if (stored.record.position < stored.record.total) {
        stored.record = transitionSession(stored.record, "active", now());
        stored.state = projectState(stored, {
          item: currentPublicItem(stored),
          feedback: null,
          provisionalScore: buildSessionScore(stored),
          nextAction: "submit",
        });
        syncFeedExpiration(stored);
        return { ok: true, data: stored.state };
      }

      stored.record = transitionSession(stored.record, "finished", now());
      stored.result = materializeResult(stored, "finished");
      stored.state = projectState(stored, {
        item: null,
        feedback: null,
        provisionalScore: stored.result.score,
        nextAction: "result",
      });
      return { ok: true, data: stored.state };
    },

    async getGameResult(
      command: GetGameResultCommand,
    ): Promise<ArcadeGatewayResult<GameResult>> {
      const stored = lookupBySessionId(command.sessionId);
      if (!stored) return failure("SESSION_NOT_FOUND");
      syncExpiration(stored);
      if (stored.record.status === "expired") {
        return { ok: true, data: stored.result ?? materializeResult(stored, "expired") };
      }
      if (!stored.result) return failure("RESULT_NOT_AVAILABLE");
      if (
        stored.record.resultAccessUntil &&
        Date.now() >= stored.record.resultAccessUntil.getTime()
      ) {
        return failure("RESULT_ACCESS_EXPIRED");
      }
      return { ok: true, data: stored.result };
    },

    async getLeaderboard(): Promise<ArcadeGatewayResult<Leaderboard>> {
      const candidates: RankingCandidate[] = [];

      for (const stored of bySessionId.values()) {
        const result = stored.result;
        if (!result) continue;

        candidates.push({
          resultId: stored.record.sessionId,
          gameCode: result.gameCode,
          alias: result.alias,
          status: result.status,
          answered: result.answered,
          total: result.total,
          points: result.score.points,
          maxPoints: result.score.maxPoints,
          completedAt: (
            stored.record.finishedAt ?? stored.record.lastActivityAt
          ).toISOString(),
          aliasAllowed: true,
          abuseMarked: false,
          invalidMarked: false,
        });
      }

      return {
        ok: true,
        data: buildLeaderboard(candidates),
      };
    },
  };

  return gateway;
}
