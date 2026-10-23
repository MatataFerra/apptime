"use client";

import { useId, useState } from "react";

import { AlertTriangle, Search } from "lucide-react";

import { type AbnDetails, type AbnMatch, tidyName } from "@/services/Abr/parse";
import type { PastedEmployer } from "@/services/Employer/paste";

import Button from "@/components/ui/Button";

import { cn } from "@/utils/helpers/styleMerger";

import { onLookupAbn } from "@/server-actions/abn-lookup";

/** "2000-07-01" -> "1 Jul 2000"; anything else as it came. */
function day(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return isNaN(date.valueOf())
    ? value
    : date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

/** What the register knows, as form fields, plus the legal name for the notes. */
function toFields(details: AbnDetails, name: string): PastedEmployer {
  return {
    name,
    taxId: details.abn,
    region: details.state ?? undefined,
    postcode: details.postcode ?? undefined,
    country: "Australia",
  };
}

function Details({
  details,
  onUse,
}: {
  details: AbnDetails;
  onUse: (fields: PastedEmployer, legalName: string) => void;
}) {
  const names = [...new Set([...details.businessNames, details.entityName].map(tidyName))];
  const [name, setName] = useState(names[0]);
  const legalName = tidyName(details.entityName);
  const active = details.status?.toLowerCase() === "active";
  const groupId = useId();

  const rows: [string, string | null][] = [
    ["ABN", details.abn],
    ["Legal name", legalName],
    ["Type", details.entityType],
    ["Location", [details.state, details.postcode].filter(Boolean).join(" ") || null],
    ["GST", details.gstSince ? `Registered since ${day(details.gstSince)}` : "Not registered"],
  ];

  return (
    <div className="flex flex-col gap-3">
      {!active ? (
        <p className="flex items-start gap-2 rounded-xl bg-destructive-soft px-3 py-2.5 text-[0.8125rem] text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            This ABN is {details.status?.toLowerCase() ?? "not active"}
            {details.statusSince ? ` since ${day(details.statusSince)}` : ""}. Check with the
            employer before using it on a visa or tax form.
          </span>
        </p>
      ) : null}

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[0.8125rem]">
        {rows
          .filter((row): row is [string, string] => !!row[1])
          .map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="min-w-0 break-words text-ink">{value}</dd>
            </div>
          ))}
      </dl>

      {names.length > 1 ? (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1 text-[0.8125rem] text-ink-muted">
            Which name do you know it by?
          </legend>
          {names.map((option) => (
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

      <p className="text-[0.8125rem] text-ink-subtle">
        The register has no street address: add it yourself.
      </p>

      <Button
        type="button"
        size="md"
        classes="w-full"
        onClick={() => onUse(toFields(details, name), legalName)}
      >
        Use these details
      </Button>
    </div>
  );
}

/**
 * Finds a business on the Australian Business Register by ABN or name and
 * hands its details to the form.
 */
function AbnLookup({ onUse }: { onUse: (fields: PastedEmployer, legalName: string) => void }) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<AbnMatch[] | null>(null);
  const [details, setDetails] = useState<AbnDetails | null>(null);
  const inputId = useId();

  async function run(value: string) {
    setBusy(true);
    setError(null);
    setDetails(null);
    const result = await onLookupAbn(value).catch(() => null);
    setBusy(false);

    if (!result) return setError("The ABN Lookup didn't answer, try again later");
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
      <label htmlFor={inputId} className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
        ABN or business name
        <span className="flex gap-2">
          <input
            id={inputId}
            value={query}
            enterKeyHint="search"
            autoComplete="off"
            placeholder="51 824 753 556 or Sunny Farms"
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
        <Details details={details} onUse={onUse} />
      ) : matches && matches.length > 0 ? (
        <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {matches.map((match) => (
            <li key={match.abn}>
              <button
                type="button"
                disabled={busy}
                onClick={() => run(match.abn)}
                className={cn(
                  "flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-surface-sunken"
                )}
              >
                <span className="text-[0.875rem] text-ink">{tidyName(match.name)}</span>
                <span className="text-[0.75rem] text-ink-muted tabular-nums">
                  ABN {match.abn}
                  {match.state ? ` · ${match.state} ${match.postcode ?? ""}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-[0.75rem] text-ink-subtle">
        From ABN Lookup, Australian Business Register.
      </p>
    </div>
  );
}

export default AbnLookup;
