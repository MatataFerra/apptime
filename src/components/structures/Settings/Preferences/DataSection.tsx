"use client";

import { useId, useState } from "react";

import { Download, LogOut, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";

import { shiftsToCsv } from "@/services/Export";
import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";

import useHourlyShifts from "@/hooks/useHourlyShifts";
import { useCurrency } from "@/hooks/useMoney";
import useProductionShifts from "@/hooks/useProductionShifts";

import { Row, Section } from "./Section";
import onDeleteAccount from "@/server-actions/delete-account";

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

/** Export your shifts, log out, or delete the account for good. */
function DataSection() {
  const currency = useCurrency();
  const { data: hourly } = useHourlyShifts();
  const { data: production } = useProductionShifts();
  const [deleting, setDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const confirmId = useId();

  function onExport() {
    const csv = shiftsToCsv(hourly, production, currency);
    download(`casualapp-shifts-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  async function onDelete() {
    setBusy(true);
    const result = await onDeleteAccount(confirmation).catch(() => null);
    if (result?.ok) {
      await signOut({ callbackUrl: "/" });
      return;
    }
    setBusy(false);
    Toast({
      type: "error",
      message: "Couldn't delete the account",
      description: result?.error ?? "Please try again.",
    });
  }

  return (
    <Section title="Your data">
      <Row label="Export shifts" hint="A CSV file you can open in Excel or Sheets.">
        <Button type="button" variant="outline" size="sm" onClick={onExport}>
          <Download className="size-4" aria-hidden="true" />
          CSV
        </Button>
      </Row>
      <Row label="Log out" hint="On this device.">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="size-4" aria-hidden="true" />
          Log out
        </Button>
      </Row>

      {deleting ? (
        <div className="flex flex-col gap-3 bg-destructive-soft/60 px-4 py-4">
          <p className="text-[0.9375rem] font-semibold text-destructive">
            This deletes your account and every shift. It can&apos;t be undone.
          </p>
          <label htmlFor={confirmId} className="text-sm text-ink">
            Type <span className="font-semibold">delete</span> to confirm
          </label>
          <input
            id={confirmId}
            value={confirmation}
            autoComplete="off"
            autoCapitalize="none"
            onChange={(e) => setConfirmation(e.target.value)}
            className="h-11 rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem] text-ink outline-hidden focus:border-destructive"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              classes="w-full"
              onClick={() => {
                setDeleting(false);
                setConfirmation("");
              }}
            >
              Keep my account
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              classes="w-full"
              disabled={busy || confirmation.trim().toLowerCase() !== "delete"}
              onClick={onDelete}
            >
              {busy ? "Deleting…" : "Delete forever"}
            </Button>
          </div>
        </div>
      ) : (
        <Row label="Delete account" hint="Your account and all your shifts.">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            classes="text-destructive"
            onClick={() => setDeleting(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete
          </Button>
        </Row>
      )}
    </Section>
  );
}

export default DataSection;
