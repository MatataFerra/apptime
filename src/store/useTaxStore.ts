import type { Tax } from "@prisma/client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface TaxStore {
  taxes: Omit<Tax, "id">[];
  saveTaxes: boolean;
  addTax: (tax: Omit<Tax, "id">) => void;
  removeTax: (internalId: string) => void;
  clearTaxes: () => void;
  setSaveTaxes: (value: boolean) => void;
}

interface TaxesFromDbStore {
  open: boolean;

  setOpen: () => void;
}

export const useTaxesFromDbStore = create<TaxesFromDbStore>((set, get) => ({
  open: true,
  setOpen: () => set((state) => ({ open: !state.open })),
}));

export const useProductionTaxesStore = create(
  devtools<TaxStore>(
    (set, get) => ({
      taxes: [],
      saveTaxes: false,
      addTax: (tax) =>
        set((state) => {
          const getTax = get().taxes.find((t) => t.name === tax.name);

          if (getTax) return state;

          return {
            taxes: [...state.taxes, tax],
          };
        }),

      removeTax: (name) =>
        set((state) => ({
          taxes: state.taxes.filter((t) => t.name !== name),
        })),
      clearTaxes: () => set({ taxes: [] }),
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
      saveTaxes: false,
      addTax: (tax) =>
        set((state) => {
          const getTax = get().taxes.find((t) => t.name === tax.name);

          if (getTax) return state;

          return {
            taxes: [...state.taxes, tax],
          };
        }),

      removeTax: (name) =>
        set((state) => ({
          taxes: state.taxes.filter((t) => t.name !== name),
        })),
      clearTaxes: () => set({ taxes: [] }),
      setSaveTaxes: (value) => set({ saveTaxes: value }),
    }),
    {
      name: "Hourly_taxes",
    }
  )
);

export const useTrackTaxesStore = create(
  devtools<TaxStore>(
    (set, get) => ({
      taxes: [],
      saveTaxes: false,
      addTax: (tax) =>
        set((state) => {
          const getTax = get().taxes.find((t) => t.name === tax.name);

          if (getTax) return state;

          return {
            taxes: [...state.taxes, tax],
          };
        }),

      removeTax: (name) =>
        set((state) => ({
          taxes: state.taxes.filter((t) => t.name !== name),
        })),
      clearTaxes: () => set({ taxes: [] }),
      setSaveTaxes: (value) => set({ saveTaxes: value }),
    }),
    {
      name: "Track_taxes",
    }
  )
);
