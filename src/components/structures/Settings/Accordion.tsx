import { PropsWithChildren } from "react";

import { Accordion } from "@/components/ui/Accordion";

type Props = {};

function AccordionSettings({ children }: PropsWithChildren<Props>) {
  return (
    <Accordion type="single" collapsible defaultValue="account" className="w-full space-y-4">
      {children}
    </Accordion>
  );
}

export default AccordionSettings;
