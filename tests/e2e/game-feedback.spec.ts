import { expect, test } from "@playwright/test";

test.describe("feedback y proyección US3 (T038)", () => {
  test("el shell de misión educa sin exponer solución privada", async ({
    page,
  }) => {
    await page.goto("/games/real-o-ia");

    const shell = page.locator('main[data-game-code="real-o-ia"]');
    await expect(shell).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "¿Real o IA?" }),
    ).toBeVisible();
    await expect(page.getByRole("status")).toContainText(/Misión lista/i);
    await expect(
      page.getByText(/detectar señales visuales de imágenes sintéticas/i),
    ).toBeVisible();

    const html = await page.content();
    expect(html).not.toContain("solutionPrivate");
    expect(html).not.toMatch(/"verdict"\s*:\s*"(real|ai)"/);
    await expect(
      page.getByRole("region", { name: "Feedback educativo" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /volver al arcade/i }),
    ).toBeVisible();
  });

  test("la ruta de resultado no sustituye el feedback inline ni exige ranking", async ({
    page,
  }) => {
    await page.goto("/games/real-o-ia/result");

    // Sin sesión: estado seguro o proyección; nunca feedback educativo reubicado.
    await expect(
      page.getByRole("region", { name: "Feedback educativo" }),
    ).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Señales" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Qué hacer" })).toHaveCount(
      0,
    );

    const body = await page.locator("body").innerText();
    expect(body).not.toContain("solutionPrivate");

    const rankingLinks = page.getByRole("link", { name: /ranking/i });
    const rankingCount = await rankingLinks.count();
    if (rankingCount > 0) {
      await expect(rankingLinks.first()).toHaveAttribute("href", "/leaderboard");
      await expect(rankingLinks.first()).toContainText(
        /opcional|secundari|consultar/i,
      );
    }

    await expect(
      page.getByRole("link", { name: /arcade|iniciar otra|volver/i }).first(),
    ).toBeVisible();
  });

  test("el ranking secundario permanece opcional tras el resultado", async ({
    page,
  }) => {
    await page.goto("/leaderboard");

    await expect(
      page.getByRole("heading", { name: /Ranking global secundario/i }),
    ).toBeVisible();
    await expect(page.getByText(/opcional y no es un objetivo/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /volver al arcade/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Feedback educativo" }),
    ).toHaveCount(0);
  });
});
