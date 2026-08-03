import type { ImageVerdict } from "./mechanics/image-verdict";

export const REAL_O_IA_SESSION_ITEM_COUNT = 8;

export type RealOrIaRatio = Readonly<{
  ai: number;
  real: number;
}>;

/** Ratios rotativos por partida (siempre suman 8). */
export const REAL_O_IA_RATIO_CYCLE: readonly RealOrIaRatio[] = Object.freeze([
  Object.freeze({ ai: 5, real: 3 }),
  Object.freeze({ ai: 3, real: 5 }),
  Object.freeze({ ai: 4, real: 4 }),
]);

export type RealOrIaPoolItem = Readonly<{
  itemId: string;
  verdict: ImageVerdict;
}>;

export function ratioForSessionStart(sessionStartCount: number): RealOrIaRatio {
  const index =
    ((sessionStartCount % REAL_O_IA_RATIO_CYCLE.length) +
      REAL_O_IA_RATIO_CYCLE.length) %
    REAL_O_IA_RATIO_CYCLE.length;
  return REAL_O_IA_RATIO_CYCLE[index]!;
}

function sampleWithoutReplacement<T>(
  items: readonly T[],
  count: number,
  random: () => number,
): T[] {
  if (count > items.length) {
    throw new Error(
      `CONTENT_UNAVAILABLE: se pidieron ${count} items y solo hay ${items.length}.`,
    );
  }
  const pool = [...items];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = pool[index]!;
    pool[index] = pool[swapIndex]!;
    pool[swapIndex] = current;
  }
  return pool.slice(0, count);
}

function shuffleInPlace<T>(items: T[], random: () => number): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = items[index]!;
    items[index] = items[swapIndex]!;
    items[swapIndex] = current;
  }
  return items;
}

/**
 * Elige 8 items del pool con ratio rotativo y orden mezclado.
 */
export function pickRealOrIaSessionItemIds(input: {
  pool: readonly RealOrIaPoolItem[];
  sessionStartCount: number;
  random?: () => number;
}): readonly string[] {
  const random = input.random ?? Math.random;
  const ratio = ratioForSessionStart(input.sessionStartCount);
  const aiPool = input.pool.filter((item) => item.verdict === "ai");
  const realPool = input.pool.filter((item) => item.verdict === "real");

  const picked = [
    ...sampleWithoutReplacement(aiPool, ratio.ai, random),
    ...sampleWithoutReplacement(realPool, ratio.real, random),
  ];

  return Object.freeze(
    shuffleInPlace(
      picked.map((item) => item.itemId),
      random,
    ),
  );
}
