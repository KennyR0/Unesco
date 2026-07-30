import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RoundProgress } from "./round-progress";

describe("RoundProgress", () => {
  it("repite el progreso en texto y semántica", () => {
    render(<RoundProgress current={5} total={5} />);
    expect(screen.getByText("Pregunta 5 de 5")).toBeVisible();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "5");
  });
});
