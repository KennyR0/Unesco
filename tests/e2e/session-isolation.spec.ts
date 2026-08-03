import { expect, test, type BrowserContext } from "@playwright/test";

import { createSessionToken } from "../../src/lib/security/session-token";

const sessionCookieExpiry = Math.floor(Date.now() / 1000) + 3_600;

async function installArcadeCookie(
  context: BrowserContext,
  gameCode: "real-o-ia" | "grupo",
  value: string,
): Promise<void> {
  await context.addCookies([
    {
      name: `antidoto_session.${gameCode}`,
      value,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      expires: sessionCookieExpiry,
    },
  ]);
}

test("mantiene sesiones de juegos distintos en cookies opacas independientes", async ({
  page,
}) => {
  const realToken = createSessionToken();
  const grupoToken = createSessionToken();

  await installArcadeCookie(page.context(), "real-o-ia", realToken);
  await installArcadeCookie(page.context(), "grupo", grupoToken);

  await page.goto("/games/real-o-ia");
  await expect(page.locator('main[data-game-code="real-o-ia"]')).toBeVisible();
  await page.reload();
  await expect(page.locator('main[data-game-code="real-o-ia"]')).toBeVisible();

  await page.goto("/games/grupo");
  await expect(page.locator('main[data-game-code="grupo"]')).toBeVisible();
  await page.reload();
  await expect(page.locator('main[data-game-code="grupo"]')).toBeVisible();

  const cookies = await page.context().cookies();
  expect(cookies).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: "antidoto_session.real-o-ia",
        value: realToken,
      }),
      expect.objectContaining({
        name: "antidoto_session.grupo",
        value: grupoToken,
      }),
    ]),
  );
});

test("no comparte cookies de sesión entre contextos de navegador", async ({
  browser,
}) => {
  const firstContext = await browser.newContext();
  const secondContext = await browser.newContext();

  try {
    const firstToken = createSessionToken();
    const secondToken = createSessionToken();
    await installArcadeCookie(firstContext, "real-o-ia", firstToken);
    await installArcadeCookie(secondContext, "real-o-ia", secondToken);

    const firstPage = await firstContext.newPage();
    const secondPage = await secondContext.newPage();
    await Promise.all([
      firstPage.goto("/games/real-o-ia"),
      secondPage.goto("/games/real-o-ia"),
    ]);

    await expect(firstPage.locator('main[data-game-code="real-o-ia"]')).toBeVisible();
    await expect(secondPage.locator('main[data-game-code="real-o-ia"]')).toBeVisible();
    await expect.poll(async () => (await firstContext.cookies())[0]?.value).toBe(
      firstToken,
    );
    await expect.poll(async () => (await secondContext.cookies())[0]?.value).toBe(
      secondToken,
    );
  } finally {
    await firstContext.close();
    await secondContext.close();
  }
});
