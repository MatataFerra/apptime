"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { format } from "date-fns";
import { CalendarDays, Check, ChevronDown, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  type CountingRule,
  VISA_PROGRAMS,
  type VisaCountry,
  type VisaProgram,
  type VisaProgramId,
} from "@/services/VisaReport";

import { Calendar } from "@/components/ui/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

import { cn } from "@/utils/helpers/styleMerger";
import useDateLocale from "@/hooks/useDateLocale";

/** "AU" -> 🇦🇺 */
export function flagOf(country: VisaCountry) {
  return [...country].map((char) => String.fromCodePoint(127397 + char.charCodeAt(0))).join("");
}

function Label({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="px-1 text-sm font-semibold text-ink-muted">
      {children}
    </h2>
  );
}

/** The visas, one row each, as a single-choice list. */
export function ProgramPicker({
  value,
  onChange,
}: {
  value: VisaProgramId;
  onChange: (id: VisaProgramId) => void;
}) {
  const t = useTranslations("extensions");

  return (
    <section className="flex flex-col gap-2" aria-labelledby="visa-program-label">
      <Label id="visa-program-label">{t("program_label")}</Label>
      <div
        role="radiogroup"
        aria-labelledby="visa-program-label"
        className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface"
      >
        {VISA_PROGRAMS.map((program) => {
          const selected = program.id === value;
          return (
            <button
              key={program.id}
              type="button"
              role="radio"
              aria-checked={selected}
              data-testid={`visa-program-${program.id}`}
              onClick={() => onChange(program.id)}
              className={cn(
                "flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:bg-surface-sunken focus-visible:outline-hidden",
                selected ? "bg-insight-soft/60" : "hover:bg-surface-sunken"
              )}
            >
              <span className="text-2xl leading-none" aria-hidden="true">
                {flagOf(program.country)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[0.9375rem] font-semibold text-ink">
                  {t(`programs.${program.id}.name`)}
                </span>
                <span className="text-[0.8125rem] text-ink-muted">
                  {t(`programs.${program.id}.detail`)}
                </span>
              </span>
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                  selected ? "border-transparent bg-insight text-on-module" : "border-border-strong"
                )}
                aria-hidden="true"
              >
                {selected ? <Check className="size-3.5" strokeWidth={3} /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** Days worked / full-time weeks, as a two-part switch with what each means below. */
export function RulePicker({
  program,
  value,
  onChange,
}: {
  program: VisaProgram;
  value: CountingRule;
  onChange: (rule: CountingRule) => void;
}) {
  const t = useTranslations("extensions");
  if (program.rules.length < 2) return null;

  return (
    <section className="flex flex-col gap-2" aria-labelledby="visa-rule-label">
      <Label id="visa-rule-label">{t("rule_label")}</Label>
      <div
        role="radiogroup"
        aria-labelledby="visa-rule-label"
        className="grid grid-cols-2 gap-1 rounded-xl bg-surface-sunken p-1"
      >
        {program.rules.map((rule) => (
          <button
            key={rule}
            type="button"
            role="radio"
            aria-checked={rule === value}
            data-testid={`visa-rule-${rule}`}
            onClick={() => onChange(rule)}
            className={cn(
              "h-10 rounded-lg px-2 text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-accent/15 focus-visible:outline-hidden",
              rule === value ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink"
            )}
          >
            {t(`rules.${rule}.label`)}
          </button>
        ))}
      </div>
      <p className="px-1 text-[0.8125rem] text-ink-muted">
        {t(`rules.${value}.hint`, { hours: program.fullTimeHours })}
      </p>
    </section>
  );
}

/**
 * The report's dates: a field that opens a range calendar. The range is only
 * applied once both ends are picked; "From the first shift in…" goes back to
 * the default.
 */
export function PeriodPicker({
  from,
  to,
  country,
  isDefault,
  onChange,
  onReset,
}: {
  from: Date;
  to: Date;
  country: VisaCountry;
  /** Whether the dates are still the default ones (no reset to offer). */
  isDefault: boolean;
  onChange: (range: { from: Date; to: Date }) => void;
  onReset: () => void;
}) {
  const t = useTranslations("extensions");
  const locale = useDateLocale();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();

  const shown = draft ?? { from, to };

  return (
    <section className="flex flex-col gap-2" aria-labelledby="visa-period-label">
      <Label id="visa-period-label">{t("period.label")}</Label>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setDraft(undefined);
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            data-testid="visa-period"
            aria-expanded={open}
            className={cn(
              "flex h-11 w-full items-center gap-2 rounded-xl border bg-surface pr-2.5 pl-3 text-left text-[0.9375rem] font-semibold text-ink transition-colors focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/15 focus-visible:outline-hidden",
              open ? "border-ink" : "border-border-strong hover:bg-surface-sunken"
            )}
          >
            <CalendarDays className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate tabular-nums">
              {format(from, "PP", { locale })} – {format(to, "PP", { locale })}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-ink-muted transition-transform",
                open && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" collisionPadding={16} className="w-auto p-0">
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={shown.from}
            selected={shown}
            onSelect={(range, day) => {
              // The first click starts a new range instead of moving one end.
              if (!draft) {
                setDraft({ from: day, to: undefined });
                return;
              }
              if (range?.from && range.to) {
                onChange({ from: range.from, to: range.to });
                setDraft(undefined);
                setOpen(false);
                return;
              }
              setDraft(range ?? { from: day, to: undefined });
            }}
            numberOfMonths={1}
          />
          {draft ? (
            <p className="px-4 pb-3 text-[0.8125rem] text-ink-muted">{t("period.pick")}</p>
          ) : null}
        </PopoverContent>
      </Popover>
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 px-1">
        <p className="min-w-0 flex-1 text-[0.8125rem] text-ink-muted">{t("period.hint")}</p>
        {isDefault ? null : (
          <button
            type="button"
            onClick={onReset}
            className="flex h-8 items-center gap-1.5 rounded-full px-1 text-[0.8125rem] font-semibold text-accent"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            {t("period.from_first", { country: t(`countries.${country}`) })}
          </button>
        )}
      </div>
    </section>
  );
}
