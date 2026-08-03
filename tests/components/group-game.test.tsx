import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GroupGame, type GroupItem } from "../../src/components/games/group-game";
import { createContentRepository } from "../../src/features/game/content/content-repository";
import contentPack from "../../src/features/game/content/game-items/grupo.v1.json";

function makeItem(): GroupItem {
  return {
    gameCode: "grupo",
    mechanic: "group_decision",
    itemId: "grupo-t048",
    prompt: "Decide qué hacer con este mensaje del grupo.",
    messages: [
      {
        sender: "Tía Marta",
        text: "El mensaje promete una cura milagrosa y pide reenviarlo.",
        timeLabel: "10:02",
      },
      {
        sender: "Primo Luis",
        text: "¿Alguien comprobó la fuente antes de compartirlo?",
        timeLabel: "10:03",
      },
      {
        sender: "Amiga Vale",
        text: "Esperemos a verificar el contexto.",
        timeLabel: "10:04",
      },
    ],
    actions: ["forward", "verify", "pause"],
  };
}

function editorialItem(itemId: string): GroupItem {
  const publicItem = createContentRepository(contentPack, {
    activeVersion: "2026-07-30.1",
  }).getPublicItem("grupo", itemId);
  if (!publicItem || publicItem.gameCode !== "grupo") {
    throw new Error(`Item público ausente: ${itemId}`);
  }
  return publicItem;
}

describe("GroupGame (T048)", () => {
  it("mantiene el orden de lectura, remitente y hora de cada mensaje", () => {
    render(<GroupGame item={makeItem()} onAction={() => {}} />);

    const thread = screen.getByRole("list", { name: "Mensajes en orden" });
    const messages = within(thread).getAllByRole("listitem");

    expect(messages).toHaveLength(3);
    expect(messages.map((message) => message.textContent)).toEqual([
      expect.stringContaining("Tía Marta"),
      expect.stringContaining("Primo Luis"),
      expect.stringContaining("Amiga Vale"),
    ]);
    expect(within(messages[0]).getByText("10:02")).toBeVisible();
    expect(within(messages[1]).getByText("10:03")).toBeVisible();
    expect(within(messages[2]).getByText("10:04")).toBeVisible();
  });

  it("emite forward, verify y pause con el mismo contrato de selección", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<GroupGame item={makeItem()} onAction={onAction} />);

    await user.click(screen.getByRole("button", { name: /Reenviar/ }));
    await user.click(screen.getByRole("button", { name: /Verificar/ }));
    await user.click(screen.getByRole("button", { name: /Frenar/ }));

    expect(onAction.mock.calls).toEqual([
      [{ value: "forward" }],
      [{ value: "verify" }],
      [{ value: "pause" }],
    ]);
  });

  it("permite recorrer las acciones con teclado y devuelve el foco al hilo al resolver", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const item = makeItem();

    const { rerender } = render(
      <GroupGame item={item} onAction={onAction} />,
    );
    const forward = screen.getByRole("button", { name: /Reenviar/ });
    const verify = screen.getByRole("button", { name: /Verificar/ });
    const pause = screen.getByRole("button", { name: /Frenar/ });

    forward.focus();
    await user.keyboard("{ArrowRight}");
    expect(verify).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(pause).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(forward).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(pause).toHaveFocus();

    rerender(
      <GroupGame
        item={item}
        onAction={onAction}
        selectedAction="verify"
      />,
    );

    expect(
      screen.getByRole("list", { name: "Mensajes en orden" }),
    ).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Elegiste Verificar.",
    );
    expect(forward).toBeDisabled();
    expect(verify).toBeDisabled();
    expect(pause).toBeDisabled();
  });

  it("conserva descripciones educativas y acciones de cuidado visibles", () => {
    render(<GroupGame item={makeItem()} onAction={() => {}} />);

    expect(screen.getByText("Amplifica sin comprobar")).toBeVisible();
    expect(screen.getByText("Contrasta y corrige")).toBeVisible();
    expect(screen.getByText("Detiene la cadena")).toBeVisible();
    expect(
      screen.getByRole("group", { name: "Acciones de cuidado" }),
    ).toBeVisible();
  });

  it("respeta el orden de lectura del pack editorial en las seis escenas", () => {
    for (const itemId of [
      "grupo-001",
      "grupo-002",
      "grupo-003",
      "grupo-004",
      "grupo-005",
      "grupo-006",
    ]) {
      const item = editorialItem(itemId);
      const { unmount } = render(
        <GroupGame item={item} onAction={() => {}} />,
      );

      const thread = screen.getByRole("list", { name: "Mensajes en orden" });
      const messages = within(thread).getAllByRole("listitem");
      expect(messages).toHaveLength(item.messages.length);

      item.messages.forEach((message, index) => {
        expect(messages[index]).toHaveTextContent(message.sender);
        expect(messages[index]).toHaveTextContent(message.timeLabel);
        expect(messages[index]).toHaveTextContent(message.text);
      });

      expect(screen.getByRole("button", { name: /Reenviar/ })).toBeEnabled();
      expect(screen.getByRole("button", { name: /Verificar/ })).toBeEnabled();
      expect(screen.getByRole("button", { name: /Frenar/ })).toBeEnabled();
      unmount();
    }
  });
});


