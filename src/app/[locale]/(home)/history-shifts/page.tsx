import UserService from "@/services/User";

import { LocaleParams } from "@/types";

import CarouselDashboard from "@/components/CarouselDashboard";
import PickupDate from "@/components/PickupDate";
import TableHistoryBody from "@/components/TableHistoryBody";
import TableHistoryFoot from "@/components/TableHistoryFoot";
import Stack from "@/components/ui/Stack";
import Table from "@/components/ui/Table";
import TableHead from "@/components/ui/TableHead";
import Text from "@/components/ui/Text";

import DashboardProvider from "@/providers/DashboardProvider";

import { GRADIENTS } from "@/utils/constants/tailwind";

const COLUMNS = ["Day", "Hours", "Earnings"] as const;

export default async function HistoryShift({ params }: { params: LocaleParams }) {
  const user = await UserService.getSessionUser();

  return (
    <Stack orientation="vertical" spacing={8}>
      <DashboardProvider user={user}>
        <CarouselDashboard params={params} />
        <Stack
          orientation="horizontal"
          alignItems="center"
          justifyContent="between"
          classes="w-full"
        >
          <Text variant="gradient" classes={`text-2xl font-bold ${GRADIENTS.gradient_2}`}>
            History Shifts
          </Text>
          <PickupDate />
        </Stack>
        <Stack
          orientation="vertical"
          classes="h-fit max-h-60 min-h-10 w-full overflow-y-scroll rounded-lg border border-gray-200 bg-white shadow-input"
        >
          <Table classes="h-full w-full table-fixed">
            <TableHead
              classes="border border-l-0 border-r-0 border-t-0 border-b-gray-900 text-left"
              columnTitle={COLUMNS}
              elementClasses="p-4"
            />

            <TableHistoryBody />
            <TableHistoryFoot />
          </Table>
        </Stack>
      </DashboardProvider>
    </Stack>
  );
}
