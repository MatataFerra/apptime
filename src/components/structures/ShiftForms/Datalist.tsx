import { type RefObject, useEffect, useRef } from "react";

import { useOnClickOutside } from "usehooks-ts";

import { useDatalistStore } from "@/components/structures/ShiftForms/store/useDatalistStore";
import Datalist from "@/components/ui/Datalist";

/**
 * Suggestions for the job name. `onSelect` must update both the form and
 * any store that mirrors it (the review dialog reads the store).
 */
function DatalistShiftNames({
  data,
  value,
  onSelect,
}: {
  data: string[] | undefined;
  value: string | null;
  onSelect: (name: string) => void;
}) {
  const { isWritingName, setIsWriting } = useDatalistStore((state) => state);
  const listNamesRef = useRef<HTMLUListElement>(null);
  useOnClickOutside([listNamesRef as RefObject<HTMLElement>], () => {
    if (isWritingName) {
      setIsWriting(false);
    }
  });

  useEffect(() => {
    if (!value) return setIsWriting(false);
  }, [setIsWriting, value]);

  if (!isWritingName) return null;

  return (
    <Datalist
      data={data}
      ref={listNamesRef}
      onSelect={(name) => {
        onSelect(name);
        setIsWriting(false);
      }}
    />
  );
}

export default DatalistShiftNames;
