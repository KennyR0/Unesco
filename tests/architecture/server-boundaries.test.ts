import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const forbiddenImport = /(?:src\/lib\/supabase\/server|src\/lib\/env\/server|server-only|@supabase\/supabase-js)/;

async function assertClientBoundary(source: string): Promise<void> {
  const firstDirective = source.trimStart().split(/\r?\n/, 1)[0];
  expect(firstDirective).toBe('"use client";');
  expect(source).not.toMatch(forbiddenImport);
}

describe("fronteras servidor/cliente", () => {
  it("permite el fixture cliente sin imports privados", async () => {
    await assertClientBoundary(await readFile("tests/fixtures/client-imports-supabase.tsx", "utf8"));
  });

  it("detecta un import privado en aislamiento", async () => {
    const source = `${await readFile("tests/fixtures/client-imports-supabase.tsx", "utf8")}\nimport "src/lib/supabase/server";`;
    expect(() => {
      if (forbiddenImport.test(source)) throw new Error("client boundary violation");
    }).toThrow(/client boundary violation/);
  });
});
