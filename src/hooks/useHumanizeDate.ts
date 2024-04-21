import { useMemo } from "react";

import { useLocale } from "next-intl";

import DateHumanizer from "@/services/Date";

import { DateHumanizerStrategy, Locale } from "@/types";

function useHumanizeDate({
  date,
  typeFormat = "today",
}: {
  date: string;
  typeFormat?: DateHumanizerStrategy;
}) {
  const locale = useLocale() as Locale;

  const humanizeStartDate = useMemo(() => {
    const humanized = date
      ? new DateHumanizer(typeFormat).humanizeDate(new Date(date), {
          locale: locale,
        })
      : null;

    return humanized ? humanized : "waiting...";
  }, [date, locale, typeFormat]);

  return humanizeStartDate;
}

export default useHumanizeDate;
