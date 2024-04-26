import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const FastChargeForm = dynamic(() => import("@/components/FastChargeForm"), {
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
      <Stack orientation="vertical" classes="h-full w-full">
        <Skeleton classes="h-28 w-1/2" />
      </Stack>
      <Stack justifyContent="end" classes="h-full w-full">
        <Skeleton classes="h-12 w-32" />
      </Stack>
    </>
  ),
});

const FastChargeTitle = dynamic(() => import("@/components/ModuleTitle"), {
  ssr: false,
  loading: () => <Skeleton classes="h-60 w-40" />,
});

export default async function FastCharge() {
  return (
    <Stack orientation="vertical" spacing={6}>
      <FastChargeTitle title="Fast Charge" subtitle="charge your shift" />
      <FastChargeForm />
    </Stack>
  );
}
