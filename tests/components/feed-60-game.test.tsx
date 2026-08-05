import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  FeedTimerGame,
  type FeedTimerItem,
} from "../../src/components/games/feed-60-game";
import { createContentRepository } from "../../src/features/game/content/content-repository";
import { validateContentCollection } from "../../src/features/game/content/content-validation";
import contentPack from "../../src/features/game/content/game-items/feed-60.v1.json";
import {
  FEED_VERIFY_COST_SECONDS,
  applyFeedVerifyCost,
  createFeedClock,
  emptyTimedFeedItemState,
  evaluateTimedFeedDecision,
  parseTimedFeedSolution,
  remainingFeedSeconds,
  resolveTimedFeedAction,
} from "../../src/features/game/domain/mechanics/timed-feed";
import {
  FEED_MAX_POINTS,
  calculateFeedSessionScore,
  maxPointsForGame,
} from "../../src/features/game/domain/scoring";

function makeItem(overrides: Partial<FeedTimerItem> = {}): FeedTimerItem {
  return {
    gameCode: "feed-60",
    mechanic: "timed_feed",
    itemId: "feed-60-t061",
    prompt: "Tienes segundos. ¿Verificas, compartes o descartas esta publicación?",
    post: "Minsa: campaña de vacunación gratuita del 5 al 12 de agosto.",
    sourceLabel: "minsa.gob.pe · cuenta verificada",
    actions: ["verify", "share", "discard"],
    remainingSeconds: 60,
    verificationAvailable: true,
    ...overrides,
  };
}

afterEach(() => {
  document.documentElement.dataset.motion = "active";
});

