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
        "flex h-5 w-5 items-center justify-center rounded-full p-3 text-xs font-bold",
        BADGE_STATUS[state],
        classes
      )}
    >
      {text}
    </span>
  );
}

export default Badge;
