import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The original Vite starter, kept for reference. Not part of this app.
    "creative-sparks-starter/**",
    // Vendored shadcn/ui code. Read it, use it, do not lint it.
    "components/ui/**",
    "hooks/use-mobile.ts",
  ]),
]);

export default eslintConfig;
