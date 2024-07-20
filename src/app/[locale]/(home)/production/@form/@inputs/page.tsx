import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const Inputs = dynamic(() => import("@/components/structures/Production/Inputs"), {
  ssr: false,
  loading: () => (
    <>
      <Stack orientation="vertical" classes="w-full">
        <Stack orientation="horizontal" wrap classes="w-full">
          <Skeleton classes="min-h-16 w-full" />
          <Skeleton classes="min-h-16 w-full" />
          <Skeleton classes="input-flex min-h-16 w-full" />
          <Skeleton classes="input-flex min-h-16 w-full" />
          <Skeleton classes="input-flex min-h-16 w-full" />
        </Stack>
        <Stack orientation="horizontal" classes="w-full">
          <Skeleton classes="h-8 w-full" />
          <Skeleton classes="h-8 w-full" />
        </Stack>
      </Stack>
    </>
  ),
});

export default async function InputsPage() {
  return <Inputs />;
}
