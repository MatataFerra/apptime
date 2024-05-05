import dynamic from "next/dynamic";

import UserService from "@/services/User";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import Skeleton from "@/components/ui/Skeleton";

const CarouselChart = dynamic(() => import("@/components/CarouselChart"), {
  ssr: false,
  loading: () => (
    <Stack classes="h-full w-full max-w-[90svw] overflow-hidden">
      <Skeleton classes="h-[300px] basis-1/2 sm:basis-1/3 md:basis-1/5" />
      <Skeleton classes="h-[300px] basis-1/2 sm:basis-1/3 md:basis-1/5" />
      <Skeleton classes="h-[300px] basis-1/2 sm:basis-1/3 md:basis-1/5" />
    </Stack>
  ),
});

const TableHistory = dynamic(() => import("@/components/TableHistory"), {
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

const PickupDate = dynamic(() => import("@/components/PickupDate"), {
  ssr: false,
  loading: () => (
    <Stack as="nav" alignItems="center">
      <Skeleton classes="h-10 w-60" />
      <Skeleton classes="h-10 w-32" />
    </Stack>
  ),
});

const DashboardProvider = dynamic(() => import("@/providers/DashboardProvider"), {
  ssr: false,
  loading: () => (
    <Stack classes="mx-auto mt-8 h-full w-full max-w-xl">
      <Skeleton classes="h-full w-full" />
    </Stack>
  ),
});

async function Dashboard() {
  const user = await UserService.getSessionUser();
  return (
    <DashboardProvider user={user}>
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
      <CarouselChart />
    </DashboardProvider>
  );
}

export default Dashboard;
