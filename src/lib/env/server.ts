import "server-only";

import { RoundSizeSchema } from "@antidoto/contracts";
import { z } from "zod";

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
  return ServerEnvSchema.parse(source);
}
