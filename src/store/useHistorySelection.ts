import { create } from "zustand";

import type { SelectionKey } from "@/services/Shift/selection";

interface HistorySelectionState {
  /** Whether the history is in selection mode (rows toggle instead of opening). */
  active: boolean;
  keys: Set<SelectionKey>;
  start: () => void;
  /** Enters selection mode with `key` already checked (a long press on a row). */
  startWith: (key: SelectionKey) => void;
  /** Leaves selection mode and forgets the selection. */
  stop: () => void;
  toggle: (key: SelectionKey) => void;
  /** Selects (`on`) or unselects every key in `keys`. */
  setMany: (keys: SelectionKey[], on: boolean) => void;
}

/** The dashboard history's multi-select, for editing or deleting shifts in bulk. */
export const useHistorySelection = create<HistorySelectionState>((set) => ({
  active: false,
  keys: new Set(),
  start: () => set({ active: true, keys: new Set() }),
  startWith: (key) => set({ active: true, keys: new Set([key]) }),
  stop: () => set({ active: false, keys: new Set() }),
  toggle: (key) =>
    set((state) => {
      const keys = new Set(state.keys);
      if (keys.has(key)) keys.delete(key);
      else keys.add(key);
      return { keys };
    }),
  setMany: (many, on) =>
    set((state) => {
      const keys = new Set(state.keys);
      for (const key of many) {
        if (on) keys.add(key);
        else keys.delete(key);
      }
      return { keys };
    }),
}));
