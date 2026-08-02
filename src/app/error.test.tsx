import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import GlobalError from "./error";

describe("GlobalError", () => {
  it("ofrece reintento seguro sin exponer detalles internos", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(
      <GlobalError
        error={new Error("internal implementation detail")}
        reset={reset}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /algo hizo ruido/i }),
    ).toBeVisible();
    expect(screen.getByRole("alert")).not.toHaveTextContent(
      "internal implementation detail",
    );
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(reset).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });
});
