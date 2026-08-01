import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GroupGame, type GroupItem } from "./group-game";

function makeItem(overrides: Partial<GroupItem> = {}): GroupItem {
  return {
    gameCode: "grupo",
    mechanic: "group_decision",
    itemId: "grupo-test",
    prompt: "Decide qué hacer con este mensaje del grupo.",
    messages: [
      {
        sender: "Tía Marta",
        text: "El limón con bicarbonato CURA el cáncer, lo confirmó la OMS.",
        timeLabel: "10:02",
      },
      {
        sender: "Primo Luis",
        text: "Mi médico me indicó seguir el tratamiento, pero estoy preocupado.",
        timeLabel: "10:03",
      },
    ],
    actions: ["forward", "verify", "pause"],
    ...overrides,
  };
}

describe("GroupGame (smoke)", () => {
  it("presenta prompt, mensajes ordenados con remitente/hora y las tres acciones", () => {
    render(<GroupGame item={makeItem()} onAction={() => {}} />);

    expect(
      screen.getByRole("heading", { name: /Decide qué hacer/ }),
    ).toBeVisible();
    expect(screen.getByText("Tía Marta")).toBeVisible();
    expect(screen.getByText(/lo confirmó la OMS/)).toBeVisible();
    expect(screen.getByText("Primo Luis")).toBeVisible();
    expect(screen.getByText("10:02")).toBeVisible();

    expect(screen.getByRole("button", { name: /Reenviar/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Verificar/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Frenar/ })).toBeEnabled();
  });

  it("emite la acción elegida por botón y permite navegar con flechas", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<GroupGame item={makeItem()} onAction={onAction} />);

    const forward = screen.getByRole("button", { name: /Reenviar/ });
    const verify = screen.getByRole("button", { name: /Verificar/ });
    const pause = screen.getByRole("button", { name: /Frenar/ });

    forward.focus();
    await user.keyboard("{ArrowRight}");
    expect(verify).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(pause).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(verify).toHaveFocus();

    await user.click(verify);
    expect(onAction).toHaveBeenCalledWith({ value: "verify" });
  });

  it("bloquea controles tras resolver y devuelve el foco al hilo", () => {
    render(
      <GroupGame
        item={makeItem()}
        onAction={() => {}}
        selectedAction="verify"
      />,
    );

    const thread = screen.getByRole("list", { name: "Mensajes en orden" });
    expect(thread).toHaveFocus();

    expect(screen.getByRole("button", { name: /Reenviar/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Verificar/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Frenar/ })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Verificar/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
