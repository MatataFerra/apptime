import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const ProductionForm = dynamic(() => import("@/components/modules/Production/Form"), {
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
        <Skeleton classes="h-32 w-full" />
      </Stack>
      <Stack justifyContent="end" classes="h-full w-full">
        <Skeleton classes="h-12 w-32" />
      </Stack>
    </>
  ),
});

const Title = dynamic(() => import("@/components/structures/share/ModuleTitle"), {
  ssr: false,
  loading: () => <Skeleton classes="h-60 w-40" />,
});

export default async function ProductionJob() {
  return (
    <>
      <Stack orientation="vertical" spacing={6}>
        <Title title="Production Job" subtitle="module to track your production work" />
        <ProductionForm />
      </Stack>
    </>
  );
}
