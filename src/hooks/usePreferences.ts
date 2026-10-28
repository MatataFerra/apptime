import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import type { UserType } from "@/types";

import { useInSettingsDraft } from "@/providers/SettingsDraft";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import useUser from "@/hooks/useUser";

import onUpdatePreferences, { type PreferencesPatch } from "@/server-actions/update-preferences";
import { usePreferencesDraft } from "@/store/usePreferencesDraft";

/** What the ["user", email] query holds (the /api/user JSON). */
type UserResponse = { user?: UserType; response: boolean; message: string };

/**
 * Saves preferences: the cache is updated first, the server action runs
 * after, and the change is rolled back if it fails.
 */
export function usePersistPreferences() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const key = [USE_QUERY_KEYS.USER, user?.email];

  return async function persist(patch: PreferencesPatch) {
    const previous = queryClient.getQueryData<UserResponse>(key);
    queryClient.setQueryData<UserResponse>(key, (old) =>
      old?.user
        ? {
            ...old,
            user: { ...old.user, config: { ...old.user.config, ...patch } as UserType["config"] },
          }
        : old
    );

    const result = await onUpdatePreferences(patch).catch(() => null);
    if (!result?.ok) {
      queryClient.setQueryData(key, previous);
      return false;
    }
    return true;
  };
}

/**
 * The user's preferences (Config) and how to change them.
 *
 * Inside Settings, `save` only stages the change: `config` shows it at once
 * and "Save changes" sends every staged change together. Elsewhere (the
 * theme toggle on Home) it saves right away.
 */
function usePreferences() {
  const t = useTranslations("settings.preferences");
  const { data: user } = useUser();
  const inSettings = useInSettingsDraft();
  const draft = usePreferencesDraft((state) => state.draft);
  const stage = usePreferencesDraft((state) => state.stage);
  const persist = usePersistPreferences();

  const saved = user?.config;
  const config = (inSettings && saved ? { ...saved, ...draft } : saved) as typeof saved;

  async function save(patch: PreferencesPatch, { silent = false }: { silent?: boolean } = {}) {
    if (inSettings) {
      stage(patch, saved as Record<string, unknown> | null | undefined);
      return true;
    }
    const ok = await persist(patch);
    if (!ok) {
      Toast({ type: "error", message: t("save_failed"), description: t("check_connection") });
      return false;
    }
    if (!silent) Toast({ type: "success", message: t("saved"), duration: 1200 });
    return true;
  }

  return { config, save };
}

export default usePreferences;
