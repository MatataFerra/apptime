import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

const PickupDate = dynamic(() => import("@/components/structures/Dashboard/Table/PickupDate"), {
  ssr: false,
  loading: () => <Skeleton classes="h-10 w-2/6" />,
});

export default async function Table() {
  return (
    <Stack orientation="horizontal" alignItems="center" justifyContent="between" classes="w-full">
      <Text as="h2" classes="line-clamp-1 text-[0.9375rem] font-semibold">
        History Shifts
      </Text>
      <PickupDate />
    </Stack>
  );
}
