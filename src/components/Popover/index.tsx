import { CSSClassNames } from "@/types";

import Icon from "@/components/ui/Icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  content?: (string | React.ReactElement)[] | string | React.ReactElement;
  side?: "left" | "right" | "top" | "bottom";
  classes?: CSSClassNames;
  trigger?: (string | React.ReactElement)[] | string | React.ReactElement;
};

function PopoverBase({ content, side = "top", classes, trigger }: Props) {
  return (
    <Popover>
      <PopoverTrigger>{trigger ? trigger : <Icon.mark />}</PopoverTrigger>
      <PopoverContent side={side} className={cn("w-60", classes)}>
        {content}
      </PopoverContent>
    </Popover>
  );
}

export default PopoverBase;
