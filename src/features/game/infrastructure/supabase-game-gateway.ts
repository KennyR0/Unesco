import {
  AnswerResultSchema,
  AppliedScoringRuleSchema,
  FinalResultSchema,
  GameErrorCodeSchema,
  GameStateSchema,
  LeaderboardSnapshotSchema,
  MVP_EDUCATIONAL_CLOSING_MESSAGE,
  QuestionGameStateSchema,
  RoundScoreSchema,
  RoundSizeSchema,
  ValidatedAliasSchema,
  type AnswerResult,
  type FinalResult,
  type GameErrorCode,
  type GameState,
  type LeaderboardSnapshot,
  type OptionRef,
  type QuestionGameState,
  type QuestionRef,
} from "@antidoto/contracts";
import { z } from "zod";

import type { Json } from "../../../lib/supabase/database.types";
import type { ServerSupabaseClient } from "../../../lib/supabase/server";

type GatewayFailure = Readonly<{ ok: false; code: GameErrorCode }>;
type GatewayResult<T> =
  | Readonly<{ ok: true; data: T }>
  | GatewayFailure;

export type StartGameGatewayData = Readonly<{
  sessionExpiresAt: Date;
  idempotent: boolean;
}>;

export type SubmittedAnswerGatewayData = Readonly<{
  answer: AnswerResult;
  acceptedNew: boolean;
  sessionExpiresAt: Date;
}>;

export type FinalResultGatewayData = Readonly<{
  result: FinalResult;
  resultAccessUntil: Date;
}>;

const TimestampSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  "La RPC debe devolver un instante válido.",
);

const RpcFailureSchema = z
  .object({
    ok: z.literal(false),
    code: GameErrorCodeSchema,
  })
  .strict();

const StartGameSuccessSchema = z
  .object({
    ok: z.literal(true),
    sessionExpiresAt: TimestampSchema,
    idempotent: z.boolean(),
  })
  .strict();

const GameStateSuccessSchema = z
  .object({
    ok: z.literal(true),
    data: GameStateSchema,
  })
  .strict();

const SubmitAnswerSuccessSchema = z
  .object({
    ok: z.literal(true),
    data: z
      .object({
        accepted_new: z.boolean(),
        sessionExpiresAt: TimestampSchema,
      })
      .passthrough(),
  })
  .strict();

const AdvanceGameSuccessSchema = z
  .object({
    ok: z.literal(true),
    data: z
      .object({
        currentPosition: z.number().int().positive(),
      })
      .strict(),
  })
  .strict();

const FinalResultRpcDataSchema = z
  .object({
    alias: ValidatedAliasSchema,
    score: RoundScoreSchema,
    correctAnswers: z.number().int().nonnegative(),
    totalQuestions: RoundSizeSchema,
    scoringRule: AppliedScoringRuleSchema,
    finishedAt: TimestampSchema,
    resultAccessUntil: TimestampSchema,
    sessionStatus: z.literal("finished").optional(),
  })
  .passthrough();

const FinalResultSuccessSchema = z
  .object({
    ok: z.literal(true),
    data: FinalResultRpcDataSchema,
  })
  .strict();

const LeaderboardSuccessSchema = z
  .object({
    ok: z.literal(true),
    data: LeaderboardSnapshotSchema,
  })
  .strict();

function parseFailure(payload: Json): GatewayFailure | null {
  const parsed = RpcFailureSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}

function parseFinalResult(
  data: z.infer<typeof FinalResultRpcDataSchema>,
): FinalResult {
  return FinalResultSchema.parse({
    alias: data.alias,
    score: data.score,
    correctAnswers: data.correctAnswers,
    totalQuestions: data.totalQuestions,
    maxScore:
      data.totalQuestions * data.scoringRule.pointsPerCorrectAnswer,
    scoringRule: data.scoringRule,
    educationalClosingMessage: MVP_EDUCATIONAL_CLOSING_MESSAGE,
  });
}

function throwInvalidRpcPayload(operation: string): never {
  throw new Error(`${operation} RPC returned an invalid payload`);
}

function requirePayload(payload: Json | null, operation: string): Json {
  return payload ?? throwInvalidRpcPayload(operation);
}

function failureOrNull(payload: Json, operation: string): GatewayFailure | null {
  const failure = parseFailure(payload);
  if (failure) return failure;

  if (
    typeof payload === "object" &&
    payload !== null &&
    !Array.isArray(payload) &&
    payload.ok === false
  ) {
    throwInvalidRpcPayload(operation);
  }

  return null;
}

export class SupabaseGameGateway {
  constructor(private readonly client: ServerSupabaseClient) {}

