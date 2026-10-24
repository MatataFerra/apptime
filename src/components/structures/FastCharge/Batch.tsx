"use client";

import { type FormEvent, useMemo, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { useTranslations } from "next-intl";

import Pay from "@/services/Pay";
import ShiftService from "@/services/Shift";
import Toast from "@/services/Toast";

import Drawer from "@/components/modules/FastCharge/Drawer";
import ShiftReviewDialog from "@/components/structures/share/ShiftReviewDialog";
import CurrencySelect from "@/components/structures/ShiftForms/CurrencySelect";
import DatalistShiftNames from "@/components/structures/ShiftForms/Datalist";
import EmployerSelect from "@/components/structures/ShiftForms/EmployerSelect";
import { useDatalistStore } from "@/components/structures/ShiftForms/store/useDatalistStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { currencySymbol } from "@/utils/constants/currencies";
import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import {
  type BatchError,
  buildBatchDays,
  findOverlaps,
  MAX_BATCH_DAYS,
  WEEK_ORDER,
  type Weekday,
} from "@/utils/helpers/batchShifts";
import { defaultFinish, needsDefaultFinish } from "@/utils/helpers/defaultFinish";
import { cn } from "@/utils/helpers/styleMerger";
import useDateLocale from "@/hooks/useDateLocale";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import useMoney, { useCurrency } from "@/hooks/useMoney";
import useProductionShifts from "@/hooks/useProductionShifts";
import useShiftNames from "@/hooks/useShiftNames";
import useUser from "@/hooks/useUser";

import onCreateHourlyBatch from "@/server-actions/hourly-batch";
import { useHourlyTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

const FORM_ID = "fast-charge-batch";
const WORK_WEEK: Weekday[] = [1, 2, 3, 4, 5];
/** Any Monday: the chips are labelled from its week. */
const A_MONDAY = new Date(2026, 9, 5);

function toNumber(value: string) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Fast charge for a stretch of days: the first shift's hours, repeated on the
 * chosen weekdays until a date. Every day can be left out before saving, and
 * days that run into a saved shift are never saved twice.
 */
function Batch() {
  const t = useTranslations("shift");
  const tb = useTranslations("shift.batch");
  const dateLocale = useDateLocale();
  const money = useMoney();
  const defaultCurrency = useCurrency();
  const queryClient = useQueryClient();

  const { data: user } = useUser();
  const { data: hourly } = useHourlyShifts();
  const { data: production } = useProductionShifts();

  const [name, setName] = useState("");
  const [employerId, setEmployerId] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);
  /** null until typed: the value saved in Settings shows instead. */
  const [typedRate, setHourValue] = useState<string | null>(null);
  const [typedBreaks, setUnpaidBreaks] = useState<string | null>(null);
  const [start, setStart] = useState("");
  const [finish, setFinish] = useState("");
  const [until, setUntil] = useState("");
  const [weekdays, setWeekdays] = useState<Weekday[]>(WORK_WEEK);
  /** Days the user unticked in the preview. */
  const [left, setLeft] = useState<Set<string>>(() => new Set());
  const [review, setReview] = useState(false);
  const [saving, setSaving] = useState(false);

  const { names } = useShiftNames({ hourly, production }, name);
  const { setIsWriting } = useDatalistStore((state) => state);

  const {
    taxesModule: { clear: clearTaxes, salaryElement: taxes },
    contributionsModule: { clear: clearContributions, salaryElement: contributions },
  } = useHourlyTaxesOrContributionsStore((state) => state);

  // The rate and breaks saved in Settings, until the user types their own.
  const savedRate = user?.config?.hourValue;
  const savedBreaks = user?.config?.unpaidBreaks;
  const hourValue = typedRate ?? (savedRate ? String(savedRate) : "");
  const unpaidBreaks = typedBreaks ?? (savedBreaks ? String(savedBreaks) : "");

  const result = useMemo(
    () => buildBatchDays({ start, finish, until, weekdays }),
    [start, finish, until, weekdays]
  );
  const days = useMemo(() => (result.ok ? result.days : []), [result]);

  const clashes = useMemo(
    () => findOverlaps(days, [...(hourly ?? []), ...(production ?? [])]),
    [days, hourly, production]
  );

  const chosen = useMemo(
    () => days.filter((day) => !clashes.has(day.key) && !left.has(day.key)),
    [days, clashes, left]
  );

  const totals = useMemo(() => {
    const rate = toNumber(hourValue);
    const breaks = toNumber(unpaidBreaks);
    let minutes = 0;
    let gross = 0;

    for (const day of chosen) {
      const shift = {
        startDate: day.start.toString(),
        endDate: day.end.toString(),
        isPublicHoliday: false,
        publicHolidayWorked: false,
        hourValue: rate,
        unpaidBreaks: breaks,
      };
      const worked = (day.end.getTime() - day.start.getTime()) / 60000;
      minutes += worked > breaks ? worked - breaks : worked;
      gross += new ShiftService(shift).calculateEarnings();
    }

    gross = Math.round(gross * 100) / 100;
    return { minutes, gross, afterTaxes: Pay.afterTax(gross, taxes) };
  }, [chosen, hourValue, unpaidBreaks, taxes]);

  // Only complain about a field once the user has filled the ones it depends on.
  const error: BatchError | null =
    !result.ok && start && finish && (until || result.error !== "invalid_until")
      ? result.error
      : null;

  const weekdayChips = useMemo(
    () =>
      WEEK_ORDER.map((day) => {
        const date = addDays(A_MONDAY, (day + 6) % 7);
        return {
          day,
          short: format(date, "EEEEEE", { locale: dateLocale }),
          long: format(date, "EEEE", { locale: dateLocale }),
        };
      }),
    [dateLocale]
  );

  function toggleWeekday(day: Weekday) {
    setWeekdays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    );
  }

  function toggleDay(key: string) {
    setLeft((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function onStartChange(value: string) {
    setStart(value);
    // A shift rarely spans days: suggest a finish 8h later, same day.
    if (value && needsDefaultFinish(value, finish)) setFinish(defaultFinish(value));
    // A week ahead is the usual stretch; never before the first day.
    const day = value.slice(0, 10);
    if (day && (!until || until < day)) {
      setUntil(format(addDays(new Date(`${day}T00:00`), 6), "yyyy-MM-dd"));
    }
  }

  function reset() {
    setName("");
    setEmployerId(null);
    setCurrency(null);
    setStart("");
    setFinish("");
    setUntil("");
    setWeekdays(WORK_WEEK);
    setLeft(new Set());
    clearTaxes();
    clearContributions();
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (saving || chosen.length === 0) return;
    setSaving(true);
    setReview(false);

    Toast({ type: "loading", message: t("processing"), description: t("please_wait") });

    const response = await onCreateHourlyBatch({
      name: name.trim() || null,
      hourValue: toNumber(hourValue),
      unpaidBreaks: toNumber(unpaidBreaks),
      currency,
      employerId,
      taxes,
      contributions,
      shifts: chosen.map((day) => ({
        startDate: day.start.toString(),
        endDate: day.end.toString(),
      })),
    });

    setSaving(false);

    if (!response) {
      Toast({ type: "error", message: t("save_failed"), description: t("try_again") });
      return;
    }

    [USE_QUERY_KEYS.HOURLY, USE_QUERY_KEYS.SALARY, USE_QUERY_KEYS.USER].forEach((key) =>
      queryClient.invalidateQueries({ queryKey: [key] })
    );

    Toast({
      type: response.created > 0 ? "success" : "error",
      message: tb("created", { count: response.created }),
      description: response.skipped.length
        ? tb("skipped", { count: response.skipped.length })
        : undefined,
    });

    if (response.created > 0) reset();
  }

  const hoursText = ShiftService.convertDifferenceInHHmm(totals.minutes).text;
  const thisYear = new Date().getFullYear();

  return (
    <Stack orientation="vertical" spacing={4} classes="w-full">
      <Stack
        as="form"
        id={FORM_ID}
        orientation="horizontal"
        wrap
        classes="w-full"
        onSubmit={onSave}
      >
        <Stack as="fieldset" orientation="vertical" classes="relative w-full">
          <Input
            label={t("fields.job_name")}
            name="batch-name"
            variant="outlined"
            value={name}
            onKeyDown={() => setIsWriting(true)}
            onChange={(e) => setName(e.target.value)}
          />
          <DatalistShiftNames data={names} value={name} onSelect={setName} />
        </Stack>

        <EmployerSelect
          value={employerId}
          onChange={(employer) => {
            setEmployerId(employer?.id ?? null);
            if (!employer) return;
            // Their usual rate and currency, as a starting point.
            if (employer.defaultRate != null) setHourValue(String(employer.defaultRate));
            if (employer.defaultCurrency) setCurrency(employer.defaultCurrency);
          }}
        />

        <Input
          containerClasses="flex-1"
          classes="h-full"
          label={tb("first_start")}
          name="batch-start"
          type="datetime-local"
          max={`${thisYear}-12-31T23:59`}
          value={start}
          onChange={(e) => onStartChange(e.target.value)}
        />
        <Input
          containerClasses="flex-1"
          classes="h-full"
          label={tb("first_finish")}
          name="batch-finish"
          type="datetime-local"
          max={`${thisYear + 1}-01-01T23:59`}
          isError={error === "finish_before_start" || error === "too_long"}
          description={
            error === "finish_before_start" || error === "too_long"
              ? tb(`errors.${error}`)
              : tb("night_hint")
          }
          value={finish}
          onChange={(e) => setFinish(e.target.value)}
        />

        <Input
          label={tb("until")}
          name="batch-until"
          type="date"
          min={start.slice(0, 10) || undefined}
          max={`${thisYear}-12-31`}
          isError={error === "until_before_start" || error === "range_too_long"}
          description={
            error === "until_before_start" || error === "range_too_long"
              ? tb(`errors.${error}`, { max: MAX_BATCH_DAYS })
              : undefined
          }
          value={until}
          onChange={(e) => setUntil(e.target.value)}
        />

        <fieldset className="w-full">
          <legend className="mb-1.5 block text-sm font-medium text-ink">{tb("weekdays")}</legend>
          <div className="grid grid-cols-7 gap-1.5">
            {weekdayChips.map(({ day, short, long }) => {
              const on = weekdays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={on}
                  aria-label={long}
                  onClick={() => toggleWeekday(day)}
                  className={cn(
                    "h-10 rounded-md border text-sm font-medium capitalize transition-colors",
                    on
                      ? "border-fast bg-fast-soft text-fast-ink"
                      : "border-border text-ink-muted hover:border-border-strong"
                  )}
                >
                  {short}
                </button>
              );
            })}
          </div>
          {error === "no_weekdays" ? (
            <small className="mt-1 block text-xs text-destructive">
              {tb("errors.no_weekdays")}
            </small>
          ) : null}
        </fieldset>

        <Input
          label={t("fields.hourly_rate")}
          name="batch-rate"
          type="number"
          step="0.01"
          min={0}
          measure={currencySymbol(currency || defaultCurrency)}
          measurePlace="left"
          value={hourValue}
          onChange={(e) => setHourValue(e.target.value)}
        />
        <CurrencySelect value={currency} onChange={setCurrency} />
        <Input
          label={t("fields.unpaid_breaks")}
          name="batch-breaks"
          measure={t("minutes_unit")}
          type="number"
          min={0}
          value={unpaidBreaks}
          onChange={(e) => setUnpaidBreaks(e.target.value)}
        />
      </Stack>

      <Drawer />

      {days.length > 0 ? (
        <section aria-labelledby="batch-preview" className="w-full">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h2 id="batch-preview" className="text-sm font-medium text-ink">
              {tb("preview", { count: chosen.length, total: days.length })}
            </h2>
            <span className="text-sm text-ink-muted">
              {hoursText} · {money(totals.gross, { currency })}
            </span>
          </div>
          <ul className="divide-y divide-border rounded-md border border-border">
            {days.map((day) => {
              const clash = clashes.has(day.key);
              const on = !clash && !left.has(day.key);
              return (
                <li key={day.key}>
                  <label
                    className={cn(
                      "flex min-h-11 items-center gap-3 px-3 py-2 text-sm",
                      clash ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                      !on && !clash && "text-ink-muted line-through"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--fast)]"
                      checked={on}
                      disabled={clash}
                      onChange={() => toggleDay(day.key)}
                    />
                    <span className="flex-1 capitalize">
                      {format(day.start, "EEE d MMM", { locale: dateLocale })}
                    </span>
                    <span className="text-ink-muted tabular-nums">
                      {format(day.start, "p", { locale: dateLocale })}–
                      {format(day.end, "p", { locale: dateLocale })}
                    </span>
                    {clash ? (
                      <span className="rounded-sm bg-surface-sunken px-1.5 py-0.5 text-xs text-ink-muted">
                        {tb("overlap")}
                      </span>
                    ) : null}
                  </label>
                </li>
              );
            })}
          </ul>
          {clashes.size > 0 ? (
            <p className="mt-1.5 text-xs text-ink-muted">
              {tb("overlap_hint", { count: clashes.size })}
            </p>
          ) : null}
        </section>
      ) : null}

      <ShiftReviewDialog
        open={review}
        onOpenChange={setReview}
        formId={FORM_ID}
        theme="fast"
        gross={totals.gross}
        currency={currency}
        afterTaxes={totals.afterTaxes}
        taxes={taxes}
        saveLabel={tb("save", { count: chosen.length })}
        rows={[
          { label: tb("shifts"), value: chosen.length },
          { label: t("fields.time_worked"), value: hoursText },
          { label: t("fields.hourly_rate"), value: money(toNumber(hourValue), { currency }) },
          ...(toNumber(unpaidBreaks)
            ? [
                {
                  label: t("fields.unpaid_breaks"),
                  value: t("minutes", { count: toNumber(unpaidBreaks) }),
                },
              ]
            : []),
        ]}
      >
        <Button
          type="button"
          variant="primary"
          classes="h-14 w-full rounded-2xl text-base font-semibold"
          disabled={chosen.length === 0 || saving}
          onClick={() => setReview(true)}
        >
          {tb("review_button", { count: chosen.length })}
        </Button>
      </ShiftReviewDialog>
    </Stack>
  );
}

export default Batch;
