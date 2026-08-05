import nextConfig from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "supabase/.temp/**",
    ],
  },
  ...nextConfig,
];

export default eslintConfig;
