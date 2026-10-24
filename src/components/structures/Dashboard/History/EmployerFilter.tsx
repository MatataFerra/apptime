"use client";

import { useState } from "react";

import { Building, Check, ChevronDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import type { EmployerFilter as Filter } from "@/services/History";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

import { cn } from "@/utils/helpers/styleMerger";
import useEmployers from "@/hooks/useEmployers";

/** With more employers than this, the list gets a search box. */
const SEARCH_FROM = 7;

function Option({
  selected,
  label,
  count,
  muted = false,
  onSelect,
}: {
  selected: boolean;
  label: string;
  count?: number;
  muted?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm transition-colors hover:bg-surface-sunken focus-visible:bg-surface-sunken focus-visible:outline-hidden",
        selected ? "font-semibold text-ink" : muted ? "text-ink-muted" : "text-ink"
      )}
    >
      <Check
        className={cn("size-4 shrink-0 text-accent", selected ? "opacity-100" : "opacity-0")}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined ? (
        <span className="shrink-0 text-xs text-ink-muted tabular-nums">{count}</span>
      ) : null}
    </button>
  );
}

/**
 * "Berry Farm ▾": the history's employer filter, a chip next to the shift
 * types. Opens a list of the employers that have shifts (archived ones too,
 * they still own old shifts) with how many each has, and "No employer"
 * when some shifts have none.
 */
function EmployerFilter({
  value,
  onChange,
  counts,
}: {
  value: Filter;
  onChange: (value: Filter) => void;
  /** Shifts per employer id, "none" for the ones without an employer. */
  counts: Map<number | "none", number>;
}) {
  const t = useTranslations("dashboard.history");
  const { byId } = useEmployers();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // The selected employer stays listed even when the type filter hides its shifts.
  const options = [...byId.values()]
    .filter((employer) => (counts.get(employer.id) ?? 0) > 0 || employer.id === value)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (options.length === 0) return null;

  const active = value !== "all";
  const selected = typeof value === "number" ? byId.get(value) : undefined;
  const label =
    selected?.name ?? (value === "none" ? t("employer_none") : t("employer_filter_label"));
  const searchable = options.length >= SEARCH_FROM;
  const needle = query.trim().toLocaleLowerCase();
  const shown = needle
    ? options.filter((employer) => employer.name.toLocaleLowerCase().includes(needle))
    : options;
  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
  const unassigned = counts.get("none") ?? 0;

  function pick(next: Filter) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid="history-employer-filter"
          aria-label={active ? `${t("employer_filter_label")}: ${label}` : undefined}
          className={cn(
            "flex h-9 max-w-full min-w-0 items-center gap-1.5 rounded-full border pr-2.5 pl-3 text-sm font-medium transition-colors",
            active
              ? "border-transparent bg-primary text-primary-foreground"
              : "border-border-strong bg-surface text-ink hover:bg-surface-sunken"
          )}
        >
          <Building
            className={cn("size-4 shrink-0", active ? "opacity-80" : "text-ink-muted")}
            aria-hidden="true"
          />
          <span className="max-w-40 truncate">{label}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform",
              open && "rotate-180",
              active ? "opacity-80" : "text-ink-muted"
            )}
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        className="w-[min(18rem,calc(100vw-2rem))] p-1.5"
      >
        {searchable ? (
          <label className="mb-1 flex h-10 items-center gap-2 rounded-lg bg-surface-sunken px-2.5">
            <Search className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("employer_search")}
              aria-label={t("employer_search")}
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-hidden placeholder:text-ink-subtle"
            />
          </label>
        ) : null}
        <div
          role="listbox"
          aria-label={t("employer_filter_label")}
          className="flex max-h-72 flex-col overflow-y-auto"
        >
          {needle ? null : (
            <Option
              selected={value === "all"}
              label={t("employer_all")}
              count={total}
              onSelect={() => pick("all")}
            />
          )}
          {shown.map((employer) => (
            <Option
              key={employer.id}
              selected={value === employer.id}
              label={
                employer.archived ? `${employer.name} ${t("employer_archived")}` : employer.name
              }
              count={counts.get(employer.id) ?? 0}
              onSelect={() => pick(employer.id)}
            />
          ))}
          {needle && shown.length === 0 ? (
            <p className="px-2.5 py-3 text-sm text-ink-muted">{t("employer_no_match")}</p>
          ) : null}
          {!needle && (unassigned > 0 || value === "none") ? (
            <>
              <div className="mx-2.5 my-1 border-t border-border" role="separator" />
              <Option
                selected={value === "none"}
                label={t("employer_none")}
                count={unassigned}
                muted
                onSelect={() => pick("none")}
              />
            </>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default EmployerFilter;
