import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";

import { type ShiftStep, useShiftData } from "@/store/useShiftData";

type Props = {
  step: ShiftStep;
};

function ShiftStartBackButton({ step }: Props) {
  const setStep = useShiftData((state) => state.setStep);
  return (
    <Button
      variant="white"
      classes="w-3/12 animate-fade-in p-2 text-sm"
      onClick={() => {
        setStep(step);
      }}
    >
      back
    </Button>
  );
}

export default ShiftStartBackButton;
