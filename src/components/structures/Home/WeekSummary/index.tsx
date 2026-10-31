import { endOfWeek, startOfWeek } from "date-fns";
import { getLocale, getTranslations } from "next-intl/server";

import { getUserDateConfig } from "@/services/Prefetch/userConfig";
import { weekStartsOnIndex } from "@/services/Summary";

import {
  dateLocaleFor,
  isDateOrder,
  isTimeFormat,
  withDateFormats,
} from "@/utils/helpers/dateFormats";
import { getUserNow } from "@/utils/helpers/userNow";

import { calendarDays, weekRangeParts } from "./shared";
import WeekSummaryCard from "./WeekSummaryCard";

/**
 * Server shell of the week card: works out this week in the user's zone,
 * week start and date order, so the card's frame and dates are in the
 * first HTML. The numbers stream in on the client (WeekSummaryCard).
 */
async function WeekSummary() {
  const [now, locale, t, config] = await Promise.all([
    getUserNow(),
    getLocale(),
    getTranslations("home.week"),
    getUserDateConfig(),
  ]);
  const dateLocale = withDateFormats(dateLocaleFor(locale), {
    time: isTimeFormat(config?.timeFormat) ? config.timeFormat : "auto",
    date: isDateOrder(config?.dateFormat) ? config.dateFormat : "auto",
  });
  const weekStartsOn = weekStartsOnIndex(config?.weekStartsOn);
  const from = startOfWeek(now, { weekStartsOn });
  const to = endOfWeek(now, { weekStartsOn });

  return (
    <WeekSummaryCard
      range={t("range", weekRangeParts(from, to, dateLocale))}
      days={calendarDays(from, now, locale)}
    />
  );
}

export default WeekSummary;
