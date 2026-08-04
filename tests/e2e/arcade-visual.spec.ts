import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.beforeEach(() => {
  test.skip(
    process.env.PLAYWRIGHT_VISUAL_REGRESSION !== "true",
    "La regresión visual requiere baselines Linux revisados y versionados.",
  );
});

async function pauseBeforeLoad(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("antidoto:motion:v1", "paused");
  });
}

async function readyForCapture(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
}

test("portada de impacto en escritorio", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "viewport canónico único");
  await page.setViewportSize({ width: 1440, height: 900 });
  await pauseBeforeLoad(page);
  await page.goto("/");
  await readyForCapture(page);

  await expect(page).toHaveScreenshot("arcade-home-1440.png", {
    animations: "disabled",
    maxDiffPixels: 100,
  });
});

test("portada de impacto en móvil", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "viewport canónico único");
  await page.setViewportSize({ width: 390, height: 844 });
  await pauseBeforeLoad(page);
  await page.goto("/");
  await readyForCapture(page);

  await expect(page).toHaveScreenshot("arcade-home-390.png", {
    animations: "disabled",
    maxDiffPixels: 100,
  });
});

test("shell de Real o IA en escritorio y móvil", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "viewports canónicos únicos");
  await pauseBeforeLoad(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/games/real-o-ia");
  await readyForCapture(page);
  await expect(page).toHaveScreenshot("real-o-ia-shell-1440.png", {
    animations: "disabled",
    maxDiffPixels: 100,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page).toHaveScreenshot("real-o-ia-shell-390.png", {
    animations: "disabled",
    maxDiffPixels: 100,
  });
});

test("404 conserva la identidad y una salida clara", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "viewport canónico único");
  await page.setViewportSize({ width: 390, height: 844 });
  await pauseBeforeLoad(page);
  await page.goto("/ruta-que-no-existe");
  await readyForCapture(page);

  await expect(page).toHaveScreenshot("not-found-390.png", {
    animations: "disabled",
    maxDiffPixels: 100,
  });
});
