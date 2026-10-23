"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import type { HourlyType, ProductionType } from "@/types";

import { useTaxesHandlerDelete } from "@/components/structures/Dashboard/Table/Dialog/store/taxesHandlerDelete";
import Button from "@/components/ui/Button";

import { cn } from "@/utils/helpers/styleMerger";

type Props = {
  shift: HourlyType | ProductionType;
};

type ShiftTax = NonNullable<HourlyType["taxes"]>[number];

/** Rate input for one tax; the change only applies to this shift. */
function RateEditor({ tax, onDone }: { tax: ShiftTax; onDone: () => void }) {
  const { rateChanges, setRate, clearRate } = useTaxesHandlerDelete((state) => state);
  const pending = rateChanges.find((c) => c.id === tax.id);
  const [draft, setDraft] = useState(String(pending?.value ?? tax.value));
  const t = useTranslations("dashboard.taxes");

  function commit() {
    const value = Number(draft);
    if (draft.trim() === "" || !Number.isFinite(value) || value < 0 || value > 100) {
      Toast({ type: "error", message: t("rate_range"), duration: 1500 });
      return;
    }
    if (value === Number(tax.value)) clearRate(tax.id);
    else setRate({ id: tax.id, value });
    onDone();
  }

  return (
    <span className="flex items-center gap-2">
      <span className="flex h-10 w-24 items-center gap-1 rounded-xl border border-border-strong bg-surface px-2.5 focus-within:border-accent">
        <input
          autoFocus
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step="any"
          aria-label={t("new_rate", { name: tax.name })}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") onDone();
          }}
          className="w-full min-w-0 bg-transparent text-right text-sm text-ink tabular-nums outline-hidden"
        />
        <span className="text-xs text-ink-muted">%</span>
      </span>
      <Button type="button" variant="ghost" size="sm" classes="w-auto" onClick={commit}>
        {t("ok")}
      </Button>
    </span>
  );
}

function Taxes({ shift }: Props) {
  const { taxesToDelete, rateChanges, addTaxToDelete, restoreTax, clearRate } =
    useTaxesHandlerDelete((state) => state);
  const [editing, setEditing] = useState<number | null>(null);
  const t = useTranslations("dashboard.taxes");

  return (
    <ul className="flex flex-col gap-2">
      {shift?.taxes?.map((tax) => {
        const removing = taxesToDelete.some((t) => t.id === tax.id);
        const newRate = rateChanges.find((c) => c.id === tax.id)?.value;
        const changed = newRate !== undefined;

        return (
          <li
            key={tax.id}
            className={cn(
              "flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3.5 py-2 transition-colors",
              removing
                ? "border-destructive/40 bg-destructive-soft"
                : changed
                  ? "border-accent/40 bg-accent-soft"
                  : "border-border bg-surface"
            )}
          >
            <span className={cn("flex min-w-0 flex-col", removing && "text-destructive")}>
              <span className={cn("text-sm font-medium", removing && "line-through")}>
                {tax.name}{" "}
                {changed ? (
                  <span className="whitespace-nowrap">
                    <span className="text-ink-muted tabular-nums line-through">{tax.value}%</span>{" "}
                    <span className="tabular-nums">{newRate}%</span>
                  </span>
                ) : (
                  <span className="tabular-nums">{tax.value}%</span>
                )}
              </span>
              {changed ? (
                <span className="text-xs text-ink-muted">{t("only_this_shift")}</span>
              ) : tax.description ? (
                <span className="truncate text-xs text-ink-muted">{tax.description}</span>
              ) : null}
            </span>

            {removing ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                classes="w-auto"
                onClick={() => {
                  restoreTax(tax.id);
                  Toast({ type: "plain", message: t("kept"), duration: 1500 });
                }}
              >
                {t("undo")}
              </Button>
            ) : editing === tax.id ? (
              <RateEditor tax={tax} onDone={() => setEditing(null)} />
            ) : (
              <span className="flex shrink-0 items-center">
                {changed ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    classes="w-auto"
                    onClick={() => clearRate(tax.id)}
                  >
                    {t("undo")}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    classes="w-auto"
                    onClick={() => setEditing(tax.id)}
                  >
                    {t("change_rate")}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  classes="w-auto text-destructive"
                  onClick={() => {
                    addTaxToDelete(tax);
                    Toast({
                      type: "plain",
                      message: t("will_remove"),
                      description: t("save_to_apply"),
                      duration: 1500,
                    });
                  }}
                >
                  {t("remove")}
                </Button>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default Taxes;
