import { describe, expect, it } from "vitest";

import { createServerSupabaseClient } from "./server";

const base = {
  SUPABASE_URL: "http://127.0.0.1:54321",
  SUPABASE_SECRET_KEY: "secret",
  SUPABASE_SERVICE_ROLE_KEY: "",
  GAME_ROUND_SIZE: "5",
};

describe("cliente Supabase server-only", () => {
  it("usa la clave privada preferida y esquema private_arcade", () => {
    const client = createServerSupabaseClient(base);
    expect(client).toBeDefined();
    expect(client.from).toBeTypeOf("function");
  });

  it("rechaza variables privadas ausentes o simultáneas", () => {
    expect(() => createServerSupabaseClient({ ...base, SUPABASE_SECRET_KEY: "", SUPABASE_SERVICE_ROLE_KEY: "" })).toThrow();
    expect(() => createServerSupabaseClient({ ...base, SUPABASE_SERVICE_ROLE_KEY: "legacy" })).toThrow();
  });
});
