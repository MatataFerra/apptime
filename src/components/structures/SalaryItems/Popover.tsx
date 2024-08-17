import type { PropsWithChildren, ReactNode } from "react";

import Icon from "@/components/ui/Icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

type Props = {
  content: ReactNode;
};

function TaxPopover({ content, children }: PropsWithChildren<Props>) {
  return (
    <>
      <Popover>
        <PopoverTrigger className="flex">
          {children} <Icon.mark width={10} height={10} />
        </PopoverTrigger>
        <PopoverContent asChild side="top">
          {content}
        </PopoverContent>
      </Popover>
    </>
  );
}

export default TaxPopover;
