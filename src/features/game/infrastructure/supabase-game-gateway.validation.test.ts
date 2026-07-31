import { describe, expect, it, vi } from "vitest";

import {
  OptionRefSchema,
  QuestionRefSchema,
} from "@antidoto/contracts";

import { SupabaseGameGateway } from "./supabase-game-gateway";

const questionRef = QuestionRefSchema.parse("Q000000000000000000001");
const firstOptionRef = OptionRefSchema.parse("O000000000000000000001");
const secondOptionRef = OptionRefSchema.parse("O000000000000000000002");
const timestamp = "2026-07-31T00:00:00.000Z";

const questionState = {
  view: "question",
  sessionStatus: "in_progress",
  alias: "Ana",
  questionStatus: "pending",
  progress: {
    currentQuestion: 2,
    totalQuestions: 5,
    answeredQuestions: 1,
  },
  question: {
    ref: questionRef,
    mechanic: "single_choice",
    prompt: "¿Qué conviene revisar antes de compartir?",
    image: null,
    options: [
      { ref: firstOptionRef, label: "La fuente", position: 1 },
      { ref: secondOptionRef, label: "Los me gusta", position: 2 },
    ],
  },
};

const scoringRule = {
  version: "single-choice-100-v1",
  pointsPerCorrectAnswer: 100,
  pointsPerIncorrectAnswer: 0,
  speedBonus: false,
};

describe("validación contractual del gateway", () => {
  it("valida GameState y rechaza metadatos privados añadidos", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        ok: true,
        data: { ...questionState, sessionExpiresAt: timestamp },
      },
      error: null,
    });
    const gateway = new SupabaseGameGateway({ rpc } as never);

    await expect(gateway.getGameState("a".repeat(64))).rejects.toThrow();
  });

  it("separa metadatos internos y devuelve AnswerResult estricto", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        ok: true,
        data: {
          accepted_new: true,
          sessionExpiresAt: timestamp,
          questionRef,
          selectedOptionRef: firstOptionRef,
          correctOptionRef: secondOptionRef,
          outcome: "incorrect",
          pointsAwarded: 0,
          feedback: {
            explanation: "Comprueba la fuente original.",
            signals: ["Falta autoría verificable"],
            recommendation: "Busca una segunda fuente confiable.",
          },
          progress: {
            currentQuestion: 1,
            totalQuestions: 5,
            answeredQuestions: 1,
          },
        },
      },
      error: null,
    });
    const gateway = new SupabaseGameGateway({ rpc } as never);

    const result = await gateway.submitAnswer(
      "a".repeat(64),
      questionRef,
      firstOptionRef,
    );

    expect(result).toMatchObject({
      ok: true,
      data: {
        acceptedNew: true,
        sessionExpiresAt: new Date(timestamp),
        answer: {
          outcome: "incorrect",
          correctOptionRef: secondOptionRef,
        },
      },
    });
    expect(JSON.stringify(result)).not.toContain("accepted_new");
  });

  it("proyecta FinalResult sin fechas internas", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        ok: true,
        data: {
          alias: "Ana",
          score: 100,
          correctAnswers: 1,
          totalQuestions: 5,
          scoringRule,
          finishedAt: timestamp,
          resultAccessUntil: "2026-08-07T00:00:00.000Z",
          sessionStatus: "finished",
        },
      },
      error: null,
    });
    const gateway = new SupabaseGameGateway({ rpc } as never);

    const result = await gateway.finishGame("a".repeat(64));

    expect(result).toMatchObject({
      ok: true,
      data: {
        result: {
          alias: "Ana",
          score: 100,
          maxScore: 500,
          scoringRule,
        },
        resultAccessUntil: new Date("2026-08-07T00:00:00.000Z"),
      },
    });
    if (result.ok) {
      expect(result.data.result).not.toHaveProperty("finishedAt");
      expect(result.data.result).not.toHaveProperty("resultAccessUntil");
      expect(result.data.result).not.toHaveProperty("sessionStatus");
    }
  });

  it("valida la instantánea del ranking y rechaza UUID", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        ok: true,
        data: {
          entries: [
            {
              position: 1,
              alias: "Ana",
              score: 500,
              isCurrentPlayer: false,
              sessionId: "00000000-0000-0000-0000-000000000000",
            },
          ],
          currentPlayerEntry: null,
        },
      },
      error: null,
    });
    const gateway = new SupabaseGameGateway({ rpc } as never);

    await expect(gateway.getLeaderboard()).rejects.toThrow();
  });

  it("valida la transición y recupera QuestionGameState después de avanzar", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({
        data: { ok: true, data: { currentPosition: 2 } },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { ok: true, data: questionState },
        error: null,
      });
    const gateway = new SupabaseGameGateway({ rpc } as never);

    const result = await gateway.advanceGame("a".repeat(64));

    expect(result).toEqual({ ok: true, data: questionState });
    expect(rpc).toHaveBeenNthCalledWith(
      2,
      "get_game_state",
      expect.objectContaining({ p_token_hash: expect.any(String) }),
    );
  });
});
