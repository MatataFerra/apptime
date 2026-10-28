"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";

import type { SavedEmployer } from "@/types";

import CurrencySelect from "@/components/structures/ShiftForms/CurrencySelect";
import EmployerSelect from "@/components/structures/ShiftForms/EmployerSelect";
import HolidayChoice, {
  fromHolidayValue,
  toHolidayValue,
} from "@/components/structures/ShiftForms/HolidayChoice";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { currencySymbol } from "@/utils/constants/currencies";
import useDefaultEmployer from "@/hooks/useDefaultEmployer";
import { useCurrency } from "@/hooks/useMoney";
import useUser from "@/hooks/useUser";
import useZodI18n from "@/hooks/useZodI18n";

import { useShiftData } from "@/store/useShiftData";

// Required-field messages come from the active language (hooks/useZodI18n).
const InputsSchema = z.object({
  hourValue: z.string().min(1),
  unpaidBreaks: z.string().min(1),
});

function ShiftStartInputs() {
  useZodI18n();
  const { data, setData, setErrors } = useShiftData((state) => state);
  const { data: user } = useUser();
  const defaultCurrency = useCurrency();
  const t = useTranslations("shift.fields");
  const tStart = useTranslations("track.start");
  const { register, control, setValue } = useForm({
    resolver: zodResolver(InputsSchema),
    defaultValues: {
      // What the dialog already has (the last shift, or edits made on the
      // previous step), else the rate from Settings.
      hourValue: data.hourValue
        ? String(data.hourValue)
        : user?.config?.hourValue
          ? String(user.config.hourValue)
          : "",
      unpaidBreaks: data.unpaidBreaks != null ? String(data.unpaidBreaks) : "1",
    },
  });

  /** Picking an employer (by hand or the default from Settings) brings its rate and currency. */
  function pickEmployer(employer: SavedEmployer | null) {
    setData({ employerId: employer?.id ?? null });
    if (!employer) return;
    if (employer.defaultRate != null) {
      setValue("hourValue", String(employer.defaultRate), { shouldDirty: true });
    }
    if (employer.defaultCurrency) setData({ currency: employer.defaultCurrency });
  }
  useDefaultEmployer(data.employerId, pickEmployer);

  const hourValue = useWatch({ control, name: "hourValue" });
  const unpaidBreaks = useWatch({ control, name: "unpaidBreaks" });

  useEffect(() => {
    if (!hourValue) setErrors(true);
    if (!unpaidBreaks) setErrors(true);

    if (hourValue && unpaidBreaks) setErrors(false);
  }, [hourValue, setErrors, unpaidBreaks]);

  useEffect(() => {
    if (hourValue) setData({ hourValue: Number(hourValue) });
  }, [hourValue, setData]);

  useEffect(() => {
    if (unpaidBreaks) setData({ unpaidBreaks: Number(unpaidBreaks) });
  }, [unpaidBreaks, setData]);

  return (
    <>
      <EmployerSelect
        allowCreate
        value={data.employerId}
        newDefaults={{ rate: Number(hourValue) || null, currency: data.currency }}
        onChange={pickEmployer}
      />
      <Stack orientation="horizontal" alignItems="center" wrap>
        <Input
          data-testid="hourValue"
          description={t("hourly_rate")}
          measure={currencySymbol(data.currency || defaultCurrency)}
          type="number"
          required
          min={0}
          {...register("hourValue", {})}
        />
        <Input
          description={t("unpaid_breaks")}
          type="number"
          min={0}
          max={5}
          required
          {...register("unpaidBreaks", {})}
        />
      </Stack>
      <CurrencySelect value={data.currency} onChange={(currency) => setData({ currency })} />
      <div className="mt-2 w-full">
        <HolidayChoice
          compact
          legend={tStart("holiday_question")}
          options={["none", "worked"]}
          value={toHolidayValue(data.isPublicHoliday, data.publicHolidayWorked)}
          onChange={(value) => setData(fromHolidayValue(value))}
        />
      </div>
    </>
  );
}

export default ShiftStartInputs;
