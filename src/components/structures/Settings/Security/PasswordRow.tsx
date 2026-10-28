"use client";

import { type FormEvent, useId, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import { Row } from "@/components/structures/Settings/Preferences/Section";
import List from "@/components/structures/share/PasswordReqList";
import Button from "@/components/ui/Button";

import { authClient } from "@/utils/auth/client";
import usePasswordErrors from "@/hooks/usePasswordErrors";

import { authErrorKey, FIELD, PANEL, SECURITY_KEYS } from "./shared";
import { setAccountPassword } from "@/server-actions/account-security";

/**
 * Change the password (asks for the current one and signs the other devices
 * out), or create one for an account that only uses Google.
 */
function PasswordRow({ hasPassword }: { hasPassword: boolean }) {
  const t = useTranslations("settings.security");
  const te = useTranslations("errors");
  const queryClient = useQueryClient();
  const ids = { current: useId(), next: useId(), repeat: useId() };
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const { passedErrors, isValid } = usePasswordErrors(next);
  const mismatch = repeat.length > 0 && repeat !== next;

  function close() {
    setOpen(false);
    setCurrent("");
    setNext("");
    setRepeat("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy || !isValid || next !== repeat || (hasPassword && !current)) return;
    setBusy(true);

    if (hasPassword) {
      const { error } = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: true,
      });
      setBusy(false);
      if (error) {
        Toast({ type: "error", message: te(authErrorKey(error.code)) });
        return;
      }
      Toast({
        type: "success",
        message: t("password_changed"),
        description: t("password_changed_description"),
      });
    } else {
      const result = await setAccountPassword(next).catch(() => null);
      setBusy(false);
      if (!result?.response) {
        Toast({ type: "error", message: te(result ? result.error : "generic") });
        return;
      }
      Toast({
        type: "success",
        message: t("password_created"),
        description: t("password_created_description"),
      });
    }

    queryClient.invalidateQueries({ queryKey: SECURITY_KEYS.accounts });
    queryClient.invalidateQueries({ queryKey: SECURITY_KEYS.sessions });
    close();
  }

  return (
    <>
      <Row label={t("password")} hint={hasPassword ? t("password_set") : t("password_none")}>
        {open ? null : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            classes="w-auto shrink-0"
            onClick={() => setOpen(true)}
          >
            {hasPassword ? t("change_password") : t("create_password")}
          </Button>
        )}
      </Row>
      {open ? (
        <form className={PANEL} onSubmit={onSubmit}>
          {hasPassword ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={ids.current} className="text-sm font-medium text-ink">
                {t("current_password")}
              </label>
              <input
                id={ids.current}
                type="password"
                required
                autoComplete="current-password"
                className={FIELD}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={ids.next} className="text-sm font-medium text-ink">
              {t("new_password")}
            </label>
            <input
              id={ids.next}
              type="password"
              required
              autoComplete="new-password"
              className={FIELD}
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </div>
          <List errors={passedErrors} password={next} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor={ids.repeat} className="text-sm font-medium text-ink">
              {t("confirm_password")}
            </label>
            <input
              id={ids.repeat}
              type="password"
              required
              autoComplete="new-password"
              aria-invalid={mismatch}
              className={FIELD}
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
            />
            {mismatch ? (
              <p className="text-[0.8125rem] text-destructive">{t("password_mismatch")}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="ghost" size="md" classes="w-full" onClick={close}>
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              classes="w-full"
              disabled={busy || !isValid || next !== repeat || (hasPassword && !current)}
            >
              {t("save_password")}
            </Button>
          </div>
        </form>
      ) : null}
    </>
  );
}

export default PasswordRow;
