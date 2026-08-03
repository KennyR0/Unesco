import { expect, test, type Page } from "@playwright/test";

const MAIN_ROUTES = ["/", "/games/real-o-ia"] as const;

async function horizontalOverflowReport(page: Page) {
  return page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          className: element.className,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
        };
      })
      .filter(({ left, right }) => left < -1 || right > innerWidth + 1)
      .slice(0, 8),
  }));
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await horizontalOverflowReport(page);
  expect(overflow.scrollWidth, JSON.stringify(overflow.offenders)).toBe(
    overflow.clientWidth,
  );
}

async function expectVisibleFocus(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const active = document.activeElement;
        return active instanceof HTMLElement
          ? getComputedStyle(active).outlineStyle
          : "none";
      }),
    )
    .not.toBe("none");
}

test.describe("accesibilidad transversal del arcade", () => {
  test("permite alcanzar el contenido y conserva foco visible con teclado", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/");

    const skipLink = page.getByRole("link", { name: /saltar al contenido/i });
    const brand = page.getByRole("link", { name: /antídoto, ir al arcade/i });

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await expectVisibleFocus(page);

    await page.keyboard.press("Tab");
    await expect(brand).toBeFocused();
    await expectVisibleFocus(page);
  });

  test("expone estados de sesión y errores como regiones anunciables", async ({
    page,
  }) => {
    await page.goto("/games/real-o-ia");

    const status = page.getByRole("status");
    await expect(status).toHaveCount(1);
    await expect(status).toHaveAttribute("aria-live", "polite");

    await page.goto("/ruta-que-no-existe");
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("mantiene objetivos táctiles operables en la navegación móvil", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/");

    const navigationLinks = page
      .getByRole("navigation", { name: /navegación principal/i })
      .getByRole("link");

    for (const link of await navigationLinks.all()) {
      const box = await link.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  for (const route of MAIN_ROUTES) {
    test(`no desborda horizontalmente a 320 px: ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(route);
      await expectNoHorizontalOverflow(page);
    });

    test(`conserva el contenido a zoom 200 %: ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(route);
      await page.addStyleTag({ content: "html { font-size: 200% !important; }" });

      await expect(page.locator("#main-content")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }

  test("respeta reduced motion y conserva una versión estática legible", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
    for (const selector of [
      ".arcade-hero::before",
      ".arcade-hero__viral",
      ".signal-collage",
      ".kinetic-marquee__track",
    ]) {
      await expect
        .poll(() => page.evaluate((target) => getComputedStyle(document.querySelector(target.split("::")[0])!, target.includes("::") ? "::before" : undefined).animationName, selector))
        .toBe("none");
    }

    await expect(page.getByText(/observa.*verifica.*decide/i).first()).toBeVisible();
    await expect(page.locator('.kinetic-marquee__track span[aria-hidden="true"]')).toBeHidden();
  });
});
