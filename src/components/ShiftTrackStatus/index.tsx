import { Shift } from "@prisma/client";

import ShiftService from "@/services/Shift";
import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

import NotesFab from "@/components/NotesFab";
import NotesPortal from "@/components/NotesPortal";
import ShiftButtons from "@/components/ShiftButtons";
import ShiftStatus from "@/components/ShiftStatus";
import ShiftTextState from "@/components/ShiftTextState";

import ShiftStatusProvider from "@/providers/ShiftStatusProvider";

import { PATH_NAMES } from "@/utils/constants/pathnames";

async function ShiftTrackStatus() {
  const user = await UserService.getSessionUser();

  if (!user) {
    return ut.redirectTo(PATH_NAMES.LOGIN);
  }

  const shiftUnclosed = ShiftService.findUnClosedShift(user?.shifts) as Shift | null;

  return (
    <ShiftStatusProvider user={user} shiftOpen={shiftUnclosed}>
      <ShiftTextState />
      <ShiftStatus />
      <ShiftButtons />
      <NotesFab />
      <NotesPortal />
    </ShiftStatusProvider>
  );
}

export default ShiftTrackStatus;
