"use client";

import Button from "@/components/ui/Button";

import { useSettingsStore } from "@/store/useSettingsStore";

function Submit() {
  const { isDirty } = useSettingsStore((state) => state);

  return (
    <Button
      disabled={isDirty === false}
      type="submit"
      variant="primary"
      size="lg"
      classes="w-full rounded-2xl"
      form="settings"
    >
      Save
    </Button>
  );
}

export default Submit;
