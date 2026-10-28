"use client";

import { useState } from "react";

import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";

import { SUPPORTED_LOCALES } from "@/utils/constants";
import { type DateOrder, datePattern, type TimeFormat } from "@/utils/helpers/dateFormats";
import { isLocale } from "@/utils/helpers/locale";
import {
  applyTheme,
  isThemePreference,
  readThemeCookie,
  type ThemePreference,
} from "@/utils/theme";
import useDateLocale from "@/hooks/useDateLocale";
import usePreferences from "@/hooks/usePreferences";

import { Row, Section } from "./Section";
import Segmented from "./Segmented";
import { usePathname, useRouter } from "@/i18n/navigation";
import { usePreferencesDraft } from "@/store/usePreferencesDraft";

const LANGUAGES: Record<(typeof SUPPORTED_LOCALES)[number], string> = {
  en: "English",
  es: "Español",
};

/**
 * Theme (applies at once and follows you to other devices), language, and
 * how times and dates read (12/24 h, day or month first), which can differ
 * from the language's own (Spanish in Australia, say).
 */
function AppearanceSection() {
  const { config, save } = usePreferences();
  const locale = useLocale();
  const t = useTranslations("settings.appearance");
  const pathname = usePathname();
  const router = useRouter();
  const dateLocale = useDateLocale();
  const [now] = useState(() => new Date());
  const timeFormat = (config?.timeFormat ?? "auto") as TimeFormat;
  const dateFormat = (config?.dateFormat ?? "auto") as DateOrder;
  // Includes an unsaved choice, which is already previewed.
  const theme: ThemePreference = isThemePreference(config?.theme)
    ? config.theme
    : readThemeCookie();
  const setCarryOver = usePreferencesDraft((state) => state.setCarryOver);

  function onTheme(next: ThemePreference) {
    applyTheme(next);
    save({ theme: next });
  }

  function onLanguage(next: string) {
    if (next === locale || !isLocale(next)) return;
    // The page remounts in the other language; keep what isn't saved yet.
    setCarryOver(true);
    // Same page in the other language; also saves the choice (NEXT_LOCALE
    // cookie) so links and visits without a locale keep it.
    router.replace(pathname, { locale: next });
  }

  return (
    <Section title={t("title")}>
      <Row label={t("theme")} hint={t("theme_hint")} stacked>
        <Segmented
          label={t("theme")}
          value={theme}
          onChange={onTheme}
          options={[
            { value: "system", label: t("system") },
            { value: "light", label: t("light") },
            { value: "dark", label: t("dark") },
          ]}
        />
      </Row>
      <Row label={t("language")} stacked>
        <Segmented
          label={t("language")}
          value={locale}
          onChange={onLanguage}
          options={SUPPORTED_LOCALES.map((l) => ({ value: l, label: LANGUAGES[l] }))}
        />
      </Row>
      <Row
        label={t("time_format")}
        hint={t("example", { example: format(now, "p", { locale: dateLocale }) })}
        stacked
      >
        <Segmented
          label={t("time_format")}
          value={timeFormat}
          onChange={(value) => save({ timeFormat: value })}
          options={[
            { value: "auto", label: t("auto") },
            { value: "12", label: t("hours_12") },
            { value: "24", label: t("hours_24") },
          ]}
        />
      </Row>
      <Row
        label={t("date_format")}
        hint={t("example", {
          example: format(now, datePattern(dateLocale, "weekdayDayMonth"), { locale: dateLocale }),
        })}
        stacked
      >
        <Segmented
          label={t("date_format")}
          value={dateFormat}
          onChange={(value) => save({ dateFormat: value })}
          options={[
            { value: "auto", label: t("auto") },
            { value: "dmy", label: format(now, "d MMM", { locale: dateLocale }) },
            { value: "mdy", label: format(now, "MMM d", { locale: dateLocale }) },
          ]}
        />
      </Row>
    </Section>
  );
}

export default AppearanceSection;
