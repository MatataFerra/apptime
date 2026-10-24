"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

import { useHourlyTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

const TaxPicker = dynamic(() => import("@/components/structures/SalaryItems/TaxPicker"), {
  ssr: false,
  loading: () => <Skeleton classes="h-40 w-full rounded-xl" />,
});

/** Taxes and contributions for this shift, inline in the form (no nested drawers). */
function Drawer() {
  const { taxesModule, contributionsModule } = useHourlyTaxesOrContributionsStore((state) => state);

  return (
    <div className="my-2 flex w-full flex-col gap-3">
      <TaxPicker store={taxesModule} theme="fast" />
      <TaxPicker kind="contributions" store={contributionsModule} theme="fast" />
    </div>
  );
}

export default Drawer;
