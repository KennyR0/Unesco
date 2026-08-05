import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  ClickbaitSwipeGame,
  type ClickbaitSwipeItem,
} from "../../src/components/games/clickbait-swipe-game";
import { createContentRepository } from "../../src/features/game/content/content-repository";
import { validateContentCollection } from "../../src/features/game/content/content-validation";
import contentPack from "../../src/features/game/content/game-items/clickbait-swipe.v1.json";
import {
  evaluateHeadlineClassification,
  parseHeadlineClassificationSolution,
} from "../../src/features/game/domain/mechanics/headline-classification";
import {
  calculateGameScore,
  maxPointsForGame,
} from "../../src/features/game/domain/scoring";

const SWIPE_THRESHOLD_PX = 96;

beforeAll(() => {
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = function setPointerCapture() {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = function releasePointerCapture() {};
  }

  if (typeof globalThis.PointerEvent === "undefined") {
    class PointerEventPolyfill extends MouseEvent {
      readonly pointerId: number;
      readonly pointerType: string;
      readonly isPrimary: boolean;

      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
        this.pointerType = init.pointerType ?? "touch";
        this.isPrimary = init.isPrimary ?? true;
      }
    }

    globalThis.PointerEvent =
      PointerEventPolyfill as unknown as typeof PointerEvent;
  }
});

function makeItem(
  overrides: Partial<ClickbaitSwipeItem> = {},
): ClickbaitSwipeItem {
  return {
    gameCode: "clickbait-swipe",
    mechanic: "headline_classification",
    itemId: "clickbait-swipe-t052",
    prompt: "¿Periodismo o clickbait?",
    headline: "¡¡URGENTE!! Los médicos ODIAN este truco",
    sourceLabel: "salud-milagrosa.xyz",
    actions: ["journalism", "clickbait"],
    keyboardEquivalent: true,
    ...overrides,
  };
}

function getCard() {
  return screen.getByRole("group", { name: /Los médicos ODIAN/ });
}

function dispatchPointer(
  target: Element,
  type: "pointerdown" | "pointermove" | "pointerup" | "pointercancel",
  clientX: number,
  clientY: number,
) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      clientX,
      clientY,
      buttons: type === "pointerup" || type === "pointercancel" ? 0 : 1,
    }),
  );
}

function swipeCard(dx: number, dy = 0) {
  const card = getCard();
  act(() => {
    dispatchPointer(card, "pointerdown", 200, 120);
  });
  act(() => {
    dispatchPointer(card, "pointermove", 200 + dx, 120 + dy);
  });
  act(() => {
    dispatchPointer(card, "pointerup", 200 + dx, 120 + dy);
  });
}

