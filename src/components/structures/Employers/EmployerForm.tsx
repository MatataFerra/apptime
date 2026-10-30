"use client";

import { type ReactNode, useId, useState } from "react";

import { ClipboardPaste, Database, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { canonicalCountry, countryForCurrency, suggestCountry } from "@/services/Employer/country";
import { currencyForCountry } from "@/services/Employer/currency";
import type { PastedEmployer, PasteField } from "@/services/Employer/paste";
import { type EmployerInput, EmployerInputSchema, fieldErrors } from "@/services/Employer/schema";
import { attribution, defaultRegistry, isRegistryId } from "@/services/Registry/registries";
import { VISA_WORK_TYPES, visaCountryOf } from "@/services/VisaReport";

import type { SavedEmployer } from "@/types";

import AuPostcodeHint from "@/components/structures/Employers/AuPostcodeHint";
import BusinessLookup, {
  type BusinessSource,
} from "@/components/structures/Employers/BusinessLookup";
import PasteDetails from "@/components/structures/Employers/PasteDetails";
import VisaWorkFields from "@/components/structures/Employers/VisaWorkFields";
import CountrySelect from "@/components/structures/share/CountrySelect";
import Button from "@/components/ui/Button";
import { ChoicePopover } from "@/components/ui/Choice";

import { CURRENCIES, currencySymbol } from "@/utils/constants/currencies";
import getCountryData from "@/utils/helpers/getCountryData";
import { cn } from "@/utils/helpers/styleMerger";
import useCurrencyName from "@/hooks/useCurrencyName";
import useErrorMessage from "@/hooks/useErrorMessage";
import { useCurrency } from "@/hooks/useMoney";
import useRegionName from "@/hooks/useRegionName";
import useZodI18n from "@/hooks/useZodI18n";

type Errors = Partial<Record<keyof EmployerInput, string>>;

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
  "workPostcode",
  "contactName",
  "contactEmail",
  "contactPhone",
  "notes",
] as const;

type TextField = (typeof TEXT_FIELDS)[number];

function initialText(employer?: SavedEmployer) {
  const text = Object.fromEntries(
    TEXT_FIELDS.map((field) => [field, employer?.[field] ?? ""])
  ) as Record<TextField, string>;
  // Saved before the picker as "NZ" or "Nueva Zelanda": shown as the picker's name.
  return { ...text, country: canonicalCountry(text.country) ?? text.country };
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-[0.8125rem] font-semibold text-ink-muted">{title}</legend>
      {children}
    </fieldset>
  );
}

