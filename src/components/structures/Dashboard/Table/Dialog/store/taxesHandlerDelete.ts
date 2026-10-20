import { Tax } from "@prisma/client";
import { create } from "zustand";

import type { TaxRateChange } from "@/server-actions/edit-shift";

interface TaxesHandlerDeleteStore {
  taxesToDelete: Tax[];
  /** New rates for this shift only, by tax id. */
  rateChanges: TaxRateChange[];
  addTaxToDelete: (tax: Tax) => void;
  restoreTax: (id: number) => void;
  setRate: (change: TaxRateChange) => void;
  clearRate: (id: number) => void;
  reset: () => void;
}

export const useTaxesHandlerDelete = create<TaxesHandlerDeleteStore>((set) => ({
  taxesToDelete: [],
  rateChanges: [],
  addTaxToDelete: (tax: Tax) =>
    set((state) => ({
      ...state,
      taxesToDelete: [...state.taxesToDelete, { ...tax }],
      rateChanges: state.rateChanges.filter((change) => change.id !== tax.id),
    })),
  reset: () =>
    set((state) => ({
      ...state,
      taxesToDelete: [],
      rateChanges: [],
    })),

  restoreTax: (id: number) =>
    set((state) => ({
      ...state,
      taxesToDelete: state.taxesToDelete.filter((tax) => tax.id !== id),
    })),
  setRate: (change: TaxRateChange) =>
    set((state) => ({
      ...state,
      rateChanges: [...state.rateChanges.filter((c) => c.id !== change.id), change],
    })),
  clearRate: (id: number) =>
    set((state) => ({
      ...state,
      rateChanges: state.rateChanges.filter((c) => c.id !== id),
    })),
}));
