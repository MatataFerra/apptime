"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SheetClose } from "@/components/ui/Sheet";

import { MODULE_THEMES, MODULES } from "@/utils/constants/modules";
import { cn } from "@/utils/helpers/styleMerger";

type Option = {
  id: string;
  label: string;
  dataTestId: string;
  url: string;
};

type Props = {
  option: Option;
};

function Option({ option }: Props) {
  const pathname = usePathname();
  const mod = MODULES[option.url];
  const colors = MODULE_THEMES[mod?.theme ?? "neutral"];
  const Icon = mod?.icon;
  const active = pathname?.split("/").includes(option.url.replace("/", ""));

  return (
    <SheetClose asChild>
      <Link
        href={option.url}
        data-testid={option.dataTestId}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex min-h-12 items-center gap-3 rounded-xl py-1.5 pr-5 pl-2 text-[0.9375rem] font-medium text-ink transition-colors",
          active ? "bg-surface-sunken" : "hover:bg-surface-sunken/70"
        )}
      >
        {Icon ? (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
              colors.soft,
              colors.ink
            )}
          >
            <Icon className="size-4.5" strokeWidth={2} aria-hidden="true" />
          </span>
        ) : null}
        <span className="flex-1">{option.label}</span>
        {active ? (
          <span className={cn("size-1.5 rounded-full", colors.strong)} aria-hidden="true" />
        ) : null}
      </Link>
    </SheetClose>
  );
}

export default Option;
