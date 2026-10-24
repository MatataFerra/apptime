"use client";

import { useId, useMemo, useState } from "react";

import { Check, HandCoins, Plus, Receipt, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { contributionRate } from "@/services/Contribution/math";
import { CONTRIBUTION_PRESETS } from "@/services/Contribution/presets";
import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";

import { MODULE_THEMES, type ModuleTheme } from "@/utils/constants/modules";
import { cn } from "@/utils/helpers/styleMerger";
import useSalaryItems from "@/hooks/useSalaryItems";

import { type ContributionOrTax, sameSalaryItem } from "@/store/useTaxOrContributionStore";

type Props = {
  /** taxesModule from one of the useXTaxesOrContributionsStore stores */
  store: {
    salaryElement: ContributionOrTax[];
    add: (element: ContributionOrTax) => void;
    remove: (element: Pick<ContributionOrTax, "name" | "value">) => void;
  };
  /** Colour family of the module the picker lives in. */
  theme?: ModuleTheme;
  /** Render without the card chrome (e.g. inside a dialog). */
  bare?: boolean;
  /**
   * "taxes" come off the pay, applied one after another; "contributions"
   * (holiday pay, casual loading…) are added on top and come with presets.
   */
  kind?: "taxes" | "contributions";
  /** Texts that say "this shift", for places that aren't one (e.g. Estimate). */
  copy?: { subtitle?: string; newTitle?: string; empty?: string };
};

const SEARCH_FROM = 8;

/** Combined deduction when taxes are applied one after another, as Pay.afterTax does. */
export function effectiveRate(taxes: Pick<ContributionOrTax, "value">[]) {
  const kept = taxes.reduce((acc, t) => acc * (1 - (Number(t.value) || 0) / 100), 1);
  return Math.round((1 - kept) * 1000) / 10;
}

/**
 * Pick the taxes (or contributions) for a shift in one place: tap a saved
 * one to add or remove it, or write a new one inline. New ones are saved
 * with the shift and show up as saved next time. Contributions also offer
 * the presets that come with the app (NZ holiday pay 8%…).
 */
function TaxPicker({
  store: { salaryElement, add, remove },
  theme = "neutral",
  bare,
  kind = "taxes",
  copy,
}: Props) {
  const titleId = useId();
  const { data, isLoading } = useSalaryItems();
  const savedItems = data?.salaryItems?.[kind];
  const saved = useMemo(() => savedItems ?? [], [savedItems]);
  const colors = MODULE_THEMES[theme];
  const tTax = useTranslations("tax_picker");
  const tContribution = useTranslations("contribution_picker");
  const tPreset = useTranslations("contribution_presets");
  const t = kind === "taxes" ? tTax : tContribution;
  const isTax = kind === "taxes";

  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", value: "", description: "" });
  const [errors, setErrors] = useState<{ name?: string; value?: string }>({});

  function isSelected(tax: Pick<ContributionOrTax, "name" | "value">) {
    return salaryElement.some((t) => sameSalaryItem(t, tax));
  }

  const unsavedSelected = salaryElement.filter((t) => !saved.some((s) => sameSalaryItem(s, t)));
  const visibleSaved = search
    ? saved.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : saved;
  const rate = isTax ? effectiveRate(salaryElement) : contributionRate(salaryElement);
  // Presets not already saved or picked, so each shows up once.
  const presets = isTax
    ? []
    : CONTRIBUTION_PRESETS.map((preset) => ({
        ...preset,
        name: tPreset(`${preset.id}.name`),
        description: tPreset(`${preset.id}.hint`),
      })).filter(
        (preset) =>
          !saved.some((s) => sameSalaryItem(s, preset)) &&
          !salaryElement.some((s) => sameSalaryItem(s, preset))
      );

  function toggleSaved(tax: (typeof saved)[number]) {
    if (isSelected(tax)) {
      remove(tax);
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

    if (!name) nextErrors.name = t("errors.name_required");
    if (!draft.value || isNaN(value) || value <= 0 || value > 100) {
      nextErrors.value = t("errors.rate_range");
    }
    if (name && isSelected({ name, value })) nextErrors.name = t("errors.already_added");

    if (nextErrors.name || nextErrors.value) {
      setErrors(nextErrors);
      return;
    }

    // Same name and rate as a saved tax: use the saved one instead of creating a duplicate.
    // Same name with another rate is a different tax (e.g. two Social Security rates).
    const existing = saved.find((s) => sameSalaryItem(s, { name, value }));
    if (existing) {
      toggleSaved(existing);
      Toast({
        type: "plain",
        message: t("using_saved", { name: existing.name }),
        description: t("using_saved_description", { rate: existing.value }),
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
      aria-labelledby={titleId}
      className={cn(
        "flex w-full flex-col gap-4",
        !bare && "rounded-xl border border-border bg-surface p-4"
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
            {isTax ? (
              <Receipt className="size-4.5" strokeWidth={2} aria-hidden="true" />
            ) : (
              <HandCoins className="size-4.5" strokeWidth={2} aria-hidden="true" />
            )}
          </span>
          <div className="flex flex-col">
            <h2 id={titleId} className="text-[0.9375rem] font-semibold text-ink">
              {t("title")}
            </h2>
            <p className="text-[0.8125rem] text-ink-muted">{copy?.subtitle ?? t("subtitle")}</p>
          </div>
        </div>
        {salaryElement.length > 0 ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 figure text-sm",
              isTax ? "bg-destructive-soft text-destructive" : "bg-accent-soft text-accent"
            )}
            aria-label={t("total_label", { rate })}
          >
            {isTax ? "−" : "+"}
            {rate}%
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
            <h3 className="text-[0.8125rem] font-medium text-ink-muted">{t("saved_title")}</h3>
            <span className="text-xs text-ink-subtle">{t("tap_hint")}</span>
          </div>
          {saved.length >= SEARCH_FROM ? (
            <label className="flex h-10 items-center gap-2 rounded-xl border border-border-strong bg-surface px-3 text-sm">
              <Search className="size-4 text-ink-subtle" aria-hidden="true" />
              <span className="sr-only">{t("search")}</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("search")}
                className="h-full w-full bg-transparent outline-hidden placeholder:text-ink-subtle"
              />
            </label>
          ) : null}
          <ul className="flex flex-wrap gap-2">
            {visibleSaved.map((tax) => {
              const on = isSelected(tax);
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
                        ? cn("border-transparent", colors.strong, "text-on-module")
                        : "border-border-strong bg-surface text-ink hover:bg-surface-sunken"
                    )}
                  >
                    {on ? <Check className="size-4" strokeWidth={2.5} aria-hidden="true" /> : null}
                    {tax.name}
                    <span
                      className={cn("tabular-nums", on ? "text-on-module/80" : "text-ink-muted")}
                    >
                      {tax.value}%
                    </span>
                  </button>
                </li>
              );
            })}
            {visibleSaved.length === 0 ? (
              <li className="text-sm text-ink-muted">{t("no_match", { search })}</li>
            ) : null}
          </ul>
        </div>
      ) : null}

      {unsavedSelected.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[0.8125rem] font-medium text-ink-muted">
            {copy?.newTitle ?? t("new_title")}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {unsavedSelected.map((tax) => (
              <li
                key={`${tax.name}-${tax.value}`}
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
                  onClick={() => remove(tax)}
                  aria-label={t("remove", { name: tax.name })}
                  className="flex size-8 items-center justify-center rounded-full hover:bg-black/5"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {presets.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[0.8125rem] font-medium text-ink-muted">
            {tContribution("presets_title")}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <li key={preset.id}>
                <button
                  type="button"
                  onClick={() =>
                    add({ name: preset.name, value: preset.value, description: preset.description })
                  }
                  title={preset.description}
                  className="flex h-10 items-center gap-1.5 rounded-full border border-dashed border-border-strong bg-surface px-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface-sunken"
                >
                  <span className="rounded bg-surface-sunken px-1 text-[0.6875rem] font-semibold text-ink-muted">
                    {preset.country}
                  </span>
                  {preset.name}
                  <span className="text-ink-muted tabular-nums">{preset.value}%</span>
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
              label={t("fields.name")}
              placeholder={t("fields.name_placeholder")}
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
              label={t("fields.rate")}
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
            label={t("fields.note")}
            placeholder={t("fields.note_placeholder")}
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
              {t("cancel")}
            </Button>
            <Button type="button" variant="primary" size="md" classes="w-full" onClick={onAddNew}>
              {t("add")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {saved.length === 0 && salaryElement.length === 0 && !isLoading ? (
            <p className="text-sm text-ink-muted">{copy?.empty ?? t("empty")}</p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="md"
            classes="w-full border-dashed"
            onClick={() => setCreating(true)}
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("new")}
          </Button>
        </div>
      )}
    </section>
  );
}

/** The same picker for contributions: added on top of the pay, with presets. */
export function ContributionPicker(props: Omit<Props, "kind">) {
  return <TaxPicker {...props} kind="contributions" />;
}

export default TaxPicker;
