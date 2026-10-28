"use client";

import { type FormEvent, useMemo, useState } from "react";

import { format } from "date-fns";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { withContributions } from "@/services/Contribution/math";
import Pay from "@/services/Pay";
import ShiftService from "@/services/Shift";

import type { SavedEmployer } from "@/types";

import Drawer from "@/components/modules/Production/Drawer";
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
import { cn } from "@/utils/helpers/styleMerger";
import useDateLocale from "@/hooks/useDateLocale";
import useDefaultEmployer from "@/hooks/useDefaultEmployer";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import useMoney, { useCurrency } from "@/hooks/useMoney";
import useProductionShifts from "@/hooks/useProductionShifts";
import useShiftNames from "@/hooks/useShiftNames";
import useUser from "@/hooks/useUser";

import onCreateProductionBatch from "@/server-actions/production-batch";
import { useProductionTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

const FORM_ID = "production-batch";

/**
 * Production for a stretch of days: the first shift's hours repeated on the
 * chosen weekdays, one rate for all, and a quantity per day (bins change from
 * day to day). The quantity typed above fills every day until a day is edited.
 */
function Batch() {
  const t = useTranslations("shift");
  const tb = useTranslations("shift.batch");
  const dateLocale = useDateLocale();
  const money = useMoney();
  const defaultCurrency = useCurrency();

  const { data: user } = useUser();
  const { data: hourly } = useHourlyShifts();
  const { data: production } = useProductionShifts();

  const [name, setName] = useState("");
  const [employerId, setEmployerId] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);
  /** null until typed: the value per item saved in Settings shows instead. */
  const [typedItemValue, setItemValue] = useState<string | null>(null);
  const [defaultQuantity, setDefaultQuantity] = useState("");
  /** Quantities edited day by day; the others use `defaultQuantity`. */
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [review, setReview] = useState(false);
  const batch = useBatchSave("production");
  const schedule = useBatchSchedule();
  const { chosen } = schedule;

  const { names } = useShiftNames({ hourly, production }, name);

  const savedItemValue = user?.config?.itemValue;
  const itemValue = typedItemValue ?? (savedItemValue ? String(savedItemValue) : "");

  /** Picking an employer (by hand or the default from Settings) brings its currency. */
  function pickEmployer(employer: SavedEmployer | null) {
    setEmployerId(employer?.id ?? null);
    if (employer?.defaultCurrency) setCurrency(employer.defaultCurrency);
  }
  useDefaultEmployer(employerId, pickEmployer);
  const setWriting = useDatalistStore((state) => state.setWriting);

  const {
    taxesModule: { clear: clearTaxes, salaryElement: taxes },
    contributionsModule: { clear: clearContributions, salaryElement: contributions },
  } = useProductionTaxesOrContributionsStore((state) => state);

  function quantityOf(key: string) {
    return quantities[key] ?? defaultQuantity;
  }

  const missing = chosen.filter((day) => toNumber(quantityOf(day.key)) === 0).length;

  const totals = useMemo(() => {
    const value = toNumber(itemValue);
    let items = 0;
    let gross = 0;

    for (const day of chosen) {
      const quantity = toNumber(quantities[day.key] ?? defaultQuantity);
      items += quantity;
      gross += new ShiftService({ itemValue: value, itemQuantity: quantity }).calculateEarnings();
    }

    // Holiday pay and the like go on top.
    gross = withContributions(Math.round(gross * 100) / 100, contributions);
    return { items, gross, afterTaxes: Pay.afterTax(gross, taxes) };
  }, [chosen, itemValue, quantities, defaultQuantity, taxes, contributions]);

  function reset() {
    setName("");
    setEmployerId(null);
    setCurrency(null);
    setDefaultQuantity("");
    setQuantities({});
    schedule.reset();
    clearTaxes();
    clearContributions();
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (batch.saving || chosen.length === 0 || missing > 0) return;
    setReview(false);

    const dates = toShiftDates(chosen);
    await batch.run(
      chosen.length,
      () =>
        onCreateProductionBatch({
          name: name.trim() || null,
          itemValue: toNumber(itemValue),
          currency,
          employerId,
          taxes,
          contributions,
          shifts: chosen.map((day, i) => ({
            ...dates[i],
            itemQuantity: toNumber(quantityOf(day.key)),
          })),
        }),
      reset
    );
  }

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
            onKeyDown={() => setWriting("production-batch-name")}
            onChange={(e) => setName(e.target.value)}
          />
          <DatalistShiftNames
            field="production-batch-name"
            data={names}
            value={name}
            onSelect={setName}
          />
        </Stack>

        <EmployerSelect value={employerId} onChange={pickEmployer} />

        <BatchScheduleFields schedule={schedule} theme="production" />

        <Stack grid cols={2} as="fieldset" classes="w-full">
          <Input
            label={t("fields.item_value")}
            name="batch-item-value"
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            measure={currencySymbol(currency || defaultCurrency)}
            measurePlace="left"
            description={t("fields.item_value_hint")}
            value={itemValue}
            onChange={(e) => setItemValue(e.target.value)}
          />
          <Input
            label={tb("quantity_default")}
            name="batch-quantity"
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            description={tb("quantity_hint")}
            value={defaultQuantity}
            onChange={(e) => setDefaultQuantity(e.target.value)}
          />
        </Stack>
        <CurrencySelect value={currency} onChange={setCurrency} />
      </Stack>

      <Drawer />

      <BatchPreview
        schedule={schedule}
        theme="production"
        summary={`${tb("items", { count: totals.items })} · ${money(totals.gross, { currency })}`}
        renderExtra={(day, on) => {
          const value = quantityOf(day.key);
          const empty = on && toNumber(value) === 0;
          return (
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min={0}
              aria-label={tb("quantity_for", {
                day: format(day.start, "EEEE d MMMM", { locale: dateLocale }),
              })}
              disabled={!on}
              value={value}
              placeholder="0"
              onChange={(e) =>
                setQuantities((current) => ({ ...current, [day.key]: e.target.value }))
              }
              className={cn(
                "h-9 w-20 rounded-md border bg-transparent px-2 text-right text-ink tabular-nums outline-hidden",
                "focus:border-production disabled:opacity-40",
                empty ? "border-destructive" : "border-border"
              )}
            />
          );
        }}
      />
      {missing > 0 ? (
        <p className="-mt-2 text-xs text-destructive">
          {tb("quantity_missing", { count: missing })}
        </p>
      ) : null}

      <ShiftReviewDialog
        open={review}
        onOpenChange={setReview}
        formId={FORM_ID}
        theme="production"
        gross={totals.gross}
        currency={currency}
        afterTaxes={totals.afterTaxes}
        taxes={taxes}
        saveLabel={tb("save", { count: chosen.length })}
        rows={[
          { label: tb("shifts"), value: chosen.length },
          { label: t("fields.quantity"), value: totals.items },
          { label: t("fields.item_value"), value: money(toNumber(itemValue), { currency }) },
        ]}
      >
        <Button
          type="button"
          variant="primary"
          classes="h-14 w-full rounded-2xl text-base font-semibold"
          disabled={chosen.length === 0 || missing > 0 || batch.saving}
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
