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
  // Server-only name: a NEXT_PUBLIC_ variable can end up in the browser bundle.
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  if (turso && !tursoUrl) {
    throw new Error("TURSO_ON is true but TURSO_DATABASE_URL isn't set");
  }
  const adapter = new PrismaLibSql(
    turso
      ? { url: tursoUrl!, authToken: process.env.TURSO_AUTH_TOKEN }
      : { url: LOCAL_DATABASE_URL }
  );

  return new PrismaClient({
    adapter,
    // Each statement is a round trip to Turso, so Prisma's defaults (2 s to
    // start, 5 s to finish) are too tight for the few writes that need one.
    transactionOptions: { maxWait: 10_000, timeout: 20_000 },
  });
}

// One client per server process; in dev it survives hot reloads.
const prisma: PrismaClient = global.prisma ?? newPrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
