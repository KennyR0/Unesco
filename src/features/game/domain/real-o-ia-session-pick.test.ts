import { describe, expect, it } from "vitest";

import {
  pickRealOrIaSessionItemIds,
  ratioForSessionStart,
  REAL_O_IA_RATIO_CYCLE,
  REAL_O_IA_SESSION_ITEM_COUNT,
  type RealOrIaPoolItem,
} from "./real-o-ia-session-pick";

function buildPool(): RealOrIaPoolItem[] {
  return [
    ...Array.from({ length: 10 }, (_, index) => ({
      itemId: `ai-${String(index + 1).padStart(2, "0")}`,
      verdict: "ai" as const,
    })),
    ...Array.from({ length: 10 }, (_, index) => ({
      itemId: `real-${String(index + 1).padStart(2, "0")}`,
      verdict: "real" as const,
    })),
  ];
}

describe("pickRealOrIaSessionItemIds", () => {
  it("rota los ratios 5-3, 3-5 y 4-4", () => {
    expect(ratioForSessionStart(0)).toEqual({ ai: 5, real: 3 });
    expect(ratioForSessionStart(1)).toEqual({ ai: 3, real: 5 });
    expect(ratioForSessionStart(2)).toEqual({ ai: 4, real: 4 });
    expect(ratioForSessionStart(3)).toEqual({ ai: 5, real: 3 });
    expect(REAL_O_IA_RATIO_CYCLE).toHaveLength(3);
  });

  it("elige exactamente 8 items respetando el ratio de la partida", () => {
    const pool = buildPool();
    const ids = pickRealOrIaSessionItemIds({
      pool,
      sessionStartCount: 0,
      random: () => 0.42,
    });

    expect(ids).toHaveLength(REAL_O_IA_SESSION_ITEM_COUNT);
    const aiCount = ids.filter((id) => id.startsWith("ai-")).length;
    const realCount = ids.filter((id) => id.startsWith("real-")).length;
    expect(aiCount).toBe(5);
    expect(realCount).toBe(3);
    expect(new Set(ids).size).toBe(8);
  });

  it("usa 3 IA y 5 reales en la segunda partida del ciclo", () => {
    const ids = pickRealOrIaSessionItemIds({
      pool: buildPool(),
      sessionStartCount: 1,
      random: () => 0.11,
    });
    expect(ids.filter((id) => id.startsWith("ai-"))).toHaveLength(3);
    expect(ids.filter((id) => id.startsWith("real-"))).toHaveLength(5);
  });
});
