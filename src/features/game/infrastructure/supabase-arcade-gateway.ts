import "server-only";

import type {
  AdvanceGameCommand,
  GameResult,
  GameState,
  Leaderboard,
  StartGameCommand,
  SubmitGameActionCommand,
} from "@antidoto/contracts";

import { normalizeAliasCandidate } from "../domain/alias";
import {
  buildLeaderboard,
  calculateRankingScore,
  isRankingEligible,
  type RankingCandidate,
} from "../domain/scoring";
import type { ServerSupabaseClient } from "../../../lib/supabase/server";
import type { Json } from "../../../lib/supabase/database.types";
import {
  tokenHashToByteaHex,
  type ArcadeSessionSnapshot,
} from "./arcade-session-snapshot";
import type {
  ArcadeGameGateway,
  ArcadeGatewayResult,
  GetGameResultCommand,
  GetGameStateCommand,
} from "./game-gateway";
import {
  createMemoryArcadeGateway,
  type MemoryArcadeGateway,
} from "./memory-arcade-gateway";

export type SupabaseArcadeGateway = ArcadeGameGateway & {
  resolveSessionId(tokenHash: string): Promise<string | null>;
  getSessionExpiresAt(sessionId: string): Date | null;
};

export type SupabaseArcadeGatewayOptions = Readonly<{
  client: ServerSupabaseClient;
  memory?: MemoryArcadeGateway;
}>;

function asSnapshot(value: unknown): ArcadeSessionSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { version?: unknown };
  if (record.version !== 1) return null;
  return value as ArcadeSessionSnapshot;
}

/**
 * Adapter durable: evalúa con el motor en memoria (domain mechanics + JSON) y
 * persiste snapshots / resultados en private_arcade vía service_role.
 */
