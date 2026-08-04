import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { gzipSync } from "node:zlib";

import mediaManifest from "../../src/features/game/content/media-manifest.v1.json";
import {
  NEW_INTERACTION_DEPENDENCIES,
  PERFORMANCE_BUDGETS,
} from "../../next.config";

type ResourceMeasurement = Readonly<{
  url: string;
  contentType: string;
  rawBytes: number;
  compressedBytes: number;
}>;

function compressedBytes(body: Buffer): number {
  return gzipSync(body, { level: 9 }).byteLength;
}

async function measureRouteResources(
  page: Page,
  request: APIRequestContext,
  route: string,
): Promise<readonly ResourceMeasurement[]> {
  const documentResponse = await page.goto(route, { waitUntil: "networkidle" });
  expect(documentResponse).not.toBeNull();

  const resourceUrls = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((url) => url.startsWith(location.origin)),
  );
  const urls = [documentResponse!.url(), ...resourceUrls].filter(
    (url, index, all) => all.indexOf(url) === index,
  );
  const measurements: ResourceMeasurement[] = [];

  for (const url of urls) {
    const response = await request.get(url);
    if (!response.ok()) continue;
    const body = await response.body();
    measurements.push({
      url,
      contentType: response.headers()["content-type"] ?? "",
      rawBytes: body.byteLength,
      compressedBytes: compressedBytes(body),
    });
  }

  return measurements;
}

function isJavaScript(resource: ResourceMeasurement): boolean {
  return (
    resource.contentType.includes("javascript") ||
    new URL(resource.url).pathname.endsWith(".js")
  );
}

function isNonMultimedia(resource: ResourceMeasurement): boolean {
  return !/^(?:image|audio|video)\//.test(resource.contentType);
}

test.describe("presupuesto de rendimiento del arcade", () => {
  test("mantiene JS de interacción y transferencia inicial bajo presupuesto", async ({
    page,
    request,
  }) => {
    test.skip(
      process.env.PLAYWRIGHT_PERFORMANCE_PRODUCTION !== "true",
      "Los presupuestos de bundle requieren una build de producción; next dev incluye HMR y devtools.",
    );

    for (const route of ["/", "/games/real-o-ia"] as const) {
      const resources = await measureRouteResources(page, request, route);
      const javascriptBytes = resources
        .filter(isJavaScript)
        .reduce((total, resource) => total + resource.compressedBytes, 0);
      const initialTransferBytes = resources
        .filter(isNonMultimedia)
        .reduce((total, resource) => total + resource.compressedBytes, 0);

      expect(
        javascriptBytes,
        `${route}: JS comprimido (${javascriptBytes} B) supera el límite duro`,
      ).toBeLessThanOrEqual(PERFORMANCE_BUDGETS.interactionJsHardBytes);
      expect(
        javascriptBytes,
        `${route}: JS comprimido recomendado (${javascriptBytes} B)`,
      ).toBeLessThanOrEqual(PERFORMANCE_BUDGETS.interactionJsRecommendedBytes);
      expect(
        initialTransferBytes,
        `${route}: transferencia inicial no multimedia`,
      ).toBeLessThanOrEqual(PERFORMANCE_BUDGETS.initialTransferBytes);
    }
  });

  test("mantiene cada acción y las dependencias nuevas dentro del presupuesto", () => {
    const actionPayloads = [
      { gameCode: "real-o-ia", itemId: "item-1", input: { kind: "verdict", value: "real" } },
      { gameCode: "grupo", itemId: "item-1", input: { kind: "group_action", value: "verify" } },
      { gameCode: "clickbait-swipe", itemId: "item-1", input: { kind: "headline_classification", value: "journalism", source: "button" } },
      { gameCode: "radar-de-fuentes", itemId: "item-1", input: { kind: "source_classification", value: "reliable" } },
      { gameCode: "feed-60", itemId: "item-1", input: { kind: "feed_action", value: "verify" } },
      { gameCode: "mente-maestra", itemId: "item-1", input: { kind: "autopsy_choice", step: "objective", optionId: "option-1" } },
    ];

    for (const payload of actionPayloads) {
      expect(
        compressedBytes(Buffer.from(JSON.stringify(payload))),
      ).toBeLessThanOrEqual(PERFORMANCE_BUDGETS.actionPayloadBytes);
    }

    expect(NEW_INTERACTION_DEPENDENCIES).toEqual([]);
    expect(PERFORMANCE_BUDGETS.newDependencyBytes).toBeLessThanOrEqual(
      PERFORMANCE_BUDGETS.newDependencyBudgetBytes,
    );
  });

  test("mantiene media y primera vista bajo los límites editoriales", async ({
    page,
    request,
  }) => {
    await page.goto("/games/real-o-ia");

    const visibleApproved = mediaManifest.assets.filter(
      (asset) =>
        asset.editorialStatus === "approved" &&
        asset.kind !== "none" &&
        !asset.decorative,
    );
    // Una escena muestra un solo recurso editorial. Sumar el catálogo entero
    // no representa la transferencia ni la media visible de la primera vista.
    const visibleBytes = Math.max(
      0,
      ...visibleApproved.map((asset) => asset.bytes),
    );

    expect(visibleBytes).toBeLessThanOrEqual(
      PERFORMANCE_BUDGETS.visibleFirstViewMediaBytes,
    );
    for (const asset of mediaManifest.assets.filter(
      (candidate) => candidate.kind !== "none" && candidate.src,
    )) {
      const response = await request.get(asset.src!);
      expect(response.ok(), asset.src).toBe(true);
      const body = await response.body();
      expect(body.byteLength, asset.src).toBeLessThanOrEqual(
        PERFORMANCE_BUDGETS.mediaMaxBytes,
      );
      expect(asset.bytes, asset.src).toBeLessThanOrEqual(
        PERFORMANCE_BUDGETS.mediaRecommendedBytes,
      );
    }
  });

  test("conserva estados visibles de carga, error y recuperación", async ({
    page,
  }) => {
    await page.goto("/games/real-o-ia", { waitUntil: "commit" });
    // Durante la transición loading → intro pueden coexistir dos mains.
    await expect(page.locator("main#main-content").first()).toBeVisible();
    await expect(
      page.locator('main#main-content[data-game-code="real-o-ia"]'),
    ).toBeVisible();
    await expect(
      page
        .locator('main#main-content[data-game-code="real-o-ia"]')
        .getByRole("status"),
    ).toBeVisible();

    await page.goto("/ruta-que-no-existe");
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /volver al arcade/i }),
    ).toBeVisible();
  });
});
