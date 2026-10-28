import type { ErrorKey } from "@/types/i18n";

/** A text field inside an expanded settings row. */
export const FIELD =
  "h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem] text-ink outline-hidden transition-colors placeholder:text-ink-subtle focus:border-accent";

/** The panel a row opens into (change email, change password…). */
export const PANEL = "flex flex-col gap-3 bg-surface-sunken/60 px-4 py-4";

/** Query keys for what this section reads. */
export const SECURITY_KEYS = {
  accounts: ["auth", "accounts"],
  sessions: ["auth", "sessions"],
} as const;

/** Better Auth client error codes, as messages the app already has. */
export function authErrorKey(code?: string | null): ErrorKey {
  switch (code) {
    case "INVALID_PASSWORD":
      return "password_wrong";
    case "PASSWORD_TOO_SHORT":
    case "PASSWORD_TOO_LONG":
      return "password_invalid";
    case "SESSION_NOT_FRESH":
      return "session_not_fresh";
    case "PASSWORD_ALREADY_SET":
      return "password_already_set";
    case "TOO_MANY_REQUESTS":
      return "too_many_attempts";
    default:
      return "generic";
  }
}
