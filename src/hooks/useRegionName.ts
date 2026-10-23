import { useLocale } from "next-intl";

/** A country's name in the app's language from its ISO code ("AU" -> "Australia"). */
function useRegionName() {
  const locale = useLocale();
  const names = new Intl.DisplayNames([locale], { type: "region" });

  return function regionName(code: string, fallback: string) {
    try {
      return (code && names.of(code)) || fallback;
    } catch {
      return fallback;
    }
  };
}

export default useRegionName;
