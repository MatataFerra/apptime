"use client";

import { useId, useState } from "react";

import { AlertTriangle, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { currencyForCountry } from "@/services/Employer/currency";
import type { PastedEmployer } from "@/services/Employer/paste";
import { attribution, REGISTRIES, REGISTRY_ORDER } from "@/services/Registry/registries";
import type { BusinessDetails, BusinessMatch, RegistryId } from "@/services/Registry/types";

import Button from "@/components/ui/Button";

import { cn } from "@/utils/helpers/styleMerger";
import useErrorMessage from "@/hooks/useErrorMessage";

import { onLookupBusiness } from "@/server-actions/business-lookup";

/** Where the details came from and when, saved with the employer. */
export type BusinessSource = { registry: RegistryId; at: string };

export type UseBusiness = (
  fields: PastedEmployer,
  legalName: string | null,
  source: BusinessSource
) => void;

/** ISO dates inside a line -> "1 Jul 2000". */
function readableDates(value: string, locale: string) {
  return value.replace(/\b(\d{4}-\d{2}-\d{2})\b/g, (iso) => {
    const date = new Date(`${iso}T12:00:00`);
    return isNaN(date.valueOf())
      ? iso
      : date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  });
}

function Details({
  details,
  searchedAt,
  onUse,
}: {
  details: BusinessDetails;
  searchedAt: string;
  onUse: UseBusiness;
}) {
  const info = REGISTRIES[details.registry];
  const t = useTranslations("employers.lookup");
  const tf = useTranslations("employers.fields");
  const locale = useLocale();
  const idLabel = t(`registries.${details.registry}.id_label`);
  const [name, setName] = useState<string | null>(details.names[0] ?? null);
  const groupId = useId();
  const f = details.fields;

  const rows: [string, string | null | undefined][] = [
    [idLabel, details.id],
    [t("legal_name"), details.legalName],
    ...details.facts.map((fact) => [fact.label, fact.value] as [string, string]),
    [
      tf("address"),
      [f.address, [f.city, f.region, f.postcode].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", "),
    ],
    [tf("industry"), f.industry],
    [tf("contactEmail"), f.contactEmail],
    [tf("contactPhone"), f.contactPhone],
    [t("pays_in"), currencyForCountry(f.country)],
  ];

  return (
    <div className="flex flex-col gap-3">
      {details.active === false ? (
        <p className="flex items-start gap-2 rounded-xl bg-destructive-soft px-3 py-2.5 text-[0.8125rem] text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            {details.statusSince
              ? t("inactive_since", {
                  id: idLabel,
                  status: details.status?.toLowerCase() ?? t("not_active"),
                  since: readableDates(details.statusSince, locale),
                })
              : t("inactive", {
                  id: idLabel,
                  status: details.status?.toLowerCase() ?? t("not_active"),
                })}
          </span>
        </p>
      ) : null}

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[0.8125rem]">
        {rows
          .filter((row): row is [string, string] => !!row[1])
          .map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="min-w-0 break-words text-ink">{readableDates(value, locale)}</dd>
            </div>
          ))}
      </dl>

      {details.names.length > 1 ? (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1 text-[0.8125rem] text-ink-muted">{t("which_name")}</legend>
          {details.names.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 rounded-lg px-1 py-1 text-[0.875rem] text-ink"
            >
              <input
                type="radio"
                name={groupId}
                checked={name === option}
                onChange={() => setName(option)}
                className="accent-accent"
              />
              {option}
            </label>
          ))}
        </fieldset>
      ) : null}

      {details.note ? <p className="text-[0.8125rem] text-ink-subtle">{details.note}</p> : null}

      <p className="text-[0.75rem] text-ink-muted">{attribution(details.registry, searchedAt)}</p>

      <Button
        type="button"
        size="md"
        classes="w-full"
        onClick={() =>
          onUse({ ...details.fields, ...(name && { name }) }, details.legalName, {
            registry: details.registry,
            at: searchedAt,
          })
        }
      >
        {t("use")}
      </Button>
    </div>
  );
}

