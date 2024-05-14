"use client";

import { useMemo } from "react";

import isEmpty from "lodash/isEmpty";

import ShiftService from "@/services/Shift";

import HasConfig from "@/components/structures/Track/Flow/Start/Dialog/HasConfig";
import SetShift from "@/components/structures/Track/Flow/Start/Dialog/SetShift";
import Trigger from "@/components/structures/Track/Trigger";
import { Dialog, DialogContent } from "@/components/ui/Dialog";

import { useShiftData } from "@/store/useShiftData";
import { useShiftStateContext } from "@/store/useShiftStatusStore";

type Props = {
  triggerStatus:
    | {
        disabled: boolean;
        apply_variant: boolean;
      }
    | undefined;
};

function StartDialog({ triggerStatus }: Props) {
  const { step, setData, setStep } = useShiftData((state) => state);
  const { user } = useShiftStateContext((state) => state);
  const hasConfig = useMemo(
    () => !isEmpty(ShiftService.getLastConfigShift(user?.shifts)),
    [user?.shifts]
  );
  const last = useMemo(() => ShiftService.getLastConfigShift(user?.shifts), [user?.shifts]);

  function resetData() {
    setStep("HasConfig");
    setData({
      holidayPay: last?.holidayPay,
      holidayPayRate: last?.holidayPayRate,
      taxCode: last?.taxCode,
      unpaidBreaks: last?.unpaidBreaks,
      hourValue: last?.hourValue,
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
                holidayPay: last?.holidayPay,
                holidayPayRate: last?.holidayPayRate,
                taxCode: last?.taxCode,
                unpaidBreaks: last?.unpaidBreaks,
                hourValue: last?.hourValue,
              });
            } else {
              setStep("ShiftInfo");
            }
          }

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
