"use client";

import { type FormEvent, useMemo, useState } from "react";

import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { withContributions } from "@/services/Contribution/math";
import Pay from "@/services/Pay";
import ShiftService from "@/services/Shift";

import type { SavedEmployer } from "@/types";

import Drawer from "@/components/modules/FastCharge/Drawer";
import BatchPreview from "@/components/structures/share/batch/BatchPreview";
import BatchScheduleFields from "@/components/structures/share/batch/BatchScheduleFields";
import useBatchSave from "@/components/structures/share/batch/useBatchSave";
import {
  toNumber,
  toShiftDates,
  useBatchSchedule,
} from "@/components/structures/share/batch/useBatchSchedule";
import ShiftReviewDialog from "@/components/structures/share/ShiftReviewDialog";
import CurrencySelect from "@/components/structures/ShiftForms/CurrencySelect";
import DatalistShiftNames from "@/components/structures/ShiftForms/Datalist";
import EmployerSelect from "@/components/structures/ShiftForms/EmployerSelect";
import { useDatalistStore } from "@/components/structures/ShiftForms/store/useDatalistStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { currencySymbol } from "@/utils/constants/currencies";
import useDefaultEmployer from "@/hooks/useDefaultEmployer";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import useMoney, { useCurrency } from "@/hooks/useMoney";
import useProductionShifts from "@/hooks/useProductionShifts";
import useShiftNames from "@/hooks/useShiftNames";
import useUser from "@/hooks/useUser";

import onCreateHourlyBatch from "@/server-actions/hourly-batch";
import { useHourlyTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

const FORM_ID = "fast-charge-batch";

/**
 * Fast charge for a stretch of days: the first shift's hours, repeated on the
 * chosen weekdays until a date. Every day can be left out before saving, and
 * days that run into a saved shift are never saved twice.
 */
function Batch() {
  const t = useTranslations("shift");
  const tb = useTranslations("shift.batch");
  const money = useMoney();
  const defaultCurrency = useCurrency();

  const { data: user } = useUser();
  const { data: hourly } = useHourlyShifts();
  const { data: production } = useProductionShifts();

  const [name, setName] = useState("");
  const [employerId, setEmployerId] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);
  /** null until typed: the value saved in Settings shows instead. */
  const [typedRate, setHourValue] = useState<string | null>(null);
  const [typedBreaks, setUnpaidBreaks] = useState<string | null>(null);
  const [review, setReview] = useState(false);
  const batch = useBatchSave("hourly");
  const schedule = useBatchSchedule();
  const { chosen } = schedule;

  const { names } = useShiftNames({ hourly, production }, name);
  const setWriting = useDatalistStore((state) => state.setWriting);

  const {
    taxesModule: { clear: clearTaxes, salaryElement: taxes },
    contributionsModule: { clear: clearContributions, salaryElement: contributions },
  } = useHourlyTaxesOrContributionsStore((state) => state);

  // The rate and breaks saved in Settings, until the user types their own.
  const savedRate = user?.config?.hourValue;
  const savedBreaks = user?.config?.unpaidBreaks;
  const hourValue = typedRate ?? (savedRate ? String(savedRate) : "");
  const unpaidBreaks = typedBreaks ?? (savedBreaks ? String(savedBreaks) : "");

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

    // Holiday pay and the like go on top.
    gross = withContributions(Math.round(gross * 100) / 100, contributions);
    return { minutes, gross, afterTaxes: Pay.afterTax(gross, taxes) };
  }, [chosen, hourValue, unpaidBreaks, taxes, contributions]);

  /** Picking an employer (by hand or the default from Settings) brings its rate and currency. */
  function pickEmployer(employer: SavedEmployer | null) {
    setEmployerId(employer?.id ?? null);
    if (!employer) return;
    if (employer.defaultRate != null) setHourValue(String(employer.defaultRate));
    if (employer.defaultCurrency) setCurrency(employer.defaultCurrency);
  }
  useDefaultEmployer(employerId, pickEmployer);

  function reset() {
    setName("");
    setEmployerId(null);
    setCurrency(null);
    schedule.reset();
    clearTaxes();
    clearContributions();
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (batch.saving || chosen.length === 0) return;
    setReview(false);

    await batch.run(
      chosen.length,
      () =>
        onCreateHourlyBatch({
          name: name.trim() || null,
          hourValue: toNumber(hourValue),
          unpaidBreaks: toNumber(unpaidBreaks),
          currency,
          employerId,
          taxes,
          contributions,
          shifts: toShiftDates(chosen),
        }),
      reset
    );
  }

  const hoursText = ShiftService.convertDifferenceInHHmm(totals.minutes).text;

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
            onKeyDown={() => setWriting("fast-batch-name")}
            onChange={(e) => setName(e.target.value)}
          />
          <DatalistShiftNames
            field="fast-batch-name"
            data={names}
            value={name}
            onSelect={setName}
          />
        </Stack>

        <EmployerSelect value={employerId} onChange={pickEmployer} />

        <BatchScheduleFields schedule={schedule} theme="fast" />

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

      <BatchPreview
        schedule={schedule}
        theme="fast"
        summary={`${hoursText} · ${money(totals.gross, { currency })}`}
      />

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
          disabled={chosen.length === 0 || batch.saving}
          onClick={() => setReview(true)}
        >
          {batch.saving ? (
            <>
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              {tb("saving", { count: chosen.length })}
            </>
          ) : (
            tb("review_button", { count: chosen.length })
          )}
        </Button>
      </ShiftReviewDialog>
    </Stack>
  );
}

export default Batch;
