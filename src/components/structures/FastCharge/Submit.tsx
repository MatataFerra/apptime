"use client";

import Dialog from "@/components/structures/FastCharge/Dialog";
import Box from "@/components/ui/Box";
import Button from "@/components/ui/Button";

import { useFastChargeStore } from "@/store/useFastChargeStore";

function Submit() {
  const { isFormReady, setDialogState } = useFastChargeStore((state) => state);

  return (
    <Dialog>
      <Box classes="flex w-full justify-end">
        <Button
          type="button"
          variant="gradient_secondary"
          disabled={!isFormReady}
          onClick={() => setDialogState(true)}
        >
          Next
        </Button>
      </Box>
    </Dialog>
  );
}

export default Submit;