  async startGame(
    alias: string,
    tokenHash: string,
    roundSize: number,
  ): Promise<GatewayResult<StartGameGatewayData>> {
    const { data, error } = await this.client.rpc("start_game", {
      p_alias: alias,
      p_token_hash: bytea(tokenHash),
      p_round_size: roundSize,
    });
    if (error) throw new Error("start_game RPC failed");

    const payload = requirePayload(data, "start_game");
    const failure = failureOrNull(payload, "start_game");
    if (failure) return failure;

    const success = StartGameSuccessSchema.parse(payload);
    return {
      ok: true,
      data: {
        sessionExpiresAt: new Date(success.sessionExpiresAt),
        idempotent: success.idempotent,
      },
    };
  }

  async getGameState(
    tokenHash: string,
  ): Promise<GatewayResult<GameState>> {
    const { data, error } = await this.client.rpc("get_game_state", {
      p_token_hash: bytea(tokenHash),
    });
    if (error) throw new Error("get_game_state RPC failed");

    const payload = requirePayload(data, "get_game_state");
    const failure = failureOrNull(payload, "get_game_state");
    if (failure) return failure;

    const success = GameStateSuccessSchema.parse(payload);
    return { ok: true, data: success.data };
  }

  async submitAnswer(
    tokenHash: string,
    questionRef: QuestionRef,
    optionRef: OptionRef,
  ): Promise<GatewayResult<SubmittedAnswerGatewayData>> {
    const { data, error } = await this.client.rpc("submit_answer", {
      p_token_hash: bytea(tokenHash),
      p_question_ref: questionRef,
      p_option_ref: optionRef,
    });
    if (error) throw new Error("submit_answer RPC failed");

    const payload = requirePayload(data, "submit_answer");
    const failure = failureOrNull(payload, "submit_answer");
    if (failure) return failure;

    const success = SubmitAnswerSuccessSchema.parse(payload);
    const {
      accepted_new: acceptedNew,
      sessionExpiresAt,
      correctOptionRef,
      ...answerFields
    } = success.data;
    const answer = AnswerResultSchema.parse(
      correctOptionRef === null
        ? answerFields
        : { ...answerFields, correctOptionRef },
    );

    return {
      ok: true,
      data: {
        answer,
        acceptedNew,
        sessionExpiresAt: new Date(sessionExpiresAt),
      },
    };
  }

  async advanceGame(
    tokenHash: string,
  ): Promise<GatewayResult<QuestionGameState>> {
    const { data, error } = await this.client.rpc("advance_game", {
      p_token_hash: bytea(tokenHash),
    });
    if (error) throw new Error("advance_game RPC failed");

    const payload = requirePayload(data, "advance_game");
    const failure = failureOrNull(payload, "advance_game");
    if (failure) return failure;
    AdvanceGameSuccessSchema.parse(payload);

    const nextState = await this.getGameState(tokenHash);
    if (!nextState.ok) return nextState;
    return {
      ok: true,
      data: QuestionGameStateSchema.parse(nextState.data),
    };
  }

  async finishGame(
    tokenHash: string,
  ): Promise<GatewayResult<FinalResultGatewayData>> {
    const { data, error } = await this.client.rpc("finish_game", {
      p_token_hash: bytea(tokenHash),
    });
    if (error) throw new Error("finish_game RPC failed");

    const payload = requirePayload(data, "finish_game");
    const failure = failureOrNull(payload, "finish_game");
    if (failure) return failure;

    const success = FinalResultSuccessSchema.parse(payload);
    return {
      ok: true,
      data: {
        result: parseFinalResult(success.data),
        resultAccessUntil: new Date(success.data.resultAccessUntil),
      },
    };
  }

  async getGameResult(
    tokenHash: string,
  ): Promise<GatewayResult<FinalResult>> {
    const { data, error } = await this.client.rpc("get_game_result", {
      p_token_hash: bytea(tokenHash),
    });
    if (error) throw new Error("get_game_result RPC failed");

    const payload = requirePayload(data, "get_game_result");
    const failure = failureOrNull(payload, "get_game_result");
    if (failure) return failure;

    const success = FinalResultSuccessSchema.parse(payload);
    return { ok: true, data: parseFinalResult(success.data) };
  }

  async getLeaderboard(
    tokenHash?: string,
  ): Promise<GatewayResult<LeaderboardSnapshot>> {
    const { data, error } = await this.client.rpc("get_leaderboard", {
      p_token_hash: tokenHash ? bytea(tokenHash) : null,
    });
    if (error) throw new Error("get_leaderboard RPC failed");

    const payload = requirePayload(data, "get_leaderboard");
    const failure = failureOrNull(payload, "get_leaderboard");
    if (failure) return failure;

    const success = LeaderboardSuccessSchema.parse(payload);
    return { ok: true, data: success.data };
  }
}

function bytea(hash: string): string {
  return `\\x${hash}`;
}

export function createGameGateway(
  client: ServerSupabaseClient,
): SupabaseGameGateway {
  return new SupabaseGameGateway(client);
}
