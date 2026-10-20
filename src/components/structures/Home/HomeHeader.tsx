"use client";

import { format, getISOWeek } from "date-fns";
import { enUS, es } from "date-fns/locale";

import type { Locale } from "@/types";

import { shortEmail } from "@/utils/helpers/shortEmail";
import useUser from "@/hooks/useUser";

import ThemeToggle from "./ThemeToggle";

const LOCALES = { en: enUS, es } as const;

/** Today's date as the headline, with a short greeting. */
function HomeHeader({ locale = "en" }: { locale?: Locale }) {
  const { data: user } = useUser();
  const now = new Date();
  const dateLocale = LOCALES[locale as keyof typeof LOCALES] ?? enUS;

  const name = user?.name
    ? user.name.split(" ")[0].trim()
    : user?.email
      ? shortEmail({ user })
      : null;

  return (
    <header className="flex items-end justify-between gap-3 pt-2">
      <div className="flex flex-col gap-1">
        <span className="text-[0.9375rem] text-ink-muted first-letter:uppercase">
          {format(now, "EEEE, MMMM", { locale: dateLocale })}
        </span>
        <h1 className="display-title text-[4.75rem] leading-[0.85] text-ink">{format(now, "d")}</h1>
      </div>
      <div className="flex flex-col items-end gap-3 self-stretch">
        <ThemeToggle />
        <p className="mt-auto mb-1.5 max-w-[11rem] text-right text-[0.9375rem] text-pretty text-ink-muted">
          {name ? `Hi ${name}, ` : "Welcome, "}
          this is week {getISOWeek(now)}.
        </p>
      </div>
    </header>
  );
}

export default HomeHeader;
