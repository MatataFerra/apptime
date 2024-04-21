import UserService from "@/services/User";

import { LocaleParams } from "@/types";

import CarouselChart from "@/components/CarouselChart";
import CarouselDashboard from "@/components/CarouselDashboard";
import PickupDate from "@/components/PickupDate";
import TableHistory from "@/components/TableHistory";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import DashboardProvider from "@/providers/DashboardProvider";

export default async function HistoryShift({ params }: { params: LocaleParams }) {
  const user = await UserService.getSessionUser();

  return (
    <Stack orientation="vertical" spacing={8}>
      <CarouselDashboard params={params} />
      <DashboardProvider user={user}>
        <Stack
          orientation="horizontal"
          alignItems="center"
          justifyContent="between"
          classes="w-full"
        >
          <Text gradient="title" classes={`text-2xl font-bold`}>
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
    </Stack>
  );
}
