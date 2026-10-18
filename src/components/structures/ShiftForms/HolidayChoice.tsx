"use client";

import { useId } from "react";

import { cn } from "@/utils/helpers/styleMerger";

export type HolidayValue = "none" | "worked" | "off";

export function toHolidayValue(isPublicHoliday?: boolean | null, worked?: boolean | null): HolidayValue {
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

const OPTIONS: { value: HolidayValue; label: string; hint: string }[] = [
  { value: "none", label: "Regular day", hint: "Normal rate" },
  { value: "worked", label: "Public holiday, worked", hint: "Paid at 1.5×" },
  { value: "off", label: "Public holiday, day off", hint: "Paid, not worked" },
];

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

  return (
    <fieldset className="flex w-full flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-ink">What kind of day was it?</legend>
      <div className="grid grid-cols-1 gap-2">
        {OPTIONS.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              htmlFor={`${id}-${option.value}`}
              className={cn(
                "flex min-h-13 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors",
                checked
                  ? option.value === "none"
                    ? "border-ink bg-surface"
                    : "border-fast bg-fast-soft"
                  : "border-border-strong bg-surface hover:bg-surface-sunken"
              )}
            >
              <input
                id={`${id}-${option.value}`}
                type="radio"
                name={`${id}-holiday`}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
              />
              <span className="flex flex-1 items-baseline justify-between gap-3">
                <span className="text-[0.9375rem] font-medium text-ink">{option.label}</span>
                <span className="text-[0.8125rem] text-ink-muted">{option.hint}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default HolidayChoice;
