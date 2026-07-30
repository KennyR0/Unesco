import type { SupabaseClient } from "@supabase/supabase-js";

import type { ServerSupabaseClient } from "../../../lib/supabase/server";

export type GatewayResponse = Readonly<Record<string, unknown>>;

function bytea(hash: string): string {
  return `\\x${hash}`;
}

export class SupabaseGameGateway {
  constructor(private readonly client: SupabaseClient<any, any, any>) {}

  async startGame(alias: string, tokenHash: string, roundSize: number): Promise<GatewayResponse> {
    const { data, error } = await this.client.rpc("start_game", { p_alias: alias, p_token_hash: bytea(tokenHash), p_round_size: roundSize });
    if (error) throw new Error("start_game RPC failed");
    return data as GatewayResponse;
  }

  async getGameState(tokenHash: string): Promise<GatewayResponse> {
    const { data, error } = await this.client.rpc("get_game_state", { p_token_hash: bytea(tokenHash) });
    if (error) throw new Error("get_game_state RPC failed");
    return data as GatewayResponse;
  }

  async submitAnswer(tokenHash: string, questionRef: string, optionRef: string): Promise<GatewayResponse> {
    const { data, error } = await this.client.rpc("submit_answer", { p_token_hash: bytea(tokenHash), p_question_ref: questionRef, p_option_ref: optionRef });
    if (error) throw new Error("submit_answer RPC failed");
    return data as GatewayResponse;
  }

  async advanceGame(tokenHash: string): Promise<GatewayResponse> {
    const { data, error } = await this.client.rpc("advance_game", { p_token_hash: bytea(tokenHash) });
    if (error) throw new Error("advance_game RPC failed");
    return data as GatewayResponse;
  }

  async finishGame(tokenHash: string): Promise<GatewayResponse> {
    const { data, error } = await this.client.rpc("finish_game", { p_token_hash: bytea(tokenHash) });
    if (error) throw new Error("finish_game RPC failed");
    return data as GatewayResponse;
  }

  async getGameResult(tokenHash: string): Promise<GatewayResponse> {
    const { data, error } = await this.client.rpc("get_game_result", { p_token_hash: bytea(tokenHash) });
    if (error) throw new Error("get_game_result RPC failed");
    return data as GatewayResponse;
  }

  async getLeaderboard(tokenHash?: string): Promise<GatewayResponse> {
    const { data, error } = await this.client.rpc("get_leaderboard", { p_token_hash: tokenHash ? bytea(tokenHash) : null });
    if (error) throw new Error("get_leaderboard RPC failed");
    return data as GatewayResponse;
  }
}

export function createGameGateway(client: ServerSupabaseClient): SupabaseGameGateway {
  return new SupabaseGameGateway(client);
}
