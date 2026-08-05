import type { NextConfig } from "next";

export const PERFORMANCE_BUDGETS = {
  // Chrome bilingüe + arranque guest (chunk diferido); hard 200 KiB intacto.
  interactionJsRecommendedBytes: 193 * 1024,
  interactionJsHardBytes: 200 * 1024,
  initialTransferBytes: 350 * 1024,
  actionPayloadBytes: 16 * 1024,
  newDependencyBudgetBytes: 50 * 1024,
  newDependencyBytes: 0,
  mediaRecommendedBytes: 300 * 1024,
  mediaMaxBytes: 1 * 1024 * 1024,
  visibleFirstViewMediaBytes: 1_500 * 1024,
} as const;

/** No se añadieron dependencias nuevas al bundle de interacción de T071. */
export const NEW_INTERACTION_DEPENDENCIES = [] as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  // Playwright and local tooling often hit 127.0.0.1 while `next dev` binds localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    // Keep generated variants aligned with the 320 px mobile baseline and the
    // fixed 448 px question-image slot used by the current shell.
    deviceSizes: [320, 480, 640, 768, 1024, 1280],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [50, 75],
    formats: ["image/avif", "image/webp"],
    // Educational media is local until an editorially approved remote source
    // is added to the media manifest. Query strings remain disallowed.
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/media/**", search: "" },
    ],
    remotePatterns: [],
  },
};

export default nextConfig;
