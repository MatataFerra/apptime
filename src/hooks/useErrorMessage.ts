import { useTranslations } from "next-intl";

type Values = Record<string, string | number>;

/**
 * Text for an error a server action sent back: a key under "errors" is
 * translated; anything else (e.g. a message from a business register's
 * API) is shown as it came.
 */
function useErrorMessage() {
  const t = useTranslations("errors");
  // Keys arrive as plain strings at runtime; has() checks them first.
  const translate = t as unknown as {
    (key: string, values?: Values): string;
    has: (key: string) => boolean;
  };

  return function errorMessage(error?: string | null, values?: Values) {
    if (!error) return t("generic");
    return translate.has(error) ? translate(error, values) : error;
  };
}

export default useErrorMessage;
