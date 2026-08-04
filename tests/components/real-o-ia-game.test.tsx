import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  RealOrIaGame,
  type RealOrIaItem,
} from "../../src/components/games/real-o-ia-game";
import { createContentRepository } from "../../src/features/game/content/content-repository";
import { validateContentCollection } from "../../src/features/game/content/content-validation";
import contentPack from "../../src/features/game/content/game-items/real-o-ia.v1.json";

const items = validateContentCollection(contentPack);
const repository = createContentRepository(contentPack, {
  activeVersion: "2026-07-30.1",
});

function asRealOrIaItem(itemId: string): RealOrIaItem {
  const publicItem = repository.getPublicItem("real-o-ia", itemId);
  if (!publicItem || publicItem.gameCode !== "real-o-ia") {
    throw new Error(`Item público ausente: ${itemId}`);
  }
  return publicItem;
}

describe("RealOrIaGame (T044)", () => {
  it("cubre el pool público con alt o fallback y sin proyección privada", () => {
    expect(items).toHaveLength(20);
    const publicItems = items.map((item) => asRealOrIaItem(item.itemId));
    const { rerender, unmount } = render(
      <RealOrIaGame item={publicItems[0]} onVerdict={() => {}} />,
    );

    for (const publicItem of publicItems) {
      const serialized = JSON.stringify(publicItem);

      expect(serialized).not.toContain("solutionPrivate");
      expect(serialized).not.toContain("evaluationSignals");
      expect(serialized).not.toContain('"verdict"');
      expect(publicItem.media.alt || publicItem.media.fallbackText).toBeTruthy();

      rerender(
        <RealOrIaGame item={publicItem} onVerdict={() => {}} />,
      );

      expect(
        screen.getByRole("heading", { name: publicItem.prompt }),
      ).toBeVisible();
      expect(screen.getByText(publicItem.context)).toBeVisible();

      if (publicItem.media.kind === "image" && publicItem.media.src) {
        expect(
          screen.getByRole("img", { name: publicItem.media.alt ?? "" }),
        ).toBeInTheDocument();
      } else {
        expect(
          screen.getByText(publicItem.media.fallbackText ?? /no está disponible/i),
        ).toBeVisible();
      }

      expect(screen.getByRole("button", { name: "Real" })).toBeEnabled();
      expect(
        screen.getByRole("button", { name: "Generada por IA" }),
      ).toBeEnabled();
    }

    unmount();
  });

  it("permite elegir con teclado en un item del pack editorial", async () => {
    const user = userEvent.setup();
    const onVerdict = vi.fn();
    const item = asRealOrIaItem("real-o-ia-001");

    render(<RealOrIaGame item={item} onVerdict={onVerdict} />);

    const realButton = screen.getByRole("button", { name: "Real" });
    const aiButton = screen.getByRole("button", { name: "Generada por IA" });

    realButton.focus();
    await user.keyboard("{ArrowRight}");
    expect(aiButton).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onVerdict).toHaveBeenCalledWith("ai");

    await user.keyboard("{ArrowLeft}");
    expect(realButton).toHaveFocus();
    await user.keyboard("[Space]");
    expect(onVerdict).toHaveBeenCalledWith("real");
    expect(onVerdict).toHaveBeenCalledTimes(2);
  });

  it("muestra fallback al fallar la media y conserva los controles del item", async () => {
    const user = userEvent.setup();
    const onVerdict = vi.fn();
    const item = asRealOrIaItem("real-o-ia-004");

    render(<RealOrIaGame item={item} onVerdict={onVerdict} />);

    fireEvent.error(
      screen.getByRole("img", { name: item.media.alt ?? "" }),
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(item.media.fallbackText ?? "")).toBeVisible();
    expect(screen.getByRole("button", { name: "Real" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Generada por IA" }));
    expect(onVerdict).toHaveBeenCalledWith("ai");
  });
});
