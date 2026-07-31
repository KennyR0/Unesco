import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "../../src/app/page";

describe("página inicial", () => {
  it("presenta propósito educativo, alias y ranking público", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: "Antídoto" })).toBeVisible();
    expect(screen.getByText(/reconocer desinformación/)).toBeVisible();
    expect(screen.getByRole("link", { name: "Consultar ranking" })).toHaveAttribute("href", "/leaderboard");
  });
});
