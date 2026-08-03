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

type GenericTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

/**
 * Tipos mínimos del esquema arcade privado.
 * El path legacy `api.*` se conserva solo para el gateway obsoleto de ranking.
 */
export type Database = {
  private_arcade: {
    Tables: {
      game_catalog: GenericTable;
      game_items: GenericTable;
      item_media: GenericTable;
      item_feedback: GenericTable;
      item_solution_private: GenericTable;
      game_sessions: {
        Row: {
          session_id: string;
          game_code: string;
          alias: string;
          alias_normalized: string;
          status: string;
          started_at: string;
          expires_at: string | null;
          last_activity_at: string;
          closed_at: string | null;
          purge_after: string | null;
          result_access_until: string | null;
          session_token_hash: string | null;
          runtime_snapshot: Json;
          position: number;
          total: number;
          mechanic: string | null;
        };
        Insert: {
          session_id?: string;
          game_code: string;
          alias: string;
          alias_normalized: string;
          status?: string;
          started_at?: string;
          expires_at?: string | null;
          last_activity_at?: string;
          closed_at?: string | null;
          purge_after?: string | null;
          result_access_until?: string | null;
          session_token_hash?: string | null;
          runtime_snapshot?: Json;
          position?: number;
          total?: number;
          mechanic?: string | null;
        };
        Update: {
          status?: string;
          expires_at?: string | null;
          last_activity_at?: string;
          closed_at?: string | null;
          purge_after?: string | null;
          result_access_until?: string | null;
          session_token_hash?: string | null;
          runtime_snapshot?: Json;
          position?: number;
          total?: number;
          mechanic?: string | null;
          alias?: string;
          alias_normalized?: string;
        };
        Relationships: [];
      };
      session_items: GenericTable;
      player_answers: GenericTable;
      game_results: GenericTable;
      leaderboard_projection: GenericTable;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
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
