import pluginQuery from "@tanstack/eslint-plugin-query";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    ignores: ["node_modules/", ".next/", "out/", "playwright-report/", "next-env.d.ts"],
  },
  // Registers react, react-hooks, import, jsx-a11y and @next/next.
  ...nextCoreWebVitals,
  ...pluginQuery.configs["flat/recommended"],
  {
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "no-console": "warn",
      "func-style": ["error", "declaration", { allowArrowFunctions: false }],
      "@tanstack/query/exhaustive-deps": "error",
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": [
        "warn",
        {
          groups: [
            // react first, then packages
            ["^react"],
            ["^@?\\w"],
            ["^@/services"],
            ["^@/types"],
            ["^@/layouts"],
            [
              "^@/components",
              "^@/components/modules",
              "^@/components/structures",
              "^@/components/ui",
            ],
            ["^@/providers"],
            ["^@/utils", "^@/hooks", "^@/styles", "^@/constants"],
            // side effect imports
            ["^\\u0000"],
            // styles
            ["^.+\\.s?css$"],
          ],
        },
      ],
      // What plugin:import/recommended (+errors, +warnings) used to turn on.
      // The plugin itself is already registered by eslint-config-next.
      "import/no-unresolved": "error",
      // TypeScript checks named imports; the plugin misreads `export *` and type-only exports.
      "import/named": "off",
      "import/namespace": "error",
      "import/default": "error",
      "import/export": "error",
      "import/no-named-as-default": "warn",
      "import/no-named-as-default-member": "warn",
      "import/no-duplicates": "warn",
    },
  },
  prettier,
];

export default config;
