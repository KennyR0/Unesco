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
});
