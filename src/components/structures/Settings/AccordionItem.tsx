import { PropsWithChildren } from "react";

import { Clock3, type LucideIcon, MapPin, UserRound } from "lucide-react";

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion";

import { MODULE_THEMES, type ModuleTheme } from "@/utils/constants/modules";
import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  value: string;
  trigger: string;
};

const ICONS: Partial<Record<string, { icon: LucideIcon; theme: ModuleTheme }>> = {
  account: { icon: UserRound, theme: "insight" },
  shift: { icon: Clock3, theme: "track" },
  personal: { icon: MapPin, theme: "fast" },
};

function AccordionItemSettings({ value, trigger, children }: PropsWithChildren<Props>) {
  const item = ICONS[value];
  const colors = item ? MODULE_THEMES[item.theme] : null;
  const Icon = item?.icon;

  return (
    <AccordionItem value={value} className="w-full border-b-0">
      <AccordionTrigger className="gap-3 px-3 py-3 text-[0.9375rem] font-medium text-ink hover:no-underline">
        <span className="flex items-center gap-3">
          {Icon && colors ? (
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
                colors.soft,
                colors.ink
              )}
            >
              <Icon className="size-4.5" strokeWidth={2} aria-hidden="true" />
            </span>
          ) : null}
          {trigger}
        </span>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-3">{children}</AccordionContent>
    </AccordionItem>
  );
}

export default AccordionItemSettings;
