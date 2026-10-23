import type messages from "../../messages/en.json";
import type { routing } from "@/i18n/routing";

/**
 * Typed translations: keys passed to `t()` are checked against en.json,
 * and `useLocale()` returns "en" | "es".
 */
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
