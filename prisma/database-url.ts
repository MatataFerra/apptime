/**
 * The local SQLite database used when TURSO_ON isn't "true" (relative to
 * the project root). Shared by the app client and prisma.config.ts.
 */
export const LOCAL_DATABASE_URL = "file:./prisma/apptime.db";
