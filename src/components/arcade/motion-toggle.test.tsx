import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MotionToggle } from "./motion-toggle";

function installMatchMedia(matches = false) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("MotionToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.dataset.motion = "active";
    installMatchMedia();
  });

  it("pausa, persiste y reactiva el movimiento decorativo", async () => {
    const user = userEvent.setup();
    render(<MotionToggle />);

    const toggle = screen.getByRole("button", { name: /pausar animación/i });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);
    expect(document.documentElement).toHaveAttribute("data-motion", "paused");
    expect(window.localStorage.getItem("antidoto:motion:v1")).toBe("paused");
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await user.click(toggle);
    expect(document.documentElement).toHaveAttribute("data-motion", "active");
    expect(window.localStorage.getItem("antidoto:motion:v1")).toBe("active");
  });

  it("sigue funcionando cuando localStorage está deshabilitado", async () => {
    const user = userEvent.setup();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });

    render(<MotionToggle />);
    await user.click(screen.getByRole("button", { name: /pausar animación/i }));

    expect(document.documentElement).toHaveAttribute("data-motion", "paused");
  });
});
