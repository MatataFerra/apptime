import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

const PickupDate = dynamic(() => import("@/components/structures/share/PickupDate"), {
  ssr: false,
  loading: () => <Skeleton classes="h-10 w-2/6" />,
});

const TableHistory = dynamic(() => import("@/components/modules/Dashboard/TableHistory"), {
  ssr: false,
  loading: () => (
    <Stack
      orientation="vertical"
      classes="h-fit max-h-60 min-h-60 w-full overflow-y-scroll rounded-lg border border-gray-200 bg-white shadow-input"
    >
      <Skeleton classes="h-full w-full" />
    </Stack>
  ),
});

export default async function Table() {
  return (
    <>
      <Stack orientation="horizontal" alignItems="center" justifyContent="between" classes="w-full">
        <Text gradient="title" classes={`line-clamp-1 text-2xl font-bold`}>
          History Shifts
        </Text>
        <PickupDate />
      </Stack>
      <Stack
        orientation="vertical"
        classes="h-fit max-h-60 min-h-60 w-full overflow-y-scroll rounded-lg border border-gray-200 bg-white shadow-input"
      >
        <TableHistory />
      </Stack>
    </>
  );
}
