import dynamic from "next/dynamic";

import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const ProductionFormInputs = dynamic(() => import("@/components/ProductionFormInputs"), {
  ssr: false,
  loading: () => (
    <>
      <Stack orientation="vertical" classes="w-full">
        <Stack orientation="horizontal" wrap classes="w-full">
          <Skeleton classes="input-flex min-h-12 w-full" />
          <Skeleton classes="input-flex min-h-12 w-full" />
          <Skeleton classes="input-flex min-h-12 w-full" />
          <Skeleton classes="input-flex min-h-12 w-full" />
          <Skeleton classes="input-flex min-h-12 w-full" />
          <Skeleton classes="input-flex min-h-12 w-full" />
          <Skeleton classes="input-flex min-h-12 w-full" />
        </Stack>
        <Stack orientation="horizontal" classes="w-full">
          <Skeleton classes="h-5 w-full" />
          <Skeleton classes="h-5 w-full" />
        </Stack>
      </Stack>
    </>
  ),
});

const ProductionFormReport = dynamic(() => import("@/components/ProductionFormReport"), {
  ssr: false,
  loading: () => (
    <Stack orientation="vertical" classes="h-full w-full">
      <Skeleton classes="h-28 w-1/2" />
    </Stack>
  ),
});

function ProductionJobForm() {
  return (
    <>
      <ProductionFormInputs />
      <ProductionFormReport />
      <Stack justifyContent="end" classes="w-full">
        <Button type="submit" variant="black" form="production-job">
          Submit
        </Button>
      </Stack>
    </>
  );
}

export default ProductionJobForm;
