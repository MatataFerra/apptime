-- Settings → Appearance: 12/24 h clock and day/month order ("auto" = the app's language).
ALTER TABLE "Config" ADD COLUMN "timeFormat" TEXT NOT NULL DEFAULT 'auto';
ALTER TABLE "Config" ADD COLUMN "dateFormat" TEXT NOT NULL DEFAULT 'auto';
