import {
  LEADERBOARD_LIMIT,
  type GameCode,
  type GameScore,
  type Leaderboard,
  type LeaderboardEntry,
} from "@antidoto/contracts";

export const GAME_SCORE_RULES = {
  "real-o-ia": {
    itemCount: 8,
    maxPoints: 80,
    timeLimitSeconds: null,
  },
  grupo: {
    itemCount: 6,
    maxPoints: 12,
    timeLimitSeconds: null,
  },
  "clickbait-swipe": {
    itemCount: 12,
    maxPoints: 16,
    timeLimitSeconds: null,
  },
  "radar-de-fuentes": {
    itemCount: 9,
    maxPoints: 9,
    timeLimitSeconds: null,
  },
  "feed-60": {
    itemCount: 10,
    maxPoints: 30,
    timeLimitSeconds: 60,
  },
  "mente-maestra": {
    itemCount: 4,
    maxPoints: 4,
    timeLimitSeconds: null,
  },
} as const satisfies Record<
  GameCode,
  Readonly<{
    itemCount: number;
    maxPoints: number;
    timeLimitSeconds: number | null;
  }>
>;

export type GroupDecisionOutcome = "protective" | "partial" | "harmful";

export type GameScoreInput =
  | Readonly<{
      gameCode: "real-o-ia";
      answers: readonly Readonly<{ correct: boolean }>[];
    }>
  | Readonly<{
      gameCode: "grupo";
      answers: readonly Readonly<{ outcome: GroupDecisionOutcome }>[];
    }>
  | Readonly<{
      gameCode: "clickbait-swipe";
      answers: readonly Readonly<{ correct: boolean }>[];
    }>
  | Readonly<{
      gameCode: "radar-de-fuentes";
      answers: readonly Readonly<{ correct: boolean }>[];
    }>
  | Readonly<{
      gameCode: "feed-60";
      answers: readonly Readonly<{
        decisionCorrect: boolean;
        verified: boolean;
      }>[];
      timeUsedSeconds?: number | null;
    }>
  | Readonly<{
      gameCode: "mente-maestra";
      answers: readonly Readonly<{ completed: boolean }>[];
    }>;

export type RankingCandidate = Readonly<{
  /** Internal server identifier used only for deterministic tie-breaking. */
  resultId: string;
  gameCode: GameCode;
  alias: string;
  status: "finished" | "expired";
  answered: number;
  total: number;
  points: number;
  maxPoints: number;
  completedAt: string;
  aliasAllowed: boolean;
  abuseMarked: boolean;
  invalidMarked: boolean;
}>;

export type FeedDecisionScore = Readonly<{
  points: number;
  bonusPoints: number;
  penaltyPoints: number;
}>;

export function maxPointsForGame(gameCode: GameCode): number {
  return GAME_SCORE_RULES[gameCode].maxPoints;
}

export function scoreRealOrAiAnswer(correct: boolean): number {
  return correct ? 10 : 0;
}

export function scoreGroupDecision(outcome: GroupDecisionOutcome): number {
  switch (outcome) {
    case "protective":
      return 2;
    case "partial":
      return 1;
    case "harmful":
      return 0;
  }
}

export function scoreClickbaitAnswer(correct: boolean): number {
  return correct ? 1 : 0;
}

export function scoreSourceClassification(correct: boolean): number {
  return correct ? 1 : 0;
}

export function scoreFeedDecision(
  decisionCorrect: boolean,
  verified: boolean,
): FeedDecisionScore {
  if (!decisionCorrect) {
    return { points: -1, bonusPoints: 0, penaltyPoints: 1 };
  }

  return {
    points: 2 + (verified ? 1 : 0),
    bonusPoints: verified ? 1 : 0,
    penaltyPoints: 0,
  };
}

export function scoreAutopsyStep(completed: boolean): number {
  return completed ? 1 : 0;
}

function emptyScore(gameCode: GameCode): GameScore {
  return {
    points: 0,
    maxPoints: maxPointsForGame(gameCode),
    correct: 0,
    errors: 0,
    bonusPoints: 0,
    penaltyPoints: 0,
    timeLimitSeconds: GAME_SCORE_RULES[gameCode].timeLimitSeconds,
    timeUsedSeconds: null,
  };
}

function ensureFeedTime(value: number | null | undefined): number | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (!Number.isFinite(value) || value < 0 || value > 60) {
    throw new RangeError("timeUsedSeconds debe estar entre 0 y 60 segundos.");
  }
  return value;
}

