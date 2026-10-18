import {
  ArrowLeftRight,
  ChartColumn,
  ChevronRight,
  Coins,
  type LucideIcon,
  Package,
  Timer,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { type CSSClassNames } from "@/types";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  title?: string;
  description?: string;
  path?: string;
  classes?: CSSClassNames;
};

const ICONS: Record<string, LucideIcon> = {
  [PATH_NAMES.FAST_CHARGE]: Zap,
  [PATH_NAMES.TRACK]: Timer,
  [PATH_NAMES.PRODUCTION]: Package,
  [PATH_NAMES.DASHBOARD]: ChartColumn,
  [PATH_NAMES.INCOMES]: Coins,
  [PATH_NAMES.COMPARE]: ArrowLeftRight,
};

/**
 * Navigation row used on Home: icon, title, one-line description, chevron.
 */
function OptionCard({ title, description, path = PATH_NAMES.HOME, classes }: Props) {
  const Icon = ICONS[path] ?? ChevronRight;

  return (
    <Link
      href={path}
      data-testid={`option-card-${path.split("/")[1]}`}
      className={cn(
        "group flex min-h-16 items-center gap-3 px-4 py-3 transition-colors active:bg-surface-sunken",
        classes
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-ink">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        {title ? <span className="text-base font-medium text-ink">{title}</span> : null}
        {description ? (
          <span className="truncate text-sm text-ink-muted">{description}</span>
        ) : null}
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-ink-subtle transition-transform group-active:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

export default OptionCard;
