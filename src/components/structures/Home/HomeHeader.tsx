import { format, getISOWeek } from "date-fns";
import { getLocale, getTranslations } from "next-intl/server";

import { getSession } from "@/utils/auth/session";
import { dateLocaleFor } from "@/utils/helpers/dateFormats";
import { shortEmail } from "@/utils/helpers/shortEmail";
import { getUserNow } from "@/utils/helpers/userNow";

import ThemeToggle from "./ThemeToggle";

/**
 * Today's date as the headline, with a short greeting. A server component:
 * it's in the first HTML, in the user's time zone (getUserNow), and only
 * the theme button hydrates.
 */
async function HomeHeader() {
  const [session, now, locale, t] = await Promise.all([
    getSession(),
    getUserNow(),
    getLocale(),
    getTranslations("home.header"),
  ]);
  const dateLocale = dateLocaleFor(locale);
  const user = session?.user;

  const name = user?.name
    ? user.name.split(" ")[0].trim()
    : user?.email
      ? shortEmail({ user })
      : null;

  return (
    <header className="flex items-end justify-between gap-3 pt-2">
      <div className="flex flex-col gap-1">
        <span className="text-[1.0625rem] text-ink-muted first-letter:uppercase">
          {format(now, "EEEE, MMMM", { locale: dateLocale })}
        </span>
        <h1 className="display-title text-[5.25rem] leading-[0.85] text-ink">{format(now, "d")}</h1>
      </div>
      <div className="flex flex-col items-end gap-3 self-stretch">
        <ThemeToggle />
        <p className="mt-auto mb-1.5 max-w-[12.5rem] text-right text-[1.0625rem] text-pretty text-ink-muted">
          {name
            ? t("greeting_name", { name, week: getISOWeek(now) })
            : t("greeting", { week: getISOWeek(now) })}
        </p>
      </div>
    </header>
  );
}

export default HomeHeader;
