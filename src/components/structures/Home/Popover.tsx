"use client";

import { CircleHelp } from "lucide-react";
import { useTranslations } from "next-intl";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import Text from "@/components/ui/Text";

function PopoverHome() {
  const t = useTranslations("home");
  return (
    <Popover>
      <PopoverTrigger
        className="flex size-8 items-center justify-center rounded-full text-ink-subtle transition-colors hover:text-ink"
        aria-label={t("popover_label")}
      >
        <CircleHelp className="size-4" strokeWidth={1.75} aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent side="top" className="w-60">
        <Text variant="default" classes="balance_text text-sm text-ink">
          {t("popover")}
        </Text>
      </PopoverContent>
    </Popover>
  );
}

export default PopoverHome;
