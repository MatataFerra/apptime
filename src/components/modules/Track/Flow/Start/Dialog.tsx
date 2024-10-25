"use client";

import { useMemo } from "react";

import isEmpty from "lodash/isEmpty";

import HourlyService from "@/services/Shift/Hourly";

import HasConfig from "@/components/structures/Track/Flow/Start/Dialog/HasConfig";
import SetShift from "@/components/structures/Track/Flow/Start/Dialog/SetShift";
import Trigger from "@/components/structures/Track/Trigger";
import { Dialog, DialogContent } from "@/components/ui/Dialog";

import useTrackShift from "@/hooks/useTrackShift";

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
  const { data: track, isLoading } = useTrackShift();
  const hasConfig = useMemo(() => {
    if (isLoading) return null;

    return !isEmpty(new HourlyService(track?.last).getConfig());
  }, [isLoading, track?.last]);

  const last = useMemo(() => {
    if (isLoading) return null;

    return new HourlyService(track?.last).getConfig();
  }, [isLoading, track?.last]);

  function resetData() {
    setStep("HasConfig");
    setData({
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
                unpaidBreaks: last?.unpaidBreaks,
                hourValue: last?.hourValue,
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