/**
 * Finds a business in a public register (Australia's ABR, New Zealand's
 * NZBN, the EU's VIES) and hands its details to the form.
 */
function BusinessLookup({ initial, onUse }: { initial: RegistryId; onUse: UseBusiness }) {
  const [registry, setRegistry] = useState<RegistryId>(initial);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<BusinessMatch[] | null>(null);
  const [details, setDetails] = useState<{ data: BusinessDetails; searchedAt: string } | null>(
    null
  );
  const inputId = useId();
  const info = REGISTRIES[registry];
  const t = useTranslations("employers.lookup");
  const errorMessage = useErrorMessage();

  function pick(next: RegistryId) {
    setRegistry(next);
    setError(null);
    setMatches(null);
    setDetails(null);
  }

  async function run(value: string) {
    setBusy(true);
    setError(null);
    setDetails(null);
    const result = await onLookupBusiness(registry, value).catch(() => null);
    setBusy(false);

    if (!result) return setError(errorMessage("lookup_failed"));
    if (!result.ok) {
      return setError(errorMessage(result.error, { register: t(`registries.${registry}.label`) }));
    }
    if (result.kind === "details") {
      setMatches(null);
      return setDetails({ data: result.details, searchedAt: result.searchedAt });
    }
    if (result.matches.length === 0) setError(t("no_matches"));
    setMatches(result.matches);
  }

  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label={t("register")} className="flex flex-wrap gap-1.5">
        {REGISTRY_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={registry === id}
            onClick={() => pick(id)}
            className={cn(
              "h-8 rounded-full border px-3 text-[0.8125rem] font-semibold transition-colors",
              registry === id
                ? "border-ink bg-ink text-surface"
                : "border-border-strong text-ink-muted hover:text-ink"
            )}
          >
            {t(`registries.${id}.label`)}
          </button>
        ))}
      </div>

      <label htmlFor={inputId} className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
        {t(`registries.${registry}.input_label`)}
        <span className="flex gap-2">
          <input
            id={inputId}
            value={query}
            enterKeyHint="search"
            autoComplete="off"
            autoCapitalize={registry === "vies" ? "characters" : undefined}
            placeholder={info.placeholder}
            onChange={(e) => setQuery(e.target.value)}
            // Inside the employer form: Enter searches instead of saving.
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              if (query.trim() && !busy) run(query);
            }}
            className="h-11 w-full min-w-0 rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem] text-ink outline-hidden placeholder:text-ink-subtle focus:border-accent"
          />
          <Button
            type="button"
            size="md"
            variant="white"
            classes="h-11 shrink-0"
            disabled={busy || !query.trim()}
            aria-label={t("search")}
            onClick={() => run(query)}
          >
            <Search className="size-4" aria-hidden="true" />
          </Button>
        </span>
      </label>

      {busy ? <p className="text-[0.8125rem] text-ink-muted">{t("searching")}</p> : null}
      {error ? <p className="text-[0.8125rem] text-destructive">{error}</p> : null}

      {details ? (
        <Details
          key={details.data.id}
          details={details.data}
          searchedAt={details.searchedAt}
          onUse={onUse}
        />
      ) : matches && matches.length > 0 ? (
        <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {matches.map((match) => (
            <li key={match.id}>
              <button
                type="button"
                disabled={busy}
                onClick={() => run(match.id)}
                className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-surface-sunken"
              >
                <span className="text-[0.875rem] text-ink">{match.name}</span>
                <span className="text-[0.75rem] text-ink-muted tabular-nums">
                  {t(`registries.${registry}.id_label`)} {match.id}
                  {match.detail ? ` · ${match.detail}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!details ? (
        <p className="text-[0.75rem] text-ink-subtle">
          {t("searches", { register: info.registerName })}
        </p>
      ) : null}
    </div>
  );
}

export default BusinessLookup;
