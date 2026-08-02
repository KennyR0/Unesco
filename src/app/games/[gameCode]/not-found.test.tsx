import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "./not-found";

describe("Game not-found state", () => {
  it("explica el estado seguro y permite volver al arcade", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: /juego no encontrado/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver al arcade/i })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
