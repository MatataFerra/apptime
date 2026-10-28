"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Laptop, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import Button from "@/components/ui/Button";

import { describeDevice } from "@/utils/helpers/device";
import useDateLocale from "@/hooks/useDateLocale";

import { SECURITY_KEYS } from "./shared";
import {
  type ActiveSession,
  revokeActiveSession,
  revokeOtherActiveSessions,
} from "@/server-actions/account-security";

/** Devices signed in to the account; sign one or all the others out. */
function Sessions({ sessions }: { sessions: ActiveSession[] }) {
  const t = useTranslations("settings.security");
  const te = useTranslations("errors");
  const locale = useDateLocale();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const others = sessions.filter((s) => !s.current);

  function name(session: ActiveSession) {
    const { browser, os } = describeDevice(session.userAgent);
    if (browser && os) return t("on", { browser, os });
    return browser ?? os ?? t("unknown_device");
  }

  async function onRevoke(id: string) {
    setBusy(id);
    const result = await revokeActiveSession(id).catch(() => null);
    setBusy(null);
    if (!result?.response) {
      Toast({ type: "error", message: te(result ? result.error : "generic") });
      return;
    }
    Toast({ type: "success", message: t("signed_out_device") });
    queryClient.invalidateQueries({ queryKey: SECURITY_KEYS.sessions });
  }

  async function onRevokeOthers() {
    setBusy("others");
    const result = await revokeOtherActiveSessions().catch(() => null);
    setBusy(null);
    if (!result?.response) {
      Toast({ type: "error", message: te(result ? result.error : "generic") });
      return;
    }
    Toast({
      type: "success",
      message: t("signed_out_others"),
      description: t("signed_out_others_hint"),
    });
    queryClient.invalidateQueries({ queryKey: SECURITY_KEYS.sessions });
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-3.5">
      <div className="flex flex-col gap-0.5">
        <span className="text-[0.9375rem] text-ink">{t("sessions")}</span>
        <p className="text-[0.8125rem] text-ink-muted">{t("sessions_hint")}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {sessions.map((session) => {
          const DeviceIcon = describeDevice(session.userAgent).mobile ? Smartphone : Laptop;
          return (
            <li key={session.id} className="flex min-h-11 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-sunken text-ink-muted">
                <DeviceIcon className="size-4.5" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm text-ink">{name(session)}</span>
                <span className="truncate text-xs text-ink-muted">
                  {session.current
                    ? t("this_device")
                    : t("last_active", {
                        when: formatDistanceToNow(new Date(session.lastActiveAt), {
                          addSuffix: true,
                          locale,
                        }),
                      })}
                </span>
              </span>
              {session.current ? (
                <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
                  {t("this_device")}
                </span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  classes="w-auto shrink-0 text-destructive"
                  disabled={busy !== null}
                  onClick={() => onRevoke(session.id)}
                >
                  {t("sign_out_device")}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      {others.length > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="md"
          classes="w-full"
          disabled={busy !== null}
          onClick={onRevokeOthers}
        >
          {t("sign_out_others")}
        </Button>
      ) : (
        <p className="text-[0.8125rem] text-ink-muted">{t("no_other_sessions")}</p>
      )}
    </div>
  );
}

export default Sessions;
