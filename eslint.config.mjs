// Flat ESLint config for ESLint v9 using @eslint/js and typescript-eslint
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignore build artifacts
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/out/**",
      "**/dist/**",
      "**/.turbo/**",
      // Next.js generated types file should not be linted
      "next-env.d.ts",
    ],
  },
  // Base JS recommended rules
  js.configs.recommended,
  // TypeScript recommended (non type-aware to avoid requiring project references)
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    },
  },
  // Node env for CJS config files
  {
    files: ["next.config.js", "postcss.config.js"],
    languageOptions: {
      globals: {
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        process: "readonly",
      },
    },
  }
);


