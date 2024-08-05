"use client";

import Toast from "@/services/Toast";

import { useTaxesHandlerDelete } from "@/components/structures/Dashboard/Table/Dialog/store/taxesHandlerDelete";
import Button from "@/components/ui/Button";
import { DialogFooter } from "@/components/ui/Dialog";

import { useTableStore } from "@/store/useTableStore";

function Footer() {
  const { setStep } = useTableStore((state) => state);
  const { reset } = useTaxesHandlerDelete((state) => state);

  return (
    <DialogFooter className="flex w-full flex-row items-center justify-end gap-4">
      <Button
        type="button"
        size="sm"
        variant="white"
        classes="active:shadow-button-inner"
        onClick={() => {
          Toast({
            type: "warning",
            message: "Changes have not been saved",
            duration: 2000,
          });
          reset();
          setStep("info");
        }}
      >
        back
      </Button>
      <Button type="submit" size="sm" variant="success">
        Save
      </Button>
    </DialogFooter>
  );
}

export default Footer;
