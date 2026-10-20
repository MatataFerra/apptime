"use client";

import { useState } from "react";

import { Moon, Sun } from "lucide-react";

import { applyTheme } from "@/utils/theme";
import usePreferences from "@/hooks/usePreferences";

function isDark() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

/**
 * One tap between light and dark from Home. It sets an explicit theme
 * (same as picking it in Settings); "System" stays available there.
 */
function ThemeToggle() {
  const { save } = usePreferences();
  const [dark, setDark] = useState(isDark);

  function toggle() {
    const next = isDark() ? "light" : "dark";
    applyTheme(next);
    setDark(next === "dark");
    save({ theme: next }, { silent: true });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-ink transition-colors hover:bg-surface-sunken"
    >
      {dark ? (
        <Sun className="size-4.5" strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <Moon className="size-4.5" strokeWidth={1.75} aria-hidden="true" />
      )}
    </button>
  );
}

export default ThemeToggle;
