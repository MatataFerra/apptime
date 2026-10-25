"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

type Result = { created: number; skipped: unknown[] };

/**
 * Saving a batch: a few seconds against the database, so the user isn't
 * left wondering. A toast stays up ("Saving 9 shifts…, you can keep using
 * the app") until the server answers, and then says what happened. It
 * lives outside the form, so leaving the page doesn't lose the answer.
 * A failed or dropped request ends in an error, never in a stuck button.
 */
function useBatchSave(module: "hourly" | "production") {
  const t = useTranslations("shift");
  const tb = useTranslations("shift.batch");
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  async function run(count: number, save: () => Promise<Result | null>, onSaved: () => void) {
    if (saving) return;
    setSaving(true);
    Toast({
      type: "loading",
      message: tb("saving", { count }),
      description: tb("saving_hint"),
      duration: Infinity,
    });

    let response: Result | null = null;
    try {
      response = await save();
    } catch {
      response = null;
    } finally {
      setSaving(false);
    }

    if (!response) {
      Toast({ type: "error", message: t("save_failed"), description: t("try_again") });
      return;
    }

    const shifts = module === "hourly" ? USE_QUERY_KEYS.HOURLY : USE_QUERY_KEYS.PRODUCTION;
    [shifts, USE_QUERY_KEYS.SALARY, USE_QUERY_KEYS.USER].forEach((key) =>
      queryClient.invalidateQueries({ queryKey: [key] })
    );

    Toast({
      type: response.created > 0 ? "success" : "error",
      message: tb("created", { count: response.created }),
      description: response.skipped.length
        ? tb("skipped", { count: response.skipped.length })
        : undefined,
    });

    if (response.created > 0) onSaved();
  }

  return { saving, run };
}

export default useBatchSave;
