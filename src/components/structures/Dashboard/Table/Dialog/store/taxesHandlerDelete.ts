import { Tax } from "@prisma/client";
import { create } from "zustand";

interface TaxesHandlerDeleteStore {
  taxesToDelete: Tax[];
  addTaxToDelete: (tax: Tax) => void;
}

export const useTaxesHandlerDelete = create<TaxesHandlerDeleteStore>((set, get) => ({
  taxesToDelete: [],
  addTaxToDelete: (tax: Tax) =>
    set((state) => ({
      ...state,
      taxesToDelete: [...state.taxesToDelete, { ...tax }],
    })),
}));
