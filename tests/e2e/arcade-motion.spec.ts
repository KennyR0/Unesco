import { expect, test } from "@playwright/test";

test("pausa, persiste y reactiva el movimiento", async ({ page }) => {
  await page.goto("/");

  const toggle = page.locator(".motion-toggle");
  await expect(toggle).toHaveAccessibleName(/pausar animación/i);
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveAccessibleName(/activar animación/i);
  expect(
    await page.evaluate(() => localStorage.getItem("antidoto:motion:v1")),
  ).toBe("paused");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await page.getByRole("button", { name: /activar animación/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "active");
});

test("sin preferencia guardada adopta reduced motion del sistema", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-motion", "paused");
  await expect(page.locator(".kinetic-marquee__track")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.getByText(/observa.*verifica.*decide/i).first()).toBeVisible();
});
