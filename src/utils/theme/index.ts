export const THEMES = ["system", "light", "dark"] as const;
export type ThemePreference = (typeof THEMES)[number];

export const THEME_COOKIE = "theme";

export function isThemePreference(value: unknown): value is ThemePreference {
  return THEMES.includes(value as ThemePreference);
}

/**
 * Runs in <head> before the first paint, so a dark-mode user never sees a
 * white flash: reads the cookie and sets the `dark` class on <html>.
 */
export const THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark|system)/);var p=m?m[1]:"system";var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

/** The cookie value set by applyTheme, read on the client. */
export function readThemeCookie(): ThemePreference {
  if (typeof document === "undefined") return "system";
  const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([a-z]+)`));
  return isThemePreference(match?.[1]) ? match[1] : "system";
}

/** Saves the preference for the next load and applies it now. */
export function applyTheme(preference: ThemePreference) {
  document.cookie = `${THEME_COOKIE}=${preference}; path=/; max-age=31536000; samesite=lax`;
  const dark =
    preference === "dark" ||
    (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}
