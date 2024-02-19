import { Shift } from "@prisma/client";

import ShiftService from "@/services/Shift";
import UserService from "@/services/User";

import { LocaleParams } from "@/types";

import CarouselDashboard from "@/components/CarouselDashboard";
import PickupDate from "@/components/PickupDate";
import TableBody from "@/components/TableBody";
import Icon from "@/components/ui/Icons";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import DashboardProvider from "@/providers/DashboardProvider";

import { GRADIENTS } from "@/utils/constants/tailwind";

export default async function HistoryShift({ params }: { params: LocaleParams }) {
  const user = await UserService.getSessionUser();

  function calculateEarnings(shift: Shift) {
    return ShiftService.calculateEarnings({
      profile: user?.profile ?? null,
      shift,
    });
  }

  function getHours(minutes: number) {
    return ShiftService.convertAmountInDecimal(minutes);
  }

  function totalEarnings() {
    return user?.shifts.reduce((acc, shift) => acc + calculateEarnings(shift), 0);
  }

  function sumHours() {
    return user?.shifts.reduce((acc, shift) => {
      return acc + (shift?.amount ? getHours(shift?.amount ?? 0) : 0);
    }, 0);
  }

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
          classes="glass h-fit max-h-60 min-h-10 w-full overflow-y-scroll rounded-lg p-4"
        >
          {/* Create table */}
          <table className="h-full w-full">
            <thead className="border border-l-0 border-r-0 border-t-0 border-b-red-500 text-left">
              <tr>
                <th>
                  <Text classes="pb-2">Day</Text>
                </th>
                <th>
                  <Text classes="pb-2">Hours</Text>
                </th>
                <th>
                  <Text classes="pb-2">Earnings</Text>
                </th>
              </tr>
            </thead>
            <TableBody />
            <tfoot>
              <tr>
                <th className="pt-2 text-left">Totals</th>
                <td className="pt-2">{`${sumHours()?.toFixed(2)}`}h</td>
                <td className="pt-2">${`${totalEarnings()?.toFixed(2)}`}</td>
              </tr>
            </tfoot>
          </table>
        </Stack>
      </DashboardProvider>
    </Stack>
  );
}
