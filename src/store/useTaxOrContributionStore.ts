import type { Contribution, Tax } from "@prisma/client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { SalaryItemInput } from "@/types";

export type ContributionElement = SalaryItemInput & { fromDb?: boolean };
export type TaxElement = SalaryItemInput & { fromDb?: boolean };

export type ContributionOrTax = ContributionElement | TaxElement;

type SalaryKey = Pick<SalaryItemInput, "name" | "value">;

/**
 * Two taxes are the same when name *and* rate match, as on the server: a user
 * can have "Social Security 11%" and "Social Security 8%" side by side.
 */
export function sameSalaryItem(a: SalaryKey, b: SalaryKey) {
  return (
    a.name.trim().toLowerCase() === b.name.trim().toLowerCase() &&
    Number(a.value) === Number(b.value)
  );
}

type SalaryElement = {
  name: string;
  value: number;
  description: string | null;
  fromDb?: boolean;
};

export type TypeOfSalaryItem = "taxes" | "contributions";

interface ModuleState {
  type: TypeOfSalaryItem;
  salaryElement: SalaryElement[];
  add: (element: SalaryElement) => void;
  remove: (element: SalaryKey) => void;
  clear: () => void;
  setSalaryItems?: (elements: SalaryElement[]) => void;
}

interface TaxOrContributionState {
  taxesModule: ModuleState;
  contributionsModule: ModuleState;
}

export interface TaxOrContributionStore {
  taxesModule: ModuleState;
  contributionsModule: ModuleState;
}

interface TaxesFromDbStore {
  open: boolean;
  setOpen: () => void;
}

type StateUpdater<S> = (state: S) => S;
type SetState<S> = (updater: StateUpdater<S> | Partial<S>) => void;
type GetState<S> = () => S;

export const useTaxesFromDbStore = create<TaxesFromDbStore>((set, get) => ({
  open: true,
  setOpen: () => set((state) => ({ open: !state.open })),
}));

function createModule(moduleName: keyof TaxOrContributionStore, type: TypeOfSalaryItem) {
  return (
    set: SetState<TaxOrContributionState>,
    get: GetState<TaxOrContributionState>
  ): ModuleState => {
    return {
      type,
      salaryElement: [],
      add: (element: ContributionOrTax) => {
        const moduleSalary = get()[moduleName];
        const existingElement = moduleSalary.salaryElement.find((e: ContributionOrTax) =>
          sameSalaryItem(e, element)
        );

        if (!existingElement) {
          set((state: any) => ({
            ...state,
            [moduleName]: {
              ...state[moduleName],
              salaryElement: [...state[moduleName].salaryElement, element],
            },
          }));
        }
      },
      remove: (element: SalaryKey) => {
        set((state: any) => ({
          ...state,
          [moduleName]: {
            ...state[moduleName],
            salaryElement: state[moduleName].salaryElement.filter(
              (e: ContributionOrTax) => !sameSalaryItem(e, element)
            ),
          },
        }));
      },
      clear: () => {
        set((state: any) => ({
          ...state,
          [moduleName]: {
            ...state[moduleName],
            salaryElement: [],
          },
        }));
      },
      setSalaryItems: (elements: ContributionOrTax[]) => {
        set((state: any) => ({
          ...state,
          [moduleName]: {
            ...state[moduleName],
            salaryElement: elements,
          },
        }));
      },
    };
  };
}

export const useProductionTaxesOrContributionsStore = create(
  devtools<TaxOrContributionStore>(
    (set, get) => ({
      taxesModule: createModule("taxesModule", "taxes")(set, get),
      contributionsModule: createModule("contributionsModule", "contributions")(set, get),
    }),
    {
      name: "taxes-and-contributions-production",
    }
  )
);
export const useHourlyTaxesOrContributionsStore = create(
  devtools<TaxOrContributionStore>(
    (set, get) => ({
      taxesModule: createModule("taxesModule", "taxes")(set, get),
      contributionsModule: createModule("contributionsModule", "contributions")(set, get),
    }),
    {
      name: "taxes-and-contributions-production",
    }
  )
);

export const useTrackTaxesOrContributionsStore = create(
  devtools<TaxOrContributionStore>(
    (set, get) => ({
      taxesModule: createModule("taxesModule", "taxes")(set, get),
      contributionsModule: createModule("contributionsModule", "contributions")(set, get),
    }),
    {
      name: "taxes-and-contributions-production",
    }
  )
);
