"use client";

import { useId } from "react";

import { useTranslations } from "next-intl";

import { ChoicePopover } from "@/components/ui/Choice";

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
        <ChoicePopover
          id={currencyId}
          label={t("currency")}
          value={currency}
          className="h-10 shrink-0 rounded-xl text-[0.9375rem]"
          options={CURRENCIES.map((c) => ({
            value: c.code as string,
            label: `${c.code} · ${currencyName(c.code)}`,
          }))}
          onChange={(code) => save({ currency: code })}
        />
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
