"use client";

import { useId } from "react";

import { ChevronDown } from "lucide-react";

import { CURRENCIES } from "@/utils/constants/currencies";
import { useCurrency } from "@/hooks/useMoney";

/**
 * "Paid in USD": the currency of this shift. Starts on the one from
 * Settings; null keeps following it.
 */
function CurrencySelect({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (currency: string | null) => void;
}) {
  const id = useId();
  const fallback = useCurrency();
  const current = value || fallback;

  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm text-ink-muted">
        Paid in
      </label>
      <span className="relative">
        <select
          id={id}
          value={current}
          onChange={(e) => onChange(e.target.value === fallback ? null : e.target.value)}
          className="h-9 appearance-none rounded-full border border-border-strong bg-surface pr-8 pl-3.5 text-sm font-semibold text-ink"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} · {c.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
      </span>
    </div>
  );
}

export default CurrencySelect;
