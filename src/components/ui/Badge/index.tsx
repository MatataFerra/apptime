import { CSSClassNames } from "@/types";

import { BADGE_STATUS } from "@/utils/constants/tailwind";
import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  classes?: CSSClassNames;
  text: string;
  state?: "active" | "inactive";
};

function Badge({ classes, state = "active", text }: Props) {
  return (
    <span
      className={cn(
        "flex h-3 w-3 items-center justify-center rounded-full p-2 text-[0.5rem] font-bold",
        BADGE_STATUS[state],
        classes
      )}
    >
      {text}
    </span>
  );
}

export default Badge;
