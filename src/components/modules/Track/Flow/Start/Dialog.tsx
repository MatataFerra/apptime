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
  };
  // The last shift's employer, unless it has been removed since.
  const lastEmployerId =
    last?.employerId != null && !byId.get(last.employerId)?.archived ? last.employerId : null;

  function resetData() {
    setStep("HasConfig");
    setData({
      unpaidBreaks: last?.unpaidBreaks,
      hourValue: last?.hourValue,
      employerId: lastEmployerId,
    });
  }

  return (
    <>
      <Dialog
        onOpenChange={(open) => {
          if (open) {
            if (hasConfig) {
              setStep("HasConfig");
              setData({
                unpaidBreaks: last?.unpaidBreaks,
                hourValue: last?.hourValue,
                employerId: lastEmployerId,
              });
            } else {
              setStep("ShiftInfo");
            }
          }

          setErrors(false);
          resetData();
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
