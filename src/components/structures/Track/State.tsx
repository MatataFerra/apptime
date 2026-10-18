"use client";

import { useCallback } from "react";

import ut from "@/services/Utilities/client";

import PopoverHome from "@/components/structures/Home/Popover";
import Text from "@/components/ui/Text";

import useTrack from "@/hooks/useTrack";

function ShiftTextState() {
  const {
    shiftUnclosed: { shift },
  } = useTrack();

  const checkCloseShift = useCallback(() => {
    if (typeof shift?.isClosed === "undefined") {
      return false;
    }

    return ut.isFalsyValue(shift?.isClosed);
  }, [shift?.isClosed]);

  const online = checkCloseShift();

  return (
    <Text as="h2" classes="flex items-center gap-2 text-sm text-ink-muted">
      Status
      <Text
        as="span"
        classes={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-medium ${
          online ? "bg-accent-soft text-accent" : "bg-surface-sunken text-ink-muted"
        }`}
      >
        <span
          aria-hidden="true"
          className={`size-1.5 rounded-full ${online ? "bg-accent" : "bg-ink-subtle"}`}
        />
        {online ? "online" : "offline"}
      </Text>
      <PopoverHome />
    </Text>
  );
}

export default ShiftTextState;
