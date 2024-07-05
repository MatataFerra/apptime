"use client";

import { type PropsWithChildren, useEffect } from "react";

import isEmpty from "lodash/isEmpty";
import type { StoreApi, UseBoundStore } from "zustand";

import { hydrateStore } from "@/utils/store";

type Props<T> = {
  data: Partial<T>;
  loading?: boolean;
  store: UseBoundStore<StoreApi<T>>;
};

function Hydrate<T>({ data, store, loading = false, children }: PropsWithChildren<Props<T>>) {
  useEffect(() => {
    if (loading) return;

    if (!isEmpty(data)) {
      hydrateStore(store, data);
    }
  }, [data, loading, store]);

  return <>{children}</>;
}

export default Hydrate;
