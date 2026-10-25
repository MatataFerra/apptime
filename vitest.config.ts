import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["**/?(*.)test.ts?(x)"],
    exclude: ["src/e2e/**/*", "node_modules/**/*", "dist/**/*", "coverage/**/*", ".next/**/*"],
    globals: true,
    setupFiles: "__test__/vitest.setup.ts",
  },
  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "./src") },
      { find: "#", replacement: resolve(__dirname, "./") },
      // Tests aren't a React Server bundle; Next resolves this to empty.js there.
      {
        find: /^server-only$/,
        replacement: resolve(__dirname, "./node_modules/server-only/empty.js"),
      },
    ],
  },
});
