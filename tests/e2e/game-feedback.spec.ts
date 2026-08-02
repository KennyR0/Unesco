import { expect, test } from "@playwright/test";

test("el shell conserva misión, estado y contenido educativo en una vista", async ({ page }) => {
  await page.goto("/games/real-o-ia");

  const shell = page.locator('main[data-game-code="real-o-ia"]');
  await expect(shell).toBeVisible();
  await expect(page.getByRole("heading", { name: "¿Real o IA?" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Misión lista");
  await expect(
    page.getByText(/detectar señales visuales de imágenes sintéticas/i),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /volver al arcade/i })).toBeVisible();
});
