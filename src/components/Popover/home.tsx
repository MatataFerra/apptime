"use client";

import { useTranslations } from "next-intl";

import Icon from "../ui/Icons";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import Text from "../ui/Text";

function PopoverHome() {
  const t = useTranslations("home");
  return (
    <Popover>
      <PopoverTrigger className="self-start">
        <Icon.mark />
      </PopoverTrigger>
      <PopoverContent side="top" className="w-60">
        <Text variant="default" classes="balance_text text-sm text-black">
          {t("popover")}
        </Text>
      </PopoverContent>
    </Popover>
  );
}

export default PopoverHome;
