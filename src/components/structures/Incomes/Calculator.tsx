"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useTranslations } from "next-intl";

import Pay from "@/services/Pay";

import TaxPicker, { effectiveRate } from "@/components/structures/SalaryItems/TaxPicker";
import Input from "@/components/ui/Input";

import { currencySymbol } from "@/utils/constants/currencies";
import { cn } from "@/utils/helpers/styleMerger";
import useMoney, { useCurrency } from "@/hooks/useMoney";
import useUser from "@/hooks/useUser";

import { type ContributionOrTax, sameSalaryItem } from "@/store/useTaxOrContributionStore";

type IncomesInputs = {
  hours: string;
  minutes: string;
  value: string;
  "unpaid-breaks": string;
};

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
// Same rule as ShiftService.calculateEarnings: breaks only count on shifts of an hour or more.
const MIN_MINUTES_FOR_BREAKS = 60;

/**
 * Estimate what a stretch of work pays: hours a day, days, hourly rate and
 * unpaid breaks, minus the taxes picked (saved ones or typed in, applied one
 * after another like on a shift), with the total broken down.
 */
function round(n: number) {
  return Math.round(n * 100) / 100;
}

function Calculator() {
  const money = useMoney();
  const t = useTranslations("estimate");
  const symbol = currencySymbol(useCurrency());
  const { data: user } = useUser();
  // The usual hourly rate from Settings.
  const savedRate = user?.config?.hourValue;
  const { register, control } = useForm<IncomesInputs>({
    values: {
      value: savedRate ? String(savedRate) : "",
    } as IncomesInputs,
    resetOptions: { keepDirtyValues: true },
  });
  const [days, setDays] = useState(5);
  // Only for this estimate: typed-in taxes aren't saved anywhere.
  const [taxes, setTaxes] = useState<ContributionOrTax[]>([]);
  const taxStore = {
    salaryElement: taxes,
    add: (tax: ContributionOrTax) => setTaxes((current) => [...current, tax]),
    remove: (tax: Pick<ContributionOrTax, "name" | "value">) =>
      setTaxes((current) => current.filter((t) => !sameSalaryItem(t, tax))),
  };

  const [hours, minutes, value, unpaidBreaks] = useWatch({
    control,
    name: ["hours", "minutes", "value", "unpaid-breaks"],
  });

  const result = useMemo(() => {
    const worked = (Number(hours) || 0) * 60 + (Number(minutes) || 0);
    const breaks = Number(unpaidBreaks) || 0;
    const paid = Math.max(0, worked >= MIN_MINUTES_FOR_BREAKS ? worked - breaks : worked);
    const rate = Number(value) || 0;

    const baseDay = (paid / 60) * rate;
    const netDay = Pay.afterTax(baseDay, taxes);

    return {
      paid,
      base: round(baseDay * days),
      taxes: round((baseDay - netDay) * days),
      perDay: round(netDay),
      total: round(netDay * days),
    };
  }, [hours, minutes, value, unpaidBreaks, days, taxes]);

  const hasTaxes = taxes.length > 0;
  const paidLabel = `${Math.floor(result.paid / 60)}h ${String(Math.round(result.paid % 60)).padStart(2, "0")}m`;

  return (
    <div className="flex flex-col gap-3.5">
      <section
        aria-live="polite"
        className="flex flex-col gap-3.5 rounded-3xl bg-surface-inverse p-5 text-ink-inverse"
      >
        <div className="flex flex-col gap-1.5 text-sm text-ink-inverse/70">
          <p>{hasTaxes ? t("earn_net") : t("earn")}</p>
          <p className="figure text-[4rem] leading-[0.95] text-live" data-testid="estimate-total">
            {money(result.total)}
          </p>
        </div>
        <dl className="flex flex-col gap-2 border-t border-ink-inverse/15 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-inverse/70">{t("paid_time")}</dt>
            <dd className="tabular-nums">{paidLabel}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-inverse/70">{t("base_pay")}</dt>
            <dd className="tabular-nums">{money(result.base)}</dd>
          </div>
          {hasTaxes ? (
            <div className="flex justify-between">
              <dt className="text-ink-inverse/70">
                {t("taxes_rate", { rate: effectiveRate(taxes) })}
              </dt>
              <dd className="tabular-nums" data-testid="estimate-taxes">
                −{money(result.taxes)}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-ink-inverse/70">{t("per_day", { days })}</dt>
            <dd className="tabular-nums">{money(result.perDay)}</dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-[0.9375rem] font-semibold">{t("time")}</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            type="number"
            inputMode="numeric"
            label={t("hours_a_day")}
            measure="h"
            min={0}
            max={24}
            {...register("hours")}
          />
          <Input
            type="number"
            inputMode="numeric"
            label={t("minutes")}
            measure="min"
            min={0}
            max={59}
            {...register("minutes")}
          />
        </div>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-medium text-ink">{t("days")}</legend>
          <div className="grid grid-cols-7 gap-1.5">
            {DAY_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={n === days}
                onClick={() => setDays(n)}
                className={cn(
                  "h-11 rounded-xl border text-[0.9375rem] font-semibold transition-colors",
                  n === days
                    ? "border-insight bg-insight text-on-module"
                    : "border-border-strong bg-surface text-ink hover:bg-surface-sunken"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-[0.9375rem] font-semibold">{t("pay")}</h2>
        <Input
          type="number"
          inputMode="decimal"
          label={t("hourly_rate")}
          measure={symbol}
          measurePlace="left"
          min={0}
          step="0.01"
          {...register("value")}
        />
        <Input
          type="number"
          inputMode="numeric"
          label={t("unpaid_breaks")}
          measure="min"
          min={0}
          {...register("unpaid-breaks")}
        />
      </section>

      <TaxPicker
        theme="insight"
        store={taxStore}
        copy={{
          subtitle: t("taxes_subtitle"),
          newTitle: t("taxes_new_title"),
          empty: t("taxes_empty"),
        }}
      />
    </div>
  );
}

export default Calculator;
