import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

import { LOCAL_DATABASE_URL } from "./database-url";

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma 7 always talks to the database through a driver adapter (there's
 * no query engine binary anymore). Turso when TURSO_ON=true, otherwise the
 * local SQLite file, both through libSQL.
 */
function newPrismaClient() {
  const turso = process.env.TURSO_ON === "true";
  const adapter = new PrismaLibSql(
    turso
      ? {
          url: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL ?? "",
          authToken: process.env.TURSO_AUTH_TOKEN,
        }
      : { url: LOCAL_DATABASE_URL }
  );

  return new PrismaClient({ adapter });
}

// One client per server process; in dev it survives hot reloads.
const prisma: PrismaClient = global.prisma ?? newPrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
