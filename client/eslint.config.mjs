import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // allow `any` while you refactor types (turn back to 'warn' or 'error' later)
      "@typescript-eslint/no-explicit-any": "off",

      // allow <img> usage (useful for camera/streaming snapshots)
      "@next/next/no-img-element": "off",

      // make prefer-const a warning (so it won't fail builds)
      "prefer-const": "warn",

      // optional: if you want unused-vars to be warning rather than error:
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    },
  },
];

export default eslintConfig;
