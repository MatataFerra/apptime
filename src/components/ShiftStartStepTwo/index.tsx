import ShiftStartButton from "@/components/ShiftStartButton";
import ShiftStartInputs from "@/components/ShiftStartInputs";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";

function ShiftStartStepTwo() {
  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle>Set shift before start</DialogTitle>
        <DialogDescription>
          Please fill in the following details to start your shift
        </DialogDescription>
      </DialogHeader>
      <ShiftStartInputs />
      <ShiftStartButton />
    </>
  );
}

export default ShiftStartStepTwo;
