import { expect, test, type Page } from "@playwright/test";

async function reachByKeyboard(
  page: Page,
  locator: ReturnType<Page["getByRole"]>,
) {
  for (let index = 0; index < 20; index += 1) {
    await page.keyboard.press("Tab");
    if (
      await locator.evaluate((element) => element === document.activeElement)
    ) {
      return;
    }
  }
  throw new Error("No se alcanzó el control esperado con teclado.");
}

test.describe("Feed 60” (T061)", () => {
  // Evita carreras de RSC/JSON en next dev cuando varios workers abren la misma ruta.
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.removeItem("antidoto:motion:v1");
      } catch {
        // El storage es opcional en el contrato de movimiento.
      }
    });
  });

  test("abre la misión, conserva el shell y permite volver con teclado", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/games/feed-60", { waitUntil: "domcontentloaded" });

    const shell = page.locator('main[data-game-code="feed-60"]');
    await expect(shell).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Feed 60/i }),
    ).toBeVisible();
    await expect(page.getByRole("status")).toContainText(/Misión lista/i);
    await expect(
      page.getByText(/verificar|compartir|descartar|tiempo|autoritativo/i).first(),
    ).toBeVisible();

    await expect(page.locator(".motion-toggle")).toBeVisible();

    const back = page.getByRole("link", { name: /volver al arcade/i });
    await reachByKeyboard(page, back);
    await expect(back).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/");
  });

  test("la tarjeta de misión en portada es alcanzable y abre la ruta", async ({
    page,
  }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /Abrir Feed 60/i });
    await expect(link).toBeVisible();

    await reachByKeyboard(page, link);
    await expect(link).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/games\/feed-60$/);
    await expect(
      page.locator('main[data-game-code="feed-60"]'),
    ).toBeVisible();
  });

  test("la pausa de movimiento no oculta el objetivo ni el retorno", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/games/feed-60", { waitUntil: "domcontentloaded" });

    await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
    await expect(
      page.locator('main[data-game-code="feed-60"]'),
    ).toBeVisible();
    await expect(page.locator(".motion-toggle")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /volver al arcade/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/Priorizar verificación|límite de tiempo/i).first(),
    ).toBeVisible();
  });
});