export function createSupabaseArcadeGateway(
  options: SupabaseArcadeGatewayOptions,
): SupabaseArcadeGateway {
  const client = options.client;
  const memory = options.memory ?? createMemoryArcadeGateway();

  async function loadBySessionId(sessionId: string): Promise<boolean> {
    const { data, error } = await client
      .from("game_sessions")
      .select("runtime_snapshot")
      .eq("session_id", sessionId)
      .maybeSingle();
    if (error || !data) return false;
    const snapshot = asSnapshot(data.runtime_snapshot);
    if (!snapshot) return false;
    memory.importSession(snapshot);
    return true;
  }

  async function loadByTokenHash(tokenHash: string): Promise<string | null> {
    const memId = memory.resolveSessionId(tokenHash);
    if (memId) return memId;

    const { data, error } = await client
      .from("game_sessions")
      .select("session_id, runtime_snapshot")
      .eq("session_token_hash", tokenHashToByteaHex(tokenHash))
      .maybeSingle();
    if (error || !data) return null;
    const snapshot = asSnapshot(data.runtime_snapshot);
    if (!snapshot) return null;
    memory.importSession(snapshot);
    return data.session_id as string;
  }

  async function persistSession(sessionId: string): Promise<void> {
    const snapshot = memory.exportSession(sessionId);
    if (!snapshot) return;

    const closed =
      snapshot.record.status === "finished" ||
      snapshot.record.status === "expired"
        ? snapshot.record.finishedAt
        : null;

    const row = {
      session_id: snapshot.record.sessionId,
      game_code: snapshot.record.gameCode,
      alias: snapshot.record.alias,
      alias_normalized: normalizeAliasCandidate(snapshot.record.alias).toLocaleLowerCase(
        "es",
      ),
      status: snapshot.record.status,
      started_at: snapshot.record.startedAt,
      expires_at: snapshot.record.expiresAt,
      last_activity_at: snapshot.record.lastActivityAt,
      closed_at: closed,
      result_access_until: snapshot.record.resultAccessUntil,
      session_token_hash: tokenHashToByteaHex(snapshot.tokenHash),
      runtime_snapshot: snapshot as unknown as Json,
      position: snapshot.record.position,
      total: snapshot.record.total,
      mechanic: snapshot.record.mechanic,
    };

    const { error } = await client.from("game_sessions").upsert(row, {
      onConflict: "session_id",
    });
    if (error) {
      throw new Error(`SUPABASE_SESSION_PERSIST: ${error.message}`);
    }

    if (snapshot.result) {
      await persistResult(snapshot);
    }
  }

  async function persistResult(snapshot: ArcadeSessionSnapshot): Promise<void> {
    const result = snapshot.result;
    if (!result) return;

    const completedAt =
      snapshot.record.finishedAt ?? snapshot.record.lastActivityAt;
    const candidate: RankingCandidate = {
      resultId: snapshot.record.sessionId,
      gameCode: result.gameCode,
      alias: result.alias,
      status: result.status,
      answered: result.answered,
      total: result.total,
      points: result.score.points,
      maxPoints: result.score.maxPoints,
      completedAt,
      aliasAllowed: true,
      abuseMarked: false,
      invalidMarked: false,
    };
    const eligible = isRankingEligible(candidate);
    const rankingScore = eligible
      ? calculateRankingScore(result.score.points, result.score.maxPoints)
      : null;

    const resultRow = {
      session_id: snapshot.record.sessionId,
      game_code: result.gameCode,
      alias: result.alias,
      alias_normalized: normalizeAliasCandidate(result.alias).toLocaleLowerCase(
        "es",
      ),
      status: result.status,
      answered: result.answered,
      total: result.total,
      points: result.score.points,
      max_points: result.score.maxPoints,
      correct: result.score.correct ?? null,
      errors: result.score.errors,
      bonus_points: result.score.bonusPoints,
      penalty_points: result.score.penaltyPoints,
      time_limit_seconds: result.score.timeLimitSeconds,
      time_used_seconds: result.score.timeUsedSeconds,
      learning_summary: result.learningSummary,
      simulated_reach: result.simulatedReach,
      ranking_score: rankingScore,
      leaderboard_eligible: eligible && rankingScore !== null,
      alias_allowed: true,
      abuse_flagged: false,
      invalidated: false,
      completed_at: completedAt,
    };

    const { data: saved, error } = await client
      .from("game_results")
      .upsert(resultRow, { onConflict: "session_id" })
      .select("result_id")
      .maybeSingle();

    if (error) {
      throw new Error(`SUPABASE_RESULT_PERSIST: ${error.message}`);
    }

    if (!eligible || rankingScore === null || !saved?.result_id) return;

    const { error: projectionError } = await client
      .from("leaderboard_projection")
      .upsert(
        {
          result_id: saved.result_id,
          game_code: result.gameCode,
          alias: result.alias,
          points: result.score.points,
          max_points: result.score.maxPoints,
          ranking_score: rankingScore,
          completed_at: completedAt,
        },
        { onConflict: "result_id" },
      );

    if (projectionError) {
      throw new Error(`SUPABASE_LEADERBOARD_PERSIST: ${projectionError.message}`);
    }
  }

  async function withHydratedSession<T>(
    sessionId: string,
    operation: () => Promise<ArcadeGatewayResult<T>>,
  ): Promise<ArcadeGatewayResult<T>> {
    if (!memory.exportSession(sessionId)) {
      await loadBySessionId(sessionId);
    }

    const result = await operation();
    if (memory.exportSession(sessionId)) {
      await persistSession(sessionId);
    }
    return result;
  }

  return {
    async resolveSessionId(tokenHash: string): Promise<string | null> {
      return loadByTokenHash(tokenHash);
    },

    getSessionExpiresAt(sessionId: string): Date | null {
      return memory.getSessionExpiresAt(sessionId);
    },

    async startGame(
      command: StartGameCommand & { sessionTokenHash: string },
    ): Promise<ArcadeGatewayResult<GameState>> {
      await loadByTokenHash(command.sessionTokenHash);
      const result = await memory.startGame(command);
      if (result.ok) {
        await persistSession(result.data.sessionId);
      }
      return result;
    },

    async getGameState(
      command: GetGameStateCommand,
    ): Promise<ArcadeGatewayResult<GameState>> {
      return withHydratedSession(command.sessionId, () =>
        memory.getGameState(command),
      );
    },

    async submitGameAction(
      command: SubmitGameActionCommand,
    ): Promise<ArcadeGatewayResult<GameState>> {
      return withHydratedSession(command.sessionId, () =>
        memory.submitGameAction(command),
      );
    },

    async advanceGame(
      command: AdvanceGameCommand,
    ): Promise<ArcadeGatewayResult<GameState>> {
      return withHydratedSession(command.sessionId, () =>
        memory.advanceGame(command),
      );
    },

    async getGameResult(
      command: GetGameResultCommand,
    ): Promise<ArcadeGatewayResult<GameResult>> {
      return withHydratedSession(command.sessionId, () =>
        memory.getGameResult(command),
      );
    },

    async getLeaderboard(): Promise<ArcadeGatewayResult<Leaderboard>> {
      const { data, error } = await client
        .from("leaderboard_projection")
        .select(
          "result_id, game_code, alias, points, max_points, ranking_score, completed_at",
        )
        .order("ranking_score", { ascending: false })
        .order("completed_at", { ascending: true })
        .order("result_id", { ascending: true })
        .limit(50);

      if (error) {
        // Fallback in-process if projection table is unavailable.
        return memory.getLeaderboard();
      }

      const candidates: RankingCandidate[] = (data ?? []).map((row) => ({
        resultId: String(row.result_id),
        gameCode: row.game_code as RankingCandidate["gameCode"],
        alias: String(row.alias),
        status: "finished",
        answered: 1,
        total: 1,
        points: Number(row.points),
        maxPoints: Number(row.max_points),
        completedAt: String(row.completed_at),
        aliasAllowed: true,
        abuseMarked: false,
        invalidMarked: false,
      }));

      // Prefer projection rows; merge memory for same-process freshness.
      const memoryBoard = await memory.getLeaderboard();
      if (memoryBoard.ok) {
        for (const entry of memoryBoard.data.entries) {
          if (!candidates.some((c) => c.alias === entry.alias && c.gameCode === entry.gameCode)) {
            candidates.push({
              resultId: `memory:${entry.gameCode}:${entry.alias}:${entry.completedAt}`,
              gameCode: entry.gameCode,
              alias: entry.alias,
              status: "finished",
              answered: 1,
              total: 1,
              points: entry.points,
              maxPoints: entry.maxPoints,
              completedAt: entry.completedAt,
              aliasAllowed: true,
              abuseMarked: false,
              invalidMarked: false,
            });
          }
        }
      }

      return { ok: true, data: buildLeaderboard(candidates) };
    },
  };
}

let sharedSupabaseArcadeGateway: SupabaseArcadeGateway | null = null;

export function getSharedSupabaseArcadeGateway(
  client: ServerSupabaseClient,
): SupabaseArcadeGateway {
  sharedSupabaseArcadeGateway ??= createSupabaseArcadeGateway({ client });
  return sharedSupabaseArcadeGateway;
}
