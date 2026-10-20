"use client";

import { useId, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";

import Toast from "@/services/Toast";

import type { SavedSalaryItem } from "@/types";

import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import useSalaryItems from "@/hooks/useSalaryItems";

import { Section } from "./Section";
import {
  onRemoveSalaryItem,
  onUpdateSalaryItem,
  type SalaryItemKind,
} from "@/server-actions/salary-items";

function shifts(count: number) {
  return count === 1 ? "1 shift" : `${count} shifts`;
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
  onSave: (draft: { name: string; value: number; description: string | null }) => void;
}) {
  const [name, setName] = useState(item.name);
  const [value, setValue] = useState(String(item.value));
  const [description, setDescription] = useState(item.description ?? "");
  const nameId = useId();
  const valueId = useId();
  const noteId = useId();

  const rate = Number(value);
  const validRate = value.trim() !== "" && Number.isFinite(rate) && rate >= 0 && rate <= 100;
  const valid = name.trim() !== "" && validRate;
  const rateChanged = validRate && rate !== Number(item.value);

  return (
    <form
      className="flex flex-col gap-3 px-4 py-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSave({ name: name.trim(), value: rate, description: description.trim() || null });
      }}
    >
      <div className="grid grid-cols-[1fr_7rem] gap-2">
        <label htmlFor={nameId} className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
          Name
          <input
            id={nameId}
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            className={FIELD}
          />
        </label>
        <label htmlFor={valueId} className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
          Rate
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
        Note (optional)
        <input
          id={noteId}
          value={description}
          maxLength={200}
          onChange={(e) => setDescription(e.target.value)}
          className={FIELD}
        />
      </label>

      {rateChanged && item.uses > 0 ? (
        <p role="status" className="rounded-xl bg-warning-soft px-3 py-2 text-[0.8125rem] text-ink">
          The new rate also applies to the {shifts(item.uses)} that use it, so their pay after
          taxes changes.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="ghost" size="md" classes="w-full" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="md" classes="w-full" disabled={!valid || busy}>
          {busy ? "Saving…" : "Save"}
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

  async function save(draft: { name: string; value: number; description: string | null }) {
    setBusy(true);
    const result = await onUpdateSalaryItem({ kind, id: item.id, ...draft }).catch(() => null);
    setBusy(false);
    if (!result?.ok) {
      Toast({ type: "error", message: "Couldn't save", description: result?.error });
      return;
    }
    await onChanged();
    setMode("view");
  }

  async function remove() {
    setBusy(true);
    const result = await onRemoveSalaryItem({ kind, id: item.id }).catch(() => null);
    setBusy(false);
    if (!result?.ok) {
      Toast({ type: "error", message: "Couldn't remove it", description: result?.error });
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
          Remove <span className="font-semibold">{item.name}</span>?{" "}
          {item.uses > 0
            ? `It won't be offered for new shifts. The ${shifts(item.uses)} that use it keep it.`
            : "No shift uses it."}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            classes="w-full"
            onClick={() => setMode("view")}
          >
            Keep it
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            classes="w-full"
            disabled={busy}
            onClick={remove}
          >
            {busy ? "Removing…" : "Remove"}
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
          {[item.description, item.uses > 0 ? `Used in ${shifts(item.uses)}` : "Not used yet"]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>
      <button
        type="button"
        aria-label={`Edit ${item.name}`}
        onClick={() => setMode("edit")}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={`Remove ${item.name}`}
        onClick={() => setMode("remove")}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-destructive-soft hover:text-destructive"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/** The user's saved taxes and contributions: rename, change the rate, remove. */
function TaxesSection() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useSalaryItems();
  const taxes = data?.salaryItems?.taxes ?? [];
  const contributions = data?.salaryItems?.contributions ?? [];

  // Shift totals depend on the rates, so the shift lists refetch too.
  async function refresh() {
    await Promise.all(
      [USE_QUERY_KEYS.SALARY, USE_QUERY_KEYS.HOURLY, USE_QUERY_KEYS.PRODUCTION].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      )
    );
  }

  if (isLoading) return <Skeleton classes="h-40 w-full rounded-[20px]" />;

  const groups = [
    { kind: "tax" as const, title: "Taxes", items: taxes },
    { kind: "contribution" as const, title: "Contributions", items: contributions },
  ].filter((group) => group.kind === "tax" || group.items.length > 0);

  return (
    <>
      {groups.map((group) => (
        <Section
          key={group.kind}
          title={`My ${group.title.toLowerCase()}`}
          description={
            group.kind === "tax" ? "The ones you can pick when you save a shift." : undefined
          }
        >
          {group.items.length === 0 ? (
            <p className="px-4 py-4 text-[0.9375rem] text-ink-muted">
              None yet. Add one when you save a shift and it shows up here.
            </p>
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

export default TaxesSection;
