import "server-only";

import {
  CLIENT_FORBIDDEN_AUTHORITY_FIELDS,
  LEADERBOARD_LIMIT,
  type ArcadeOperationResult,
  type Leaderboard,
} from "@antidoto/contracts";
import { z } from "zod";

import { GameCodeSchema } from "../domain/schemas";
import {
  buildLeaderboard,
  type RankingCandidate,
} from "../domain/scoring";
import type { ArcadeGameGateway } from "../infrastructure/game-gateway";
import { arcadeFailure, getLeaderboardOperation } from "./game-operations";

/** Copia neutral: ranking secundario, nunca competitivo ni requisito de juego. */
export const LEADERBOARD_COPY = {
  scopeLabel: "Ranking global secundario",
  supporting:
    "Esta lectura es opcional y no es un objetivo de aprendizaje ni un requisito para jugar.",
  empty: "Todavía no hay resultados elegibles en el ranking.",
  unavailable:
    "El ranking no está disponible ahora. Puedes reintentar sin afectar tu partida.",
} as const;

const RankingCandidateIngestSchema = z
  .object({
    resultId: z.string().min(1).max(128),
    gameCode: GameCodeSchema,
    alias: z.string().min(1).max(64),
    status: z.enum(["finished", "expired"]),
    answered: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
    points: z.number(),
    maxPoints: z.number(),
    completedAt: z.string().min(1),
    aliasAllowed: z.boolean(),
    abuseMarked: z.boolean(),
    invalidMarked: z.boolean(),
  })
  .passthrough();

export type LeaderboardDependencies = Readonly<{
  gateway: ArcadeGameGateway;
}>;

function pickServerCandidateFields(
  row: Record<string, unknown>,
): Record<string, unknown> {
  return {
    resultId: row.resultId,
    gameCode: row.gameCode,
    alias: row.alias,
    status: row.status,
    answered: row.answered,
    total: row.total,
    points: row.points,
    maxPoints: row.maxPoints,
    completedAt: row.completedAt,
    aliasAllowed: row.aliasAllowed,
    abuseMarked: row.abuseMarked,
    invalidMarked: row.invalidMarked,
  };
}

/**
 * Ingesta server-only de filas candidatas.
 * Ignora rank, rankingScore, leaderboardEligible y demás autoridad del cliente.
 */
export function ingestRankingCandidates(input: unknown): RankingCandidate[] {
  if (!Array.isArray(input)) return [];

  const candidates: RankingCandidate[] = [];
  for (const row of input) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const parsed = RankingCandidateIngestSchema.safeParse(
      pickServerCandidateFields(row as Record<string, unknown>),
    );
    if (!parsed.success) continue;
    candidates.push({
      resultId: parsed.data.resultId,
      gameCode: parsed.data.gameCode,
      alias: parsed.data.alias,
      status: parsed.data.status,
      answered: parsed.data.answered,
      total: parsed.data.total,
      points: parsed.data.points,
      maxPoints: parsed.data.maxPoints,
      completedAt: parsed.data.completedAt,
      aliasAllowed: parsed.data.aliasAllowed,
      abuseMarked: parsed.data.abuseMarked,
      invalidMarked: parsed.data.invalidMarked,
    });
  }
  return candidates;
}

/** Proyecta elegibles, rankingScore normalizado y máximo diez entradas. */
export function projectEligibleLeaderboard(
  candidates: readonly RankingCandidate[],
): Leaderboard {
  return buildLeaderboard(candidates);
}

export function projectLeaderboardFromUnknown(
  input: unknown,
): Leaderboard {
  return projectEligibleLeaderboard(ingestRankingCandidates(input));
}

export function leaderboardRejectsClientAuthority(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const queue: unknown[] = [payload];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;
    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }
    for (const [key, value] of Object.entries(current)) {
      if (
        (CLIENT_FORBIDDEN_AUTHORITY_FIELDS as readonly string[]).includes(key)
      ) {
        return true;
      }
      if (value && typeof value === "object") queue.push(value);
    }
  }
  return false;
}

/**
 * Lectura global del ranking arcade.
 * La elegibilidad y rankingScore solo se resuelven en servidor.
 */
export async function getLeaderboard(
  dependencies: LeaderboardDependencies,
): Promise<ArcadeOperationResult<Leaderboard>> {
  try {
    const result = await getLeaderboardOperation({
      gateway: dependencies.gateway,
    });

    if (!result.ok) {
      if (result.error.code === "LEADERBOARD_EMPTY") {
        return arcadeFailure("LEADERBOARD_EMPTY", LEADERBOARD_COPY.empty);
      }
      return arcadeFailure(
        "LEADERBOARD_UNAVAILABLE",
        LEADERBOARD_COPY.unavailable,
      );
    }

    if (result.data.entries.length === 0) {
      return arcadeFailure("LEADERBOARD_EMPTY", LEADERBOARD_COPY.empty);
    }

    if (result.data.entries.length > LEADERBOARD_LIMIT) {
      return {
        ok: true,
        data: {
          scope: "global",
          limit: LEADERBOARD_LIMIT,
          entries: result.data.entries.slice(0, LEADERBOARD_LIMIT),
        },
      };
    }

    return { ok: true, data: result.data };
  } catch {
    return arcadeFailure(
      "LEADERBOARD_UNAVAILABLE",
      LEADERBOARD_COPY.unavailable,
    );
  }
}

/**
 * Proyecta candidatas crudas (p. ej. filas RPC) sin confiar en rankingScore
 * ni en marcas de elegibilidad aportadas por fuera del servidor.
 */
export function getLeaderboardFromCandidates(
  input: unknown,
): ArcadeOperationResult<Leaderboard> {
  try {
    const leaderboard = projectLeaderboardFromUnknown(input);
    if (leaderboard.entries.length === 0) {
      return arcadeFailure("LEADERBOARD_EMPTY", LEADERBOARD_COPY.empty);
    }
    return { ok: true, data: leaderboard };
  } catch {
    return arcadeFailure(
      "LEADERBOARD_UNAVAILABLE",
      LEADERBOARD_COPY.unavailable,
    );
  }
}
