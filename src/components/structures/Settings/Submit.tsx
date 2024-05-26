"use client";
import Button from "@/components/ui/Button";

import { useSettingsStore } from "@/store/useSettingsStore";

function Submit() {
  const { isDirty } = useSettingsStore((state) => state);

  return (
    <Button
      disabled={isDirty === false}
      type="submit"
      variant="black"
      size="md"
      classes="justify-self-end"
      form="settings"
    >
      Save
    </Button>
  );
}

export default Submit;
