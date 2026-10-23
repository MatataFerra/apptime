import type { Messages } from "next-intl";

/**
 * A key under "errors" in messages/*.json. Server actions return one of
 * these instead of a sentence: they don't know the visitor's language,
 * the client translates it with `useTranslations("errors")`.
 */
export type ErrorKey = keyof Messages["errors"];

/** What a server action answers when it only says whether it worked. */
export type ActionResult = { response: true } | { response: false; error: ErrorKey };
