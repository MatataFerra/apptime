"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Repeat, Zap } from "lucide-react";

import { repeatableFastCharge } from "@/services/Repeat";
import ShiftService from "@/services/Shift";
import { formatHours } from "@/services/Summary";
import Toast from "@/services/Toast";

import { effectiveRate } from "@/components/structures/SalaryItems/TaxPicker";
import ShiftReviewDialog from "@/components/structures/share/ShiftReviewDialog";

import { invalidateShiftQueries } from "@/utils/helpers/invalidateShiftQueries";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import useMoney from "@/hooks/useMoney";

import onCreateHourlyShift from "@/server-actions/hourly-job";

const FORM_ID = "repeat-fast-charge";

function time(date: Date) {
  return format(date, "h:mm a");
}

/**
 * "Same as last time?" — logs the last Fast charge again for today, with
 * the same hours, rate, breaks and taxes, after a review.
 */
function RepeatFastCharge() {
  const format$ = useMoney();
  // In the shift's own currency.
  function money(value: number) {
    return format$(value, { currency: last?.currency });
  }
  const { data: hourly } = useHourlyShifts();
  const queryClient = useQueryClient();
  const [now] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const plan = repeatableFastCharge(hourly, now);
  if (!plan) return null;

  const { last, start, end } = plan;
  const taxes = (last.taxes ?? []).map((t) => ({
    name: t.name,
    value: t.value,
    description: t.description ?? null,
  }));
  const draft = {
    ...last,
    startDate: start.toString(),
    endDate: end.toString(),
    isPublicHoliday: false,
    publicHolidayWorked: false,
  };
  const gross = new ShiftService(draft).calculateEarnings();
  const afterTaxes = gross * (1 - effectiveRate(taxes) / 100);
  const minutes = (end.valueOf() - start.valueOf()) / 60000 - (last.unpaidBreaks ?? 0);
  const lastDay = format(new Date(last.startDate), "EEEE");

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);

    const response = await onCreateHourlyShift({
      name: last.name ?? "",
      startDate: start.toString(),
      endDate: end.toString(),
      hourValue: last.hourValue,
      unpaidBreaks: last.unpaidBreaks ?? 0,
      isPublicHoliday: false,
      isWorked: false,
      taxes,
      contributions: [],
      currency: last.currency,
    });

    setSaving(false);
    setOpen(false);
    invalidateShiftQueries(queryClient);

    if (response?.response) {
      Toast({
        type: "success",
        message: "Shift saved",
        description: `${last.name || "Your shift"} for today.`,
      });
    } else {
      Toast({
        type: "error",
        message: "Couldn't save the shift",
        description: "Please try again.",
      });
    }
  }

  return (
    <section
      aria-label="Repeat your last Fast charge"
      data-testid="repeat-fast-charge"
      className="flex flex-col gap-3 rounded-xl bg-fast-soft p-4 text-fast-ink"
    >
      <div className="flex items-center gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-fast text-on-module">
          <Zap className="size-5" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[0.8125rem] font-medium opacity-80">Same as {lastDay}?</span>
          <span className="truncate text-[0.9375rem] font-semibold">
            {last.name || "Fast charge"}
          </span>
          <span className="truncate text-[0.8125rem] opacity-80">
            {time(start)} – {time(end)} · {formatHours(Math.max(0, minutes))} at{" "}
            {money(last.hourValue)}/h
          </span>
        </div>
      </div>

      <form id={FORM_ID} onSubmit={onSave} className="contents">
        <ShiftReviewDialog
          open={open}
          onOpenChange={setOpen}
          formId={FORM_ID}
          theme="fast"
          currency={last.currency}
          gross={gross}
          afterTaxes={afterTaxes}
          taxes={taxes}
          tags={["Repeated", "Regular day"]}
          rows={[
            { label: "Job", value: last.name || "–" },
            { label: "Start", value: format(start, "EEE d MMM, h:mm a") },
            { label: "Finish", value: format(end, "EEE d MMM, h:mm a") },
            { label: "Unpaid breaks", value: `${last.unpaidBreaks ?? 0} min` },
            { label: "Hourly rate", value: money(last.hourValue) },
          ]}
        >
          <button
            type="button"
            disabled={saving}
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-fast px-3.5 text-sm font-semibold text-on-module transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            <Repeat className="size-4" aria-hidden="true" />
            Log it for today
          </button>
        </ShiftReviewDialog>
      </form>
    </section>
  );
}

export default RepeatFastCharge;
