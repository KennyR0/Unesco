import { expect, test } from "@playwright/test";

test("inicia, responde, muestra feedback educativo y avanza", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Elige un alias").fill("E2E Player");
  await page.getByRole("button", { name: "Comenzar" }).click();
  await expect(page).toHaveURL(/\/play$/);
  await expect(page.getByRole("radio").first()).toBeVisible();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Responder" }).click();
  await expect(page.getByRole("status")).toBeVisible();
  await expect(page.getByText(/Comprueba|Una información|fecha|fuente/i).first()).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("radio").first()).toBeVisible();
});
