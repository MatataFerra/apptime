"use client";

import SelectRow from "@/components/structures/ShiftForms/SelectRow";

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
  const fallback = useCurrency();
  const current = value || fallback;

  return (
    <SelectRow
      label="Paid in"
      value={current}
      onChange={(code) => onChange(code === fallback ? null : code)}
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} · {c.label}
        </option>
      ))}
    </SelectRow>
  );
}

export default CurrencySelect;
