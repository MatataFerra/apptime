"use client";

import { useId, useState } from "react";

import { AlertTriangle, Search } from "lucide-react";

import type { PastedEmployer } from "@/services/Employer/paste";
import { REGISTRIES, REGISTRY_ORDER } from "@/services/Registry/registries";
import type { BusinessDetails, BusinessMatch, RegistryId } from "@/services/Registry/types";

import Button from "@/components/ui/Button";

import { cn } from "@/utils/helpers/styleMerger";

import { onLookupBusiness } from "@/server-actions/business-lookup";

export type UseBusiness = (fields: PastedEmployer, legalName: string | null) => void;

/** ISO dates inside a line -> "1 Jul 2000". */
function readableDates(value: string) {
  return value.replace(/\b(\d{4}-\d{2}-\d{2})\b/g, (iso) => {
    const date = new Date(`${iso}T12:00:00`);
    return isNaN(date.valueOf())
      ? iso
      : date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  });
}

function Details({ details, onUse }: { details: BusinessDetails; onUse: UseBusiness }) {
  const info = REGISTRIES[details.registry];
  const [name, setName] = useState<string | null>(details.names[0] ?? null);
  const groupId = useId();
  const f = details.fields;

  const rows: [string, string | null | undefined][] = [
    [info.idLabel, details.id],
    ["Legal name", details.legalName],
    ...details.facts.map((fact) => [fact.label, fact.value] as [string, string]),
    [
      "Address",
      [f.address, [f.city, f.region, f.postcode].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", "),
    ],
    ["Industry", f.industry],
    ["Email", f.contactEmail],
    ["Phone", f.contactPhone],
  ];

  return (
    <div className="flex flex-col gap-3">
      {details.active === false ? (
        <p className="flex items-start gap-2 rounded-xl bg-destructive-soft px-3 py-2.5 text-[0.8125rem] text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            This {info.idLabel} is {details.status?.toLowerCase() ?? "not active"}
            {details.statusSince ? ` since ${readableDates(details.statusSince)}` : ""}. Check with
            the employer before using it on a visa or tax form.
          </span>
        </p>
      ) : null}

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[0.8125rem]">
        {rows
          .filter((row): row is [string, string] => !!row[1])
          .map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="min-w-0 break-words text-ink">{readableDates(value)}</dd>
            </div>
          ))}
      </dl>

      {details.names.length > 1 ? (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1 text-[0.8125rem] text-ink-muted">
            Which name do you know it by?
          </legend>
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

      <Button
        type="button"
        size="md"
        classes="w-full"
        onClick={() => onUse({ ...details.fields, ...(name && { name }) }, details.legalName)}
      >
        Use these details
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
  const [details, setDetails] = useState<BusinessDetails | null>(null);
  const inputId = useId();
  const info = REGISTRIES[registry];

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

    if (!result) return setError("The register didn't answer, try again later");
    if (!result.ok) return setError(result.error);
    if (result.kind === "details") {
      setMatches(null);
      return setDetails(result.details);
    }
    if (result.matches.length === 0) setError("No businesses with that name");
    setMatches(result.matches);
  }

  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label="Register" className="flex flex-wrap gap-1.5">
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
            {REGISTRIES[id].label}
          </button>
        ))}
      </div>

      <label htmlFor={inputId} className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
        {info.inputLabel}
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
            aria-label="Search the register"
            onClick={() => run(query)}
          >
            <Search className="size-4" aria-hidden="true" />
          </Button>
        </span>
      </label>

      {busy ? <p className="text-[0.8125rem] text-ink-muted">Looking it up…</p> : null}
      {error ? <p className="text-[0.8125rem] text-destructive">{error}</p> : null}

      {details ? (
        <Details key={details.id} details={details} onUse={onUse} />
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
                  {info.idLabel} {match.id}
                  {match.detail ? ` · ${match.detail}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-[0.75rem] text-ink-subtle">{info.source}</p>
    </div>
  );
}

export default BusinessLookup;