describe("ClickbaitSwipeGame (T052)", () => {
  it("presenta titular, fuente y controles equivalentes Periodismo/Clickbait", () => {
    render(<ClickbaitSwipeGame item={makeItem()} onClassify={() => {}} />);

    expect(
      screen.getByRole("heading", { name: "¿Periodismo o clickbait?" }),
    ).toBeVisible();
    expect(screen.getByText(/Los médicos ODIAN/)).toBeVisible();
    expect(screen.getByText(/salud-milagrosa\.xyz/)).toBeVisible();
    expect(screen.getByRole("button", { name: /Periodismo/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Clickbait/ })).toBeEnabled();
    expect(
      screen.getByRole("group", { name: "Opciones de clasificación" }),
    ).toBeVisible();
  });

  it("cancela el gesto bajo el umbral y no envía clasificación", () => {
    const onClassify = vi.fn();
    render(<ClickbaitSwipeGame item={makeItem()} onClassify={onClassify} />);

    swipeCard(SWIPE_THRESHOLD_PX - 8);
    expect(onClassify).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Periodismo/ })).toBeEnabled();
  });

  it("compromete clickbait a la derecha y periodismo a la izquierda por gesto", () => {
    const onClassify = vi.fn();
    const { rerender } = render(
      <ClickbaitSwipeGame item={makeItem()} onClassify={onClassify} />,
    );

    swipeCard(SWIPE_THRESHOLD_PX + 4);
    expect(onClassify).toHaveBeenCalledWith({
      value: "clickbait",
      source: "swipe",
    });

    onClassify.mockClear();
    rerender(
      <ClickbaitSwipeGame
        item={makeItem({ itemId: "clickbait-swipe-t052-b" })}
        onClassify={onClassify}
      />,
    );
    swipeCard(-(SWIPE_THRESHOLD_PX + 4));
    expect(onClassify).toHaveBeenCalledWith({
      value: "journalism",
      source: "swipe",
    });
  });

  it("usa clases de dirección distintas: derecha clickbait, izquierda journalism", () => {
    render(<ClickbaitSwipeGame item={makeItem()} onClassify={() => {}} />);
    const card = getCard();

    act(() => {
      dispatchPointer(card, "pointerdown", 200, 120);
    });
    act(() => {
      dispatchPointer(card, "pointermove", 200 + SWIPE_THRESHOLD_PX + 4, 120);
    });
    expect(card.className).toContain("headline-swipe__card--toward-clickbait");
    expect(card.className).toContain("headline-swipe__card--armed");
    expect(card.className).not.toContain(
      "headline-swipe__card--toward-journalism",
    );

    act(() => {
      dispatchPointer(card, "pointermove", 200 - (SWIPE_THRESHOLD_PX + 4), 120);
    });
    expect(card.className).toContain("headline-swipe__card--toward-journalism");
    expect(card.className).toContain("headline-swipe__card--armed");
    expect(card.className).not.toContain(
      "headline-swipe__card--toward-clickbait",
    );

    act(() => {
      dispatchPointer(card, "pointerup", 200 - (SWIPE_THRESHOLD_PX + 4), 120);
    });
  });

  it("cancela el arrastre vertical sin enviar", () => {
    const onClassify = vi.fn();
    render(<ClickbaitSwipeGame item={makeItem()} onClassify={onClassify} />);

    swipeCard(40, 120);
    expect(onClassify).not.toHaveBeenCalled();
  });

  it("hace equivalentes botón, teclado y gesto para la misma clasificación", async () => {
    const user = userEvent.setup();
    const selections: Array<{ value: string; source: string }> = [];
    const onClassify = vi.fn((selection: { value: string; source: string }) => {
      selections.push(selection);
    });
    const item = makeItem();

    const { rerender } = render(
      <ClickbaitSwipeGame item={item} onClassify={onClassify} />,
    );

    await user.click(screen.getByRole("button", { name: /Clickbait/ }));

    rerender(
      <ClickbaitSwipeGame
        item={{ ...item, itemId: "clickbait-swipe-keyboard" }}
        onClassify={onClassify}
      />,
    );
    getCard().focus();
    await user.keyboard("{ArrowRight}");

    rerender(
      <ClickbaitSwipeGame
        item={{ ...item, itemId: "clickbait-swipe-gesture" }}
        onClassify={onClassify}
      />,
    );
    swipeCard(SWIPE_THRESHOLD_PX + 10);

    expect(selections).toEqual([
      { value: "clickbait", source: "button" },
      { value: "clickbait", source: "keyboard" },
      { value: "clickbait", source: "swipe" },
    ]);
  });

  it("permite Periodismo con flecha izquierda y bloquea tras resolver", async () => {
    const user = userEvent.setup();
    const onClassify = vi.fn();
    const item = makeItem();

    const { rerender } = render(
      <ClickbaitSwipeGame item={item} onClassify={onClassify} />,
    );

    getCard().focus();
    await user.keyboard("{ArrowLeft}");
    expect(onClassify).toHaveBeenCalledWith({
      value: "journalism",
      source: "keyboard",
    });

    rerender(
      <ClickbaitSwipeGame
        item={item}
        onClassify={onClassify}
        selectedClassification="journalism"
      />,
    );

    expect(getCard()).toHaveFocus();
    expect(screen.getByRole("button", { name: /Periodismo/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Clickbait/ })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(/Periodismo/);
  });

  it("cubre racha de tres y score máximo 16 sobre los doce titulares", () => {
    const items = validateContentCollection(contentPack);
    const repository = createContentRepository(contentPack, {
      activeVersion: "2026-07-30.1",
    });
    const published = repository.listPublishedItems("clickbait-swipe");

    expect(items).toHaveLength(12);
    expect(published).toHaveLength(12);
    expect(maxPointsForGame("clickbait-swipe")).toBe(16);

    let streakBefore = 0;
    let bonusPointsAwarded = 0;
    let points = 0;
    const answers: Array<{ correct: boolean }> = [];

    for (const item of published) {
      const publicItem = repository.getPublicItem(
        "clickbait-swipe",
        item.itemId,
      );
      expect(publicItem).not.toBeNull();
      expect(publicItem && "solutionPrivate" in publicItem).toBe(false);

      const solution = parseHeadlineClassificationSolution(item.solutionPrivate);
      const evaluation = evaluateHeadlineClassification({
        answer: solution.classification,
        solution,
        feedback: item.feedback,
        streakBefore,
        bonusPointsAwarded,
      });

      expect(evaluation.correct).toBe(true);
      points += evaluation.points;
      streakBefore = evaluation.streak;
      bonusPointsAwarded = evaluation.totalBonusPoints;
      answers.push({ correct: true });
    }

    const sessionScore = calculateGameScore({
      gameCode: "clickbait-swipe",
      answers,
    });

    expect(points).toBe(16);
    expect(bonusPointsAwarded).toBe(4);
    expect(sessionScore).toMatchObject({
      points: 16,
      maxPoints: 16,
      bonusPoints: 4,
      correct: 12,
      errors: 0,
    });
    expect(sessionScore.points).toBeLessThanOrEqual(sessionScore.maxPoints);
  });
});
