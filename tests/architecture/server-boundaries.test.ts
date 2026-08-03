import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { createMemoryArcadeGateway } from "../../src/features/game/infrastructure/memory-arcade-gateway";
import {
  startGameOperation,
  submitGameActionOperation,
} from "../../src/features/game/application/game-operations";

const forbiddenImport = /(?:src\/lib\/supabase\/server|src\/lib\/env\/server|server-only|@supabase\/supabase-js)/;
const forbiddenClientAuthority =
  /(?:SUPABASE_(?:SECRET|SERVICE_ROLE)|NEXT_PUBLIC_SUPABASE_(?:SECRET|SERVICE_ROLE)|process\.env|\bcookies\s*\()/;

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

  it("mantiene el transporte arcade como frontera server-only", async () => {
    const files = [
      "src/features/game/application/server-operations.ts",
      "src/features/game/application/submit-game-action.ts",
      "src/features/game/application/game-operations.ts",
      "src/app/actions/game.ts",
    ];
    for (const file of files) {
      const source = await readFile(file, "utf8");
      expect(source.includes('"use client"')).toBe(false);
      expect(
        source.startsWith("import \"server-only\"") ||
          source.startsWith("\"use server\""),
      ).toBe(true);
    }
  });

  it("mantiene secretos, cookies y cliente Supabase fuera de los componentes cliente", async () => {
    const files = [
      "src/components/games/real-o-ia-game.tsx",
      "src/components/games/group-game.tsx",
      "src/components/games/clickbait-swipe-game.tsx",
      "src/components/games/source-radar-game.tsx",
      "src/components/games/feed-60-game.tsx",
      "src/components/games/misinformation-autopsy-game.tsx",
      "src/components/game/grupo-play-session.tsx",
    ];

    for (const file of files) {
      const source = await readFile(file, "utf8");
      expect(source.trimStart().startsWith('"use client";')).toBe(true);
      expect(source).not.toMatch(forbiddenClientAuthority);
    }
  });

  it("resuelve la pertenencia del item en el servidor y no acepta score enviado", async () => {
    const gateway = createMemoryArcadeGateway();
    const started = await startGameOperation(
      { alias: "Ana", gameCode: "real-o-ia" },
      { gateway, sessionTokenHash: "a".repeat(64) },
    );
    expect(started.ok).toBe(true);
    if (!started.ok) return;

    const foreignItem = await submitGameActionOperation(
      {
        sessionId: started.data.sessionId,
        gameCode: "real-o-ia",
        itemId: "item-owned-by-another-session",
        input: { kind: "verdict", value: "real" },
      },
      { gateway },
    );
    expect(foreignItem).toMatchObject({
      ok: false,
      error: { code: "ITEM_NOT_IN_SESSION" },
    });

    const forgedScore = await submitGameActionOperation(
      {
        sessionId: started.data.sessionId,
        gameCode: "real-o-ia",
        itemId: "item-1",
        input: { kind: "verdict", value: "real" },
        score: 100,
      },
      { gateway },
    );
    expect(forgedScore).toMatchObject({
      ok: false,
      error: { code: "INVALID_ACTION" },
    });
  });
});
