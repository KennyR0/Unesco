import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
