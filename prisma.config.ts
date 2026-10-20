import { defineConfig } from "prisma/config";

import { LOCAL_DATABASE_URL } from "./prisma/database-url";

/**
 * Prisma CLI config (Prisma 7 no longer reads the URL or the seed command
 * from schema.prisma / package.json). The URL is only used by local CLI
 * commands (db push, migrate, studio); Turso migrations are applied with
 * `pnpm turso:shell <migration>`.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    url: LOCAL_DATABASE_URL,
  },
});
