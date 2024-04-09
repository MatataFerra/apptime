"use client";

import { useEffect, useMemo } from "react";

import isEmpty from "lodash/isEmpty";

import ShiftService from "@/services/Shift";

import Trigger from "@/components/ShiftDialog/trigger";
import ShiftStartStepTwo from "@/components/ShiftStartStepTwo";
import { Dialog, DialogContent } from "@/components/ui/Dialog";

import ShiftStartHasConfigStep from "../ShiftStartHasConfigStep";
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

function ShiftStartDialog({ triggerStatus }: Props) {
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
          {hasConfig && step === "HasConfig" ? <ShiftStartHasConfigStep /> : <ShiftStartStepTwo />}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ShiftStartDialog;
