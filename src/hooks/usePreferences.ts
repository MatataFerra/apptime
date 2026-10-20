import { useQueryClient } from "@tanstack/react-query";

import Toast from "@/services/Toast";

import type { UserType } from "@/types";

/** What the ["user", email] query holds (the /api/user JSON). */
type UserResponse = { user?: UserType; response: boolean; message: string };

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import useUser from "@/hooks/useUser";

import onUpdatePreferences, { type PreferencesPatch } from "@/server-actions/update-preferences";

/**
 * The user's preferences (Config) and a save that applies at once:
 * the cache is updated first, the server action runs after, and the
 * change is rolled back if it fails.
 */
function usePreferences() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const key = [USE_QUERY_KEYS.USER, user?.email];

  async function save(patch: PreferencesPatch) {
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
      Toast({
        type: "error",
        message: "Couldn't save that",
        description: "Check your connection and try again.",
      });
      return false;
    }
    return true;
  }

  return { config: user?.config, save };
}

export default usePreferences;
