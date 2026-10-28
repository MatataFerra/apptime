import { create } from "zustand";

import type { PreferencesPatch } from "@/server-actions/update-preferences";

/**
 * Settings changes not saved yet. Sections read their values through
 * usePreferences (saved config + this draft), and "Save changes" sends them
 * all in one request.
 */
export const usePreferencesDraft = create<{
  draft: PreferencesPatch;
  /** Set by a language switch, which remounts Settings: keep the draft through it. */
  carryOver: boolean;
  stage: (patch: PreferencesPatch, saved: Record<string, unknown> | null | undefined) => void;
  clear: () => void;
  setCarryOver: (carryOver: boolean) => void;
}>((set) => ({
  draft: {},
  carryOver: false,
  stage: (patch, saved) =>
    set((state) => {
      const draft: Record<string, unknown> = { ...state.draft };
      for (const [key, value] of Object.entries(patch)) {
        // Back to what's saved: nothing to save for that field.
        if ((saved?.[key] ?? null) === (value ?? null)) delete draft[key];
        else draft[key] = value;
      }
      return { draft: draft as PreferencesPatch };
    }),
  clear: () => set({ draft: {} }),
  setCarryOver: (carryOver) => set({ carryOver }),
}));