type Helper = "lookup" | "paste" | null;

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
  onSave: (data: EmployerInput) => void;
}) {
  useZodI18n();
  const settingsCurrency = useCurrency();
  const currencyName = useCurrencyName();
  const t = useTranslations("employers.form");
  const tf = useTranslations("employers.fields");
  const errorMessage = useErrorMessage();
  const regionName = useRegionName();
  const [text, setText] = useState(() => initialText(employer));
  const [rate, setRate] = useState(
    employer?.defaultRate != null ? String(employer.defaultRate) : ""
  );
  const [currency, setCurrency] = useState(employer?.defaultCurrency ?? "");
  const [workType, setWorkType] = useState(employer?.visaWorkType ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [helper, setHelper] = useState<Helper>(null);
  // Filled in by a helper and not edited since: highlighted until checked.
  const [filled, setFilled] = useState<Set<TextField>>(new Set());
  const [guessed, setGuessed] = useState<Set<TextField>>(new Set());
  const [currencyFilled, setCurrencyFilled] = useState(false);
  // A lookup made in this form; until then, the one saved with the employer.
  const [source, setSource] = useState<BusinessSource | null>(null);
  const shownSource =
    source ??
    (employer?.sourceRegistry && employer.sourcedAt && isRegistryId(employer.sourceRegistry)
      ? { registry: employer.sourceRegistry, at: employer.sourcedAt }
      : null);
  const baseId = useId();
  const shown = { ...serverErrors, ...errors };

  function fill(values: PastedEmployer, guesses: PasteField[] = []) {
    // "Deutschland" -> "Germany"; a misspelling stays, with a suggestion under the field.
    const country = values.country && (canonicalCountry(values.country) ?? values.country.trim());
    const entries = Object.entries({ ...values, country }).filter(([, v]) => v?.trim()) as [
      TextField,
      string,
    ][];
    setText((current) => ({ ...current, ...Object.fromEntries(entries) }));
    setFilled(new Set(entries.map(([field]) => field)));
    setGuessed(new Set(guesses));
    // An employer in New Zealand pays in NZD, one in Germany in EUR…
    const paidIn = currencyForCountry(country);
    if (paidIn) setCurrency(paidIn);
    setCurrencyFilled(!!paidIn);
    setHelper(null);
  }

  function edited(name: TextField) {
    if (!filled.has(name)) return;
    setFilled((current) => new Set([...current].filter((f) => f !== name)));
    setGuessed((current) => new Set([...current].filter((f) => f !== name)));
  }

  /** The country picked (or ""), and the currency it pays in unless one was chosen. */
  function pickCountry(country: string) {
    setText((current) => ({ ...current, country }));
    edited("country");
    const paidIn = currencyForCountry(country);
    if (paidIn && (currency === "" || currencyFilled)) {
      setCurrency(paidIn);
      setCurrencyFilled(true);
    }
  }

  /** The currency picked; AUD or NZD also say the country, when it's empty. */
  function pickCurrency(code: string) {
    setCurrency(code);
    setCurrencyFilled(false);
    const country = countryForCurrency(code);
    if (country && !text.country.trim()) {
      setText((current) => ({ ...current, country }));
      setFilled((current) => new Set([...current, "country"]));
    }
  }

  function countryField() {
    const id = `${baseId}-country`;
    const value = text.country.trim();
    const error = shown.country ? errorMessage(shown.country) : undefined;
    // Not on the list: typed before the picker, or pasted with a typo.
    const unknown = value !== "" && !canonicalCountry(value);
    const suggestion = unknown ? suggestCountry(value) : null;
    const suggested = suggestion
      ? `${getCountryData(suggestion).flag} ${regionName(getCountryData(suggestion).countryId, suggestion)}`
      : "";
    return (
      <div className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
        <label htmlFor={id}>{tf("country")}</label>
        <CountrySelect
          id={id}
          label={tf("country")}
          value={value}
          placeholder={t("country_placeholder")}
          searchPlaceholder={t("country_search")}
          clearLabel={t("country_none")}
          tone={filled.has("country") ? "filled" : undefined}
          testId="employer-country"
          onChange={pickCountry}
        />
        {unknown && !error ? (
          <span id={`${id}-hint`} className="flex flex-col items-start gap-1 text-[0.75rem]">
            <span className="text-destructive">
              {suggestion
                ? t("country_suggest", { value, country: suggested })
                : t("country_unknown", { value })}
            </span>
            {suggestion ? (
              <button
                type="button"
                onClick={() => pickCountry(suggestion)}
                className="font-semibold text-accent"
              >
                {t("country_use", { country: suggested })}
              </button>
            ) : null}
          </span>
        ) : guessed.has("country") && !error ? (
          <span className="text-[0.75rem] text-ink-muted">{t("guessed")}</span>
        ) : null}
        {error ? (
          <span id={`${id}-error`} className="text-[0.8125rem] text-destructive">
            {error}
          </span>
        ) : null}
      </div>
    );
  }

  function field(
    name: TextField,
    props: { type?: string; inputMode?: "email" | "tel" | "numeric" } = {}
  ) {
    const id = `${baseId}-${name}`;
    const label = tf(name);
    const error = shown[name] ? errorMessage(shown[name]) : undefined;
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
            {t("guessed")}
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
        // A kind of work only means something for the country it's listed under.
        const visaCountry = visaCountryOf(text.country);
        const types: readonly string[] =
          visaCountry === "AU" || visaCountry === "NZ" ? VISA_WORK_TYPES[visaCountry] : [];
        const input: EmployerInput = {
          ...text,
          visaWorkType: types.includes(workType) ? workType : null,
          workPostcode: visaCountry === "AU" ? text.workPostcode : null,
          defaultRate: rate.trim() === "" ? null : Number(rate),
          defaultCurrency: currency || null,
          // Only a new lookup is sent; the saved source stays as it is.
          ...(source && { source }),
        };
        const parsed = EmployerInputSchema.safeParse(input);
        if (!parsed.success) {
          setErrors(fieldErrors(parsed.error));
          return;
        }
        setErrors({});
        // The input, not the parsed output: the server checks it again.
        onSave(input);
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <HelperTab
            active={helper === "lookup"}
            icon={<Search className="size-4" aria-hidden="true" />}
            onClick={() => setHelper((h) => (h === "lookup" ? null : "lookup"))}
          >
            {t("lookup")}
          </HelperTab>
          <HelperTab
            active={helper === "paste"}
            icon={<ClipboardPaste className="size-4" aria-hidden="true" />}
            onClick={() => setHelper((h) => (h === "paste" ? null : "paste"))}
          >
            {t("paste")}
          </HelperTab>
        </div>

        {helper === "lookup" ? (
          <BusinessLookup
            // Starts on the register that fits the country typed, else the currency.
            initial={defaultRegistry(text.country, currency || settingsCurrency)}
            onUse={(values, legalName, from) => {
              fill(values);
              setSource(from);
              // Forms sometimes ask for the legal name: keep it in the notes.
              if (legalName && legalName !== values.name) {
                setText((current) =>
                  current.notes.includes(legalName)
                    ? current
                    : {
                        ...current,
                        notes: [current.notes.trim(), t("legal_name_note", { name: legalName })]
                          .filter(Boolean)
                          .join("\n"),
                      }
                );
              }
            }}
          />
        ) : null}
        {helper === "paste" ? <PasteDetails current={text} onFill={fill} /> : null}

        {shownSource ? (
          <p
            data-testid="employer-source"
            className="flex items-start gap-2 rounded-xl border border-border px-3 py-2 text-[0.75rem] text-ink-muted"
          >
            <Database className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {attribution(shownSource.registry, shownSource.at)}
          </p>
        ) : null}

        {(filled.size > 0 || currencyFilled) && !helper ? (
          <p className="rounded-xl bg-accent-soft/40 px-3 py-2 text-[0.8125rem] text-ink">
            {t("filled_hint")}
          </p>
        ) : null}
      </div>

      <Group title={t("groups.business")}>
        {field("name")}
        <div className="grid grid-cols-2 gap-2">
          {field("taxId")}
          {field("industry")}
        </div>
      </Group>

      <Group title={t("groups.where")}>
        {field("address")}
        <div className="grid grid-cols-[1fr_7rem] gap-2">
          {field("city")}
          {field("postcode")}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {field("region")}
          {countryField()}
        </div>
        {canonicalCountry(text.country) === "Australia" ? (
          <AuPostcodeHint
            postcode={text.postcode}
            region={text.region}
            onUseState={(state) => {
              setText((current) => ({ ...current, region: state }));
              edited("region");
            }}
          />
        ) : null}
      </Group>

      {visaCountryOf(text.country) === "AU" || visaCountryOf(text.country) === "NZ" ? (
        <Group title={t("groups.visa")}>
          <VisaWorkFields
            country={visaCountryOf(text.country) as "AU" | "NZ"}
            workType={workType}
            onWorkType={setWorkType}
            postcode={text.postcode}
            workPostcode={text.workPostcode}
            workPostcodeField={field("workPostcode", { inputMode: "numeric" })}
          />
        </Group>
      ) : null}

      <Group title={t("groups.contact")}>
        {field("contactName")}
        <div className="grid grid-cols-2 gap-2">
          {field("contactEmail", { type: "email", inputMode: "email" })}
          {field("contactPhone", { type: "tel", inputMode: "tel" })}
        </div>
      </Group>

      <Group title={t("groups.pay")}>
        <div className="grid grid-cols-[1fr_8rem] gap-2">
          <label htmlFor={rateId} className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
            {t("per_hour")}
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
              <span className="text-[0.8125rem] text-destructive">
                {errorMessage(shown.defaultRate)}
              </span>
            ) : null}
          </label>
          <div className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
            <label htmlFor={currencyId}>{t("currency")}</label>
            <ChoicePopover
              id={currencyId}
              variant="field"
              label={t("currency")}
              value={currency}
              tone={currencyFilled ? "filled" : undefined}
              display={(code) => code || t("settings_currency", { currency: settingsCurrency })}
              options={[
                ...CURRENCIES.map((c) => ({
                  value: c.code as string,
                  label: `${c.code} · ${currencyName(c.code)}`,
                })),
                {
                  value: "",
                  label: t("settings_currency", { currency: settingsCurrency }),
                  muted: true,
                  separated: true,
                },
              ]}
              onChange={pickCurrency}
            />
          </div>
        </div>
        <p className="text-[0.8125rem] text-ink-subtle">{t("pay_hint")}</p>
      </Group>

      <label htmlFor={notesId} className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
        {tf("notes")}
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
          {t("cancel")}
        </Button>
        <Button type="submit" size="md" classes="w-full" disabled={busy}>
          {busy ? t("saving") : employer ? t("save") : t("add")}
        </Button>
      </div>
    </form>
  );
}

export default EmployerForm;
