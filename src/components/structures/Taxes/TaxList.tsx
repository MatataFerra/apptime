"use client";

import { useId, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import type { SavedSalaryItem } from "@/types";

import { Section } from "@/components/structures/Settings/Preferences/Section";
import Segmented from "@/components/structures/Settings/Preferences/Segmented";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import useErrorMessage from "@/hooks/useErrorMessage";
import useSalaryItems from "@/hooks/useSalaryItems";

import {
  onRemoveSalaryItem,
  onUpdateSalaryItem,
  type SalaryItemKind,
} from "@/server-actions/salary-items";

type Draft = {
  name: string;
  value: number;
  description: string | null;
  /** ISO start of the day the change applies from; null for every shift. */
  from: string | null;
};

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const FIELD =
  "h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem] text-ink outline-hidden focus:border-accent";

/** Edit form for one item. Warns when the change reaches saved shifts. */
function ItemEditor({
  item,
  busy,
  onCancel,
  onSave,
}: {
  item: SavedSalaryItem;
  busy: boolean;
  onCancel: () => void;
  onSave: (draft: Draft) => void;
}) {
  const [name, setName] = useState(item.name);
  const [value, setValue] = useState(String(item.value));
  const [description, setDescription] = useState(item.description ?? "");
  const nameId = useId();
  const valueId = useId();
  const noteId = useId();
  const dateId = useId();
  const [scope, setScope] = useState<"all" | "from">("from");
  const [fromDay, setFromDay] = useState(today);
  const t = useTranslations("taxes");

  const rate = Number(value);
  const validRate = value.trim() !== "" && Number.isFinite(rate) && rate >= 0 && rate <= 100;
  const valid = name.trim() !== "" && validRate;
  const rateChanged = validRate && (rate !== Number(item.value) || name.trim() !== item.name);
  // Only worth asking when saved shifts would be affected.
  const askScope = rateChanged && item.uses > 0;
  const validDay = scope === "all" || /^\d{4}-\d{2}-\d{2}$/.test(fromDay);

  return (
    <form
      className="flex flex-col gap-3 px-4 py-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid || !validDay) return;
        onSave({
          name: name.trim(),
          value: rate,
          description: description.trim() || null,
          // Midnight of that day where the user is.
          from: askScope && scope === "from" ? new Date(`${fromDay}T00:00`).toISOString() : null,
        });
      }}
    >
      <div className="grid grid-cols-[1fr_7rem] gap-2">
        <label htmlFor={nameId} className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
          {t("fields.name")}
          <input
            id={nameId}
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            className={FIELD}
          />
        </label>
        <label htmlFor={valueId} className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
          {t("fields.rate")}
          <span className="flex h-11 items-center gap-1 rounded-xl border border-border-strong bg-surface px-3 focus-within:border-accent">
            <input
              id={valueId}
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full min-w-0 bg-transparent text-right text-[0.9375rem] text-ink tabular-nums outline-hidden"
            />
            <span className="text-sm text-ink-muted">%</span>
          </span>
        </label>
      </div>
      <label htmlFor={noteId} className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
        {t("fields.note")}
        <input
          id={noteId}
          value={description}
          maxLength={200}
          onChange={(e) => setDescription(e.target.value)}
          className={FIELD}
        />
      </label>

      {askScope ? (
        <div className="flex flex-col gap-2.5 rounded-xl bg-warning-soft px-3 py-3">
          <p className="text-[0.8125rem] font-medium text-ink">
            {t("scope_question", { count: item.uses })}
          </p>
          <Segmented
            label={t("scope_label")}
            value={scope}
            onChange={setScope}
            options={[
              { value: "from", label: t("scope_from") },
              { value: "all", label: t("scope_all") },
            ]}
          />
          {scope === "from" ? (
            <label
              htmlFor={dateId}
              className="flex items-center justify-between gap-3 text-[0.8125rem] text-ink"
            >
              {t("shifts_from")}
              <input
                id={dateId}
                type="date"
                value={fromDay}
                onChange={(e) => setFromDay(e.target.value)}
                className="h-10 rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem] text-ink"
              />
            </label>
          ) : null}
          <p role="status" className="text-[0.8125rem] text-ink-muted">
            {scope === "from" ? t("scope_from_hint") : t("scope_all_hint")}
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="ghost" size="md" classes="w-full" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button type="submit" size="md" classes="w-full" disabled={!valid || !validDay || busy}>
          {busy ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}

function ItemRow({
  item,
  kind,
  onChanged,
}: {
  item: SavedSalaryItem;
  kind: SalaryItemKind;
  onChanged: () => Promise<void>;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "remove">("view");
  const [busy, setBusy] = useState(false);
  const t = useTranslations("taxes");
  const errorMessage = useErrorMessage();

  async function save(draft: Draft) {
    setBusy(true);
    const result = await onUpdateSalaryItem({ kind, id: item.id, ...draft }).catch(() => null);
    setBusy(false);
    if (!result?.ok) {
      Toast({ type: "error", message: t("save_failed"), description: errorMessage(result?.error) });
      return;
    }
    if (result.moved !== null) {
      Toast({
        type: "success",
        message: t("rate_updated"),
        description: t("moved", { count: result.moved }),
      });
    }
    await onChanged();
    setMode("view");
  }

  async function remove() {
    setBusy(true);
    const result = await onRemoveSalaryItem({ kind, id: item.id }).catch(() => null);
    setBusy(false);
    if (!result?.ok) {
      Toast({
        type: "error",
        message: t("remove_failed"),
        description: errorMessage(result?.error),
      });
      return;
    }
    await onChanged();
  }

  if (mode === "edit") {
    return <ItemEditor item={item} busy={busy} onCancel={() => setMode("view")} onSave={save} />;
  }

  if (mode === "remove") {
    return (
      <div className="flex flex-col gap-3 px-4 py-4">
        <p className="text-[0.9375rem] text-ink">
          {t.rich("remove_question", {
            name: item.name,
            strong: (chunks) => <span className="font-semibold">{chunks}</span>,
          })}{" "}
          {item.uses > 0 ? t("remove_used", { count: item.uses }) : t("remove_unused")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            classes="w-full"
            onClick={() => setMode("view")}
          >
            {t("keep")}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            classes="w-full"
            disabled={busy}
            onClick={remove}
          >
            {busy ? t("removing") : t("remove")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-14 items-center gap-3 px-4 py-3" data-testid="salary-item">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-[0.9375rem] text-ink">{item.name}</span>
          <span className="shrink-0 text-[0.9375rem] font-semibold text-ink tabular-nums">
            {Number(item.value)}%
          </span>
        </span>
        <span className="truncate text-[0.8125rem] text-ink-muted">
          {[item.description, item.uses > 0 ? t("used_in", { count: item.uses }) : t("not_used")]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>
      <button
        type="button"
        aria-label={t("edit_label", { name: item.name })}
        onClick={() => setMode("edit")}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={t("remove_label", { name: item.name })}
        onClick={() => setMode("remove")}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-destructive-soft hover:text-destructive"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/** The user's saved taxes and contributions: rename, change the rate, remove. */
function TaxList() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useSalaryItems();
  const taxes = data?.salaryItems?.taxes ?? [];
  const contributions = data?.salaryItems?.contributions ?? [];
  const t = useTranslations("taxes");

  // Shift totals depend on the rates, so the shift lists refetch too.
  async function refresh() {
    await Promise.all(
      [USE_QUERY_KEYS.SALARY, USE_QUERY_KEYS.HOURLY, USE_QUERY_KEYS.PRODUCTION].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      )
    );
  }

  if (isLoading) return <Skeleton classes="h-40 w-full rounded-xl" />;

  const groups = [
    { kind: "tax" as const, title: t("my_taxes"), items: taxes },
    { kind: "contribution" as const, title: t("my_contributions"), items: contributions },
  ];

  return (
    <>
      {groups.map((group) => (
        <Section
          key={group.kind}
          title={group.title}
          description={
            group.kind === "tax" ? t("taxes_description") : t("my_contributions_description")
          }
        >
          {group.items.length === 0 ? (
            <p className="px-4 py-4 text-[0.9375rem] text-ink-muted">{t("empty")}</p>
          ) : (
            group.items.map((item) => (
              <ItemRow key={item.id} item={item} kind={group.kind} onChanged={refresh} />
            ))
          )}
        </Section>
      ))}
    </>
  );
}

export default TaxList;
