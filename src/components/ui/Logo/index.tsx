"use client";

import { useTranslations } from "next-intl";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import { cn } from "@/utils/helpers/styleMerger";

import { Link } from "@/i18n/navigation";

interface Props {
  withText?: boolean;
  classes?: string;
}

/**
 * Brand mark: a compass — a ring with a tilted needle.
 * The ring and the south half follow the current text colour; the north half uses the accent.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-6", className)}>
      <circle cx="16" cy="16" r="12.5" stroke="currentColor" strokeWidth="3" fill="none" />
      <g transform="rotate(40 16 16)">
        <path d="M16 6.5 L19.4 16 L12.6 16 Z" fill="var(--color-accent)" />
        <path d="M16 25.5 L19.4 16 L12.6 16 Z" fill="currentColor" />
      </g>
    </svg>
  );
}

function Logo({ withText, classes }: Props) {
  const t = useTranslations("nav");

  return (
    <Link
      href={PATH_NAMES.HOME}
      aria-label={t("home_label")}
      className={cn("flex items-center gap-1.5 rounded-md text-ink select-none", classes)}
    >
      <LogoMark className="size-7" />
      {withText ? (
        <span className="font-logo text-[1.375rem] leading-none font-extrabold tracking-[-0.03em]">
          nomadshift
        </span>
      ) : null}
    </Link>
  );
}

export default Logo;