export function calculateGameScore(input: GameScoreInput): GameScore {
  const score = emptyScore(input.gameCode);

  switch (input.gameCode) {
    case "real-o-ia": {
      const correct = input.answers.filter((answer) => answer.correct).length;
      score.correct = correct;
      score.errors = input.answers.length - correct;
      score.points = input.answers.reduce(
        (total, answer) => total + scoreRealOrAiAnswer(answer.correct),
        0,
      );
      return score;
    }
    case "grupo": {
      score.correct = null;
      score.errors = input.answers.filter(
        (answer) => answer.outcome === "harmful",
      ).length;
      score.points = input.answers.reduce(
        (total, answer) => total + scoreGroupDecision(answer.outcome),
        0,
      );
      return score;
    }
    case "clickbait-swipe": {
      let streak = 0;
      let bonusPoints = 0;
      let points = 0;
      let correct = 0;

      for (const answer of input.answers) {
        points += scoreClickbaitAnswer(answer.correct);
        if (!answer.correct) {
          streak = 0;
          continue;
        }

        correct += 1;
        streak += 1;
        if (streak % 3 === 0 && bonusPoints < 4) {
          bonusPoints += 1;
          points += 1;
        }
      }

      score.points = Math.min(points, score.maxPoints);
      score.correct = correct;
      score.errors = input.answers.length - correct;
      score.bonusPoints = bonusPoints;
      return score;
    }
    case "radar-de-fuentes": {
      const correct = input.answers.filter((answer) => answer.correct).length;
      score.correct = correct;
      score.errors = input.answers.length - correct;
      score.points = input.answers.reduce(
        (total, answer) => total + scoreSourceClassification(answer.correct),
        0,
      );
      return score;
    }
    case "feed-60": {
      let points = 0;
      let correct = 0;
      let bonusPoints = 0;
      let penaltyPoints = 0;

      for (const answer of input.answers) {
        const decisionScore = scoreFeedDecision(
          answer.decisionCorrect,
          answer.verified,
        );
        points += decisionScore.points;
        bonusPoints += decisionScore.bonusPoints;
        penaltyPoints += decisionScore.penaltyPoints;
        if (answer.decisionCorrect) {
          correct += 1;
        }
      }

      score.points = Math.max(0, Math.min(points, score.maxPoints));
      score.correct = correct;
      score.errors = input.answers.length - correct;
      score.bonusPoints = bonusPoints;
      score.penaltyPoints = penaltyPoints;
      score.timeUsedSeconds = ensureFeedTime(input.timeUsedSeconds);
      return score;
    }
    case "mente-maestra": {
      const completed = input.answers.filter((answer) => answer.completed).length;
      score.points = completed;
      score.correct = completed;
      score.errors = input.answers.length - completed;
      return score;
    }
  }
}

export function calculateRankingScore(
  points: number,
  maxPoints: number,
): number | null {
  if (
    !Number.isFinite(points) ||
    !Number.isFinite(maxPoints) ||
    maxPoints <= 0
  ) {
    return null;
  }

  return Math.min(100, Math.max(0, Math.round((points / maxPoints) * 100)));
}

export function isRankingEligible(candidate: RankingCandidate): boolean {
  return (
    candidate.status === "finished" &&
    candidate.answered === candidate.total &&
    candidate.total > 0 &&
    candidate.aliasAllowed &&
    !candidate.abuseMarked &&
    !candidate.invalidMarked &&
    candidate.resultId.trim().length > 0 &&
    Number.isFinite(candidate.points) &&
    Number.isFinite(candidate.maxPoints) &&
    candidate.maxPoints > 0 &&
    candidate.points >= 0 &&
    candidate.points <= candidate.maxPoints &&
    Number.isFinite(Date.parse(candidate.completedAt))
  );
}

type RankedCandidate = Readonly<{
  candidate: RankingCandidate;
  rankingScore: number;
}>;

export function rankLeaderboard(
  candidates: readonly RankingCandidate[],
): readonly LeaderboardEntry[] {
  const ranked: RankedCandidate[] = [];

  for (const candidate of candidates) {
    if (!isRankingEligible(candidate)) {
      continue;
    }

    const rankingScore = calculateRankingScore(
      candidate.points,
      candidate.maxPoints,
    );
    if (rankingScore === null) {
      continue;
    }

    ranked.push({ candidate, rankingScore });
  }

  ranked.sort((left, right) => {
    const scoreDifference = right.rankingScore - left.rankingScore;
    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    const dateDifference =
      Date.parse(left.candidate.completedAt) -
      Date.parse(right.candidate.completedAt);
    if (dateDifference !== 0) {
      return dateDifference;
    }

    return left.candidate.resultId.localeCompare(right.candidate.resultId);
  });

  return ranked.slice(0, LEADERBOARD_LIMIT).map(({ candidate, rankingScore }, index) => ({
    rank: index + 1,
    gameCode: candidate.gameCode,
    alias: candidate.alias,
    points: candidate.points,
    maxPoints: candidate.maxPoints,
    rankingScore,
    completedAt: candidate.completedAt,
  }));
}

export function buildLeaderboard(
  candidates: readonly RankingCandidate[],
): Leaderboard {
  return {
    scope: "global",
    entries: rankLeaderboard(candidates),
    limit: LEADERBOARD_LIMIT,
  };
}
