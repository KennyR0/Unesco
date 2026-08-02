import { expect, test, type Page } from "@playwright/test";

import { ARCADE_GAME_ROUTES } from "../setup/arcade-fixtures";

const firstGameLink = /Abrir ¿Real o IA\?/i;

async function horizontalOverflowReport(page: Page) {
  return page.evaluate(
    () => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      offenders: Array.from(document.querySelectorAll<HTMLElement>("body *"))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            tag: element.tagName.toLowerCase(),
            className: element.className,
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            overflowX: style.overflowX,
          };
        })
        .filter(
          ({ left, right, overflowX }) =>
            overflowX === "visible" && (left < -1 || right > innerWidth + 1),
        )
        .sort((first, second) => second.right - first.right)
        .slice(0, 16),
    }),
  );
}

async function reachByKeyboard(page: Page, locator: ReturnType<Page["getByRole"]>) {
  for (let index = 0; index < 18; index += 1) {
    await page.keyboard.press("Tab");
    if (await locator.evaluate((element) => element === document.activeElement)) {
      return;
    }
  }
  throw new Error("No se alcanzó el control esperado con teclado.");
}

test("la portada grita su propósito y muestra seis misiones", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /La mentira es viral\. La verdad se entrena\./i,
    }),
  ).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(6);
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /ranking/i })).toHaveCount(0);
  const overflow = await horizontalOverflowReport(page);
  expect(overflow.scrollWidth, JSON.stringify(overflow.offenders)).toBe(
    overflow.clientWidth,
  );
});

test("las seis rutas heredan un tema estable sin publicar ranking", async ({ page }) => {
  for (const [gameCode, route] of Object.entries(ARCADE_GAME_ROUTES)) {
    const response = await page.goto(route);

    expect(response?.ok(), `${gameCode} no respondió correctamente`).toBe(true);
    await expect(page.locator(`main[data-game-code="${gameCode}"]`)).toHaveCount(1);
    await expect(page.getByRole("link", { name: /volver al arcade/i })).toBeVisible();
  }
});

test("la primera misión se abre con teclado en menos de 30 segundos", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const startedAt = Date.now();
  await page.goto("/");
  const link = page.getByRole("link", { name: firstGameLink });

  await reachByKeyboard(page, link);
  await expect(link).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/games\/real-o-ia$/, { timeout: 30_000 });

  expect(Date.now() - startedAt).toBeLessThan(30_000);
});

test("la portada conserva el flujo a 200 por ciento sin overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });

  await expect(page.getByRole("article")).toHaveCount(6);
  await expect(page.getByRole("link", { name: firstGameLink })).toBeVisible();
  const overflow = await horizontalOverflowReport(page);
  expect(overflow.scrollWidth, JSON.stringify(overflow.offenders)).toBe(
    overflow.clientWidth,
  );
});

test("el shell conserva lectura a 320 px y zoom 200 por ciento", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/games/real-o-ia");
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });

  await expect(page.getByRole("heading", { name: "¿Real o IA?" })).toBeVisible();
  await expect(page.getByRole("link", { name: /volver al arcade/i })).toBeVisible();
  const overflow = await horizontalOverflowReport(page);
  expect(overflow.scrollWidth, JSON.stringify(overflow.offenders)).toBe(
    overflow.clientWidth,
  );
});

test("portada y shell no emiten errores de consola", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await page.goto("/games/real-o-ia");

  expect(errors).toEqual([]);
});

test("la ruta antigua de ranking no se publica", async ({ page }) => {
  const response = await page.goto("/ranking");
  expect(response?.status()).toBe(404);
});
