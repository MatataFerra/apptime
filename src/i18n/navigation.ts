import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware versions of Next's navigation APIs: `href="/track"` goes to
 * `/{current locale}/track`. Use these instead of next/link and
 * next/navigation for links inside the app.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
