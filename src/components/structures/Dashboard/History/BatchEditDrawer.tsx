"use client";

import { type ReactNode, useId, useState } from "react";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

import type { HistoryEntry } from "@/services/History";

import type { HourlyType, ProductionType } from "@/types";

import Button from "@/components/ui/Button";
import { ChoiceOptions, ChoiceTrigger, useInlineChoice } from "@/components/ui/Choice";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/Drawer";

import { CURRENCIES } from "@/utils/constants/currencies";
import { cn } from "@/utils/helpers/styleMerger";
import useCurrencyName from "@/hooks/useCurrencyName";
import useEmployers from "@/hooks/useEmployers";
import { useCurrency } from "@/hooks/useMoney";

import type { BatchEditInput } from "@/server-actions/edit-shifts-batch";

type Changes = BatchEditInput["changes"];
type Holiday = "none" | "worked" | "off";

/** The selected shifts don't agree on this field. */
export const MIXED = "\u0000mixed";
type Common<T> = T | typeof MIXED;

const HOLIDAYS: Holiday[] = ["none", "worked", "off"];

/** The value every entry shares, or MIXED. */
export function commonValue<T>(
  entries: HistoryEntry[],
  pick: (entry: HistoryEntry) => T
): Common<T> {
  if (entries.length === 0) return MIXED;
  const first = pick(entries[0]);
  return entries.every((entry) => Object.is(pick(entry), first)) ? first : MIXED;
}

type Field = "employer" | "currency" | "holiday";

