"use client";

import { useState } from "react";

import { useLocale, useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";

import { authClient, signOutAndLeave } from "@/utils/auth/client";
import { PATH_NAMES } from "@/utils/constants/pathnames";

/** "Confirm your email": resend the link, or sign out. */
function VerifyEmailNotice({ email }: { email: string }) {
  const t = useTranslations("auth.verify_email");
  const locale = useLocale();
  const [sending, setSending] = useState(false);

  async function resend() {
    setSending(true);
    const { error } = await authClient.sendVerificationEmail({
      email,
      // After confirming, back to the app (signed in, restriction lifted).
      callbackURL: `/${locale}`,
    });
    setSending(false);
    Toast(
      error
        ? { type: "error", message: t(error.status === 429 ? "too_many" : "not_sent") }
        : { type: "success", message: t("sent") }
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
        <p className="text-ink-muted">{t("body", { email })}</p>
        <p className="text-sm text-ink-muted">{t("hint")}</p>
      </div>
      <div className="flex flex-col gap-3">
        <Button variant="primary" size="md" classes="w-full" disabled={sending} onClick={resend}>
          {t("resend")}
        </Button>
        <Button
          variant="outline"
          size="md"
          classes="w-full"
          onClick={() => signOutAndLeave(`/${locale}${PATH_NAMES.LOGIN}`)}
        >
          {t("sign_out")}
        </Button>
      </div>
    </main>
  );
}

export default VerifyEmailNotice;
