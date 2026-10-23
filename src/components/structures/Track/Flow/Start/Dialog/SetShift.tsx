import { useTranslations } from "next-intl";

import ShiftStartButton from "@/components/structures/Track/Flow/Start/Button";
import ShiftStartInputs from "@/components/structures/Track/Flow/Start/Dialog/Inputs";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";

function SetShift() {
  const t = useTranslations("track.start");

  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle>{t("set_title")}</DialogTitle>
        <DialogDescription>{t("set_description")}</DialogDescription>
      </DialogHeader>
      <ShiftStartInputs />
      <ShiftStartButton />
    </>
  );
}

export default SetShift;
