import { PropsWithChildren } from "react";

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion";

type Props = {
  value: string;
  trigger: string;
};

function AccordionItemSettings({ value, trigger, children }: PropsWithChildren<Props>) {
  return (
    <AccordionItem value={value} className="w-full">
      <AccordionTrigger className="px-4 font-bold text-gray-800 dark:text-gray-100">
        {trigger}
      </AccordionTrigger>
      <AccordionContent className="space-y-4 px-4">{children}</AccordionContent>
    </AccordionItem>
  );
}

export default AccordionItemSettings;