describe("FeedTimerGame (T061)", () => {
  it("comunica el tiempo restante en texto y no solo con la barra", () => {
    render(
      <FeedTimerGame item={makeItem()} remainingSeconds={42} onAction={() => {}} />,
    );

    const timer = screen.getByRole("timer");
    expect(timer).toHaveTextContent("Tiempo restante");
    expect(timer).toHaveTextContent("42 s");
    expect(screen.getByText(/minsa\.gob\.pe/)).toBeVisible();
    expect(screen.getByText(/campaña de vacunación/)).toBeVisible();
  });

  it("emite verify, revela pistas y recupera el foco en la decisión", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const item = makeItem();
    const { rerender } = render(
      <FeedTimerGame item={item} remainingSeconds={50} onAction={onAction} />,
    );

    await user.click(screen.getByRole("button", { name: /Verificar/ }));
    expect(onAction).toHaveBeenCalledWith({ value: "verify" });

    rerender(
      <FeedTimerGame
        item={item}
        remainingSeconds={46}
        onAction={onAction}
        verified
        verificationHints={[
          "Fuente oficial del Ministerio.",
          "Fecha concreta.",
          "Cobertura seria.",
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: /Verificar/ })).toBeDisabled();
    expect(screen.getByText("Fuente oficial del Ministerio.")).toBeVisible();
    const hints = screen.getByRole("region", {
      name: /Pistas de verificación SIFT/i,
    });
    expect(hints).toBeVisible();
    expect(hints).toHaveClass("feed-timer__hint-chips");
    expect(hints.querySelectorAll(".feed-timer__hint-chip")).toHaveLength(3);

    const share = screen.getByRole("button", { name: /Compartir/ });
    expect(share).toHaveFocus();
  });

  it("recorre Compartir/Descartar con flechas y confirma con teclado", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <FeedTimerGame item={makeItem()} remainingSeconds={55} onAction={onAction} />,
    );

    const share = screen.getByRole("button", { name: /Compartir/ });
    const discard = screen.getByRole("button", { name: /Descartar/ });

    share.focus();
    await user.keyboard("{ArrowRight}");
    expect(discard).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(share).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(onAction).toHaveBeenCalledWith({ value: "share" });
  });

  it("anuncia aviso anticipado ≤10 s y bloquea controles al expirar", () => {
    const { rerender } = render(
      <FeedTimerGame item={makeItem()} remainingSeconds={10} onAction={() => {}} />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/Quedan 10 s/);
    expect(screen.getByRole("timer")).toHaveTextContent("10 s");

    rerender(
      <FeedTimerGame
        item={makeItem()}
        remainingSeconds={0}
        onAction={() => {}}
        expired
        selectedAction="discard"
      />,
    );

    expect(screen.getByRole("timer")).toHaveTextContent("0 s");
    expect(screen.getByText(/El tiempo se agotó/)).toBeVisible();
    expect(screen.getByRole("button", { name: /Verificar/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Compartir/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Descartar/ })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(/expiró|Descartar/i);
  });

  it("la pausa visual no extiende el tiempo autoritativo mostrado", () => {
    render(
      <FeedTimerGame item={makeItem()} remainingSeconds={33} onAction={() => {}} />,
    );

    expect(screen.queryByText(/pausa visual no detiene el reloj/i)).toBeNull();

    act(() => {
      document.documentElement.dataset.motion = "paused";
      window.dispatchEvent(
        new CustomEvent("antidoto:motion-change", { detail: "paused" }),
      );
    });

    expect(
      screen.getByText(/La pausa visual no detiene el reloj/i),
    ).toBeVisible();
    expect(screen.getByRole("timer")).toHaveTextContent("33 s");
  });

  it("alcanza score 30 con el pack editorial y verify en cada decisión correcta", () => {
    const items = validateContentCollection(contentPack);
    const repository = createContentRepository(contentPack);
    const published = repository.listPublishedItems("feed-60");
    expect(published).toHaveLength(10);
    expect(maxPointsForGame("feed-60")).toBe(FEED_MAX_POINTS);

    const answers = published.map((item) => {
      const solution = parseTimedFeedSolution(item.solutionPrivate);
      const evaluation = evaluateTimedFeedDecision({
        decision: solution.appropriateDecision,
        verified: true,
        solution,
        feedback: item.feedback,
      });
      expect(evaluation.decisionCorrect).toBe(true);
      expect(evaluation.points).toBe(3);
      expect(evaluation).not.toHaveProperty("verificationHints");
      return {
        decisionCorrect: evaluation.decisionCorrect,
        verified: evaluation.verified,
      };
    });

    const score = calculateFeedSessionScore(answers);
    expect(score.points).toBe(30);
    expect(score.maxPoints).toBe(30);
    expect(score.bonusPoints).toBe(10);
  });

  it("resuelve carreras: la expiración gana a verify y a la decisión final", () => {
    const [item] = validateContentCollection(contentPack);
    const startedAt = new Date("2026-08-02T22:00:00.000Z");
    const clock = createFeedClock(startedAt);
    const afterExpiry = new Date(clock.expiresAt.getTime() + 1);
    const sessionItemIds = [item.itemId];

    const verifyRace = resolveTimedFeedAction({
      action: "verify",
      itemId: item.itemId,
      sessionItemIds,
      clock,
      itemState: emptyTimedFeedItemState(),
      solution: item.solutionPrivate,
      feedback: item.feedback,
      now: afterExpiry,
    });
    expect(verifyRace.kind).toBe("expired");

    const decideRace = resolveTimedFeedAction({
      action: "share",
      itemId: item.itemId,
      sessionItemIds,
      clock,
      itemState: emptyTimedFeedItemState(),
      solution: item.solutionPrivate,
      feedback: item.feedback,
      now: afterExpiry,
    });
    expect(decideRace.kind).toBe("expired");

    const afterVerify = applyFeedVerifyCost(clock);
    expect(afterVerify.verifySecondsConsumed).toBe(FEED_VERIFY_COST_SECONDS);
    expect(
      remainingFeedSeconds(afterVerify, startedAt),
    ).toBeLessThan(remainingFeedSeconds(clock, startedAt));
  });
});
