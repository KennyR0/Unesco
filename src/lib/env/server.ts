import "server-only";

import { RoundSizeSchema } from "@antidoto/contracts";
import { z } from "zod";

const PublicSupabasePrivateKeyNames = [
  "NEXT_PUBLIC_SUPABASE_SECRET_KEY",
  "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE",
] as const;

const ServerEnvSchema = z
  .object({
    SUPABASE_URL: z.string().url(),
    SUPABASE_SECRET_KEY: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().min(1).optional(),
    ),
    SUPABASE_SERVICE_ROLE_KEY: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().min(1).optional(),
    ),
    GAME_ROUND_SIZE: z.preprocess(
      (value) => (value === undefined || value === "" ? 5 : Number(value)),
      RoundSizeSchema,
    ),
  })
  .superRefine((value, context) => {
    const keys = [value.SUPABASE_SECRET_KEY, value.SUPABASE_SERVICE_ROLE_KEY].filter(
      Boolean,
    );
    if (keys.length !== 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SUPABASE_SECRET_KEY"],
        message: "Define exactamente una clave privada de Supabase.",
      });
    }
  });

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export function parseServerEnv(
  source: Record<string, string | undefined> = process.env,
): ServerEnv {
  const publicPrivateKey = PublicSupabasePrivateKeyNames.find((name) =>
    source[name]?.trim(),
  );

  if (publicPrivateKey) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        path: [publicPrivateKey],
        message:
          "Las claves privadas de Supabase deben permanecer server-only; no uses NEXT_PUBLIC_ para ellas.",
      },
    ]);
  }

  return ServerEnvSchema.parse(source);
}
