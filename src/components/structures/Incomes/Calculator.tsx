"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { formatMoney } from "@/services/Summary";

import Input from "@/components/ui/Input";

import { cn } from "@/utils/helpers/styleMerger";

type IncomesInputs = {
  hours: string;
  minutes: string;
  value: string;
  "holiday-pay": string;
  "unpaid-breaks": string;
};

const DEFAULT_HOLIDAY_PAY_RATE = 8;
const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
// Same rule as ShiftService.calculateEarnings: breaks only count on shifts of an hour or more.
const MIN_MINUTES_FOR_BREAKS = 60;

/**
 * Estimate what a stretch of work pays: hours a day, days, hourly rate,
 * holiday pay and unpaid breaks, with the total broken down.
 */
function round(n: number) {
  return Math.round(n * 100) / 100;
}

function Calculator() {
  const { register, control } = useForm<IncomesInputs>({
    defaultValues: { "holiday-pay": String(DEFAULT_HOLIDAY_PAY_RATE) },
  });
  const [days, setDays] = useState(5);

  const [hours, minutes, value, holidayPay, unpaidBreaks] = useWatch({
    control,
    name: ["hours", "minutes", "value", "holiday-pay", "unpaid-breaks"],
  });

  const result = useMemo(() => {
    const worked = (Number(hours) || 0) * 60 + (Number(minutes) || 0);
    const breaks = Number(unpaidBreaks) || 0;
    const paid = Math.max(0, worked >= MIN_MINUTES_FOR_BREAKS ? worked - breaks : worked);
    const rate = Number(value) || 0;
    // An empty field means the default rate shown in the hint, not 0%.
    const holidayRate =
      holidayPay === undefined || String(holidayPay).trim() === ""
        ? DEFAULT_HOLIDAY_PAY_RATE
        : Number(holidayPay) || 0;

    const baseDay = (paid / 60) * rate;
    const holidayDay = (baseDay * holidayRate) / 100;

    return {
      paid,
      holidayRate,
      base: round(baseDay * days),
      holiday: round(holidayDay * days),
      perDay: round(baseDay + holidayDay),
      total: round((baseDay + holidayDay) * days),
    };
  }, [hours, minutes, value, holidayPay, unpaidBreaks, days]);

  const paidLabel = `${Math.floor(result.paid / 60)}h ${String(Math.round(result.paid % 60)).padStart(2, "0")}m`;

  return (
    <div className="flex flex-col gap-3.5">
      <section
        aria-live="polite"
        className="flex flex-col gap-3.5 rounded-3xl bg-surface-inverse p-5 text-ink-inverse"
      >
        <div className="flex flex-col gap-1.5 text-sm text-ink-inverse/70">
          <p>You&apos;d earn, before tax</p>
          <p className="figure text-[4rem] leading-[0.95] text-live" data-testid="estimate-total">
            {formatMoney(result.total)}
          </p>
        </div>
        <dl className="flex flex-col gap-2 border-t border-ink-inverse/15 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-inverse/70">Paid time per day</dt>
            <dd className="tabular-nums">{paidLabel}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-inverse/70">Base pay</dt>
            <dd className="tabular-nums">{formatMoney(result.base)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-inverse/70">Holiday pay, {result.holidayRate}%</dt>
            <dd className="tabular-nums">{formatMoney(result.holiday)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-inverse/70">
              Per day, for {days} {days === 1 ? "day" : "days"}
            </dt>
            <dd className="tabular-nums">{formatMoney(result.perDay)}</dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-3.5 rounded-[20px] border border-border bg-surface p-4">
        <h2 className="text-[0.9375rem] font-semibold">Time</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            type="number"
            inputMode="numeric"
            label="Hours a day"
            measure="h"
            min={0}
            max={24}
            {...register("hours")}
          />
          <Input
            type="number"
            inputMode="numeric"
            label="Minutes"
            measure="min"
            min={0}
            max={59}
            {...register("minutes")}
          />
        </div>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-medium text-ink">Days</legend>
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

      <section className="flex flex-col gap-3.5 rounded-[20px] border border-border bg-surface p-4">
        <h2 className="text-[0.9375rem] font-semibold">Pay</h2>
        <Input
          type="number"
          inputMode="decimal"
          label="Hourly rate"
          measure="$"
          measurePlace="left"
          min={0}
          step="0.01"
          {...register("value")}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            type="number"
            inputMode="decimal"
            label="Holiday pay"
            measure="%"
            placeholder={String(DEFAULT_HOLIDAY_PAY_RATE)}
            min={0}
            {...register("holiday-pay")}
          />
          <Input
            type="number"
            inputMode="numeric"
            label="Unpaid breaks"
            measure="min"
            min={0}
            {...register("unpaid-breaks")}
          />
        </div>
        <p className="text-[0.8125rem] text-ink-muted">
          Leave holiday pay empty to use the standard {DEFAULT_HOLIDAY_PAY_RATE}%.
        </p>
      </section>
    </div>
  );
}

export default Calculator;
