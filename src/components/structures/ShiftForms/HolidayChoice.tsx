"use client";

import { useId } from "react";

import { useTranslations } from "next-intl";

import { cn } from "@/utils/helpers/styleMerger";

export type HolidayValue = "none" | "worked" | "off";

export function toHolidayValue(
  isPublicHoliday?: boolean | null,
  worked?: boolean | null
): HolidayValue {
  if (worked) return "worked";
  if (isPublicHoliday) return "off";
  return "none";
}

export function fromHolidayValue(value: HolidayValue) {
  return {
    isPublicHoliday: value !== "none",
    publicHolidayWorked: value === "worked",
  };
}

const OPTIONS: HolidayValue[] = ["none", "worked", "off"];

/**
 * One question instead of two checkboxes: was this day a public holiday,
 * and if so did you work it. Maps onto isPublicHoliday / publicHolidayWorked.
 */
function HolidayChoice({
  value,
  onChange,
}: {
  value: HolidayValue;
  onChange: (value: HolidayValue) => void;
}) {
  const id = useId();
  const t = useTranslations("shift.holiday");

  return (
    <fieldset className="flex w-full flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-ink">{t("question")}</legend>
      <div className="grid grid-cols-1 gap-2">
        {OPTIONS.map((option) => {
          const checked = value === option;
          return (
            <label
              key={option}
              htmlFor={`${id}-${option}`}
              className={cn(
                "flex min-h-13 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors",
                checked
                  ? option === "none"
                    ? "border-ink bg-surface"
                    : "border-fast bg-fast-soft"
                  : "border-border-strong bg-surface hover:bg-surface-sunken"
              )}
            >
              <input
                id={`${id}-${option}`}
                type="radio"
                name={`${id}-holiday`}
                value={option}
                checked={checked}
                onChange={() => onChange(option)}
              />
              <span className="flex flex-1 items-baseline justify-between gap-3">
                <span className="text-[0.9375rem] font-medium text-ink">
                  {t(`${option}.label`)}
                </span>
                <span className="text-[0.8125rem] text-ink-muted">{t(`${option}.hint`)}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default HolidayChoice;
