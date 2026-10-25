"use client";

import { useTranslations } from "next-intl";

import SelectRow, { PillSelect } from "@/components/structures/ShiftForms/SelectRow";

import { CURRENCIES } from "@/utils/constants/currencies";
import useCurrencyName from "@/hooks/useCurrencyName";
import { useCurrency } from "@/hooks/useMoney";

/**
 * "Paid in USD": the currency of this shift. Starts on the one from
 * Settings; null keeps following it.
 */
function CurrencySelect({
  value,
  onChange,
  pill,
}: {
  value: string | null | undefined;
  onChange: (currency: string | null) => void;
  /** Just the select, e.g. next to the rate it applies to. Shows codes only. */
  pill?: boolean;
}) {
  const fallback = useCurrency();
  const t = useTranslations("shift.fields");
  const currencyName = useCurrencyName();
  const current = value || fallback;

  const options = CURRENCIES.map((c) => ({
    value: c.code as string,
    label: `${c.code} · ${currencyName(c.code)}`,
  }));
  function pick(code: string) {
    onChange(code === fallback ? null : code);
  }

  if (pill) {
    return (
      <PillSelect
        label={t("paid_in")}
        value={current}
        options={options.map((o) => ({ ...o, label: o.value }))}
        onChange={pick}
      />
    );
  }

  return <SelectRow label={t("paid_in")} value={current} options={options} onChange={pick} />;
}

export default CurrencySelect;
