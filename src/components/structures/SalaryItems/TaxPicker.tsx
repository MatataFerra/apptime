"use client";

import { useMemo, useState } from "react";

import { Check, Plus, Receipt, Search, X } from "lucide-react";

import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";

import { MODULE_THEMES, type ModuleTheme } from "@/utils/constants/modules";
import { cn } from "@/utils/helpers/styleMerger";
import useSalaryItems from "@/hooks/useSalaryItems";

import type { ContributionOrTax } from "@/store/useTaxOrContributionStore";

type Props = {
  /** taxesModule from one of the useXTaxesOrContributionsStore stores */
  store: {
    salaryElement: ContributionOrTax[];
    add: (element: ContributionOrTax) => void;
    remove: (name: string) => void;
  };
  /** Colour family of the module the picker lives in. */
  theme?: ModuleTheme;
  /** Render without the card chrome (e.g. inside a dialog). */
  bare?: boolean;
};

const SEARCH_FROM = 8;

/** Combined deduction when taxes are applied one after another, as Pay.afterTax does. */
export function effectiveRate(taxes: Pick<ContributionOrTax, "value">[]) {
  const kept = taxes.reduce((acc, t) => acc * (1 - (Number(t.value) || 0) / 100), 1);
  return Math.round((1 - kept) * 1000) / 10;
}

