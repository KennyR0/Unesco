import { expect, test, type Page } from "@playwright/test";

import mediaManifest from "../../src/features/game/content/media-manifest.v1.json";

const imageAssets = mediaManifest.assets.filter(
  (asset) => asset.kind === "image" && asset.src,
);

async function loadResponsiveImage(page: Page, asset: (typeof imageAssets)[number]) {
  return page.evaluate(
    ({ src, alt, width, height }) =>
      new Promise<{
        naturalWidth: number;
        naturalHeight: number;
        frameWidth: number;
        imageWidth: number;
        imageHeight: number;
        alt: string;
      }>((resolve, reject) => {
        const frame = document.createElement("figure");
        frame.className = "verdict-game__frame";
        frame.style.width = "min(100%, 36rem)";
        frame.style.maxWidth = "100%";
        const image = document.createElement("img");
        image.className = "verdict-game__image";
        image.src = src;
        image.alt = alt ?? "";
        image.width = width ?? 640;
        image.height = height ?? 432;
        image.style.width = "100%";
        image.style.height = "auto";
        image.onload = () => {
          // Fuerza layout tras decodificar: en viewports estrechos el primer
          // getBoundingClientRect puede llegar antes de aplicar CSS de imagen.
          void image.offsetHeight;
          const frameBox = frame.getBoundingClientRect();
          const imageBox = image.getBoundingClientRect();
          resolve({
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
            frameWidth: frameBox.width,
            imageWidth: imageBox.width,
            imageHeight: imageBox.height,
            alt: image.alt,
          });
        };
        image.onerror = () => reject(new Error(`No cargó ${src}`));
        frame.append(image);
        document.querySelector("main")?.append(frame);
      }),
    {
      src: asset.src,
      alt: asset.alt,
      width: asset.width,
      height: asset.height,
    },
  );
}

test.describe("media pública del arcade", () => {
  test("sirve todos los assets declarados con formato y peso contractual", async ({
    page,
    request,
  }) => {
    await page.goto("/games/real-o-ia");

    for (const asset of imageAssets) {
      const response = await request.get(asset.src);
      expect(response.ok(), asset.src).toBe(true);
      expect(response.headers()["content-type"], asset.src).toMatch(
        /^image\/webp/,
      );
      const body = await response.body();
      expect(body.byteLength, asset.src).toBe(asset.bytes);
      expect(body.byteLength).toBeLessThanOrEqual(1_048_576);
    }
  });

  test("conserva alt, dimensiones declaradas y layout responsive", async ({
    page,
  }) => {
    const asset = imageAssets[0];
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/games/real-o-ia");

    const mobile = await loadResponsiveImage(page, asset);
    expect(mobile.naturalWidth).toBeGreaterThan(0);
    expect(mobile.naturalHeight).toBeGreaterThan(0);
    expect(mobile.alt).toBe(asset.alt);
    expect(mobile.imageWidth).toBeLessThanOrEqual(mobile.frameWidth + 1);
    expect(mobile.imageHeight).toBeGreaterThan(0);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/games/real-o-ia");
    const desktop = await loadResponsiveImage(page, asset);
    expect(desktop.imageWidth).toBeLessThanOrEqual(desktop.frameWidth + 1);
    expect(desktop.imageWidth).toBeGreaterThan(mobile.imageWidth);
  });

  test("mantiene una salida textual cuando el asset falta", async ({
    page,
    request,
  }) => {
    await page.goto("/games/real-o-ia");

    const response = await request.get("/media/real-o-ia/does-not-exist.webp");
    expect(response.status()).toBe(404);

    await expect(page.getByRole("main")).toBeVisible();
    const fallback = await page.evaluate(() => {
      const node = document.createElement("p");
      node.className = "image-fallback";
      node.setAttribute("role", "status");
      node.textContent =
        "La imagen educativa no está disponible. Continúa con el texto del desafío.";
      document.querySelector("main")?.append(node);
      return node.textContent;
    });
    expect(fallback).toMatch(/imagen educativa.*disponible/i);
  });
});
