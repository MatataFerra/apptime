"use client";

import { useTranslations } from "next-intl";

import Icon from "@/components/ui/Icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import Text from "@/components/ui/Text";

function PopoverHome() {
  const t = useTranslations("home");
  return (
    <Popover>
      <PopoverTrigger className="self-start" aria-label="state shift info">
        <Icon.mark />
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
