"use client";

import { useEffect } from "react";

import { useTranslations } from "next-intl";
import { z } from "zod";

/**
 * Zod's default messages ("Required", "Invalid email"…) in the current
 * language, for every schema used on the client. A message written in a
 * schema (`.min(1, "…")`) still wins over these.
 */
function ZodI18n() {
  const t = useTranslations("validation");

  useEffect(() => {
    z.setErrorMap((issue, ctx) => {
      switch (issue.code) {
        case z.ZodIssueCode.invalid_type:
          return {
            message:
              issue.received === "undefined" || issue.received === "null"
                ? t("required")
                : t("invalid_value"),
          };
        case z.ZodIssueCode.invalid_string:
          return {
            message: issue.validation === "email" ? t("invalid_email") : t("invalid_value"),
          };
        case z.ZodIssueCode.too_small:
          if (issue.type === "string") {
            return {
              message:
                Number(issue.minimum) <= 1
                  ? t("required")
                  : t("min_chars", { min: Number(issue.minimum) }),
            };
          }
          if (issue.type === "number")
            return { message: t("min_number", { min: Number(issue.minimum) }) };
          return { message: ctx.defaultError };
        case z.ZodIssueCode.too_big:
          if (issue.type === "string")
            return { message: t("max_chars", { max: Number(issue.maximum) }) };
          if (issue.type === "number")
            return { message: t("max_number", { max: Number(issue.maximum) }) };
          return { message: ctx.defaultError };
        default:
          return { message: ctx.defaultError };
      }
    });
  }, [t]);

  return null;
}

export default ZodI18n;
