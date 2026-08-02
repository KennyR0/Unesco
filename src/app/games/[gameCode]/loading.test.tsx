import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Loading from "./loading";

describe("Game loading state", () => {
  it("anuncia que la misión está cargando", () => {
    render(<Loading />);

    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent(/cargando la misión/i);
  });
});
