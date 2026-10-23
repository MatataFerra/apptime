"use client";

import { type ReactNode, useId } from "react";

import { ChevronDown } from "lucide-react";

import { cn } from "@/utils/helpers/styleMerger";

/**
 * A setting of the shift on one line: label on the left, a pill select on
 * the right ("Employer  [Farm ▾]", "Paid in  [AUD ▾]"). Its own top margin
 * keeps it clear of the field above, whatever form it sits in.
 */
function SelectRow({
  label,
  value,
  onChange,
  children,
  classes,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** The `<option>`s. */
  children: ReactNode;
  classes?: string;
}) {
  const id = useId();

  return (
    <div className={cn("mt-3 mb-1 flex w-full items-center justify-between gap-3", classes)}>
      <label htmlFor={id} className="text-sm text-ink-muted">
        {label}
      </label>
      <span className="relative min-w-0">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 max-w-56 appearance-none truncate rounded-full border border-border-strong bg-surface pr-8 pl-3.5 text-sm font-semibold text-ink"
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
      </span>
    </div>
  );
}

export default SelectRow;
