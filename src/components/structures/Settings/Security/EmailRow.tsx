"use client";

import { type FormEvent, useId, useState } from "react";

import { useLocale, useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import { Row } from "@/components/structures/Settings/Preferences/Section";
import Button from "@/components/ui/Button";

import { authClient } from "@/utils/auth/client";

import { authErrorKey, FIELD, PANEL } from "./shared";

/**
 * The sign-in email, whether it's confirmed (with a way to resend the link
 * if not), and changing it: a new one is confirmed from its own inbox first.
 */
function EmailRow({ email, verified }: { email: string; verified: boolean }) {
  const t = useTranslations("settings.security");
  const te = useTranslations("errors");
  const locale = useLocale();
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  async function resend() {
    setResending(true);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: `/${locale}/settings?email=verified`,
    });
    setResending(false);
    Toast(
      error
        ? {
            type: "error",
            message: t(error.status === 429 ? "verify_too_many" : "verify_not_sent"),
          }
        : { type: "success", message: t("verify_sent"), description: email }
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const newEmail = value.trim().toLowerCase();
    if (!newEmail || busy) return;
    if (newEmail === email.toLowerCase()) {
      Toast({ type: "error", message: te("email_same") });
      return;
    }

    setBusy(true);
    const { error } = await authClient.changeEmail({
      newEmail,
      // Better Auth adds ?error=… here if the link is invalid or expired.
      callbackURL: `/${locale}/settings?email=updated`,
    });
    setBusy(false);

    if (error) {
      Toast({ type: "error", message: te(authErrorKey(error.code)) });
      return;
    }
    // Same answer whether or not the address is taken (no account probing).
    Toast({
      type: "success",
      message: t("email_sent"),
      description: t("email_sent_description", { email: newEmail }),
    });
    setOpen(false);
    setValue("");
  }

  return (
    <>
      <Row label={t("email")} hint={email}>
        <span
          className={
            verified
              ? "shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent"
              : "shrink-0 rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning"
          }
        >
          {verified ? t("email_verified") : t("email_unverified")}
        </span>
        {open ? null : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            classes="w-auto shrink-0"
            onClick={() => setOpen(true)}
          >
            {t("change")}
          </Button>
        )}
      </Row>
      {verified ? null : (
        <div className="flex items-center justify-between gap-4 px-4 pb-3">
          <p className="text-[0.8125rem] text-ink-muted">{t("verify_hint")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            classes="w-auto shrink-0"
            disabled={resending}
            onClick={resend}
          >
            {resending ? t("sending") : t("verify_resend")}
          </Button>
        </div>
      )}
      {open ? (
        <form className={PANEL} onSubmit={onSubmit}>
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {t("new_email")}
          </label>
          <input
            id={inputId}
            type="email"
            required
            autoComplete="email"
            autoCapitalize="none"
            className={FIELD}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <p className="text-[0.8125rem] text-ink-muted">{t("email_hint")}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              classes="w-full"
              onClick={() => {
                setOpen(false);
                setValue("");
              }}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" variant="primary" size="md" classes="w-full" disabled={busy}>
              {busy ? t("sending") : t("send_link")}
            </Button>
          </div>
        </form>
      ) : null}
    </>
  );
}

export default EmailRow;
