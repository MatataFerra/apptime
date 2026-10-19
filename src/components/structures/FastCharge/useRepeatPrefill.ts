"use client";

import { useEffect, useRef } from "react";

import { useSearchParams } from "next/navigation";

import { moveToToday } from "@/services/Summary/repeat";

import type { HourlyType } from "@/types";
import type { FastChargeInputs } from "@/types/forms";

import { useFastChargeStore } from "@/store/useFastChargeStore";
import { useHourlyTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

type SetValue = (name: keyof FastChargeInputs, value: string | boolean | null) => void;

/**
 * `/fast-charge?repeat=<id>`: fills the form with that shift moved to today
 * (see planRepeat), once. Returns the shift it copied, for the notice.
 */
function useRepeatPrefill(hourly: HourlyType[] | undefined, setValue: SetValue) {
  const params = useSearchParams();
  const repeatId = params.get("repeat");
  const setStoreValue = useFastChargeStore((state) => state.setValues);
  const addTax = useHourlyTaxesOrContributionsStore((state) => state.taxesModule.add);
  const done = useRef(false);
  const picked = repeatId ? hourly?.find((s) => String(s.id) === repeatId && s.isClosed) : undefined;

  useEffect(() => {
    if (done.current || !picked) return;

    const plan = picked ? moveToToday(picked) : null;
    if (!plan) return;

    done.current = true;
    const { source: shift } = plan;
    const fields: [keyof FastChargeInputs, string | boolean][] = [
      ["name", shift.name ?? ""],
      ["start-date", plan.startDate],
      ["start-time", plan.startTime],
      ["finish-date", plan.finishDate],
      ["finish-time", plan.finishTime],
      ["hour-value", String(shift.hourValue)],
      ["unpaid-breaks", shift.unpaidBreaks ? String(shift.unpaidBreaks) : ""],
      ["is-public-holiday", false],
      ["is-public-holiday-worked", false],
    ];
    fields.forEach(([name, value]) => setValue(name, value));

    setStoreValue({
      name: shift.name ?? "",
      startDate: plan.startDate,
      startTime: plan.startTime,
      finishDate: plan.finishDate,
      finishTime: plan.finishTime,
      hourValue: String(shift.hourValue),
      unpaidBreaks: shift.unpaidBreaks ? String(shift.unpaidBreaks) : "",
      fastHoliday: false,
      fastWorked: false,
    });
    (shift.taxes ?? []).forEach((tax) =>
      addTax({ name: tax.name, value: tax.value, description: tax.description, fromDb: true })
    );
  }, [picked, setValue, setStoreValue, addTax]);

  return picked && moveToToday(picked) ? picked : null;
}

export default useRepeatPrefill;
