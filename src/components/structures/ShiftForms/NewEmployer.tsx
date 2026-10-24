"use client";

import { useId, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import type ApiEmployers from "@/services/Api/Employer";
import Toast from "@/services/Toast";

import type { SavedEmployer } from "@/types";

import Button from "@/components/ui/Button";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import useErrorMessage from "@/hooks/useErrorMessage";

import { onCreateEmployer } from "@/server-actions/employers";

type EmployersData = Awaited<ReturnType<typeof ApiEmployers.getAll>>;

/**
 * Adds an employer without leaving the form: just the name, saved with the
 * shift's rate and currency as its defaults. The rest (ABN, address…) is
 * filled in later from Employers.
 */
function NewEmployer({
  defaultRate,
  defaultCurrency,
  onCreated,
  onCancel,
}: {
  defaultRate?: number | null;
  defaultCurrency?: string | null;
  onCreated: (employer: SavedEmployer) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const queryClient = useQueryClient();
  const t = useTranslations("shift.fields");
  const errorMessage = useErrorMessage();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setBusy(true);
    const result = await onCreateEmployer({
      name,
      defaultRate: defaultRate && defaultRate > 0 ? defaultRate : null,
      defaultCurrency: defaultCurrency ?? null,
    }).catch(() => null);

    if (!result?.ok) {
      setBusy(false);
      Toast({
        type: "error",
        message: t("new_employer_failed"),
        description: errorMessage(result?.error),
      });
      return;
    }

    // Refetch the list so the pickers know the new one, then select it.
    await queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.EMPLOYERS] });
    const data = queryClient.getQueryData<EmployersData>([USE_QUERY_KEYS.EMPLOYERS]);
    const created = data?.employers.find((employer) => employer.id === result.id);
    setBusy(false);
    if (created) onCreated(created);
    else onCancel();
  }

  return (
    <div className="mt-3 mb-1 flex w-full flex-col gap-2.5 rounded-xl border border-border bg-surface-sunken p-3">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {t("new_employer_name")}
      </label>
      <input
        id={id}
        autoFocus
        value={name}
        maxLength={80}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void save();
          }
        }}
        className="h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-[0.9375rem] text-ink outline-none focus:border-accent focus:ring-3 focus:ring-accent/15"
      />
      <p className="text-[0.8125rem] text-ink-muted">{t("new_employer_hint")}</p>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="ghost" size="sm" classes="w-full" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button
          type="button"
          variant="accent"
          size="sm"
          classes="w-full"
          disabled={busy || !name.trim()}
          onClick={save}
        >
          {busy ? t("saving_employer") : t("save_employer")}
        </Button>
      </div>
    </div>
  );
}

export default NewEmployer;
