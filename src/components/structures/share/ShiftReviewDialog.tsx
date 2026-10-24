"use client";

import type { PropsWithChildren, ReactNode } from "react";

import { ClipboardCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { effectiveRate } from "@/components/structures/SalaryItems/TaxPicker";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

import { MODULE_THEMES, type ModuleTheme } from "@/utils/constants/modules";
import { cn } from "@/utils/helpers/styleMerger";
import useMoney from "@/hooks/useMoney";

export type ReviewRow = { label: string; value: ReactNode };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** id of the <form> the save button submits */
  formId: string;
  theme: ModuleTheme;
  gross: number;
  /** The shift's currency; defaults to the one in Settings. */
  currency?: string | null;
  afterTaxes: number;
  taxes: { name: string; value: number }[];
  rows: ReviewRow[];
  /** Short tags like "Public holiday" shown above the rows. */
  tags?: string[];
  /** Text of the save button; "Save shift" by default. */
  saveLabel?: string;
};

/**
 * Last look before saving a shift: what you'll earn (and after tax),
 * the details that produce it, and the taxes applied.
 */
function ShiftReviewDialog({
  open,
  onOpenChange,
  formId,
  theme,
  gross,
  currency,
  afterTaxes,
  taxes,
  rows,
  tags = [],
  saveLabel,
  children,
}: PropsWithChildren<Props>) {
  const format$ = useMoney();
  const t = useTranslations("shift.review");
  function money(value: number) {
    return format$(value, { currency });
  }
  const colors = MODULE_THEMES[theme];
  const hasTaxes = taxes.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] gap-5 overflow-y-auto p-5">
        <DialogHeader className="flex-row items-center gap-3 space-y-0 text-left">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-[14px]",
              colors.soft,
              colors.ink
            )}
          >
            <ClipboardCheck className="size-5.5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-0.5">
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </div>
        </DialogHeader>

        <section
          aria-live="polite"
          className="flex flex-col gap-3 rounded-xl bg-surface-inverse p-4 text-ink-inverse"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[0.8125rem] text-ink-inverse/70">{t("earn")}</span>
            <span className="figure text-[2.75rem] leading-none text-live">{money(gross)}</span>
          </div>
          {hasTaxes ? (
            <dl className="flex flex-col gap-1.5 border-t border-ink-inverse/15 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-inverse/70">
                  {t("taxes_rate", { rate: effectiveRate(taxes) })}
                </dt>
                <dd className="tabular-nums">−{money(Math.max(0, gross - afterTaxes))}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>{t("after_taxes")}</dt>
                <dd className="tabular-nums">{money(afterTaxes)}</dd>
              </div>
            </dl>
          ) : null}
        </section>

        {tags.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-fast-soft px-2.5 py-1 text-xs font-semibold text-fast-ink"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        <dl className="divide-y divide-border rounded-2xl border border-border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-ink-muted">{row.label}</dt>
              <dd className="text-right text-sm font-medium text-ink tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>

        {hasTaxes ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-[0.8125rem] font-medium text-ink-muted">{t("taxes")}</h3>
            <ul className="flex flex-wrap gap-2">
              {taxes.map((tax) => (
                <li
                  key={tax.name}
                  className="rounded-full border border-border-strong px-3 py-1.5 text-sm"
                >
                  {tax.name} <span className="text-ink-muted tabular-nums">{tax.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <DialogFooter className="grid grid-cols-2 gap-2.5 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="lg" classes="w-full">
              {t("edit")}
            </Button>
          </DialogClose>
          <Button
            type="submit"
            size="lg"
            form={formId}
            classes={cn("w-full text-on-module hover:opacity-90", colors.strong)}
          >
            {saveLabel ?? t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ShiftReviewDialog;
