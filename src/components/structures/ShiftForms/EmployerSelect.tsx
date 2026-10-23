"use client";

import Link from "next/link";

import type { SavedEmployer } from "@/types";

import SelectRow from "@/components/structures/ShiftForms/SelectRow";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import { cn } from "@/utils/helpers/styleMerger";
import useEmployers from "@/hooks/useEmployers";

const NONE = "";

/**
 * "Employer  [Farm ▾]": who the shift is for. Lists the active employers;
 * an archived one only shows when this shift already points at it.
 * `onChange` gets the whole employer so the form can prefill its rate.
 */
function EmployerSelect({
  value,
  onChange,
  classes,
}: {
  value: number | null | undefined;
  onChange: (employer: SavedEmployer | null) => void;
  /** Overrides the row's own spacing, e.g. inside a gap-based column. */
  classes?: string;
}) {
  const { employers, byId, isLoading } = useEmployers();
  const current = value != null ? byId.get(value) : undefined;
  const options = current?.archived ? [...employers, current] : employers;

  // Nothing to pick yet: point to where they're added instead of an empty select.
  if (!isLoading && options.length === 0) {
    return (
      <div
        className={cn("mt-3 mb-1 flex w-full items-center justify-between gap-3 text-sm", classes)}
      >
        <span className="text-ink-muted">Employer</span>
        <Link
          href={PATH_NAMES.EMPLOYERS}
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          Add one
        </Link>
      </div>
    );
  }

  return (
    <SelectRow
      label="Employer"
      classes={classes}
      value={value != null ? String(value) : NONE}
      onChange={(id) => onChange(id === NONE ? null : (byId.get(Number(id)) ?? null))}
    >
      <option value={NONE}>None</option>
      {options.map((employer) => (
        <option key={employer.id} value={employer.id}>
          {employer.name}
          {employer.archived ? " (removed)" : ""}
        </option>
      ))}
    </SelectRow>
  );
}

export default EmployerSelect;
