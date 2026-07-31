import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { parseServerEnv } from "../env/server";
import type { Database } from "./database.types";

export type ServerSupabaseClient = SupabaseClient<Database, "api">;

export function createServerSupabaseClient(
  source: Record<string, string | undefined> = process.env,
): ServerSupabaseClient {
  const env = parseServerEnv(source);
  const key = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("Supabase server key is required");
  }
  return createClient<Database, "api">(env.SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    db: { schema: "api" },
  });
}
