import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ActionButton } from "./action-button";

describe("ActionButton", () => {
  it("is named, keyboard activatable and touch-sized", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ActionButton onClick={onClick}>Comenzar</ActionButton>);

    const button = screen.getByRole("button", { name: "Comenzar" });
    expect(button.className).toContain("min-h-[44px]");
    expect(button.className).toContain("min-w-[44px]");
    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
