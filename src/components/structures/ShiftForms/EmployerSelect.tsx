"use client";

import { useState } from "react";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import type { SavedEmployer } from "@/types";

import NewEmployer from "@/components/structures/ShiftForms/NewEmployer";
import SelectRow from "@/components/structures/ShiftForms/SelectRow";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import { cn } from "@/utils/helpers/styleMerger";
import useEmployers from "@/hooks/useEmployers";

import { Link } from "@/i18n/navigation";

const NONE = "none";
const NEW = "__new__";

/**
 * "Employer  [Farm ▾]": who the shift is for. Lists the active employers;
 * an archived one only shows when this shift already points at it.
 * `onChange` gets the whole employer so the form can prefill its rate.
 *
 * With `allowCreate`, a "New employer…" option adds one right here (name
 * only, saved with `newDefaults` as its rate and currency) and selects it.
 */
function EmployerSelect({
  value,
  onChange,
  classes,
  allowCreate = false,
  createLink = false,
  newDefaults,
}: {
  value: number | null | undefined;
  onChange: (employer: SavedEmployer | null) => void;
  /** Overrides the row's own spacing, e.g. inside a gap-based column. */
  classes?: string;
  allowCreate?: boolean;
  /** With `allowCreate`: when nothing is picked, also a link under the row to add one. */
  createLink?: boolean;
  newDefaults?: { rate?: number | null; currency?: string | null };
}) {
  const { employers, byId, isLoading } = useEmployers();
  const t = useTranslations("shift.fields");
  const [creating, setCreating] = useState(false);
  const current = value != null ? byId.get(value) : undefined;
  const options = current?.archived ? [...employers, current] : employers;

  if (creating) {
    return (
      <NewEmployer
        defaultRate={newDefaults?.rate}
        defaultCurrency={newDefaults?.currency}
        onCancel={() => setCreating(false)}
        onCreated={(employer) => {
          setCreating(false);
          onChange(employer);
        }}
      />
    );
  }

  // Nothing to pick yet: add one here, or point to where they're added.
  if (!isLoading && options.length === 0 && allowCreate) {
    return (
      <div
        className={cn("mt-3 mb-1 flex w-full items-center justify-between gap-3 text-sm", classes)}
      >
        <span className="text-ink-muted">{t("employer")}</span>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          {t("add_employer")}
        </button>
      </div>
    );
  }

  if (!isLoading && options.length === 0) {
    return (
      <div
        className={cn("mt-3 mb-1 flex w-full items-center justify-between gap-3 text-sm", classes)}
      >
        <span className="text-ink-muted">{t("employer")}</span>
        <Link
          href={PATH_NAMES.EMPLOYERS}
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          {t("add_employer")}
        </Link>
      </div>
    );
  }

  const row = (
    <SelectRow
      label={t("employer")}
      classes={classes}
      value={value != null ? String(value) : NONE}
      searchPlaceholder={t("search_employer")}
      options={[
        ...options.map((employer) => ({
          value: String(employer.id),
          label: employer.archived ? `${employer.name} ${t("removed")}` : employer.name,
        })),
        { value: NONE, label: t("no_employer"), muted: true, separated: options.length > 0 },
        ...(allowCreate
          ? [{ value: NEW, label: t("new_employer"), action: true, separated: true }]
          : []),
      ]}
      onChange={(id) => {
        if (id === NEW) return setCreating(true);
        onChange(id === NONE ? null : (byId.get(Number(id)) ?? null));
      }}
    />
  );

  // No employer yet: say so, with the way to add one in plain sight.
  if (createLink && value == null) {
    return (
      <div className={cn("flex w-full flex-col", classes)}>
        {row}
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="mt-1 flex w-fit items-center gap-1 self-end text-[0.8125rem] font-semibold text-accent underline-offset-4 hover:underline"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          {t("create_employer_for_shift")}
        </button>
      </div>
    );
  }

  return row;
}

export default EmployerSelect;
