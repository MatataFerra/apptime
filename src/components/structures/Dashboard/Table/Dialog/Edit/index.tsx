import { Shift } from "@prisma/client";

import { UserType } from "@/types";

import TableDialogEditHourly from "@/components/structures/Dashboard/Table/Dialog/Edit/Hourly";
import TableDialogEditProduction from "@/components/structures/Dashboard/Table/Dialog/Edit/Production";
import Stack from "@/components/ui/Stack";

type Props = {
  shift: Shift;
  user: UserType | null | undefined;
};

function TableDialogEditShift({ shift, user }: Props) {
  return (
    <Stack orientation="horizontal">
      {shift.typeShift === "PRODUCTION" ? (
        <TableDialogEditProduction shift={shift} user={user} />
      ) : (
        <TableDialogEditHourly shift={shift} user={user} />
      )}
    </Stack>
  );
}

export default TableDialogEditShift;
