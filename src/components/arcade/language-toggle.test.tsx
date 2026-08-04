import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "../../lib/i18n/provider";
import { LanguageToggle } from "./language-toggle";

describe("LanguageToggle", () => {
  it("exposes both languages and the active language to assistive technology", () => {
    render(
      <LanguageProvider initialLocale="es">
        <LanguageToggle />
      </LanguageProvider>,
    );

    expect(screen.getByRole("group", { name: /idioma/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /inglés/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /español/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
