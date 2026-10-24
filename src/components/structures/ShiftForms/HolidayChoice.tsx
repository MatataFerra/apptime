"use client";

import { useId } from "react";

import { useTranslations } from "next-intl";

import Segmented from "@/components/structures/Settings/Preferences/Segmented";

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
 *
 * `compact` draws the options as a segmented control with the chosen one's
 * hint underneath, for tight spots like the Track start dialog.
 */
function HolidayChoice({
  value,
  onChange,
  options = OPTIONS,
  compact = false,
  legend,
}: {
  value: HolidayValue;
  onChange: (value: HolidayValue) => void;
  /** Which choices to offer, e.g. a live shift is always worked. */
  options?: HolidayValue[];
  compact?: boolean;
  /** Replaces the default question ("What kind of day was it?"). */
  legend?: string;
}) {
  const id = useId();
  const t = useTranslations("shift.holiday");
  const question = legend ?? t("question");

  if (compact) {
    return (
      <div className="flex w-full flex-col gap-2">
        <span className="text-sm text-ink-muted" aria-hidden="true">
          {question}
        </span>
        <Segmented
          label={question}
          value={value}
          options={options.map((option) => ({ value: option, label: t(`${option}.label`) }))}
          onChange={onChange}
        />
        <p
          className={cn(
            "px-1 text-[0.8125rem]",
            value === "none" ? "text-ink-muted" : "font-medium text-fast-ink"
          )}
          aria-live="polite"
        >
          {t(`${value}.hint`)}
        </p>
      </div>
    );
  }

  return (
    <fieldset className="flex w-full flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-ink">{question}</legend>
      <div className="grid grid-cols-1 gap-2">
        {options.map((option) => {
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
