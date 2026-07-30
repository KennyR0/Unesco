import { ROUND_SIZE_CONTRACT, SCORING_RULE_CONTRACT, type RoundSize } from "@antidoto/contracts";

export function scoreAnswer(isCorrect: boolean): number {
  return isCorrect ? SCORING_RULE_CONTRACT.pointsPerCorrectAnswer : SCORING_RULE_CONTRACT.pointsPerIncorrectAnswer;
}

export function maxScore(roundSize: RoundSize): number {
  return roundSize * SCORING_RULE_CONTRACT.pointsPerCorrectAnswer;
}

export function isRoundSize(value: number): value is RoundSize {
  return Number.isInteger(value) && value >= ROUND_SIZE_CONTRACT.minimum && value <= ROUND_SIZE_CONTRACT.maximum;
}
