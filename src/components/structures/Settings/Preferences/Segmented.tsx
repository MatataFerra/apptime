"use client";

import { cn } from "@/utils/helpers/styleMerger";

/** A small radio group drawn as joined buttons. */
function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid w-full gap-1 rounded-xl bg-surface-sunken p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 rounded-lg text-sm font-medium transition-colors",
              checked ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default Segmented;
