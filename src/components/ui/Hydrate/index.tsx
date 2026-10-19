"use client";

import { type PropsWithChildren, useEffect, useRef } from "react";

import every from "lodash/every";
import isObject from "lodash/isObject";
import isString from "lodash/isString";
import map from "lodash/map";
import type { StoreApi, UseBoundStore } from "zustand";

import { hydrateStore } from "@/utils/store";

function isEmptyDeep(obj: unknown): boolean {
  if (obj === undefined) {
    return true;
  }

  if (isObject(obj)) {
    if (Object.keys(obj).length === 0) return true;
    return every(map(obj, (v) => isEmptyDeep(v)));
  } else if (isString(obj)) {
    return !obj.length;
  }
  return false;
}

type Props<T> = {
  data: Partial<T>;
  loading?: boolean;
  store: UseBoundStore<StoreApi<T>>;
};

function Hydrate<T>({ data, store, loading = false, children }: PropsWithChildren<Props<T>>) {
  // Hydrates the store once, with the first non-empty data.
  const hydrated = useRef(false);
  useEffect(() => {
    if (loading || hydrated.current) return;

    if (!isEmptyDeep(data)) {
      hydrateStore(store, data);
      hydrated.current = true;
    }
  }, [data, loading, store]);

  return <>{children}</>;
}

export default Hydrate;
