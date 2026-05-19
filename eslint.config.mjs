import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";

/** @type {import('eslint').Linter.Config} */
export default [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "**/*.cjs", "**/*.js", "**/*.config.ts"],
  },
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: { onlyWarn },
  },
  {
    languageOptions: {
      globals: { React: true, JSX: true },
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
  },
  {
    linterOptions: { reportUnusedDisableDirectives: "off" },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-useless-escape": "off",
      "prefer-const": "off",
    },
  },
];
