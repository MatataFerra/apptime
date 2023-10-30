"use client";

import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";

function FormHomeButtons() {
  return (
    <Stack as="footer" justifyContent="end">
      <Button variant="teal" classes="remove_button_highlight">
        Next {">"}
      </Button>
    </Stack>
  );
}

export default FormHomeButtons;
