import type { Tax } from "@prisma/client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface TaxStore {
  taxes: Omit<Tax, "id">[];
  next: number;
  saveTaxes: boolean;
  addTax: (tax: Omit<Tax, "id">) => void;
  removeTax: (internalId: string) => void;
  clearTaxes: () => void;
  setSaveTaxes: (value: boolean) => void;
}

export const useProductionTaxesStore = create(
  devtools<TaxStore>(
    (set, get) => ({
      taxes: [],
      next: 0,
      saveTaxes: false,
      addTax: (tax) =>
        set((state) => {
          const getTax = get().taxes.find((t) => t.name === tax.name);

          if (getTax) return state;

          return {
            taxes: [...state.taxes, tax],
            next: state.next + 1,
          };
        }),

      removeTax: (name) =>
        set((state) => ({
          taxes: state.taxes.filter((t) => t.name !== name),
          next: state.next - 1,
        })),
      clearTaxes: () => set({ taxes: [], next: 0 }),
      setSaveTaxes: (value) => set({ saveTaxes: value }),
    }),
    {
      name: "taxes",
    }
  )
);

export const useHourlyTaxesStore = create(
  devtools<TaxStore>(
    (set, get) => ({
      taxes: [],
      next: 0,
      saveTaxes: false,
      addTax: (tax) =>
        set((state) => {
          const getTax = get().taxes.find((t) => t.name === tax.name);

          if (getTax) return state;

          return {
            taxes: [...state.taxes, tax],
            next: state.next + 1,
          };
        }),

      removeTax: (name) =>
        set((state) => ({
          taxes: state.taxes.filter((t) => t.name !== name),
          next: state.next - 1,
        })),
      clearTaxes: () => set({ taxes: [], next: 0 }),
      setSaveTaxes: (value) => set({ saveTaxes: value }),
    }),
    {
      name: "Hourly_taxes",
    }
  )
);
