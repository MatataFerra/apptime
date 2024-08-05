import type { StoreApi, UseBoundStore } from "zustand";

export function hydrateStore<T>(store: UseBoundStore<StoreApi<T>>, initialState: Partial<T>) {
  store.setState(initialState);
}
