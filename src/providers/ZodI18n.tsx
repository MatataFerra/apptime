"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";
import { z } from "zod";

/**
 * Zod's default messages ("Required", "Invalid email"…) in the current
 * language, for every schema used on the client. A message written in a
 * schema (`.min(1, "…")` or `{ error: "…" }`) still wins over these;
 * anything not handled here falls back to Zod's own message.
 */
function ZodI18n() {
  const t = useTranslations("validation");

  useEffect(() => {
    z.config({
      customError: (issue) => {
        switch (issue.code) {
          case "invalid_type":
            return issue.input === undefined || issue.input === null
              ? t("required")
              : t("invalid_value");
          case "invalid_format":
            return issue.format === "email" ? t("invalid_email") : t("invalid_value");
          case "too_small":
            if (issue.origin === "string") {
              return Number(issue.minimum) <= 1
                ? t("required")
                : t("min_chars", { min: Number(issue.minimum) });
            }
            if (issue.origin === "number" || issue.origin === "int") {
              return t("min_number", { min: Number(issue.minimum) });
            }
            return undefined;
          case "too_big":
            if (issue.origin === "string") return t("max_chars", { max: Number(issue.maximum) });
            if (issue.origin === "number" || issue.origin === "int") {
              return t("max_number", { max: Number(issue.maximum) });
            }
            return undefined;
          default:
            return undefined;
        }
      },
    });
  }, [t]);

  return null;
}

export default ZodI18n;
