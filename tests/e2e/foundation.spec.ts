import { expect, test, type Page } from "@playwright/test";

import { ARCADE_GAME_ROUTES } from "../setup/arcade-fixtures";

const firstGameLink = /Abrir ¿Real o IA\?/i;

async function hasNoHorizontalOverflow(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
}

test("la portada muestra seis misiones y conserva una sola acción principal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Juega a detectar lo que intenta engañarte.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(6);
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /ranking/i })).toHaveCount(0);
  expect(await hasNoHorizontalOverflow(page)).toBe(true);
});

test("las seis rutas del catálogo responden y no dependen de un ranking", async ({
  page,
}) => {
  for (const [gameCode, route] of Object.entries(ARCADE_GAME_ROUTES)) {
    const response = await page.goto(route);

    expect(response?.ok(), `${gameCode} no respondió correctamente`).toBe(true);
    await expect(page.locator(`[data-game-code="${gameCode}"]`)).toHaveCount(1);
    await expect(page.getByRole("link", { name: /volver al arcade/i })).toBeVisible();
  }
});

test("la primera misión se abre con teclado en menos de 30 segundos", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const startedAt = Date.now();
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: firstGameLink })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/games\/real-o-ia$/, { timeout: 30_000 });

  expect(Date.now() - startedAt).toBeLessThan(30_000);
});

test("la portada conserva el flujo a 200 por ciento de texto sin overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  await page.addStyleTag({
    content: "html { font-size: 200% !important; }",
  });

  await expect(page.getByRole("article")).toHaveCount(6);
  await expect(page.getByRole("link", { name: firstGameLink })).toBeVisible();
  expect(await hasNoHorizontalOverflow(page)).toBe(true);
});

test("la ruta antigua de ranking no se publica", async ({ page }) => {
  const response = await page.goto("/ranking");

  expect(response?.status()).toBe(404);
});