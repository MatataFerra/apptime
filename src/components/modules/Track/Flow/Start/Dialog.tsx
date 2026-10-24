"use client";

import { useMemo } from "react";

import isEmpty from "lodash/isEmpty";

import ShiftService from "@/services/Shift";

import HasConfig from "@/components/structures/Track/Flow/Start/Dialog/HasConfig";
import SetShift from "@/components/structures/Track/Flow/Start/Dialog/SetShift";
import Trigger from "@/components/structures/Track/Trigger";
import { Dialog, DialogContent } from "@/components/ui/Dialog";

import useEmployers from "@/hooks/useEmployers";
import useTrack from "@/hooks/useTrack";

import { useShiftData } from "@/store/useShiftData";

type Props = {
  triggerStatus:
    | {
        disabled: boolean;
        apply_variant: boolean;
      }
    | undefined;
};

function StartDialog({ triggerStatus }: Props) {
  const { step, setData, setStep, setErrors } = useShiftData((state) => state);
  const { user } = useTrack();
  const { byId } = useEmployers();
  const hasConfig = useMemo(
    () => !isEmpty(ShiftService.getLastConfigShift(user?.shifts?.hourly)),
    [user?.shifts]
  );
  const last = useMemo(
    () => ShiftService.getLastConfigShift(user?.shifts?.hourly),
    [user?.shifts?.hourly]
  ) as {
    unpaidBreaks: number;
    hourValue: number;
    employerId?: number | null;
    currency?: string | null;
  } | null;
  // The last shift's employer, unless it has been removed since.
  const lastEmployerId =
    last?.employerId != null && !byId.get(last.employerId)?.archived ? last.employerId : null;

  /** Every time it opens: the last shift's settings, on a normal day. */
  function resetData() {
    setStep(hasConfig ? "HasConfig" : "ShiftInfo");
    setErrors(false);
    setData({
      unpaidBreaks: last?.unpaidBreaks ?? 1,
      hourValue: last?.hourValue ?? 0,
      employerId: lastEmployerId,
      currency: last?.currency ?? null,
      isPublicHoliday: false,
      publicHolidayWorked: false,
    });
  }

  return (
    <>
      <Dialog
        onOpenChange={(open) => {
          if (open) resetData();
        }}
      >
        <Trigger status={triggerStatus} />
        <DialogContent className="min-h-[300px] w-10/12">
          {hasConfig && step === "HasConfig" ? <HasConfig /> : <SetShift />}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default StartDialog;
