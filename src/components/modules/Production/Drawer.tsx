"use client";

import dynamic from "next/dynamic";

import TaxPickerSkeleton from "@/components/structures/SalaryItems/TaxPickerSkeleton";

import { useProductionTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

const TaxPicker = dynamic(() => import("@/components/structures/SalaryItems/TaxPicker"), {
  ssr: false,
  loading: () => <TaxPickerSkeleton />,
});
const ContributionPicker = dynamic(
  () => import("@/components/structures/SalaryItems/TaxPicker").then((m) => m.ContributionPicker),
  { ssr: false, loading: () => <TaxPickerSkeleton kind="contributions" /> }
);

/** Taxes and contributions for this shift, inline in the form (no nested drawers). */
function Drawer() {
  const { taxesModule, contributionsModule } = useProductionTaxesOrContributionsStore(
    (state) => state
  );

  return (
    <div className="my-2 flex w-full flex-col gap-3">
      <TaxPicker store={taxesModule} theme="production" />
      <ContributionPicker store={contributionsModule} theme="production" />
    </div>
  );
}

export default Drawer;
