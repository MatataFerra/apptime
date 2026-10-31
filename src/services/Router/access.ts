import { isVerificationOverdue } from "@/services/Auth/verification";

import { SUPPORTED_LOCALES, USER_ROLES } from "@/utils/constants";
import { PATH_NAMES } from "@/utils/constants/pathnames";

/**
 * Who can open each page. Paths without the locale; a route also covers
 * everything under it (/reset covers /reset/<token>). Pages not listed
 * here only get the locale added.
 *
 * - private: signed in only; /login otherwise, with ?redirect= back.
 * - guest: signed out only; signed-in users go Home.
 * - public: anyone.
 *
 * `desktop: true` lets the page open on a computer; everything else sends
 * desktops to /no-mobile.
 *
 * An account past its grace period without confirming its email is sent to
 * /verify-email from every listed page, except those with `unverified: true`.
 */
type Access = "private" | "guest" | "public";
type RouteRule = { access: Access; admin?: true; desktop?: true; unverified?: true };

export const ROUTE_RULES: Record<string, RouteRule> = {
  [PATH_NAMES.HOME]: { access: "public" },
  // Calculators: they read the user's defaults when signed in, nothing else.
  [PATH_NAMES.INCOMES]: { access: "public" },
  [PATH_NAMES.COMPARE]: { access: "public" },

  [PATH_NAMES.DASHBOARD]: { access: "private" },
  [PATH_NAMES.SETTINGS]: { access: "private" },
  [PATH_NAMES.TAXES]: { access: "private" },
  [PATH_NAMES.EMPLOYERS]: { access: "private" },
  [PATH_NAMES.EXTENSIONS]: { access: "private" },
  [PATH_NAMES.FAST_CHARGE]: { access: "private" },
  [PATH_NAMES.TRACK]: { access: "private" },
  [PATH_NAMES.PRODUCTION]: { access: "private" },
  [PATH_NAMES.ADMIN]: { access: "private", admin: true },

  [PATH_NAMES.LOGIN]: { access: "guest", desktop: true },
  [PATH_NAMES.REGISTER]: { access: "guest", desktop: true },
  [PATH_NAMES.RESET_PASSWORD]: { access: "guest" },
  [PATH_NAMES.RESET_SUCCESS]: { access: "guest" },
  // The link in the reset email: it may be opened on a computer, or while
  // signed in on this device, and should still work.
  [PATH_NAMES.RESET_TOKEN]: { access: "public", desktop: true, unverified: true },
  // Where a restricted account goes: resend the link or sign out. Only for
  // accounts that need it; the rest go Home.
  [PATH_NAMES.VERIFY_EMAIL]: { access: "private", desktop: true, unverified: true },
};

type Locale = (typeof SUPPORTED_LOCALES)[number];

export type AccessUser = {
  role?: string | null;
  emailVerified?: boolean | null;
  createdAt?: Date | string | null;
} | null;

export type AccessDecision =
  { type: "next" } | { type: "redirect"; pathname: string; redirectBack?: string };

/** The locale the pathname starts with (`/es/track` -> `es`), if any. */
export function localeOf(pathname: string): Locale | undefined {
  return SUPPORTED_LOCALES.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
}

/** `/es/track/x` -> `/track/x`; `/es` -> `/`. */
function withoutLocale(pathname: string, locale: Locale) {
  return pathname.slice(locale.length + 1) || "/";
}

function withLocale(path: string, locale: Locale) {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** The rule for a path without locale: exact match, or the closest parent. */
export function ruleFor(path: string): RouteRule | undefined {
  if (ROUTE_RULES[path]) return ROUTE_RULES[path];
  const parent = Object.keys(ROUTE_RULES)
    .filter((route) => route !== "/" && path.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0];
  return parent ? ROUTE_RULES[parent] : undefined;
}

/**
 * What the proxy does with a page request. `getUser` is called for every
 * listed page except the ones open to anyone, unverified accounts included.
 */
export async function decideAccess({
  pathname,
  preferredLocale,
  isMobile,
  getUser,
}: {
  pathname: string;
  /** From Accept-Language; used only when the URL has no locale. */
  preferredLocale: Locale;
  isMobile: boolean;
  getUser: () => Promise<AccessUser>;
}): Promise<AccessDecision> {
  const locale = localeOf(pathname);

  // No locale in the URL: add one (the browser's) and come back.
  if (!locale) {
    return { type: "redirect", pathname: withLocale(pathname, preferredLocale) };
  }

  const path = withoutLocale(pathname, locale);
  const home = withLocale(PATH_NAMES.HOME, locale);

  if (path === PATH_NAMES.NO_MOBILE) {
    return isMobile ? { type: "redirect", pathname: home } : { type: "next" };
  }

  const rule = ruleFor(path);
  if (!rule) return { type: "next" };

  if (!isMobile && !rule.desktop) {
    return { type: "redirect", pathname: withLocale(PATH_NAMES.NO_MOBILE, locale) };
  }

  if (rule.access === "public" && rule.unverified) return { type: "next" };

  const user = await getUser();
  const verifyEmail = withLocale(PATH_NAMES.VERIFY_EMAIL, locale);
  const overdue = isVerificationOverdue(user);

  if (overdue && !rule.unverified) {
    return { type: "redirect", pathname: verifyEmail };
  }

  if (rule.access === "public") return { type: "next" };

  if (rule.access === "guest") {
    return user ? { type: "redirect", pathname: home } : { type: "next" };
  }

  if (!user) {
    return {
      type: "redirect",
      pathname: withLocale(PATH_NAMES.LOGIN, locale),
      redirectBack: pathname,
    };
  }

  // Nothing to confirm (or still within the grace period): back Home.
  if (path === PATH_NAMES.VERIFY_EMAIL && !overdue) {
    return { type: "redirect", pathname: home };
  }

  if (rule.admin && user.role !== USER_ROLES.ADMIN) {
    return { type: "redirect", pathname: home };
  }

  return { type: "next" };
}
