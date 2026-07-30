import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QuestionImage } from "./question-image";

describe("QuestionImage", () => {
  it("conserva dimensiones, alternativa y fallback", () => {
    render(<QuestionImage src="/images/questions/contexto-fuera-de-campo.webp" alt="Contexto" width={640} height={360} />);
    const image = screen.getByAltText("Contexto");
    expect(image).toHaveAttribute("width", "640");
    expect(image).toHaveAttribute("height", "360");
    fireEvent.error(image);
    expect(screen.getByRole("status")).toHaveTextContent("puedes responder con el texto");
  });
});
