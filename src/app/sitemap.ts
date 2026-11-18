import type { MetadataRoute } from "next";

import { SUPPORTED_LOCALES } from "@/utils/constants";
import { PATH_NAMES } from "@/utils/constants/pathnames";
import { INDEXABLE_PAGES, SITE_URL } from "@/utils/constants/site";

function urlOf(path: string, locale: string) {
  return new URL(path === "/" ? `/${locale}` : `/${locale}${path}`, SITE_URL).href;
}

/** Every indexable page in each locale, each pointing at its translations. */
export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_PAGES.flatMap((path) => {
    const languages = Object.fromEntries(
      SUPPORTED_LOCALES.map((locale) => [locale, urlOf(path, locale)])
    );
    return SUPPORTED_LOCALES.map((locale) => ({
      url: urlOf(path, locale),
      changeFrequency: "monthly" as const,
      priority: path === PATH_NAMES.HOME ? 1 : 0.7,
      alternates: { languages },
    }));
  });
}
