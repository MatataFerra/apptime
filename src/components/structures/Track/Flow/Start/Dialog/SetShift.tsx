import ShiftStartButton from "@/components/structures/Track/Flow/Start/Button";
import ShiftStartInputs from "@/components/structures/Track/Flow/Start/Dialog/Inputs";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";

function SetShift() {
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

export default SetShift;
