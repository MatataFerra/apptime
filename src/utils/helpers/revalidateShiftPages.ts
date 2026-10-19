import { revalidatePath } from "next/cache";

/**
 * Route patterns as revalidatePath expects them: the file structure,
 * route groups included, with `type` because of the [locale] segment.
 * A literal "/dashboard" never matched the localized routes.
 */
export const SHIFT_PAGES = ["/[locale]/(home)", "/[locale]/(home)/dashboard"] as const;
export const SETTINGS_PAGE = "/[locale]/(home)/settings";

/** Pages that show shift data: Home (week, month) and the Dashboard. */
export function revalidateShiftPages() {
  SHIFT_PAGES.forEach((path) => revalidatePath(path, "page"));
}

export function revalidateSettingsPage() {
  revalidatePath(SETTINGS_PAGE, "page");
}
