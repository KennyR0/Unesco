import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AliasForm } from "./alias-form";

describe("AliasForm", () => {
  it("explica rango, visibilidad y tiene controles etiquetados", () => {
    render(<AliasForm />);
    expect(screen.getByLabelText("Elige un alias")).toBeVisible();
    expect(screen.getByText(/3 a 20 caracteres/)).toBeVisible();
    expect(screen.getByText(/pueden aparecer en el ranking/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Comenzar" })).toBeEnabled();
  });
});
