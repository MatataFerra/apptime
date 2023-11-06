import { getServerSession } from "next-auth";

import UserService from "@/services/User";

import UnfilledForm from "@/components/ShiftStatus/UnfilledForm";
import ShiftTrack from "@/components/ShiftTrack";
import Stack from "@/components/ui/Stack";

async function Status() {
  const session = await getServerSession();
  const user = await UserService.findUniqueUser({ email: session?.user?.email });

  return (
    <Stack
      orientation="vertical"
      alignItems="center"
      classes="border_dash min-h-[25dvh] w-full justify-center p-4"
      spacing={6}
      justifyContent="center"
    >
      {!user?.formCompleted ? <UnfilledForm /> : <ShiftTrack />}

      {/* <ShiftTrack /> */}
      {/* <ShiftRecorded /> */}
    </Stack>
  );
}

export default Status;
