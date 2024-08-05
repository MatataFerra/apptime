import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

const Submit = dynamic(() => import("@/components/structures/FastCharge/Submit"), {
  ssr: false,
  loading: () => (
    <Stack justifyContent="end" classes="w-full">
      <Skeleton classes="h-12 w-32" />
    </Stack>
  ),
});

export default async function FormPage() {
  return <Submit />;
}
