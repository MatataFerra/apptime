"use client";

import { useId } from "react";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { CURRENCIES, currencySymbol } from "@/utils/constants/currencies";
import useCurrencyName from "@/hooks/useCurrencyName";
import { useCurrency } from "@/hooks/useMoney";
import usePreferences from "@/hooks/usePreferences";

import NumberSetting from "./NumberSetting";
import { Row, Section } from "./Section";
import Segmented from "./Segmented";

/** Currency and the values that prefill new shifts and Estimate. */
function MoneySection() {
  const { config, save } = usePreferences();
  const currency = useCurrency();
  const t = useTranslations("settings.money");
  const currencyName = useCurrencyName();
  const currencyId = useId();
  const symbol = currencySymbol(currency);
  const weekStartsOn = config?.weekStartsOn === "sunday" ? "sunday" : "monday";

  return (
    <Section title={t("title")} description={t("description")}>
      <Row label={t("currency")} hint={t("currency_hint")} htmlFor={currencyId}>
        <span className="relative shrink-0">
          <select
            id={currencyId}
            value={currency}
            onChange={(e) => save({ currency: e.target.value })}
            className="h-10 appearance-none rounded-xl border border-border-strong bg-surface pr-9 pl-3 text-[0.9375rem] font-semibold text-ink"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} · {currencyName(c.code)}
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
        label={t("hourly_rate")}
        hint={t("hourly_rate_hint")}
        value={config?.hourValue}
        unit={symbol}
        unitPlace="left"
        nullable
        onSave={(hourValue) => save({ hourValue })}
      />
      <NumberSetting
        label={t("unpaid_breaks")}
        hint={t("unpaid_breaks_hint")}
        value={config?.unpaidBreaks}
        unit="min"
        nullable
        max={600}
        onSave={(unpaidBreaks) => save({ unpaidBreaks })}
      />
      <NumberSetting
        label={t("holiday_pay")}
        hint={t("holiday_pay_hint")}
        value={config?.holidayPay ?? 8}
        unit="%"
        max={100}
        onSave={(holidayPay) => holidayPay !== null && save({ holidayPay })}
      />
      <Row label={t("week_starts")} stacked>
        <Segmented
          label={t("week_starts")}
          value={weekStartsOn}
          onChange={(value) => save({ weekStartsOn: value })}
          options={[
            { value: "monday", label: t("monday") },
            { value: "sunday", label: t("sunday") },
          ]}
        />
      </Row>
    </Section>
  );
}

export default MoneySection;
