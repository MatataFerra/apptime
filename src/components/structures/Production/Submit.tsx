"use client";

import Dialog from "@/components/structures/Production/Dialog";
import Box from "@/components/ui/Box";
import Button from "@/components/ui/Button";

import { useProductionForm } from "@/store/useProductionForm";

function Submit() {
  const { isFormReady, setDialogState } = useProductionForm((state) => state);

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
