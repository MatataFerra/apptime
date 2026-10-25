"use client";

import { type PropsWithChildren, useEffect, useRef } from "react";

import type { StoreApi, UseBoundStore } from "zustand";

import { hydrateStore } from "@/utils/store";

function isEmptyDeep(obj: unknown): boolean {
  if (obj === undefined) {
    return true;
  }

  if ((typeof obj === "object" && obj !== null) || typeof obj === "function") {
    return Object.values(obj).every((v) => isEmptyDeep(v));
  } else if (typeof obj === "string") {
    return !obj.length;
  }
  return false;
}

type Props<T> = {
  data: Partial<T>;
  loading?: boolean;
  /** Hydrate even if `data` is empty (e.g. a user with no shifts yet). */
  ready?: boolean;
  store: UseBoundStore<StoreApi<T>>;
};

function Hydrate<T>({
  data,
  store,
  loading = false,
  ready = false,
  children,
}: PropsWithChildren<Props<T>>) {
  // Hydrates the store with the first non-empty data and again whenever a
  // value in it changes (e.g. a query refetched after a shift started), so
  // the store never keeps an older copy than the one the queries hold.
  const last = useRef<Partial<T> | null>(null);
  useEffect(() => {
    if (loading || (!ready && isEmptyDeep(data))) return;

    const previous = last.current;
    const changed =
      !previous ||
      Object.keys(data).some((key) => previous[key as keyof T] !== data[key as keyof T]);
    if (!changed) return;

    hydrateStore(store, data);
    last.current = data;
  }, [data, loading, ready, store]);

  return <>{children}</>;
}

export default Hydrate;
