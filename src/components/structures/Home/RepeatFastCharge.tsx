"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Repeat, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

import { repeatableFastCharge } from "@/services/Repeat";
import ShiftService from "@/services/Shift";
import { formatHours } from "@/services/Summary";
import Toast from "@/services/Toast";

import { effectiveRate } from "@/components/structures/SalaryItems/TaxPicker";
import ShiftReviewDialog from "@/components/structures/share/ShiftReviewDialog";

import { PATH_NAMES } from "@/utils/constants/pathnames";
import { invalidateShiftQueries } from "@/utils/helpers/invalidateShiftQueries";
import useDateLocale from "@/hooks/useDateLocale";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import useMoney from "@/hooks/useMoney";

import { useRouter } from "@/i18n/navigation";
import onCreateHourlyShift from "@/server-actions/hourly-job";

const FORM_ID = "repeat-fast-charge";

/**
 * "Same as last time?" — logs the last Fast charge again for today, with
 * the same hours, rate, breaks and taxes, after a review.
 */
function RepeatFastCharge() {
  const format$ = useMoney();
  const t = useTranslations("home.repeat");
  const ts = useTranslations("shift");
  const locale = useDateLocale();
  function time(date: Date) {
    return format(date, "p", { locale });
  }
  function dateTime(date: Date) {
    return format(date, "EEE d MMM, p", { locale });
  }
  // In the shift's own currency.
  function money(value: number) {
    return format$(value, { currency: last?.currency });
  }
  const { data: hourly } = useHourlyShifts();
  const queryClient = useQueryClient();
  const router = useRouter();
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
  const contributions = (last.contributions ?? []).map((c) => ({
    name: c.name,
    value: c.value,
    description: c.description ?? null,
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
  const lastDay = format(new Date(last.startDate), "EEEE", { locale });

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
      contributions,
      currency: last.currency,
      employerId: last.employerId ?? null,
    });

    setSaving(false);
    setOpen(false);
    invalidateShiftQueries(queryClient);

    if (response?.response) {
      Toast({
        type: "success",
        message: ts("saved"),
        description: t("saved_description", { name: last.name || ts("your_shift") }),
      });
    } else {
      Toast({
        type: "error",
        message: ts("save_failed"),
        description: ts("try_again"),
      });
    }
  }

  return (
    <section
      aria-label={t("label")}
      data-testid="repeat-fast-charge"
      className="flex flex-col gap-3 rounded-xl bg-fast-soft p-4 text-fast-ink"
    >
      <div className="flex items-center gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-fast text-on-module">
          <Zap className="size-5" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[0.8125rem] font-medium opacity-80">
            {t("same_as", { day: lastDay })}
          </span>
          <span className="truncate text-[0.9375rem] font-semibold">
            {last.name || t("fallback_name")}
          </span>
          <span className="truncate text-[0.8125rem] opacity-80">
            {t("summary", {
              start: time(start),
              end: time(end),
              hours: formatHours(Math.max(0, minutes)),
              rate: money(last.hourValue),
            })}
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
          tags={[ts("tags.repeated"), ts("tags.regular_day")]}
          onEdit={() => router.push(`${PATH_NAMES.FAST_CHARGE}?repeat=${last.id}`)}
          rows={[
            { label: ts("fields.job"), value: last.name || "–" },
            { label: ts("fields.start"), value: dateTime(start) },
            { label: ts("fields.finish"), value: dateTime(end) },
            {
              label: ts("fields.unpaid_breaks"),
              value: ts("minutes", { count: last.unpaidBreaks ?? 0 }),
            },
            { label: ts("fields.hourly_rate"), value: money(last.hourValue) },
          ]}
        >
          <button
            type="button"
            disabled={saving}
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-fast px-3.5 text-sm font-semibold text-on-module transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            <Repeat className="size-4" aria-hidden="true" />
            {t("log_today")}
          </button>
        </ShiftReviewDialog>
      </form>
    </section>
  );
}

export default RepeatFastCharge;
