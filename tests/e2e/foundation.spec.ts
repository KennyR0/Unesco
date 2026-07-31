import { expect, test } from "@playwright/test";

test("la entrada pública carga el propósito de Antídoto", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Antídoto" })).toBeVisible();
  await expect(
    page.getByText(/reconocer desinformación/i),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  await page.getByRole("link", { name: "Consultar ranking" }).click();
  await expect(page).toHaveURL(/\/leaderboard$/);
  await expect(page.getByRole("heading", { name: "Ranking" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("la ruta antigua de ranking no se publica", async ({ page }) => {
  const response = await page.goto("/ranking");

  expect(response?.status()).toBe(404);
});
