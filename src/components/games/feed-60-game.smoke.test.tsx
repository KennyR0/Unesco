import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  FeedTimerGame,
  type FeedTimerItem,
} from "./feed-60-game";

function makeItem(overrides: Partial<FeedTimerItem> = {}): FeedTimerItem {
  return {
    gameCode: "feed-60",
    mechanic: "timed_feed",
    itemId: "feed-60-test",
    prompt: "Tienes segundos. ¿Verificas, compartes o descartas esta publicación?",
    post: "Minsa: campaña de vacunación gratuita del 5 al 12 de agosto.",
    sourceLabel: "minsa.gob.pe · cuenta verificada",
    actions: ["verify", "share", "discard"],
    remainingSeconds: 60,
    verificationAvailable: true,
    ...overrides,
  };
}

describe("FeedTimerGame (smoke T059)", () => {
  it("muestra reloj en texto, fuente, post y las tres acciones", () => {
    render(
      <FeedTimerGame item={makeItem()} remainingSeconds={58} onAction={() => {}} />,
    );

    expect(screen.getByRole("heading", { name: /Verificas, compartes/ })).toBeVisible();
    expect(screen.getByText(/campaña de vacunación/)).toBeVisible();
    expect(screen.getByText(/minsa\.gob\.pe/)).toBeVisible();
    expect(screen.getByRole("timer")).toHaveTextContent("58 s");

    expect(screen.getByRole("button", { name: /Verificar/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Compartir/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Descartar/ })).toBeEnabled();
  });

  it("emite verify, share y discard; verify queda marcado tras verificar", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const { rerender } = render(
      <FeedTimerGame item={makeItem()} remainingSeconds={58} onAction={onAction} />,
    );

    await user.click(screen.getByRole("button", { name: /Verificar/ }));
    expect(onAction).toHaveBeenCalledWith({ value: "verify" });

    rerender(
      <FeedTimerGame
        item={makeItem()}
        remainingSeconds={54}
        onAction={onAction}
        verified
        verificationHints={["Fuente oficial.", "Fecha visible.", "Cobertura seria."]}
      />,
    );

    expect(screen.getByRole("button", { name: /Verificar/ })).toBeDisabled();
    expect(screen.getByText("Fuente oficial.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /Compartir/ }));
    expect(onAction).toHaveBeenCalledWith({ value: "share" });
    expect(onAction).toHaveBeenCalledTimes(2);
  });

  it("anuncia aviso anticipado y bloquea controles al expirar", () => {
    render(
      <FeedTimerGame
        item={makeItem()}
        remainingSeconds={0}
        onAction={() => {}}
        expired
      />,
    );

    expect(screen.getByRole("timer")).toHaveTextContent("0 s");
    expect(
      screen.getByText(/El tiempo se agotó\. La partida expiró/),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Verificar/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Compartir/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Descartar/ })).toBeDisabled();
  });
});
