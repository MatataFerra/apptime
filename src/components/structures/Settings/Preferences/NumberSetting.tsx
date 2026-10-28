"use client";

import { useId, useState } from "react";

import { useTranslations } from "next-intl";

import { Row } from "./Section";

/**
 * A number setting that saves when you leave the field (or press Enter).
 * Empty means "no default" when `nullable`.
 */
function NumberSetting({
  label,
  hint,
  value,
  unit,
  unitPlace = "right",
  nullable,
  min = 0,
  max,
  onSave,
}: {
  label: string;
  hint?: string;
  value: number | null | undefined;
  unit: string;
  unitPlace?: "left" | "right";
  nullable?: boolean;
  min?: number;
  max?: number;
  onSave: (value: number | null) => void;
}) {
  const id = useId();
  const t = useTranslations("settings.money");
  const saved = value === null || value === undefined ? "" : String(value);
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? saved;

  function commit() {
    if (draft === null) return;
    setDraft(null);
    const trimmed = draft.trim();
    if (trimmed === saved) return;
    if (trimmed === "") {
      if (nullable) onSave(null);
      return;
    }
    const number = Number(trimmed);
    if (Number.isFinite(number) && number >= min && (max === undefined || number <= max)) {
      onSave(number);
    }
  }

  return (
    <Row label={label} hint={hint} htmlFor={id}>
      <span className="flex h-10 w-32 shrink-0 items-center gap-1.5 rounded-xl border border-border-strong bg-surface px-3 focus-within:border-accent">
        {unitPlace === "left" ? <span className="text-sm text-ink-muted">{unit}</span> : null}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step="any"
          placeholder={nullable ? t("none") : undefined}
          value={shown}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="w-full min-w-0 bg-transparent text-right text-[0.9375rem] text-ink tabular-nums outline-hidden placeholder:text-ink-subtle"
        />
        {unitPlace === "right" ? <span className="text-sm text-ink-muted">{unit}</span> : null}
      </span>
    </Row>
  );
}

export default NumberSetting;
