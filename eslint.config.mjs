import nextConfig from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [
      "prototipo/**",
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "supabase/.temp/**",
    ],
  },
  ...nextConfig,
];

export default eslintConfig;
