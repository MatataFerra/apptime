import DateHumanizer from "@/services/Date";

import type { CSSClassNames, DateHumanizerStrategy, Locale } from "@/types";

import Text from "@/components/ui/Text";

import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  humanize?: DateHumanizerStrategy;
  date?: Date;
  classes?: CSSClassNames;
  locale?: Locale;
};

function TodayDate({ humanize = "today", date = new Date(), classes, locale }: Props) {
  const dateHumanized = new DateHumanizer(humanize).humanizeDate(date, { locale });

  return (
    <Text variant="default" classes={cn("text-xs", classes)}>
      today is: {dateHumanized}
    </Text>
  );
}

export default TodayDate;
