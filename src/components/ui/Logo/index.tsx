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
 * Brand mark: an open clock that reads as the "c" of casual.
 * The ring follows the current text colour; the hands use the accent.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-6", className)}>
      <path
        d="M26.4 10 A12 12 0 1 0 26.4 22"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M16 16 L16 9.5 M16 16 L20 18.5"
        stroke="var(--color-accent)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
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
          casualapp
        </span>
      ) : null}
    </Link>
  );
}

export default Logo;
