-- Rate limiting that holds across serverless instances.
--
-- * RateLimit: Better Auth's table (rateLimit.storage = "database").
-- * ActionRateLimit: our limits for server actions that call Better Auth
--   directly, which its limiter doesn't see (the reset password email).

CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lastRequest" BIGINT NOT NULL
);
CREATE UNIQUE INDEX "RateLimit_key_key" ON "RateLimit"("key");

CREATE TABLE "ActionRateLimit" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "count" INTEGER NOT NULL,
    "windowStart" DATETIME NOT NULL
);
