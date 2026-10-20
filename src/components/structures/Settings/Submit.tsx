"use client";

import Button from "@/components/ui/Button";

import { useSettingsStore } from "@/store/useSettingsStore";

/** Saves "Your details" only; the other sections save on their own. */
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
      Save details
    </Button>
  );
}

export default Submit;
