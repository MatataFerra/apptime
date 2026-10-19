import UserService from "@/services/User";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { CarouselChart, DashboardProvider,PickupDate, TableHistory } from "./Dashboard.lazy";

/**
 * @deprecated This component was replaced by the new parallel routing of Dashboard
 */
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
        classes="h-fit max-h-60 min-h-60 w-full overflow-y-scroll rounded-lg border border-border bg-surface"
      >
        <TableHistory />
      </Stack>
      <CarouselChart />
    </DashboardProvider>
  );
}

export default Dashboard;
