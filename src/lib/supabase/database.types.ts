export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type RpcDefinition<Args> = {
  Args: Args;
  Returns: Json;
};

export type Database = {
  api: {
    Tables: { [_ in never]: never };
    Views: { [_ in never]: never };
    Functions: {
      start_game: RpcDefinition<{
        p_alias: string;
        p_token_hash: string;
        p_round_size: number;
      }>;
      get_game_state: RpcDefinition<{
        p_token_hash: string;
      }>;
      submit_answer: RpcDefinition<{
        p_token_hash: string;
        p_question_ref: string;
        p_option_ref: string;
      }>;
      advance_game: RpcDefinition<{
        p_token_hash: string;
      }>;
      finish_game: RpcDefinition<{
        p_token_hash: string;
      }>;
      get_game_result: RpcDefinition<{
        p_token_hash: string;
      }>;
      get_leaderboard: RpcDefinition<{
        p_token_hash: string | null;
      }>;
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