/** One line of the form: label, what it's set to, and a way back when it changed. */
function FieldRow({
  label,
  hint,
  changed,
  onReset,
  children,
  below,
}: {
  label: string;
  hint?: string;
  changed: boolean;
  onReset: () => void;
  children: ReactNode;
  /** Shown under the row, e.g. a Choice's options. */
  below?: ReactNode;
}) {
  const t = useTranslations("dashboard.selection");
  return (
    <div className="border-b border-border py-3 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 flex-col">
          <span className="flex items-center gap-1.5 text-sm text-ink">
            {label}
            {changed ? (
              <button
                type="button"
                onClick={onReset}
                aria-label={t("undo_field", { field: label })}
                className="flex size-6 items-center justify-center rounded-full text-ink-muted hover:bg-surface-sunken hover:text-ink"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </span>
          {hint ? <span className="text-xs text-ink-muted">{hint}</span> : null}
        </span>
        {children}
      </div>
      {below}
    </div>
  );
}

/**
 * A pick-one field that opens its options right under the row (no native
 * select, no portal inside the drawer). Only one is open at a time.
 */
function Choice<T extends string>({
  label,
  hint,
  open,
  onToggle,
  value,
  common,
  options,
  onChange,
  onReset,
  render,
}: {
  label: string;
  hint?: string;
  open: boolean;
  onToggle: () => void;
  /** The picked value, undefined while unchanged. */
  value: T | undefined;
  common: Common<T>;
  options: T[];
  onChange: (value: T) => void;
  onReset: () => void;
  render: (value: T) => string;
}) {
  const t = useTranslations("dashboard.selection");
  const id = useId();
  const current = value ?? common;
  const changed = value !== undefined && value !== common;
  const { rootRef, triggerRef } = useInlineChoice({
    open,
    onOpenChange: (next) => {
      if (next !== open) onToggle();
    },
  });

  return (
    <div ref={rootRef}>
      <FieldRow
        label={label}
        hint={hint}
        changed={changed}
        onReset={onReset}
        below={
          open ? (
            <ChoiceOptions
              inline
              id={id}
              label={label}
              className="mt-2"
              value={current === MIXED ? undefined : current}
              options={options.map((option) => ({
                value: option,
                label: render(option),
                tag: option === common ? t("current") : undefined,
              }))}
              onSelect={(next) => {
                triggerRef.current?.focus({ preventScroll: true });
                onChange(next as T);
              }}
            />
          ) : null
        }
      >
        <ChoiceTrigger
          ref={triggerRef}
          open={open}
          aria-controls={open ? id : undefined}
          aria-label={`${label}: ${current === MIXED ? t("mixed") : render(current)}`}
          onClick={onToggle}
          tone={changed ? "changed" : current === MIXED ? "muted" : "default"}
          className="max-w-[60%]"
        >
          {current === MIXED ? t("mixed") : render(current)}
        </ChoiceTrigger>
      </FieldRow>
    </div>
  );
}

function TextInput({
  label,
  hint,
  value,
  common,
  onChange,
  numeric = false,
}: {
  label: string;
  hint?: string;
  /** What's typed, undefined while untouched. */
  value: string | undefined;
  common: Common<string>;
  onChange: (value: string | undefined) => void;
  numeric?: boolean;
}) {
  const t = useTranslations("dashboard.selection");
  const id = useId();
  const shown = value ?? (common === MIXED ? "" : common);
  const changed = value !== undefined && value.trim() !== (common === MIXED ? "" : common);

  return (
    <FieldRow label={label} hint={hint} changed={changed} onReset={() => onChange(undefined)}>
      <input
        id={id}
        aria-label={label}
        type={numeric ? "number" : "text"}
        inputMode={numeric ? "decimal" : undefined}
        step={numeric ? "0.01" : undefined}
        min={numeric ? 0 : undefined}
        maxLength={numeric ? undefined : 100}
        value={shown}
        placeholder={common === MIXED ? t("mixed") : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 min-w-0 rounded-full border border-border-strong bg-surface px-3.5 text-sm text-ink placeholder:font-normal placeholder:text-ink-muted",
          numeric ? "w-28 text-right tabular-nums" : "w-44",
          changed ? "font-semibold text-accent" : "font-semibold"
        )}
      />
    </FieldRow>
  );
}

/**
 * "Edit 3 shifts": each field shows what the selected shifts have in common
 * ("Berry Farm"), or "Mixed" when they differ. Only the fields changed from
 * that are sent. The hourly rate and the piece value only apply to the
 * shifts of their kind.
 */
function BatchEditDrawer({
  open,
  onOpenChange,
  entries,
  saving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: HistoryEntry[];
  saving: boolean;
  onSave: (changes: Changes) => void;
}) {
  const t = useTranslations("dashboard.selection");
  const tf = useTranslations("shift.fields");
  const th = useTranslations("shift.holiday");
  const { employers, byId } = useEmployers();
  const fallback = useCurrency();
  const currencyName = useCurrencyName();

  const [openField, setOpenField] = useState<Field | null>(null);
  const [employer, setEmployer] = useState<string>();
  const [currency, setCurrency] = useState<string>();
  const [holiday, setHoliday] = useState<Holiday>();
  const [name, setName] = useState<string>();
  const [hourValue, setHourValue] = useState<string>();
  const [itemValue, setItemValue] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  const hourly = entries.filter((e) => e.kind === "hourly");
  const production = entries.filter((e) => e.kind === "production");

  const NONE = "none";
  const common = {
    employer: commonValue(entries, (e) => (e.employerId === null ? NONE : String(e.employerId))),
    currency: commonValue(entries, (e) => e.currency ?? fallback),
    holiday: commonValue(entries, (e): Holiday => e.holiday ?? "none"),
    name: commonValue(entries, (e) => e.name ?? ""),
    hourValue: commonValue(hourly, (e) => String((e.shift as HourlyType).hourValue)),
    itemValue: commonValue(production, (e) => String((e.shift as ProductionType).itemValue ?? 0)),
  };

  // The selected shifts' employer stays listed even if it's archived.
  const employerIds = [
    ...employers.map((e) => String(e.id)),
    ...(common.employer !== MIXED &&
    common.employer !== NONE &&
    !employers.some((e) => String(e.id) === common.employer)
      ? [common.employer]
      : []),
  ];

  function toggle(field: Field) {
    setOpenField((current) => (current === field ? null : field));
  }

  function choose<T>(set: (value: T) => void) {
    return (value: T) => {
      set(value);
      setOpenField(null);
      setError(null);
    };
  }

  function reset() {
    setOpenField(null);
    setEmployer(undefined);
    setCurrency(undefined);
    setHoliday(undefined);
    setName(undefined);
    setHourValue(undefined);
    setItemValue(undefined);
    setError(null);
  }

  function differs(value: string | undefined, against: Common<string>) {
    return value !== undefined && value.trim() !== "" && value.trim() !== against;
  }

  function submit() {
    const changes: Changes = {};
    if (employer !== undefined && employer !== common.employer) {
      changes.employerId = employer === NONE ? null : Number(employer);
    }
    if (currency !== undefined && currency !== common.currency) {
      changes.currency = currency === fallback ? null : currency;
    }
    if (holiday !== undefined && holiday !== common.holiday) changes.holiday = holiday;
    if (differs(name, common.name)) changes.name = name!.trim();
    if (hourly.length > 0 && differs(hourValue, common.hourValue)) {
      changes.hourValue = Number(hourValue);
    }
    if (production.length > 0 && differs(itemValue, common.itemValue)) {
      changes.itemValue = Number(itemValue);
    }

    if (Object.keys(changes).length === 0) {
      setError(t("no_changes"));
      return;
    }
    const values = [changes.hourValue, changes.itemValue].filter((v) => v !== undefined);
    if (values.some((v) => !Number.isFinite(v) || v < 0)) {
      setError(t("invalid_value"));
      return;
    }
    setError(null);
    onSave(changes);
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DrawerContent className="max-h-[90dvh]" data-testid="batch-edit-drawer">
        <DrawerHeader className="text-left">
          <DrawerTitle>{t("edit_title", { count: entries.length })}</DrawerTitle>
          <DrawerDescription>{t("edit_description")}</DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4">
          <Choice
            label={tf("employer")}
            open={openField === "employer"}
            onToggle={() => toggle("employer")}
            value={employer}
            common={common.employer}
            options={[...employerIds, NONE]}
            onChange={choose(setEmployer)}
            onReset={() => setEmployer(undefined)}
            render={(id) => {
              if (id === NONE) return tf("no_employer");
              const found = byId.get(Number(id));
              return found ? `${found.name}${found.archived ? ` ${tf("removed")}` : ""}` : "";
            }}
          />

          <TextInput label={tf("job")} value={name} common={common.name} onChange={setName} />

          {hourly.length > 0 ? (
            <TextInput
              numeric
              label={tf("hourly_rate")}
              hint={production.length > 0 ? t("only_hourly", { count: hourly.length }) : undefined}
              value={hourValue}
              common={common.hourValue}
              onChange={setHourValue}
            />
          ) : null}

          {production.length > 0 ? (
            <TextInput
              numeric
              label={t("piece_value")}
              hint={
                hourly.length > 0 ? t("only_production", { count: production.length }) : undefined
              }
              value={itemValue}
              common={common.itemValue}
              onChange={setItemValue}
            />
          ) : null}

          <Choice
            label={tf("paid_in")}
            open={openField === "currency"}
            onToggle={() => toggle("currency")}
            value={currency}
            common={common.currency}
            options={CURRENCIES.map((c) => c.code as string)}
            onChange={choose(setCurrency)}
            onReset={() => setCurrency(undefined)}
            render={(code) => `${code} · ${currencyName(code)}`}
          />

          <Choice
            label={t("holiday")}
            open={openField === "holiday"}
            onToggle={() => toggle("holiday")}
            value={holiday}
            common={common.holiday}
            options={HOLIDAYS}
            onChange={choose(setHoliday)}
            onReset={() => setHoliday(undefined)}
            render={(value) => th(`${value}.label`)}
          />
        </div>

        <DrawerFooter>
          {error ? (
            <p role="alert" className="text-center text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            size="lg"
            variant="primary"
            classes="w-full"
            disabled={saving}
            onClick={submit}
          >
            {t("save", { count: entries.length })}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default BatchEditDrawer;
