import type { MetadataRoute } from "next";

import { ROUTE_RULES } from "@/services/Router/access";

import { SUPPORTED_LOCALES } from "@/utils/constants";
import { PATH_NAMES } from "@/utils/constants/pathnames";
import { INDEXABLE_PAGES, SITE_URL } from "@/utils/constants/site";

const indexable = new Set<string>(INDEXABLE_PAGES);

const hidden = [...Object.keys(ROUTE_RULES), PATH_NAMES.NO_MOBILE].filter(
  (path) => !indexable.has(path)
);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        ...SUPPORTED_LOCALES.flatMap((locale) => hidden.map((path) => `/${locale}${path}`)),
      ],
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).href,
  };
}
