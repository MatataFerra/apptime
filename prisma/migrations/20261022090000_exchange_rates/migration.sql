-- Exchange rates (EUR based) to convert shifts paid in another currency
-- into the one picked in Settings, at the rate of each shift's day.
CREATE TABLE "ExchangeRate" (
    "date" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "filled" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("date", "quote")
);

-- Only EUR, USD, AUD, NZD and GBP can be picked now. A Settings currency
-- outside them goes back to the default (USD). Shifts keep theirs and are
-- still converted.
UPDATE "Config" SET "currency" = 'USD' WHERE "currency" NOT IN ('EUR', 'USD', 'AUD', 'NZD', 'GBP');
