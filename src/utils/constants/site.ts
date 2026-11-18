import { PATH_NAMES } from "@/utils/constants/pathnames";

function siteOrigin() {
  const url =
    process.env.NEXT_PUBLIC_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";
  // The Vercel variables come without protocol.
  return new URL(/^https?:\/\//.test(url) ? url : `https://${url}`);
}

/** Public origin of the app, for absolute URLs (Open Graph, sitemap, robots). */
export const SITE_URL = siteOrigin();

/**
 * Pages search engines may list (paths without the locale). Everything
 * else in ROUTE_RULES is behind a session or a one-off link, and robots.ts
 * keeps crawlers out of it.
 */
export const INDEXABLE_PAGES = [
  PATH_NAMES.HOME,
  PATH_NAMES.INCOMES,
  PATH_NAMES.COMPARE,
  PATH_NAMES.REGISTER,
  PATH_NAMES.LOGIN,
] as const;
