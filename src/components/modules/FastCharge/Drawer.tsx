"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

import { useHourlyTaxesOrContributionsStore } from "@/store/useTaxOrContributionStore";

const TaxPicker = dynamic(() => import("@/components/structures/SalaryItems/TaxPicker"), {
  ssr: false,
  loading: () => <Skeleton classes="h-40 w-full rounded-[20px]" />,
});

/** Taxes for this shift, inline in the form (no nested drawers). */
function Drawer() {
  const { taxesModule } = useHourlyTaxesOrContributionsStore((state) => state);

  return (
    <div className="my-2 w-full">
      <TaxPicker store={taxesModule} theme="fast" />
    </div>
  );
}

export default Drawer;