function sameName(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Pick the taxes for a shift in one place: tap a saved tax to add or
 * remove it, or write a new one inline. New taxes are saved with the
 * shift and show up as saved next time.
 */
function TaxPicker({ store: { salaryElement, add, remove }, theme = "neutral", bare }: Props) {
  const { data, isLoading } = useSalaryItems();
  const saved = useMemo(() => data?.salaryItems?.taxes ?? [], [data?.salaryItems?.taxes]);
  const colors = MODULE_THEMES[theme];

  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", value: "", description: "" });
  const [errors, setErrors] = useState<{ name?: string; value?: string }>({});

  function isSelected(name: string) {
    return salaryElement.some((t) => sameName(t.name, name));
  }

  const unsavedSelected = salaryElement.filter((t) => !saved.some((s) => sameName(s.name, t.name)));
  const visibleSaved = search
    ? saved.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : saved;
  const rate = effectiveRate(salaryElement);

  function toggleSaved(tax: (typeof saved)[number]) {
    if (isSelected(tax.name)) {
      remove(tax.name);
      return;
    }
    const { id: _id, ...rest } = tax;
    add({ ...rest, fromDb: true });
  }

  function resetDraft() {
    setDraft({ name: "", value: "", description: "" });
    setErrors({});
  }

  function onAddNew() {
    const name = draft.name.trim();
    const value = Number(draft.value);
    const nextErrors: typeof errors = {};

    if (!name) nextErrors.name = "Give it a name";
    if (!draft.value || isNaN(value) || value <= 0 || value > 100) {
      nextErrors.value = "Between 0 and 100";
    }
    if (name && isSelected(name)) nextErrors.name = "Already added";

    if (nextErrors.name || nextErrors.value) {
      setErrors(nextErrors);
      return;
    }

    // Same name as a saved tax: use the saved one instead of creating a duplicate.
    const existing = saved.find((s) => sameName(s.name, name));
    if (existing) {
      toggleSaved(existing);
      Toast({
        type: "plain",
        message: `Using your saved "${existing.name}"`,
        description: `${existing.value}% from your previous shifts.`,
        duration: 2000,
      });
    } else {
      add({ name, value, description: draft.description.trim() || null });
    }

    resetDraft();
    setCreating(false);
  }

  return (
    <section
      aria-labelledby="tax-picker-title"
      className={cn(
        "flex w-full flex-col gap-4",
        !bare && "rounded-[20px] border border-border bg-surface p-4"
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
              colors.soft,
              colors.ink
            )}
          >
            <Receipt className="size-4.5" strokeWidth={2} aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <h2 id="tax-picker-title" className="text-[0.9375rem] font-semibold text-ink">
              Taxes
            </h2>
            <p className="text-[0.8125rem] text-ink-muted">
              Optional. Taken off this shift&apos;s pay.
            </p>
          </div>
        </div>
        {salaryElement.length > 0 ? (
          <span
            className="shrink-0 rounded-full bg-destructive-soft px-2.5 py-1 figure text-sm text-destructive"
            aria-label={`${rate}% taken off in total`}
          >
            −{rate}%
          </span>
        ) : null}
      </header>

      {isLoading ? (
        <div className="flex gap-2">
          <Skeleton classes="h-10 w-28 rounded-full" />
          <Skeleton classes="h-10 w-24 rounded-full" />
        </div>
      ) : saved.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[0.8125rem] font-medium text-ink-muted">Your taxes</h3>
            <span className="text-xs text-ink-subtle">Tap to add or remove</span>
          </div>
          {saved.length >= SEARCH_FROM ? (
            <label className="flex h-10 items-center gap-2 rounded-xl border border-border-strong bg-surface px-3 text-sm">
              <Search className="size-4 text-ink-subtle" aria-hidden="true" />
              <span className="sr-only">Search your taxes</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your taxes"
                className="h-full w-full bg-transparent outline-hidden placeholder:text-ink-subtle"
              />
            </label>
          ) : null}
          <ul className="flex flex-wrap gap-2">
            {visibleSaved.map((tax) => {
              const on = isSelected(tax.name);
              return (
                <li key={tax.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleSaved(tax)}
                    title={tax.description ?? undefined}
                    className={cn(
                      "flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
                      on
                        ? cn("border-transparent", colors.strong, "text-white")
                        : "border-border-strong bg-surface text-ink hover:bg-surface-sunken"
                    )}
                  >
                    {on ? <Check className="size-4" strokeWidth={2.5} aria-hidden="true" /> : null}
                    {tax.name}
                    <span className={cn("tabular-nums", on ? "text-white/80" : "text-ink-muted")}>
                      {tax.value}%
                    </span>
                  </button>
                </li>
              );
            })}
            {visibleSaved.length === 0 ? (
              <li className="text-sm text-ink-muted">No saved tax matches “{search}”.</li>
            ) : null}
          </ul>
        </div>
      ) : null}

      {unsavedSelected.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[0.8125rem] font-medium text-ink-muted">New for this shift</h3>
          <ul className="flex flex-wrap gap-2">
            {unsavedSelected.map((tax) => (
              <li
                key={tax.name}
                className={cn(
                  "flex h-10 items-center gap-1.5 rounded-full pr-1 pl-3.5 text-sm font-medium",
                  colors.soft,
                  colors.ink
                )}
              >
                {tax.name}
                <span className="tabular-nums opacity-80">{tax.value}%</span>
                <button
                  type="button"
                  onClick={() => remove(tax.name)}
                  aria-label={`Remove ${tax.name}`}
                  className="flex size-8 items-center justify-center rounded-full hover:bg-black/5"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {creating ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-surface-sunken p-3">
          <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2.5">
            <Input
              name="new-tax-name"
              label="Name"
              placeholder="Income tax"
              value={draft.name}
              autoFocus
              isError={!!errors.name}
              description={errors.name}
              onChange={(e) => {
                setDraft((d) => ({ ...d, name: e.target.value }));
                setErrors((er) => ({ ...er, name: undefined }));
              }}
            />
            <Input
              name="new-tax-value"
              label="Rate"
              type="number"
              inputMode="decimal"
              placeholder="10.5"
              measure="%"
              min={0}
              max={100}
              step="0.1"
              value={draft.value}
              isError={!!errors.value}
              description={errors.value}
              onChange={(e) => {
                setDraft((d) => ({ ...d, value: e.target.value }));
                setErrors((er) => ({ ...er, value: undefined }));
              }}
            />
          </div>
          <Input
            name="new-tax-description"
            label="Note (optional)"
            placeholder="As shown on your payslip"
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="md"
              classes="w-full"
              onClick={() => {
                resetDraft();
                setCreating(false);
              }}
            >
              Cancel
            </Button>
            <Button type="button" variant="primary" size="md" classes="w-full" onClick={onAddNew}>
              Add tax
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {saved.length === 0 && salaryElement.length === 0 && !isLoading ? (
            <p className="text-sm text-ink-muted">
              No taxes yet. Add the ones on your payslip, like income tax; next time they&apos;re
              one tap away.
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="md"
            classes="w-full border-dashed"
            onClick={() => setCreating(true)}
          >
            <Plus className="size-4" aria-hidden="true" />
            New tax
          </Button>
        </div>
      )}
    </section>
  );
}

export default TaxPicker;
