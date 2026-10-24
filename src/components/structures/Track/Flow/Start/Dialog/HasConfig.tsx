"use client";

import { useId, useState } from "react";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { History } from "lucide-react";
import { useTranslations } from "next-intl";

import CurrencySelect from "@/components/structures/ShiftForms/CurrencySelect";
import EmployerSelect from "@/components/structures/ShiftForms/EmployerSelect";
import HolidayChoice, {
  fromHolidayValue,
  toHolidayValue,
} from "@/components/structures/ShiftForms/HolidayChoice";
import StartButton from "@/components/structures/Track/Flow/Start/Button";
import Button from "@/components/ui/Button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { currencySymbol } from "@/utils/constants/currencies";
import { useCurrency } from "@/hooks/useMoney";

import { useShiftData } from "@/store/useShiftData";

/**
 * "Use your last shift's settings?": the rate, currency and employer can be
 * changed (or an employer added) right here; breaks and the rest go through
 * Edit. A live shift is either a normal day or a worked public holiday.
 */
function ShiftStartHasConfigStep() {
  const { setStep, setData, setErrors, data } = useShiftData((state) => state);
  const t = useTranslations("track.start");
  const tFields = useTranslations("shift.fields");
  const defaultCurrency = useCurrency();
  const rateId = useId();
  const [rate, setRate] = useState(data.hourValue ? String(data.hourValue) : "");

  function onRateChange(value: string) {
    setRate(value);
    const number = Number(value);
    const valid = value.trim() !== "" && Number.isFinite(number) && number >= 0;
    setErrors(!valid);
    if (valid) setData({ hourValue: number });
  }

  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle>
          <Stack orientation="horizontal" alignItems="center" spacing={3}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <History className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <Text as="span" classes="font-display text-lg leading-tight font-semibold">
              {t("last_config_title")}
            </Text>
          </Stack>
        </DialogTitle>
        <DialogDescription>
          <VisuallyHidden.Root>{t("last_config_description")}</VisuallyHidden.Root>
        </DialogDescription>
      </DialogHeader>

      <div className="flex w-full flex-col divide-y divide-border">
        <div className="flex min-h-12 items-center justify-between gap-3 pb-2">
          <label htmlFor={rateId} className="text-sm text-ink-muted">
            {tFields("hourly_rate")}
          </label>
          <span className="flex items-center gap-1.5">
            <span className="relative">
              <span
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-ink-muted"
                aria-hidden="true"
              >
                {currencySymbol(data.currency || defaultCurrency)}
              </span>
              <input
                id={rateId}
                data-testid="last-config-rate"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={rate}
                onChange={(e) => onRateChange(e.target.value)}
                className="h-9 w-28 rounded-full border border-border-strong bg-surface pr-3 pl-8 text-right text-sm font-semibold text-ink tabular-nums outline-none focus:border-accent focus:ring-3 focus:ring-accent/15"
              />
            </span>
            <CurrencySelect
              pill
              value={data.currency}
              onChange={(currency) => setData({ currency })}
            />
          </span>
        </div>

        <EmployerSelect
          allowCreate
          classes="my-0 min-h-12 py-1.5"
          value={data.employerId}
          newDefaults={{ rate: data.hourValue, currency: data.currency }}
          onChange={(employer) => {
            setData({ employerId: employer?.id ?? null });
            if (!employer) return;
            // Their usual rate and currency, as a starting point.
            if (employer.defaultRate != null) onRateChange(String(employer.defaultRate));
            if (employer.defaultCurrency) setData({ currency: employer.defaultCurrency });
          }}
        />

        <div className="flex min-h-12 items-center justify-between gap-3 py-1.5 text-sm">
          <span className="text-ink-muted">{tFields("unpaid_breaks")}</span>
          <span className="font-semibold text-ink tabular-nums">{data.unpaidBreaks ?? 0}</span>
        </div>

        <div className="pt-3">
          <HolidayChoice
            compact
            legend={t("holiday_question")}
            options={["none", "worked"]}
            value={toHolidayValue(data.isPublicHoliday, data.publicHolidayWorked)}
            onChange={(value) => setData(fromHolidayValue(value))}
          />
        </div>
      </div>

      <Stack>
        <Button
          variant="white"
          classes="w-full p-2 text-sm active:shadow-button-inner"
          onClick={() => setStep("ShiftInfo")}
        >
          {t("edit")}
        </Button>
        <StartButton title={t("start")} />
      </Stack>
    </>
  );
}

export default ShiftStartHasConfigStep;
