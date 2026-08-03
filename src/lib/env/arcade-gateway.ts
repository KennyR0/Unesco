import "server-only";

import { z } from "zod";

const ArcadeGatewayModeSchema = z.enum(["memory", "supabase"]);

export type ArcadeGatewayMode = z.infer<typeof ArcadeGatewayModeSchema>;

/**
 * Selector runtime del puerto arcade. Default memory; supabase requiere
 * SUPABASE_* válidos al construir el cliente.
 */
export function resolveArcadeGatewayMode(
  source: Record<string, string | undefined> = process.env,
): ArcadeGatewayMode {
  const raw = source.ARCADE_GATEWAY?.trim();
  if (!raw) return "memory";
  return ArcadeGatewayModeSchema.parse(raw);
}
