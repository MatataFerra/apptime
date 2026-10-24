-- Holiday pay is no longer a setting: it's a contribution added to the
-- shifts it applies to (e.g. New Zealand's 8% pay-as-you-go), picked from
-- presets that come with the app.
ALTER TABLE "Config" DROP COLUMN "holidayPay";
