"use client";

import { type ReactNode, useId, useState } from "react";

import { ClipboardPaste, Search } from "lucide-react";

import type { PastedEmployer, PasteField } from "@/services/Employer/paste";
import { type EmployerData, EmployerInputSchema, fieldErrors } from "@/services/Employer/schema";

import type { SavedEmployer } from "@/types";

import AbnLookup from "@/components/structures/Employers/AbnLookup";
import PasteDetails from "@/components/structures/Employers/PasteDetails";
import Button from "@/components/ui/Button";

import { CURRENCIES, currencySymbol } from "@/utils/constants/currencies";
import { cn } from "@/utils/helpers/styleMerger";
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
  "region",
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

type Helper = "abn" | "paste" | null;

/** One of the two ways to fill the form faster. */
function HelperTab({
  active,
  icon,
  children,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-10 items-center justify-center gap-2 rounded-xl border text-[0.8125rem] font-semibold transition-colors",
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-border-strong text-ink-muted hover:bg-surface-sunken hover:text-ink"
      )}
    >
      {icon}
      {children}
    </button>
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
  const [helper, setHelper] = useState<Helper>(null);
  // Filled in by a helper and not edited since: highlighted until checked.
  const [filled, setFilled] = useState<Set<TextField>>(new Set());
  const [guessed, setGuessed] = useState<Set<TextField>>(new Set());
  const baseId = useId();
  const shown = { ...serverErrors, ...errors };

  function fill(values: PastedEmployer, guesses: PasteField[] = []) {
    const entries = Object.entries(values).filter(([, v]) => v?.trim()) as [TextField, string][];
    setText((current) => ({ ...current, ...Object.fromEntries(entries) }));
    setFilled(new Set(entries.map(([field]) => field)));
    setGuessed(new Set(guesses));
    setHelper(null);
  }

  function edited(name: TextField) {
    if (!filled.has(name)) return;
    setFilled((current) => new Set([...current].filter((f) => f !== name)));
    setGuessed((current) => new Set([...current].filter((f) => f !== name)));
  }

  function field(
    name: TextField,
    label: string,
    props: { type?: string; inputMode?: "email" | "tel" } = {}
  ) {
    const id = `${baseId}-${name}`;
    const error = shown[name];
    const guess = guessed.has(name) && !error;
    // Hint and error sit outside the label so they don't become the field's name.
    const describedBy = error ? `${id}-error` : guess ? `${id}-hint` : undefined;
    return (
      <div className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          name={name}
          type={props.type ?? "text"}
          inputMode={props.inputMode}
          value={text[name]}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => {
            setText((current) => ({ ...current, [name]: e.target.value }));
            edited(name);
          }}
          className={cn(FIELD, filled.has(name) && "border-accent bg-accent-soft/40")}
        />
        {guess ? (
          <span id={`${id}-hint`} className="text-[0.75rem] text-ink-muted">
            Guessed from the text: check it
          </span>
        ) : null}
        {error ? (
          <span id={`${id}-error`} className="text-[0.8125rem] text-destructive">
            {error}
          </span>
        ) : null}
      </div>
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
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <HelperTab
            active={helper === "abn"}
            icon={<Search className="size-4" aria-hidden="true" />}
            onClick={() => setHelper((h) => (h === "abn" ? null : "abn"))}
          >
            Look up ABN
          </HelperTab>
          <HelperTab
            active={helper === "paste"}
            icon={<ClipboardPaste className="size-4" aria-hidden="true" />}
            onClick={() => setHelper((h) => (h === "paste" ? null : "paste"))}
          >
            Paste details
          </HelperTab>
        </div>

        {helper === "abn" ? (
          <AbnLookup
            onUse={(values, legalName) => {
              fill(values);
              // Forms sometimes ask for the legal name: keep it in the notes.
              if (legalName !== values.name) {
                setText((current) =>
                  current.notes.includes(legalName)
                    ? current
                    : {
                        ...current,
                        notes: [current.notes.trim(), `Legal name: ${legalName}`]
                          .filter(Boolean)
                          .join("\n"),
                      }
                );
              }
            }}
          />
        ) : null}
        {helper === "paste" ? <PasteDetails current={text} onFill={fill} /> : null}

        {filled.size > 0 && !helper ? (
          <p className="rounded-xl bg-accent-soft/40 px-3 py-2 text-[0.8125rem] text-ink">
            The highlighted fields were filled in for you. Check them before saving.
          </p>
        ) : null}
      </div>

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
        <div className="grid grid-cols-2 gap-2">
          {field("region", "State or region")}
          {field("country", "Country")}
        </div>
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
