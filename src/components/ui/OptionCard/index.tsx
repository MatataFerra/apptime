import type { ReactNode } from "react";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { type CSSClassNames } from "@/types";

import { MODULE_THEMES, MODULES } from "@/utils/constants/modules";
import { PATH_NAMES } from "@/utils/constants/pathnames";
import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  title?: string;
  description?: string;
  /** Right-aligned detail (e.g. a total); replaces the chevron. */
  meta?: ReactNode;
  path?: string;
  classes?: CSSClassNames;
};

/**
 * Navigation row used on Home: icon, title, one-line description, chevron.
 */
function OptionCard({ title, description, meta, path = PATH_NAMES.HOME, classes }: Props) {
  const mod = MODULES[path];
  const Icon = mod?.icon ?? ChevronRight;
  const colors = MODULE_THEMES[mod?.theme ?? "neutral"];

  return (
    <Link
      href={path}
      data-testid={`option-card-${path.split("/")[1]}`}
      className={cn(
        "group flex min-h-14 items-center gap-3 px-3.5 py-2 transition-colors active:bg-surface-sunken",
        classes
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-[10px]",
          colors.soft,
          colors.ink
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        {title ? <span className="text-[0.9375rem] font-medium text-ink">{title}</span> : null}
        {description ? (
          <span className="truncate text-sm text-ink-muted">{description}</span>
        ) : null}
      </span>
      {meta ? (
        <span className="shrink-0 text-sm text-ink-muted tabular-nums">{meta}</span>
      ) : (
        <ChevronRight
          className="size-4 shrink-0 text-ink-subtle transition-transform group-active:translate-x-0.5"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}

export default OptionCard;
