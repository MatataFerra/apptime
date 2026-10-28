import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import type { UserType } from "@/types";

import { useDetailsDirty, useHasUnsavedSettings } from "@/providers/SettingsDraft";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import { applyTheme, isThemePreference } from "@/utils/theme";
import { usePersistPreferences } from "@/hooks/usePreferences";
import useUser from "@/hooks/useUser";

import onUpdateSettings from "@/server-actions/update-settings";
import { usePreferencesDraft } from "@/store/usePreferencesDraft";
import { useSettingsStore } from "@/store/useSettingsStore";

type UserResponse = { user?: UserType; response: boolean; message: string };

/**
 * Everything changed in Settings, saved or dropped at once: the staged
 * preferences (one request) and "Your details" (another), with one toast.
 */
function useSettingsChanges() {
  const t = useTranslations("settings.changes");
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const persist = usePersistPreferences();
  const dirty = useHasUnsavedSettings();
  const detailsDirty = useDetailsDirty();
  const [saving, setSaving] = useState(false);
  const key = [USE_QUERY_KEYS.USER, user?.email];

  async function saveDetails() {
    const { values, setDefaultValues } = useSettingsStore.getState();
    const result = await onUpdateSettings(values).catch(() => null);
    // The action answers with the saved rows, or with an error object.
    if (!Array.isArray(result)) return false;

    setDefaultValues(values);
    queryClient.setQueryData<UserResponse>(key, (old) =>
      old?.user
        ? {
            ...old,
            user: {
              ...old.user,
              name: values.account.name,
              profile: {
                ...old.user.profile,
                city: values.personal.city,
                country: values.personal.country,
              } as UserType["profile"],
            },
          }
        : old
    );
    queryClient.invalidateQueries({ queryKey: key });
    return true;
  }

  async function savePreferences() {
    // Read now, not from the render: a number field saves on blur, right
    // before the button's click.
    const { draft, clear } = usePreferencesDraft.getState();
    if (Object.keys(draft).length === 0) return true;
    const ok = await persist(draft);
    if (ok) clear();
    return ok;
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    const [prefs, details] = await Promise.all([
      savePreferences(),
      detailsDirty ? saveDetails() : Promise.resolve(true),
    ]);
    setSaving(false);

    if (prefs && details) {
      Toast({ type: "success", message: t("saved"), duration: 1500 });
    } else {
      Toast({ type: "error", message: t("failed"), description: t("failed_hint") });
    }
  }

  function discard() {
    const { draft, clear } = usePreferencesDraft.getState();
    const savedTheme = user?.config?.theme;
    if (draft.theme && isThemePreference(savedTheme)) applyTheme(savedTheme);
    clear();
    const details = useSettingsStore.getState();
    details.setValue(details.defaultValues);
  }

  return { dirty, saving, save, discard };
}

export default useSettingsChanges;
