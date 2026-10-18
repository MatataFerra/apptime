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
    <DialogFooter className="grid w-full grid-cols-2 gap-2.5 sm:space-x-0">
      <Button
        type="button"
        size="lg"
        variant="outline"
        classes="w-full"
        onClick={() => {
          Toast({
            type: "warning",
            message: "Changes not saved",
            duration: 2000,
          });
          reset();
          setStep("info");
        }}
      >
        Back
      </Button>
      <Button type="submit" size="lg" variant="primary" classes="w-full">
        Save changes
      </Button>
    </DialogFooter>
  );
}

export default Footer;
