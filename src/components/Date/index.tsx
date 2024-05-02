import DateHumanizer from "@/services/Date";

import { CSSClassNames, DateHumanizerStrategy, Locale } from "@/types";

import Text from "@/components/ui/Text";

import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  humanize?: DateHumanizerStrategy;
  date?: Date;
  classes?: CSSClassNames;
  locale?: Locale;
};

function DateComponent({ humanize = "today", date = new Date(), classes, locale }: Props) {
  const dateHumanized = new DateHumanizer(humanize).humanizeDate(date, { locale });
  const TODAY_TRANSLATIONS = {
    en: "today is",
    es: "hoy es",
  };

  return (
    <Text variant="default" classes={cn("text-xs", classes)}>
      {TODAY_TRANSLATIONS[locale ?? "en"]}: {dateHumanized}
    </Text>
  );
}

export default DateComponent;
