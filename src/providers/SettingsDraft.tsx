"use client";

import { createContext, type ReactNode, useContext, useEffect } from "react";

import { applyTheme, isThemePreference } from "@/utils/theme";
import useUser from "@/hooks/useUser";

import { usePreferencesDraft } from "@/store/usePreferencesDraft";
import { useSettingsStore } from "@/store/useSettingsStore";

const SettingsDraftContext = createContext(false);

/** Inside Settings, preference changes wait for "Save changes" instead of saving at once. */
export function useInSettingsDraft() {
  return useContext(SettingsDraftContext);
}

/**
 * Wraps the Settings page. Leaving it with unsaved changes drops them (and
 * puts back the saved theme, which was only being previewed). Closing or
 * reloading the tab asks first.
 */
export function SettingsDraftProvider({ children }: { children: ReactNode }) {
  const { data: user } = useUser();
  const savedTheme = user?.config?.theme;
  const dirty = useHasUnsavedSettings();

  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    return () => {
      const draft = usePreferencesDraft.getState();
      if (draft.carryOver) {
        draft.setCarryOver(false);
        return;
      }
      if (draft.draft.theme && isThemePreference(savedTheme)) applyTheme(savedTheme);
      draft.clear();
      const details = useSettingsStore.getState();
      details.setValue(details.defaultValues);
    };
  }, [savedTheme]);

  return <SettingsDraftContext.Provider value>{children}</SettingsDraftContext.Provider>;
}

/** Whether "Your details" differs from what's saved. */
export function useDetailsDirty() {
  const values = useSettingsStore((state) => state.values);
  const defaults = useSettingsStore((state) => state.defaultValues);
  return (
    values.account.name !== defaults.account.name ||
    values.personal.city !== defaults.personal.city ||
    values.personal.country !== defaults.personal.country
  );
}

/** Any change in Settings waiting for "Save changes". */
export function useHasUnsavedSettings() {
  const draftCount = usePreferencesDraft((state) => Object.keys(state.draft).length);
  const detailsDirty = useDetailsDirty();
  return draftCount > 0 || detailsDirty;
}
