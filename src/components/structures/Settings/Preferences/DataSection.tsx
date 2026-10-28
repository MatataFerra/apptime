"use client";

import { useId, useState } from "react";

import { BriefcaseBusiness, ChevronRight, Lock, LogOut, Percent, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";

import { signOutAndLeave } from "@/utils/auth/client";
import { PATH_NAMES } from "@/utils/constants/pathnames";

import { Row, Section } from "./Section";
import { Link } from "@/i18n/navigation";
import onDeleteAccount from "@/server-actions/delete-account";

/** Export (Premium), log out, or delete the account for good. */
function DataSection() {
  const [deleting, setDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const confirmId = useId();
  const t = useTranslations("settings.data");
  const te = useTranslations("errors");
  const word = t("confirm_word");

  async function onDelete() {
    setBusy(true);
    const result = await onDeleteAccount(confirmation).catch(() => null);
    if (result?.ok) {
      await signOutAndLeave("/");
      return;
    }
    setBusy(false);
    Toast({
      type: "error",
      message: t("delete_failed"),
      description: te(result?.ok === false ? result.error : "generic"),
    });
  }

  return (
    <Section title={t("title")}>
      <Shortcut href={PATH_NAMES.TAXES} icon={Percent} label={t("taxes")} hint={t("taxes_hint")} />
      <Shortcut
        href={PATH_NAMES.EMPLOYERS}
        icon={BriefcaseBusiness}
        label={t("employers")}
        hint={t("employers_hint")}
      />
      {/* Export is a Premium feature; shiftsToCsv (services/Export) is ready for it. */}
      <Row label={t("export")} hint={t("export_hint")}>
        <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-surface-sunken px-3 text-[0.8125rem] font-semibold text-ink-muted">
          <Lock className="size-3.5" aria-hidden="true" />
          Premium
        </span>
      </Row>
      <Row label={t("log_out")} hint={t("log_out_hint")}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          classes="w-auto shrink-0"
          onClick={() => signOutAndLeave("/")}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {t("log_out")}
        </Button>
      </Row>

      {deleting ? (
        <div className="flex flex-col gap-3 bg-destructive-soft/60 px-4 py-4">
          <p className="text-[0.9375rem] font-semibold text-destructive">{t("delete_warning")}</p>
          <label htmlFor={confirmId} className="text-sm text-ink">
            {t.rich("type_to_confirm", {
              word,
              strong: (chunks) => <span className="font-semibold">{chunks}</span>,
            })}
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
              {t("keep")}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              classes="w-full"
              disabled={busy || confirmation.trim().toLowerCase() !== word}
              onClick={onDelete}
            >
              {busy ? t("deleting") : t("delete_forever")}
            </Button>
          </div>
        </div>
      ) : (
        <Row label={t("delete_account")} hint={t("delete_account_hint")}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            classes="w-auto shrink-0 text-destructive"
            onClick={() => setDeleting(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t("delete")}
          </Button>
        </Row>
      )}
    </Section>
  );
}

/** A row that opens another screen (My taxes, Employers). */
function Shortcut({
  href,
  icon: Icon,
  label,
  hint,
}: {
  href: string;
  icon: typeof Percent;
  label: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-sunken focus-visible:bg-surface-sunken"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-sunken text-ink-muted">
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[0.9375rem] text-ink">{label}</span>
        <span className="text-[0.8125rem] text-ink-muted">{hint}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
    </Link>
  );
}

export default DataSection;
