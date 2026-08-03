/**
 * Puntuación educativa de Feed 60” (scoring-proposal aprobada).
 * +2 decisión adecuada, -1 inadecuada, +1 si la adecuada sigue a verify;
 * el total de sesión se acota a piso 0 y máximo 30.
 */

export const FEED_ITEM_COUNT = 10;
export const FEED_MAX_POINTS = 30;
export const FEED_MIN_POINTS = 0;
export const FEED_CORRECT_POINTS = 2;
export const FEED_VERIFY_BONUS = 1;
export const FEED_INCORRECT_PENALTY = 1;

export type FeedDecisionScore = Readonly<{
  points: number;
  bonusPoints: number;
  penaltyPoints: number;
}>;

export type FeedDecisionAnswer = Readonly<{
  decisionCorrect: boolean;
  verified: boolean;
}>;

export type FeedSessionScore = Readonly<{
  points: number;
  maxPoints: typeof FEED_MAX_POINTS;
  correct: number;
  errors: number;
  bonusPoints: number;
  penaltyPoints: number;
  rawPoints: number;
}>;

/**
 * Puntúa una decisión final: +2 (+1 verify) o -1.
 * No aplica el piso ni el techo de sesión.
 */
export function scoreFeedDecision(
  decisionCorrect: boolean,
  verified: boolean,
): FeedDecisionScore {
  if (!decisionCorrect) {
    return {
      points: -FEED_INCORRECT_PENALTY,
      bonusPoints: 0,
      penaltyPoints: FEED_INCORRECT_PENALTY,
    };
  }

  return {
    points: FEED_CORRECT_POINTS + (verified ? FEED_VERIFY_BONUS : 0),
    bonusPoints: verified ? FEED_VERIFY_BONUS : 0,
    penaltyPoints: 0,
  };
}

/**
 * Agrega las decisiones de la partida y aplica piso 0 / máximo 30.
 * El cliente no aporta puntos; solo el servidor llama esta fórmula.
 */
export function calculateFeedSessionScore(
  answers: readonly FeedDecisionAnswer[],
): FeedSessionScore {
  let rawPoints = 0;
  let correct = 0;
  let bonusPoints = 0;
  let penaltyPoints = 0;

  for (const answer of answers) {
    const decisionScore = scoreFeedDecision(
      answer.decisionCorrect,
      answer.verified,
    );
    rawPoints += decisionScore.points;
    bonusPoints += decisionScore.bonusPoints;
    penaltyPoints += decisionScore.penaltyPoints;
    if (answer.decisionCorrect) {
      correct += 1;
    }
  }

  return {
    points: Math.max(
      FEED_MIN_POINTS,
      Math.min(rawPoints, FEED_MAX_POINTS),
    ),
    maxPoints: FEED_MAX_POINTS,
    correct,
    errors: answers.length - correct,
    bonusPoints,
    penaltyPoints,
    rawPoints,
  };
}
