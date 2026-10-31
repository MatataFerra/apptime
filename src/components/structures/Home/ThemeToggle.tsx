"use client";

import { useSyncExternalStore } from "react";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

import { applyTheme } from "@/utils/theme";
import usePreferences from "@/hooks/usePreferences";

function isDark() {
  return document.documentElement.classList.contains("dark");
}

/** The `dark` class on <html> changes (here, in Settings or by ThemeSync). */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/**
 * One tap between light and dark from Home. It sets an explicit theme
 * (same as picking it in Settings); "System" stays available there.
 *
 * Rendered on the server inside HomeHeader: the server can't see the
 * `dark` class, so the icon follows it in CSS (no flash) and the label
 * catches up right after hydration (no mismatch).
 */
function ThemeToggle() {
  const { save } = usePreferences();
  const t = useTranslations("home.theme");
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = isDark() ? "light" : "dark";
    applyTheme(next);
    save({ theme: next }, { silent: true });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? t("to_light") : t("to_dark")}
      aria-pressed={dark}
      className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-ink transition-colors hover:bg-surface-sunken"
    >
      <Sun className="hidden size-4.5 dark:block" strokeWidth={1.75} aria-hidden="true" />
      <Moon className="size-4.5 dark:hidden" strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

export default ThemeToggle;
