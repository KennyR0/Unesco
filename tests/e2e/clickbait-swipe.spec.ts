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

test.describe("Clickbait Swipe (T052)", () => {
  test("abre la misión, conserva el shell y permite volver con teclado", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/games/clickbait-swipe");

    const shell = page.locator('main[data-game-code="clickbait-swipe"]');
    await expect(shell).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Clickbait Swipe/i }),
    ).toBeVisible();
    await expect(page.getByRole("status")).toContainText(/Misión lista/i);
    await expect(
      page.getByText(/periodismo|clickbait|titular/i).first(),
    ).toBeVisible();

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
    const link = page.getByRole("link", { name: /Abrir Clickbait Swipe/i });
    await expect(link).toBeVisible();

    await reachByKeyboard(page, link);
    await expect(link).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/games\/clickbait-swipe$/);
    await expect(
      page.locator('main[data-game-code="clickbait-swipe"]'),
    ).toBeVisible();
  });
});
