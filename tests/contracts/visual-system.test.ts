import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const contract = readFileSync(
  join(root, "specs/001-trivia-mvp-flow/contracts/visual-system.md"),
  "utf8",
);
const styles = readFileSync(join(root, "src/app/arcade-visual.css"), "utf8");
const layout = readFileSync(join(root, "src/app/layout.tsx"), "utf8");
const shell = readFileSync(
  join(root, "src/components/game/game-shell.tsx"),
  "utf8",
);

describe("contrato visual de Antídoto", () => {
  it("fija la paleta completa y sus variantes accesibles", () => {
    for (const color of [
      "#0A0A0A",
      "#F2EFE4",
      "#FFFDF5",
      "#D6FF00",
      "#FF2D6F",
      "#20DFF2",
      "#FFB400",
      "#00A968",
      "#C90048",
      "#007A4A",
      "#006D78",
    ]) {
      expect(contract).toContain(color);
      expect(styles.toLowerCase()).toContain(color.toLowerCase());
    }
  });

  it("carga las tres familias tipográficas con next/font", () => {
    expect(layout).toContain("Anton");
    expect(layout).toContain("Archivo");
    expect(layout).toContain("Space_Mono");
    expect(layout).toContain('from "next/font/google"');
  });

  it("expone temas estables y el contrato global de movimiento", () => {
    for (const gameCode of [
      "real-o-ia",
      "grupo",
      "clickbait-swipe",
      "radar-de-fuentes",
      "feed-60",
      "mente-maestra",
    ]) {
      expect(styles).toContain(`[data-game-code="${gameCode}"]`);
    }
    expect(shell).toContain("data-game-code={gameCode}");
    expect(layout).toContain("antidoto:motion:v1");
    expect(styles).toContain('html[data-motion="paused"]');
    expect(styles).toContain("prefers-reduced-motion: reduce");
  });

  it("prohíbe las estéticas que diluyen la identidad", () => {
    expect(contract).toMatch(/tarjetas SaaS/i);
    expect(contract).toMatch(/bento grids/i);
    expect(contract).toMatch(/glassmorphism/i);
    expect(contract).toMatch(/minimalismo editorial silencioso/i);
  });
});
