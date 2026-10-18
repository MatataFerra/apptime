import Link from "next/link";

import { MODULE_THEMES, MODULES } from "@/utils/constants/modules";
import { PATH_NAMES } from "@/utils/constants/pathnames";
import { cn } from "@/utils/helpers/styleMerger";

const ITEMS = [
  { path: PATH_NAMES.TRACK, title: "Track" },
  { path: PATH_NAMES.FAST_CHARGE, title: "Fast charge" },
  { path: PATH_NAMES.PRODUCTION, title: "Production" },
];

/** The three ways to log work, each in its module colour. */
function Features() {
  return (
    <div className="grid w-full grid-cols-3 gap-2.5">
      {ITEMS.map(({ path, title }) => {
        const { theme, icon: Icon } = MODULES[path];
        const colors = MODULE_THEMES[theme];

        return (
          <Link
            key={path}
            href={path}
            data-testid={`option-card-${path.split("/")[1]}`}
            className={cn(
              "flex min-h-24 flex-col justify-between gap-4 rounded-2xl px-3 py-3.5 transition-transform active:scale-[0.97]",
              colors.soft,
              colors.ink
            )}
          >
            <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[0.9375rem] font-semibold">{title}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default Features;
