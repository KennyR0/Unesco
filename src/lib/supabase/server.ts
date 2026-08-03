import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { parseServerEnv } from "../env/server";
import type { Database } from "./database.types";

export type ServerSupabaseClient = SupabaseClient<Database, "private_arcade">;
export type LegacyApiSupabaseClient = SupabaseClient<Database, "api">;

function resolveSupabaseKey(
  source: Record<string, string | undefined>,
): { url: string; key: string } {
  const env = parseServerEnv(source);
  const key = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("Supabase server key is required");
  }
  return { url: env.SUPABASE_URL, key };
}

/** Cliente service_role contra private_arcade (path arcade actual). */
export function createServerSupabaseClient(
  source: Record<string, string | undefined> = process.env,
): ServerSupabaseClient {
  const { url, key } = resolveSupabaseKey(source);
  return createClient<Database, "private_arcade">(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    db: { schema: "private_arcade" },
  });
}

/** Cliente legacy api.* solo para ranking/RPC obsoletos. */
export function createLegacyApiSupabaseClient(
  source: Record<string, string | undefined> = process.env,
): LegacyApiSupabaseClient {
  const { url, key } = resolveSupabaseKey(source);
  return createClient<Database, "api">(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    db: { schema: "api" },
  });
}
