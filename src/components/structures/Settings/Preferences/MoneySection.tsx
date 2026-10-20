"use client";

import { useId } from "react";

import { ChevronDown } from "lucide-react";

import { CURRENCIES, currencySymbol } from "@/utils/constants/currencies";
import { useCurrency } from "@/hooks/useMoney";
import usePreferences from "@/hooks/usePreferences";

import NumberSetting from "./NumberSetting";
import { Row, Section } from "./Section";
import Segmented from "./Segmented";

/** Currency and the values that prefill new shifts and Estimate. */
function MoneySection() {
  const { config, save } = usePreferences();
  const currency = useCurrency();
  const currencyId = useId();
  const symbol = currencySymbol(currency);
  const weekStartsOn = config?.weekStartsOn === "sunday" ? "sunday" : "monday";

  return (
    <Section
      title="Money and defaults"
      description="New shifts start with these. You can change them on each shift."
    >
      <Row label="Currency" hint="For totals and new shifts." htmlFor={currencyId}>
        <span className="relative shrink-0">
          <select
            id={currencyId}
            value={currency}
            onChange={(e) => save({ currency: e.target.value })}
            className="h-10 appearance-none rounded-xl border border-border-strong bg-surface pr-9 pl-3 text-[0.9375rem] font-semibold text-ink"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} · {c.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
            aria-hidden="true"
          />
        </span>
      </Row>
      <NumberSetting
        label="Hourly rate"
        hint="Prefills Track, Fast charge and Estimate."
        value={config?.hourValue}
        unit={symbol}
        unitPlace="left"
        nullable
        onSave={(hourValue) => save({ hourValue })}
      />
      <NumberSetting
        label="Unpaid breaks"
        hint="Minutes per shift, for Fast charge."
        value={config?.unpaidBreaks}
        unit="min"
        nullable
        max={600}
        onSave={(unpaidBreaks) => save({ unpaidBreaks })}
      />
      <NumberSetting
        label="Holiday pay"
        hint="Used by Estimate."
        value={config?.holidayPay ?? 8}
        unit="%"
        max={100}
        onSave={(holidayPay) => holidayPay !== null && save({ holidayPay })}
      />
      <Row label="Week starts on" stacked>
        <Segmented
          label="Week starts on"
          value={weekStartsOn}
          onChange={(value) => save({ weekStartsOn: value })}
          options={[
            { value: "monday", label: "Monday" },
            { value: "sunday", label: "Sunday" },
          ]}
        />
      </Row>
    </Section>
  );
}

export default MoneySection;
