import { describe, expect, it } from "vitest";

import { maxScore, scoreAnswer } from "./scoring";

describe("regla de puntuación", () => {
  it("otorga 100 por acierto y cero por error", () => {
    expect(scoreAnswer(true)).toBe(100);
    expect(scoreAnswer(false)).toBe(0);
  });

  it("deriva el máximo del tamaño persistido de ronda", () => {
    expect(maxScore(1 as never)).toBe(100);
    expect(maxScore(5 as never)).toBe(500);
    expect(maxScore(10 as never)).toBe(1000);
  });
});
