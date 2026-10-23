"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import CurrencySelect from "@/components/structures/ShiftForms/CurrencySelect";
import EmployerSelect from "@/components/structures/ShiftForms/EmployerSelect";
import PublicHolidayDropdown from "@/components/structures/Track/Flow/Start/Dialog/Dropdown";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

import { currencySymbol } from "@/utils/constants/currencies";
import { useCurrency } from "@/hooks/useMoney";
import useUser from "@/hooks/useUser";

import { useShiftData } from "@/store/useShiftData";

const InputsSchema = z.object({
  hourValue: z
    .string()
    .min(1)
    .refine((value) => !!value, {
      message: "Hour value is required",
    }),
  unpaidBreaks: z.string().refine((value) => !!value, {
    message: "Unpaid breaks is required",
  }),
});

function ShiftStartInputs() {
  const { data, setData, setErrors } = useShiftData((state) => state);
  const { data: user } = useUser();
  const defaultCurrency = useCurrency();
  const { register, control, setValue } = useForm({
    resolver: zodResolver(InputsSchema),
    defaultValues: {
      // The rate from Settings, if one is saved.
      hourValue: user?.config?.hourValue ? String(user.config.hourValue) : "",
      unpaidBreaks: "1",
    },
  });

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
    if (unpaidBreaks) setData({ unpaidBreaks: unpaidBreaks ? Number(unpaidBreaks) : 1 });
  }, [unpaidBreaks, setData]);

  return (
    <>
      <EmployerSelect
        value={data.employerId}
        onChange={(employer) => {
          setData({ employerId: employer?.id ?? null });
          if (!employer) return;
          // Their usual rate and currency, as a starting point.
          if (employer.defaultRate != null) {
            setValue("hourValue", String(employer.defaultRate), { shouldDirty: true });
          }
          if (employer.defaultCurrency) setData({ currency: employer.defaultCurrency });
        }}
      />
      <Stack orientation="horizontal" alignItems="center" wrap>
        <Input
          data-testid="hourValue"
          description="Hour value"
          measure={currencySymbol(data.currency || defaultCurrency)}
          type="number"
          required
          min={0}
          {...register("hourValue", {})}
        />
        <Input
          description="Unpaid Breaks"
          type="number"
          min={0}
          max={5}
          required
          {...register("unpaidBreaks", {})}
        />
      </Stack>
      <CurrencySelect value={data.currency} onChange={(currency) => setData({ currency })} />
      <Stack orientation="vertical" classes="h-20">
        <PublicHolidayDropdown />
      </Stack>
    </>
  );
}

export default ShiftStartInputs;
