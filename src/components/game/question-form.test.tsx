import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QuestionForm } from "./question-form";

describe("QuestionForm", () => {
  it("ofrece selección única y mensaje de envío", () => {
    render(<QuestionForm questionRef="Q000000000000000000001" options={[{ ref: "O000000000000000000001", label: "Fuente", position: 1 }, { ref: "O000000000000000000002", label: "Compartidos", position: 2 }]} action={vi.fn()} />);
    expect(screen.getByRole("group", { name: "Selecciona una opción" })).toBeVisible();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Responder" })).toBeEnabled();
  });
});
