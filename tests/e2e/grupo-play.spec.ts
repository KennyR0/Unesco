import { expect, test } from "@playwright/test";

test.describe("El Grupo jugable", () => {
  test("permite iniciar, decidir y ver feedback en la primera escena", async ({
    page,
  }) => {
    await page.goto("/games/grupo");

    await expect(
      page.getByRole("heading", { name: "El Grupo" }),
    ).toBeVisible();
    await expect(
      page.getByLabel(/elige un alias temporal/i),
    ).toBeVisible();

    await page.getByLabel(/elige un alias temporal/i).fill("Lina");
    await page.getByRole("button", { name: /entrar al chat familiar/i }).click();

    await expect(page.getByRole("button", { name: /Verificar/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/chat familiar/i).first()).toBeVisible();

    await page.getByRole("button", { name: /Verificar/i }).click();

    await expect(
      page.getByRole("region", { name: "Feedback educativo" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /Continuar/i })).toBeVisible();
  });
});
