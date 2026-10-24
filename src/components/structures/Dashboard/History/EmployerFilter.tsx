"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import type { EmployerFilter as Filter } from "@/services/History";

import { cn } from "@/utils/helpers/styleMerger";
import useEmployers from "@/hooks/useEmployers";

const ALL = "all";
const NONE = "none";

/**
 * "Berry Farm ▾": the history's employer filter, a chip next to the shift
 * types. Lists the employers that have shifts in the history (archived ones
 * too, they still own old shifts), and "No employer" when some have none.
 */
function EmployerFilter({
  value,
  onChange,
  employerIds,
  hasUnassigned,
}: {
  value: Filter;
  onChange: (value: Filter) => void;
  /** Employers with at least one shift in the history. */
  employerIds: number[];
  /** Whether some shifts have no employer. */
  hasUnassigned: boolean;
}) {
  const t = useTranslations("dashboard.history");
  const { byId } = useEmployers();

  const options = employerIds
    .map((id) => byId.get(id))
    .filter((employer) => employer !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (options.length === 0) return null;

  const active = value !== ALL;

  return (
    <span className="relative min-w-0 shrink-0">
      <select
        aria-label={t("employer_filter_label")}
        data-testid="history-employer-filter"
        value={String(value)}
        onChange={(e) => {
          const next = e.target.value;
          onChange(next === ALL || next === NONE ? next : Number(next));
        }}
        className={cn(
          "h-9 max-w-48 appearance-none truncate rounded-full border pr-8 pl-3.5 text-sm font-medium transition-colors",
          active
            ? "border-transparent bg-primary text-primary-foreground"
            : "border-border-strong bg-surface text-ink hover:bg-surface-sunken"
        )}
      >
        <option value={ALL}>{t("employer_all")}</option>
        {options.map((employer) => (
          <option key={employer.id} value={employer.id}>
            {employer.name}
          </option>
        ))}
        {hasUnassigned ? <option value={NONE}>{t("employer_none")}</option> : null}
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2",
          active ? "text-primary-foreground" : "text-ink-muted"
        )}
        aria-hidden="true"
      />
    </span>
  );
}

export default EmployerFilter;
