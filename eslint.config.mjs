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
      // With the React Compiler, watch() results get memoized and stop updating
      // (the compiler's own check only sees useForm, not useFormContext).
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "VariableDeclarator[init.callee.name=/^useForm(Context)?$/] > ObjectPattern > Property[key.name='watch']",
          message: "Use useWatch({ control, name }) instead of watch(): the React Compiler freezes watch() values.",
        },
      ],
      // lodash is CommonJS: `from "lodash"` pulls the whole library into the
      // bundle, even for one function. Import each one: lodash/isEmpty.
      "no-restricted-imports": [
        "error",
        { paths: [{ name: "lodash", message: 'Import the function itself: "lodash/<name>".' }] },
      ],
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
