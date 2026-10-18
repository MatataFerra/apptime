import type { ReactNode } from "react";

import { MODULE_THEMES, MODULES, type ModuleTheme } from "@/utils/constants/modules";
import { GRADIENTS } from "@/utils/constants/tailwind";
import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  title: string;
  subtitle?: string;
  /** Path of the module (PATH_NAMES.*): picks its colour and icon. */
  module?: string;
  /** Overrides the theme picked from `module`. */
  theme?: ModuleTheme;
  aside?: ReactNode;
  /** @deprecated ignored, kept for compatibility */
  gradient?: keyof typeof GRADIENTS;
};

/**
 * Module header: a tinted band that continues the sticky app header,
 * with the module's icon, a condensed title and a one-line description.
 */
function ModuleTitle({ title, subtitle, module, theme, aside }: Props) {
  const mod = module ? MODULES[module] : undefined;
  const key = theme ?? mod?.theme ?? "neutral";
  const colors = MODULE_THEMES[key];
  const Icon = mod?.icon;
  const banded = key !== "neutral";

  return (
    <header
      className={cn(
        "-mx-4 flex items-end justify-between gap-3 self-stretch px-5 pt-2",
        banded ? "rounded-b-[28px] bg-(--band) pb-6" : "pb-2"
      )}
    >
      <div className="flex min-w-0 items-start gap-3.5">
        {Icon && banded ? (
          <span
            className={cn(
              "flex size-13 shrink-0 items-center justify-center rounded-2xl text-white",
              colors.strong
            )}
          >
            <Icon className="size-6.5" strokeWidth={1.75} aria-hidden="true" />
          </span>
        ) : null}
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="display-title text-5xl text-ink">{title}</h1>
          {subtitle ? (
            <p
              className={cn("text-[0.9375rem] text-pretty", banded ? colors.ink : "text-ink-muted")}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </header>
  );
}

export default ModuleTitle;
