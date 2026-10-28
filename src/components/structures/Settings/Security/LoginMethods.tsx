"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";

import { authClient } from "@/utils/auth/client";

import { authErrorKey, SECURITY_KEYS } from "./shared";

type Account = { id: string; providerId: string };

/** Email + password and Google: which are set up, and link or unlink Google. */
function LoginMethods({ accounts }: { accounts: Account[] }) {
  const t = useTranslations("settings.security");
  const te = useTranslations("errors");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const hasPassword = accounts.some((a) => a.providerId === "credential");
  const google = accounts.find((a) => a.providerId === "google");

  async function onLink() {
    setBusy(true);
    // Redirects to Google and back to Settings.
    const { error } = await authClient.linkSocial({
      provider: "google",
      callbackURL: `/${locale}/settings?linked=google`,
      errorCallbackURL: `/${locale}/settings?link=failed`,
    });
    if (error) {
      setBusy(false);
      Toast({ type: "error", message: te(authErrorKey(error.code)) });
    }
  }

  async function onUnlink() {
    if (!google || !hasPassword) return;
    setBusy(true);
    const { error } = await authClient.unlinkAccount({ accountId: google.id });
    setBusy(false);
    if (error) {
      Toast({ type: "error", message: te(authErrorKey(error.code)) });
      return;
    }
    Toast({ type: "success", message: t("unlinked") });
    queryClient.invalidateQueries({ queryKey: SECURITY_KEYS.accounts });
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-3.5">
      <div className="flex flex-col gap-0.5">
        <span className="text-[0.9375rem] text-ink">{t("methods")}</span>
        <p className="text-[0.8125rem] text-ink-muted">{t("methods_hint")}</p>
      </div>
      <ul className="flex flex-col gap-2">
        <li className="flex min-h-11 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-sunken text-ink-muted">
            <KeyRound className="size-4.5" aria-hidden="true" />
          </span>
          <span className="flex-1 text-sm text-ink">{t("method_password")}</span>
          <Status on={hasPassword} />
        </li>
        <li className="flex min-h-11 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-sunken">
            <Image src="/assets/google-logo.webp" alt="" width={16} height={16} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm text-ink">{t("method_google")}</span>
            {!google ? (
              <span className="text-xs text-ink-muted">{t("google_same_email")}</span>
            ) : !hasPassword ? (
              <span className="text-xs text-ink-muted">{t("unlink_needs_password")}</span>
            ) : null}
          </span>
          {google ? (
            hasPassword ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                classes="w-auto shrink-0 text-destructive"
                disabled={busy}
                onClick={onUnlink}
              >
                {t("unlink")}
              </Button>
            ) : (
              <Status on />
            )
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              classes="w-auto shrink-0"
              disabled={busy}
              onClick={onLink}
            >
              {t("link")}
            </Button>
          )}
        </li>
      </ul>
    </div>
  );
}

function Status({ on }: { on: boolean }) {
  const t = useTranslations("settings.security");
  return (
    <span
      className={
        on
          ? "shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent"
          : "shrink-0 rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-semibold text-ink-muted"
      }
    >
      {on ? t("linked") : t("not_linked")}
    </span>
  );
}

export default LoginMethods;
