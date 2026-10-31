"use client";

import { useEffect } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import { Section } from "@/components/structures/Settings/Preferences/Section";
import Skeleton from "@/components/ui/Skeleton";

import { authClient } from "@/utils/auth/client";
import useUser from "@/hooks/useUser";

import EmailRow from "./EmailRow";
import LoginMethods from "./LoginMethods";
import PasswordRow from "./PasswordRow";
import Sessions from "./Sessions";
import { SECURITY_KEYS } from "./shared";
import { usePathname, useRouter } from "@/i18n/navigation";
import { listActiveSessions } from "@/server-actions/account-security";

/** Email, password, sign-in methods and signed-in devices. */
function SecuritySection() {
  const t = useTranslations("settings.security");
  const { data: user } = useUser();
  useReturnToast();

  const accounts = useQuery({
    queryKey: SECURITY_KEYS.accounts,
    queryFn: async () => {
      const { data, error } = await authClient.listAccounts();
      if (error) throw error;
      return data.map(({ id, providerId }) => ({ id, providerId }));
    },
  });
  const sessions = useQuery({
    queryKey: SECURITY_KEYS.sessions,
    queryFn: async () => (await listActiveSessions()) ?? [],
  });

  if (!user || accounts.isLoading || sessions.isLoading) {
    return <Skeleton classes="h-96 w-full rounded-xl" />;
  }

  const list = accounts.data ?? [];
  const hasPassword = list.some((a) => a.providerId === "credential");

  return (
    <Section title={t("title")}>
      <EmailRow email={user.email} verified={user.emailVerified !== false} />
      <PasswordRow hasPassword={hasPassword} />
      <LoginMethods accounts={list} />
      <Sessions sessions={sessions.data ?? []} />
    </Section>
  );
}

/**
 * Coming back from the email link or from Google: say how it went once,
 * then drop the query from the URL.
 */
function useReturnToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const t = useTranslations("settings.security");
  const te = useTranslations("errors");

  useEffect(() => {
    const email = params.get("email");
    const linked = params.get("linked");
    const linkFailed = params.get("link");
    const error = params.get("error");
    if (!email && !linked && !linkFailed && !error) return;

    if (linkFailed || (linked && error)) {
      Toast({ type: "error", message: te("google_link_failed") });
    } else if (error) {
      Toast({ type: "error", message: te("reset_link_invalid") });
    } else if (email === "verified") {
      Toast({ type: "success", message: t("email_verified_toast") });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    } else if (email) {
      Toast({ type: "success", message: t("email_updated") });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    } else if (linked) {
      Toast({ type: "success", message: t("linked_toast") });
      queryClient.invalidateQueries({ queryKey: SECURITY_KEYS.accounts });
    }
    router.replace(pathname);
  }, [params, router, pathname, queryClient, t, te]);
}

export default SecuritySection;
