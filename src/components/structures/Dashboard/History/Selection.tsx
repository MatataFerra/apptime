"use client";

import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ListChecks, Pencil, Square, SquareCheck, SquareMinus, Trash, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import type { HistoryEntry } from "@/services/History";
import { idsByKind, type SelectionKey, selectionKey } from "@/services/Shift/selection";
import Toast from "@/services/Toast";

import BatchEditDrawer from "@/components/structures/Dashboard/History/BatchEditDrawer";
import Button from "@/components/ui/Button";

import { invalidateShiftQueries } from "@/utils/helpers/invalidateShiftQueries";
import { cn } from "@/utils/helpers/styleMerger";

import onDeleteShiftsBatch from "@/server-actions/delete-shifts-batch";
import onEditShiftsBatch, { type BatchEditInput } from "@/server-actions/edit-shifts-batch";
import { useDashHourlyStore } from "@/store/useDashHourlyStore";
import { useDashProductionStore } from "@/store/useDashProductionStore";
import { useHistorySelection } from "@/store/useHistorySelection";

export function keyOf(entry: HistoryEntry): SelectionKey {
  return selectionKey(entry.kind, entry.id);
}

/** All, some or none of `entries` selected. */
export function selectionState(entries: HistoryEntry[], keys: Set<SelectionKey>) {
  const selected = entries.filter((e) => keys.has(keyOf(e))).length;
  if (selected === 0) return "none";
  return selected === entries.length ? "all" : "some";
}

/** The checkbox drawn where the date badge was. */
export function CheckIcon({
  state,
  classes,
}: {
  state: "all" | "some" | "none";
  classes?: string;
}) {
  const Icon = state === "all" ? SquareCheck : state === "some" ? SquareMinus : Square;
  return (
    <Icon
      className={cn("size-5", state === "none" ? "text-ink-subtle" : "text-accent", classes)}
      aria-hidden="true"
    />
  );
}

/** "Select" in the history header: turns the rows into checkboxes. */
export function SelectToggle() {
  const t = useTranslations("dashboard.selection");
  const { active, start, stop } = useHistorySelection();

  return (
    <button
      type="button"
      data-testid="history-select"
      aria-pressed={active}
      onClick={active ? stop : start}
      className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
    >
      <ListChecks className="size-4" aria-hidden="true" />
      {active ? t("done") : t("select")}
    </button>
  );
}

/** "✕  3 selected   Select all": replaces the filters while selecting. */
export function SelectionHeader({ entries }: { entries: HistoryEntry[] }) {
  const t = useTranslations("dashboard.selection");
  const { keys, stop, setMany } = useHistorySelection();
  const count = entries.filter((e) => keys.has(keyOf(e))).length;
  const all = entries.length > 0 && count === entries.length;

  return (
    <div className="flex h-9 items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        <button
          type="button"
          onClick={stop}
          aria-label={t("cancel")}
          className="flex size-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-sunken hover:text-ink"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        <span className="text-[0.9375rem] font-semibold text-ink" aria-live="polite">
          {t("selected", { count })}
        </span>
      </span>
      <button
        type="button"
        onClick={() => setMany(entries.map(keyOf), !all)}
        className="h-9 rounded-full px-3 text-sm font-medium text-accent hover:bg-surface-sunken"
      >
        {all ? t("select_none") : t("select_all")}
      </button>
    </div>
  );
}

/**
 * The bar at the bottom while selecting: "Delete" and "Edit 3". Delete asks
 * once in place, like the shift dialog does.
 */
export function SelectionActions({ entries }: { entries: HistoryEntry[] }) {
  const t = useTranslations("dashboard.selection");
  const queryClient = useQueryClient();
  const router = useRouter();
  const { keys, stop } = useHistorySelection();
  const hourlyStore = useDashHourlyStore();
  const productionStore = useDashProductionStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);

  // Only what's on screen counts: a filter change leaves the rest out.
  const selected = entries.filter((e) => keys.has(keyOf(e)));
  const ids = idsByKind(selected.map(keyOf));
  const count = selected.length;

  function done() {
    invalidateShiftQueries(queryClient);
    router.refresh();
    setConfirmDelete(false);
    setEditing(false);
    stop();
  }

  const remove = useMutation({
    mutationFn: () => onDeleteShiftsBatch({ ids }),
    onMutate: () => Toast({ type: "loading", message: t("deleting"), duration: Infinity }),
    onSuccess: (res) => {
      if (!res) {
        Toast({ type: "error", message: t("delete_failed"), duration: 2500 });
        return;
      }
      ids.hourly.forEach((id) => hourlyStore.delete(id));
      ids.production.forEach((id) => productionStore.delete(id));
      Toast({
        type: "success",
        message: t("deleted", { count: res.hourly + res.production }),
        duration: 2000,
      });
      done();
    },
    onError: () => Toast({ type: "error", message: t("delete_failed"), duration: 2500 }),
  });

  const edit = useMutation({
    mutationFn: (changes: BatchEditInput["changes"]) => onEditShiftsBatch({ ids, changes }),
    onMutate: () => Toast({ type: "loading", message: t("saving"), duration: Infinity }),
    onSuccess: (res) => {
      if (!res) {
        Toast({ type: "error", message: t("save_failed"), duration: 2500 });
        return;
      }
      Toast({
        type: "success",
        message: t("saved", { count: res.hourly + res.production }),
        duration: 2000,
      });
      done();
    },
    onError: () => Toast({ type: "error", message: t("save_failed"), duration: 2500 }),
  });

  const busy = remove.isPending || edit.isPending;

  return (
    <>
      <div
        data-testid="selection-actions"
        className="sticky bottom-0 z-10 -mx-1 flex flex-col gap-2 border-t border-border bg-background/95 px-1 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur"
      >
        {confirmDelete ? (
          <>
            <p className="text-center text-sm text-ink">{t("confirm_delete", { count })}</p>
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                size="lg"
                variant="outline"
                classes="w-full"
                onClick={() => setConfirmDelete(false)}
              >
                {t("keep_them")}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="danger"
                classes="w-full"
                disabled={busy}
                onClick={() => remove.mutate()}
              >
                {t("delete_count", { count })}
              </Button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-[1fr_2fr] gap-2.5">
            <Button
              type="button"
              size="lg"
              variant="ghost"
              classes="w-full gap-1.5 text-destructive"
              disabled={count === 0 || busy}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash className="size-4" aria-hidden="true" />
              {t("delete")}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="primary"
              classes="w-full gap-1.5"
              disabled={count === 0 || busy}
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-4" aria-hidden="true" />
              {t("edit", { count })}
            </Button>
          </div>
        )}
      </div>

      <BatchEditDrawer
        open={editing}
        onOpenChange={setEditing}
        entries={selected}
        saving={edit.isPending}
        onSave={(changes) => edit.mutate(changes)}
      />
    </>
  );
}
