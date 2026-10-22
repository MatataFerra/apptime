"use client";

import { type ReactNode, useId, useState } from "react";

import { type EmployerData, EmployerInputSchema, fieldErrors } from "@/services/Employer/schema";

import type { SavedEmployer } from "@/types";

import Button from "@/components/ui/Button";

import { CURRENCIES, currencySymbol } from "@/utils/constants/currencies";
import { useCurrency } from "@/hooks/useMoney";

type Errors = Partial<Record<keyof EmployerData, string>>;

const FIELD =
  "h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem] text-ink outline-hidden focus:border-accent aria-invalid:border-destructive";

const TEXT_FIELDS = [
  "name",
  "taxId",
  "industry",
  "address",
  "city",
  "postcode",
  "country",
  "contactName",
  "contactEmail",
  "contactPhone",
  "notes",
] as const;

type TextField = (typeof TEXT_FIELDS)[number];

function initialText(employer?: SavedEmployer) {
  return Object.fromEntries(TEXT_FIELDS.map((field) => [field, employer?.[field] ?? ""])) as Record<
    TextField,
    string
  >;
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-[0.8125rem] font-semibold text-ink-muted">{title}</legend>
      {children}
    </fieldset>
  );
}

/**
 * Add or edit an employer. Only the name is required; the rest is what
 * visa and tax forms usually ask for, filled in when the user has it.
 */
function EmployerForm({
  employer,
  busy,
  serverErrors,
  onCancel,
  onSave,
}: {
  employer?: SavedEmployer;
  busy: boolean;
  /** Field errors the server sent back. */
  serverErrors?: Errors;
  onCancel: () => void;
  onSave: (data: EmployerData) => void;
}) {
  const settingsCurrency = useCurrency();
  const [text, setText] = useState(() => initialText(employer));
  const [rate, setRate] = useState(
    employer?.defaultRate != null ? String(employer.defaultRate) : ""
  );
  const [currency, setCurrency] = useState(employer?.defaultCurrency ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const baseId = useId();
  const shown = { ...serverErrors, ...errors };

  function field(
    name: TextField,
    label: string,
    props: { type?: string; inputMode?: "email" | "tel" } = {}
  ) {
    const id = `${baseId}-${name}`;
    const error = shown[name];
    return (
      <label htmlFor={id} className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
        {label}
        <input
          id={id}
          name={name}
          type={props.type ?? "text"}
          inputMode={props.inputMode}
          value={text[name]}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => setText((current) => ({ ...current, [name]: e.target.value }))}
          className={FIELD}
        />
        {error ? (
          <span id={`${id}-error`} className="text-[0.8125rem] text-destructive">
            {error}
          </span>
        ) : null}
      </label>
    );
  }

  const rateId = `${baseId}-rate`;
  const currencyId = `${baseId}-currency`;
  const notesId = `${baseId}-notes`;

  return (
    <form
      className="flex flex-col gap-5 px-4 py-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = EmployerInputSchema.safeParse({
          ...text,
          defaultRate: rate.trim() === "" ? null : Number(rate),
          defaultCurrency: currency || null,
        });
        if (!parsed.success) {
          setErrors(fieldErrors(parsed.error));
          return;
        }
        setErrors({});
        onSave(parsed.data);
      }}
    >
      <Group title="Business">
        {field("name", "Name")}
        <div className="grid grid-cols-2 gap-2">
          {field("taxId", "Tax or business no.")}
          {field("industry", "Industry")}
        </div>
      </Group>

      <Group title="Where">
        {field("address", "Address")}
        <div className="grid grid-cols-[1fr_7rem] gap-2">
          {field("city", "City or town")}
          {field("postcode", "Postcode")}
        </div>
        {field("country", "Country")}
      </Group>

      <Group title="Contact">
        {field("contactName", "Person")}
        <div className="grid grid-cols-2 gap-2">
          {field("contactEmail", "Email", { type: "email", inputMode: "email" })}
          {field("contactPhone", "Phone", { type: "tel", inputMode: "tel" })}
        </div>
      </Group>

      <Group title="Usual pay">
        <div className="grid grid-cols-[1fr_8rem] gap-2">
          <label htmlFor={rateId} className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
            Per hour
            <span className="flex h-11 items-center gap-1 rounded-xl border border-border-strong bg-surface px-3 focus-within:border-accent">
              <span className="text-sm text-ink-muted">
                {currencySymbol(currency || settingsCurrency)}
              </span>
              <input
                id={rateId}
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={rate}
                aria-invalid={shown.defaultRate ? true : undefined}
                onChange={(e) => setRate(e.target.value)}
                className="w-full min-w-0 bg-transparent text-right text-[0.9375rem] text-ink tabular-nums outline-hidden"
              />
            </span>
            {shown.defaultRate ? (
              <span className="text-[0.8125rem] text-destructive">{shown.defaultRate}</span>
            ) : null}
          </label>
          <label
            htmlFor={currencyId}
            className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted"
          >
            Currency
            <select
              id={currencyId}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={FIELD}
            >
              <option value="">{settingsCurrency} (Settings)</option>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-[0.8125rem] text-ink-subtle">
          Optional. New shifts for this employer will start with it.
        </p>
      </Group>

      <label htmlFor={notesId} className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
        Notes
        <textarea
          id={notesId}
          rows={3}
          value={text.notes}
          maxLength={500}
          onChange={(e) => setText((current) => ({ ...current, notes: e.target.value }))}
          className="w-full rounded-xl border border-border-strong bg-surface px-3 py-2.5 text-[0.9375rem] text-ink outline-hidden focus:border-accent"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="ghost" size="md" classes="w-full" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="md" classes="w-full" disabled={busy}>
          {busy ? "Saving…" : employer ? "Save" : "Add employer"}
        </Button>
      </div>
    </form>
  );
}

export default EmployerForm;
