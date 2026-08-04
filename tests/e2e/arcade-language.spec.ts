import { expect, test } from "@playwright/test";

test("permite cambiar entre español e inglés y conserva la preferencia", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("button", { name: "Español" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: /entrena el ojo/i })).toBeVisible();

  await page.getByRole("button", { name: "Inglés" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: /train your eye/i })).toBeVisible();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: /train your eye/i })).toBeVisible();

  await page.getByRole("button", { name: "Spanish" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});
