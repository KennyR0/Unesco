import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { listAvailableArcadeCatalog } from "../../features/game/content/catalog";
import { LanguageProvider } from "../../lib/i18n/provider";
import { ArcadeHome } from "./arcade-home";

describe("ArcadeHome language switching", () => {
  it("renders the English mission catalog when English is active", () => {
    render(
      <LanguageProvider initialLocale="en">
        <ArcadeHome games={listAvailableArcadeCatalog()} />
      </LanguageProvider>,
    );

    expect(screen.getByRole("heading", { name: /the lie goes viral\. truth is trained/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The Group" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open the group/i })).toHaveAttribute("href", "/games/grupo");
  });
});
