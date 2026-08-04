import { expect, test } from "@playwright/test";

test.describe("Mente Maestra jugable", () => {
  test("recorre los cuatro pasos y muestra la autopsia educativa", async ({
    page,
  }) => {
    await page.goto("/games/mente-maestra");

    await expect(
      page.getByRole("heading", { name: /Mente Maestra/i }),
    ).toBeVisible();
    await page.getByLabel(/elige un alias temporal/i).fill("Lina");
    await page
      .getByRole("button", {
        name: /empezar misión/i,
      })
      .click();

    for (let step = 1; step <= 4; step += 1) {
      const options = page
        .getByRole("group", { name: /opciones del paso/i })
        .getByRole("button");

      await expect(options.first()).toBeVisible({ timeout: 15_000 });
      await options.first().click();

      await expect(
        page.getByRole("region", { name: "Feedback educativo" }),
      ).toBeVisible({ timeout: 15_000 });

      await page.getByRole("button", { name: /Continuar/i }).click();
    }

    await expect(
      page.getByText(
        /Alcance simulado|Autopsia de tu fake news|Simulación educativa/i,
      ).first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText(/no se publica contenido externo|no se publicó nada/i).first(),
    ).toBeVisible();
  });
});
