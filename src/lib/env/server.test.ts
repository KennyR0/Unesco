import { describe, expect, it } from "vitest";

import { parseServerEnv } from "./server";

const base = {
  SUPABASE_URL: "https://example.supabase.co",
  GAME_ROUND_SIZE: "5",
};

describe("parseServerEnv", () => {
  it("accepts exactly one private Supabase key", () => {
    expect(
      parseServerEnv({ ...base, SUPABASE_SECRET_KEY: "secret" }),
    ).toMatchObject({ GAME_ROUND_SIZE: 5 });
  });

  it("rejects missing or simultaneous private keys", () => {
    expect(() => parseServerEnv(base)).toThrow();
    expect(() =>
      parseServerEnv({
        ...base,
        SUPABASE_SECRET_KEY: "secret",
        SUPABASE_SERVICE_ROLE_KEY: "legacy",
      }),
    ).toThrow();
  });

  it("rejects an invalid URL and an out-of-contract round size", () => {
    expect(() =>
      parseServerEnv({
        ...base,
        SUPABASE_URL: "not-a-url",
        SUPABASE_SECRET_KEY: "secret",
      }),
    ).toThrow();
    expect(() =>
      parseServerEnv({
        ...base,
        GAME_ROUND_SIZE: "11",
        SUPABASE_SECRET_KEY: "secret",
      }),
    ).toThrow();
  });
});
