"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";

import type { EmployerData } from "@/services/Employer/schema";
import Toast from "@/services/Toast";

import type { SavedEmployer } from "@/types";

import EmployerForm from "@/components/structures/Employers/EmployerForm";
import { Section } from "@/components/structures/Settings/Preferences/Section";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import { cn } from "@/utils/helpers/styleMerger";
import useEmployers from "@/hooks/useEmployers";
import useMoney from "@/hooks/useMoney";

import { onCreateEmployer, onRemoveEmployer, onUpdateEmployer } from "@/server-actions/employers";

type FieldErrors = Partial<Record<keyof EmployerData, string>>;

/** "Farming · Bundaberg, Australia · 12 shifts" */
function summary(employer: SavedEmployer) {
  const place = [employer.city, employer.country].filter(Boolean).join(", ");
  const shifts =
    employer.shifts > 0 ? `${employer.shifts} shift${employer.shifts === 1 ? "" : "s"}` : null;
  return [employer.industry, place, shifts].filter(Boolean).join(" · ");
}

/** The saved details, label and value, skipping empty ones. */
function Details({ employer }: { employer: SavedEmployer }) {
  const money = useMoney(employer.defaultCurrency);
  const rows: [string, string | null][] = [
    ["Tax or business no.", employer.taxId],
    [
      "Address",
      [
        employer.address,
        [employer.postcode, employer.city].filter(Boolean).join(" "),
        employer.country,
      ]
        .filter(Boolean)
        .join(", ") || null,
    ],
    ["Contact", employer.contactName],
    ["Email", employer.contactEmail],
    ["Phone", employer.contactPhone],
    [
      "Usual pay",
      employer.defaultRate != null
        ? `${money(employer.defaultRate, { cents: true })} / hour`
        : null,
    ],
    ["Notes", employer.notes],
  ];
  const filled = rows.filter((row): row is [string, string] => !!row[1]);

  if (filled.length === 0) {
    return (
      <p className="px-4 pb-4 text-[0.8125rem] text-ink-muted">
        No details yet. Add them when you have them: forms for visas and taxes usually ask for them.
      </p>
    );
  }

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 px-4 pb-4 text-[0.8125rem]">
      {filled.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-ink-muted">{label}</dt>
          <dd className="min-w-0 break-words text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function EmployerRow({
  employer,
  onChanged,
}: {
  employer: SavedEmployer;
  onChanged: () => Promise<void>;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "remove">("view");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<FieldErrors>();
  const meta = summary(employer);
  const detailsId = `employer-${employer.id}-details`;

  async function save(data: EmployerData) {
    setBusy(true);
    const result = await onUpdateEmployer(employer.id, data).catch(() => null);
    setBusy(false);
    if (!result?.ok) {
      if (result && "fields" in result) setFields(result.fields);
      Toast({ type: "error", message: "Couldn't save", description: result?.error });
      return;
    }
    await onChanged();
    setMode("view");
  }

  async function remove() {
    setBusy(true);
    const result = await onRemoveEmployer(employer.id).catch(() => null);
    setBusy(false);
    if (!result?.ok) {
      Toast({ type: "error", message: "Couldn't remove it", description: result?.error });
      return;
    }
    await onChanged();
  }

  if (mode === "edit") {
    return (
      <EmployerForm
        employer={employer}
        busy={busy}
        serverErrors={fields}
        onCancel={() => setMode("view")}
        onSave={save}
      />
    );
  }

  if (mode === "remove") {
    return (
      <div className="flex flex-col gap-3 px-4 py-4">
        <p className="text-[0.9375rem] text-ink">
          Remove <span className="font-semibold">{employer.name}</span> and its details?
        </p>
        {employer.shifts > 0 ? (
          <p className="text-[0.8125rem] text-ink-muted">
            {employer.shifts === 1 ? "Its shift keeps" : `Its ${employer.shifts} shifts keep`} its
            name; it just won&apos;t be offered for new ones.
          </p>
        ) : null}
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
    <div data-testid="employer">
      <div className="flex min-h-14 items-center gap-1 py-1 pr-3 pl-1">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          onClick={() => setOpen((current) => !current)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-sunken"
        >
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-[0.9375rem] text-ink">{employer.name}</span>
            {meta ? <span className="truncate text-[0.8125rem] text-ink-muted">{meta}</span> : null}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-ink-muted transition-transform",
              open && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          aria-label={`Edit ${employer.name}`}
          onClick={() => {
            setFields(undefined);
            setMode("edit");
          }}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          <Pencil className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Remove ${employer.name}`}
          onClick={() => setMode("remove")}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-destructive-soft hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
      {open ? (
        <div id={detailsId}>
          <Details employer={employer} />
        </div>
      ) : null}
    </div>
  );
}

/** The user's employers: add, see the details, edit, remove. */
function EmployerList() {
  const queryClient = useQueryClient();
  const { employers, isLoading } = useEmployers();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<FieldErrors>();

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.EMPLOYERS] });
  }

  async function create(data: EmployerData) {
    setBusy(true);
    const result = await onCreateEmployer(data).catch(() => null);
    setBusy(false);
    if (!result?.ok) {
      if (result && "fields" in result) setFields(result.fields);
      Toast({ type: "error", message: "Couldn't add it", description: result?.error });
      return;
    }
    await refresh();
    setAdding(false);
  }

  if (isLoading) return <Skeleton classes="h-40 w-full rounded-xl" />;

  return (
    <>
      {adding ? (
        <Section title="New employer">
          <EmployerForm
            busy={busy}
            serverErrors={fields}
            onCancel={() => setAdding(false)}
            onSave={create}
          />
        </Section>
      ) : (
        <Button
          type="button"
          size="md"
          classes="w-full"
          onClick={() => {
            setFields(undefined);
            setAdding(true);
          }}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add employer
        </Button>
      )}

      <Section
        title="My employers"
        description="Where you work and the details forms ask for: tax number, address, contact."
      >
        {employers.length === 0 ? (
          <p className="px-4 py-4 text-[0.9375rem] text-ink-muted">
            None yet. Add the places you work for to keep their details in one place.
          </p>
        ) : (
          employers.map((employer) => (
            <EmployerRow key={employer.id} employer={employer} onChanged={refresh} />
          ))
        )}
      </Section>
    </>
  );
}

export default EmployerList;
