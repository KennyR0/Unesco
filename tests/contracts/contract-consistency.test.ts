import { describe, expect, it } from "vitest";

import {
  GameErrorCodeSchema,
  ROUND_SIZE_CONTRACT,
  RoundScoreSchema,
  SCORING_RULE_CONTRACT,
} from "@antidoto/contracts";

describe("consistencia del contrato", () => {
  it("mantiene códigos de error y regla de puntuación versionada", () => {
    expect(GameErrorCodeSchema.options).toEqual([
      "INVALID_ALIAS",
      "BLOCKED_ALIAS",
      "SESSION_NOT_FOUND",
      "SESSION_FINISHED",
      "SESSION_INVALID",
      "QUESTIONS_UNAVAILABLE",
      "QUESTION_NOT_ASSIGNED",
      "QUESTION_ALREADY_ANSWERED",
      "OPTION_NOT_SELECTED",
      "OPTION_NOT_ALLOWED",
      "ANSWER_SAVE_FAILED",
      "GAME_START_FAILED",
      "ADVANCE_NOT_ALLOWED",
      "GAME_NOT_COMPLETE",
      "GAME_FINISH_FAILED",
      "RESULT_NOT_AVAILABLE",
      "RESULT_ACCESS_EXPIRED",
      "RANKING_UNAVAILABLE",
      "UNEXPECTED_ERROR",
    ]);
    expect(SCORING_RULE_CONTRACT.speedBonus).toBe(false);
    expect(SCORING_RULE_CONTRACT.pointsPerCorrectAnswer).toBe(100);
  });

  it("deriva la envolvente de puntuación del contrato, sin máximo independiente", () => {
    expect(ROUND_SIZE_CONTRACT.production).toBe(5);
    expect(RoundScoreSchema.safeParse(ROUND_SIZE_CONTRACT.maximum * 100).success).toBe(true);
    expect(RoundScoreSchema.safeParse(ROUND_SIZE_CONTRACT.maximum * 100 + 100).success).toBe(false);
  });
});
