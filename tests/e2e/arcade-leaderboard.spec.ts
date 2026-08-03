import { expect, test } from "@playwright/test";

test.describe("ranking global arcade (T039)", () => {
  test("la landing no exige ranking y /leaderboard es lectura secundaria", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("link", { name: /ranking|leaderboard|clasificaci/i }),
    ).toHaveCount(0);

    await page.goto("/leaderboard");

    await expect(
      page.getByRole("heading", { name: /Ranking global secundario/i }),
    ).toBeVisible();
    await expect(page.getByText(/Secundario \/ Opcional/i)).toBeVisible();
    await expect(page.getByText(/opcional y no es un objetivo/i)).toBeVisible();

    const main = page.locator("main.leaderboard-page");
    await expect(main).toHaveAttribute(
      "data-leaderboard-state",
      /ready|empty|error/,
    );

    const table = page.getByRole("table");
    const empty = page.getByRole("status");
    const error = page.getByRole("alert");

    if (await table.count()) {
      await expect(table).toBeVisible();
      await expect(table.getByText(/hasta 10 resultados elegibles/i)).toBeVisible();
      const bodyRows = table.locator("tbody tr");
      expect(await bodyRows.count()).toBeLessThanOrEqual(10);
    } else if (await empty.count()) {
      await expect(empty).toContainText(/elegibles|ranking/i);
    } else {
      await expect(error).toBeVisible();
      await expect(error).toContainText(/no está disponible|reintentar/i);
    }

    await expect(
      page.getByRole("link", { name: /volver al arcade/i }),
    ).toBeVisible();
  });

  test("el fallo o vacío del ranking no bloquea volver al arcade", async ({
    page,
  }) => {
    await page.goto("/leaderboard");

    const back = page.getByRole("link", { name: /volver al arcade/i });
    await expect(back).toBeVisible();
    await back.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("desde resultado el ranking sigue siendo enlace opcional discreto", async ({
    page,
  }) => {
    await page.goto("/games/real-o-ia/result");

    const optionalResultRanking = page.getByRole("link", {
      name: /consultar ranking global \(opcional\)/i,
    });
    const secureRanking = page.getByRole("link", {
      name: /^consultar ranking$/i,
    });
    const continuePlay = page.getByRole("link", {
      name: /iniciar otra partida|volver al arcade|volver a la misión/i,
    });

    await expect(continuePlay.first()).toBeVisible();

    if (await optionalResultRanking.count()) {
      await expect(optionalResultRanking).toBeVisible();
      await expect(
        page.getByText(/lectura secundaria y no es requisito/i),
      ).toBeVisible();
      await optionalResultRanking.click();
    } else {
      // Sin sesión: SecureStateView ofrece ranking opcional sin bloquear el juego.
      await expect(secureRanking).toBeVisible();
      await expect(
        page.getByText(/puedes volver al arcade e iniciar otra/i),
      ).toBeVisible();
      await secureRanking.click();
    }

    await expect(page).toHaveURL(/\/leaderboard$/);
    await expect(
      page.getByRole("heading", { name: /Ranking global secundario/i }),
    ).toBeVisible();
  });
});
