"use client";

import DateHumanizer from "@/services/Date";

import { CSSClassNames, DateHumanizerStrategy } from "@/types";

import Text from "@/components/ui/Text";

import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  humanize?: DateHumanizerStrategy;
  date?: Date;
  classes?: CSSClassNames;
};

function DateComponent({ humanize = "today", date = new Date(), classes }: Props) {
  const dateHumanized = new DateHumanizer(humanize).humanizeDate(date);

  return (
    <Text variant="default" classes={cn("text-sm", classes)}>
      {dateHumanized}
    </Text>
  );
}

export default DateComponent;
