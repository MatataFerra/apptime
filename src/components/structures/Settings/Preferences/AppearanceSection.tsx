"use client";

import { useState } from "react";

import { useLocale } from "next-intl";

import { SUPPORTED_LOCALES } from "@/utils/constants";
import { isLocale } from "@/utils/helpers/locale";
import {
  applyTheme,
  isThemePreference,
  readThemeCookie,
  type ThemePreference,
} from "@/utils/theme";
import usePreferences from "@/hooks/usePreferences";

import { Row, Section } from "./Section";
import Segmented from "./Segmented";
import { usePathname, useRouter } from "@/i18n/navigation";

const LANGUAGES: Record<(typeof SUPPORTED_LOCALES)[number], string> = {
  en: "English",
  es: "Español",
};

/** Theme (applies at once and follows you to other devices) and language. */
function AppearanceSection() {
  const { config, save } = usePreferences();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<ThemePreference>(() =>
    isThemePreference(config?.theme) ? config.theme : readThemeCookie()
  );

  function onTheme(next: ThemePreference) {
    setTheme(next);
    applyTheme(next);
    save({ theme: next });
  }

  function onLanguage(next: string) {
    if (next === locale || !isLocale(next)) return;
    // Same page in the other language; also saves the choice (NEXT_LOCALE
    // cookie) so links and visits without a locale keep it.
    router.replace(pathname, { locale: next });
  }

  return (
    <Section title="Appearance">
      <Row label="Theme" hint="System follows your phone." stacked>
        <Segmented
          label="Theme"
          value={theme}
          onChange={onTheme}
          options={[
            { value: "system", label: "System" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </Row>
      <Row label="Language" stacked>
        <Segmented
          label="Language"
          value={locale}
          onChange={onLanguage}
          options={SUPPORTED_LOCALES.map((l) => ({ value: l, label: LANGUAGES[l] }))}
        />
      </Row>
    </Section>
  );
}

export default AppearanceSection;
