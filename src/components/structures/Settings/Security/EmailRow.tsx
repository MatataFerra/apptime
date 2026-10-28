"use client";

import { type FormEvent, useId, useState } from "react";

import { useLocale, useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import { Row } from "@/components/structures/Settings/Preferences/Section";
import Button from "@/components/ui/Button";

import { authClient } from "@/utils/auth/client";

import { authErrorKey, FIELD, PANEL } from "./shared";

/** The sign-in email; a new one is confirmed from its own inbox first. */
function EmailRow({ email }: { email: string }) {
  const t = useTranslations("settings.security");
  const te = useTranslations("errors");
  const locale = useLocale();
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

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
