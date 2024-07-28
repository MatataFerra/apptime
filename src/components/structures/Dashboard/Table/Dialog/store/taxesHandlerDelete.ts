import { Tax } from "@prisma/client";
import { create } from "zustand";

interface TaxesHandlerDeleteStore {
  taxesToDelete: Tax[];
  addTaxToDelete: (tax: Tax) => void;
  restoreTax: (id: number) => void;
  reset: () => void;
}

export const useTaxesHandlerDelete = create<TaxesHandlerDeleteStore>((set, get) => ({
  taxesToDelete: [],
  addTaxToDelete: (tax: Tax) =>
    set((state) => ({
      ...state,
      taxesToDelete: [...state.taxesToDelete, { ...tax }],
    })),
  reset: () =>
    set((state) => ({
      ...state,
      taxesToDelete: [],
    })),

  restoreTax: (id: number) =>
    set((state) => ({
      ...state,
      taxesToDelete: state.taxesToDelete.filter((tax) => tax.id !== id),
    })),
}));
