"use client";

import { useId, useState } from "react";

import { useTranslations } from "next-intl";

import type { HistoryEntry } from "@/services/History";

import { PillSelect } from "@/components/structures/ShiftForms/SelectRow";
import Button from "@/components/ui/Button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/Drawer";

import { CURRENCIES } from "@/utils/constants/currencies";
import useEmployers from "@/hooks/useEmployers";
import { useCurrency } from "@/hooks/useMoney";

import type { BatchEditInput } from "@/server-actions/edit-shifts-batch";

type Changes = BatchEditInput["changes"];

const KEEP = "__keep__";
const NONE = "__none__";
const HOLIDAYS = ["none", "worked", "off"] as const;

/** A label on the left and its control on the right, like the shift forms. */
function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
      <label htmlFor={id} className="flex min-w-0 flex-col">
        <span className="text-sm text-ink">{label}</span>
        {hint ? <span className="text-xs text-ink-muted">{hint}</span> : null}
      </label>
      {children(id)}
    </div>
  );
}

function NumberField({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      id={id}
      type="number"
      inputMode="decimal"
      step="0.01"
      min={0}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-28 rounded-full border border-border-strong bg-surface px-3.5 text-right text-sm font-semibold text-ink tabular-nums placeholder:font-normal placeholder:text-ink-subtle"
    />
  );
}

/**
 * "Edit 3 shifts": the changes to apply to every selected shift. Each field
 * starts on "Keep" and only the ones touched are sent. The hourly rate and
 * the piece value only apply to the shifts of their kind.
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
  const { employers } = useEmployers();
  const fallback = useCurrency();

  const [employer, setEmployer] = useState(KEEP);
  const [name, setName] = useState("");
  const [hourValue, setHourValue] = useState("");
  const [itemValue, setItemValue] = useState("");
  const [currency, setCurrency] = useState(KEEP);
  const [holiday, setHoliday] = useState(KEEP);
  const [error, setError] = useState<string | null>(null);

  const hourlyCount = entries.filter((e) => e.kind === "hourly").length;
  const productionCount = entries.length - hourlyCount;
  const names = new Set(entries.map((e) => e.name ?? ""));
  const sharedName = names.size === 1 ? [...names][0] : null;

  function reset() {
    setEmployer(KEEP);
    setName("");
    setHourValue("");
    setItemValue("");
    setCurrency(KEEP);
    setHoliday(KEEP);
    setError(null);
  }

  function submit() {
    const changes: Changes = {};
    if (employer !== KEEP) changes.employerId = employer === NONE ? null : Number(employer);
    if (name.trim()) changes.name = name.trim();
    if (hourlyCount > 0 && hourValue !== "") changes.hourValue = Number(hourValue);
    if (productionCount > 0 && itemValue !== "") changes.itemValue = Number(itemValue);
    if (currency !== KEEP) changes.currency = currency === fallback ? null : currency;
    if (holiday !== KEEP) changes.holiday = holiday as (typeof HOLIDAYS)[number];

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
          <Row label={tf("employer")}>
            {(id) => (
              <PillSelect id={id} value={employer} onChange={setEmployer}>
                <option value={KEEP}>{t("keep")}</option>
                <option value={NONE}>{tf("no_employer")}</option>
                {employers.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </PillSelect>
            )}
          </Row>

          <Row label={tf("job")}>
            {(id) => (
              <input
                id={id}
                type="text"
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={sharedName || t("keep")}
                className="h-9 w-40 min-w-0 rounded-full border border-border-strong bg-surface px-3.5 text-sm font-semibold text-ink placeholder:font-normal placeholder:text-ink-subtle"
              />
            )}
          </Row>

          {hourlyCount > 0 ? (
            <Row
              label={tf("hourly_rate")}
              hint={productionCount > 0 ? t("only_hourly", { count: hourlyCount }) : undefined}
            >
              {(id) => (
                <NumberField
                  id={id}
                  value={hourValue}
                  onChange={setHourValue}
                  placeholder={t("keep")}
                />
              )}
            </Row>
          ) : null}

          {productionCount > 0 ? (
            <Row
              label={t("piece_value")}
              hint={hourlyCount > 0 ? t("only_production", { count: productionCount }) : undefined}
            >
              {(id) => (
                <NumberField
                  id={id}
                  value={itemValue}
                  onChange={setItemValue}
                  placeholder={t("keep")}
                />
              )}
            </Row>
          ) : null}

          <Row label={tf("paid_in")}>
            {(id) => (
              <PillSelect id={id} value={currency} onChange={setCurrency}>
                <option value={KEEP}>{t("keep")}</option>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </PillSelect>
            )}
          </Row>

          <Row label={t("holiday")}>
            {(id) => (
              <PillSelect id={id} value={holiday} onChange={setHoliday}>
                <option value={KEEP}>{t("keep")}</option>
                {HOLIDAYS.map((h) => (
                  <option key={h} value={h}>
                    {th(`${h}.label`)}
                  </option>
                ))}
              </PillSelect>
            )}
          </Row>
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
