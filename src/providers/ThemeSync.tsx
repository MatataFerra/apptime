"use client";

import { useEffect } from "react";

import { applyTheme, isThemePreference, readThemeCookie } from "@/utils/theme";
import useUser from "@/hooks/useUser";

/**
 * Keeps the page in step with the theme saved in the account (so a new
 * device picks it up) and with the phone's setting when it's "system".
 */
function ThemeSync() {
  const { data: user } = useUser();
  const saved = user?.config?.theme;

  useEffect(() => {
    if (isThemePreference(saved) && saved !== readThemeCookie()) applyTheme(saved);
  }, [saved]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readThemeCookie() === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return null;
}

export default ThemeSync;
