import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SecureStateView } from "./secure-state-view";

describe("SecureStateView", () => {
  it("presenta una recuperación común para una sesión inválida sin detalles sensibles", () => {
    render(
      <SecureStateView
        gameCode="real-o-ia"
        reason="invalid"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      /no hay una partida recuperable/i,
    );
    expect(screen.getByRole("main")).toHaveAttribute(
      "data-recovery-state",
      "invalid",
    );
    expect(screen.getByRole("main")).toHaveAttribute(
      "data-game-code",
      "real-o-ia",
    );
    expect(screen.getByRole("link", { name: /iniciar otra partida/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.queryByText(/token|hash|cookie|sessionid/i)).not.toBeInTheDocument();
  });

  it("comunica la expiración en texto y conserva la salida al arcade", () => {
    render(<SecureStateView reason="expired" />);

    expect(screen.getByRole("status")).toHaveTextContent(/expiró/i);
    expect(screen.getByRole("link", { name: /iniciar otra partida/i })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
